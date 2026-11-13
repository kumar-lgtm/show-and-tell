import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cleanup, cli, uniqueName, ORIGIN } from './_seed.mjs';
import { handle } from '../server/store.js';
import { voiceContexts } from '../server/format.js';

after(() => cleanup());

const note = (comment, startMs, { reviewer = 'Ana', sessionId = 'recording-1', ...extra } = {}) => ({
  kind: 'voice', comment, reviewer,
  voice: { sessionId, startMs, endMs: startMs + 1000, target: { kind: 'general' } },
  ...extra,
});

test('voice context joins sentence fragments in speech order without mixing authors or recordings', () => {
  const notes = [note('blue', 9000), note('Make this button', 2000),
    note('private', 0, { reviewer: 'Ben' }), note('another recording', 0, { sessionId: 'other' }),
    { kind: 'feedback', comment: 'ordinary note' }];
  const before = JSON.stringify(notes);
  assert.deepEqual(voiceContexts(notes), [{
    sessionId: 'recording-1', reviewer: 'Ana', count: 2, transcript: 'Make this button blue',
    sentences: ['[→ T1 General] Make this button blue'],
    targets: [{ ref: 'T1', kind: 'general', label: 'General', detail: 'General page feedback' }],
  }]);
  assert.equal(JSON.stringify(notes), before, 'input order and payloads remain unchanged');
  assert.deepEqual(voiceContexts(notes.slice(0, 1)), [], 'a filtered read cannot pull in omitted passages');
});

test('CLI, MCP renderer and markdown retain continuous context and individual anchor warnings', async () => {
  const name = uniqueName('voice-context');
  const call = async (method, path, body) => {
    const res = await handle(new Request(`http://localhost/__ag/${path}`, {
      method, headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }), name, path);
    assert.ok(res.ok, `${path}: ${res.status}`);
    return res.json();
  };
  const session = await call('POST', 'sessions', { url: `${ORIGIN}/` });
  const add = async (a) => call('POST', `sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), url: `${ORIGIN}/`, ...a,
  });
  // Persist out of speech order: the reader must sort by the audio clock.
  const blue = await add(note('blue', 9000, { voice: {
    sessionId: 'recording-1', startMs: 9000, endMs: 10000, needsReview: true,
    target: { kind: 'region', label: 'Button region' },
  } }));
  const first = await add(note('Make this button', 2000));
  await add(note('secret', 1000, { reviewer: 'Ben' }));
  await add(note('other secret', 2000, { reviewer: 'Ben' }));
  const read = cli(['feedback', name, 'list', '--by', 'Ana']);
  assert.equal(read.code, 0, read.err);
  assert.match(read.out, /1\. \[→ T1 General\] Make this button \[→ T2 Button region \(check timing\)\] blue/);
  assert.match(read.out, /T2 region · no element context captured/);
  assert.match(read.out, /2 listed passages in speech order/);
  assert.match(read.out, /Only listed notes are included/);
  assert.match(read.out, /alignment: .*confirm the intended target/);
  assert.match(read.out, new RegExp(`\\[${blue.id}\\]`));
  assert.doesNotMatch(read.out, /secret/);
  const md = cli(['feedback', name, 'export', '--by', 'Ana']);
  assert.equal(md.code, 0, md.err);
  assert.match(md.out, /1\. \[→ T1 General\] Make this button \[→ T2 Button region \(check timing\)\] blue/);
  assert.match(md.out, /Alignment:.*confirm the intended target/);
  assert.doesNotMatch(md.out, /secret/);
  assert.equal(cli(['feedback', name, 'resolve', first.id, 'Applied']).code, 0);
  const filtered = cli(['feedback', name, 'list', '--by', 'Ana']);
  assert.doesNotMatch(filtered.out, /Make this button/, 'resolved passages stay out of pending context');
});

test('untrusted voice context cannot forge CLI rows or markdown sections or notify handles', async () => {
  const { openProject } = await import('../server/agent.js');
  const { exportMarkdown } = await import('../server/export.js');
  const p = openProject(uniqueName('voice-fence'));
  const notes = [note('hello\n## forged @octocat', 0, { sessionId: 'id\n## forged' }),
    note('world', 1000, { sessionId: 'id\n## forged' })]
    .map((a, i) => ({ ...a, id: `n${i}`, status: 'pending', pagePath: '/' }));
  assert.doesNotMatch(p.render(notes), /\n## forged/);
  const md = exportMarkdown(p, notes);
  assert.doesNotMatch(md, /\n## forged|@octocat/);
  assert.match(md, /@\u200doctocat/);
});
