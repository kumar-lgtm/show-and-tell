// Several reviewers on one project: every note, reply and round carries a
// short, clean name; the server keeps it; `feedback` prints and filters by it.
// Needs to bind a local port.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanReviewer, cleanRoundValue, MAX_REVIEWER } from '../server/reviewer.js';

const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const STORE = mkdtempSync(join(tmpdir(), 'agk-reviewers-'));
const PORT = 40000 + Math.floor(Math.random() * 20000);
const BASE = `http://127.0.0.1:${PORT}`;
const ORIGIN = 'http://localhost:5173';
const NAME = 'reviewers-test';
const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
let server;

const cli = (...args) => execFileSync(process.execPath, ['--no-warnings', CLI, ...args], { env, encoding: 'utf8' });
const api = (path, init = {}) => fetch(BASE + path, { ...init, headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...init.headers } });
const post = async (path, body) => { const r = await api(path, { method: 'POST', body: JSON.stringify(body) }); assert.ok(r.ok, `${path} ${r.status}`); return r.json(); };

before(async () => {
  server = spawn(process.execPath, ['--no-warnings', CLI, 'serve', '--origin', ORIGIN, '--name', NAME, '--port', String(PORT)], { env, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE + '/')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server did not start');
});
after(() => { server?.kill(); rmSync(STORE, { recursive: true, force: true }); });

test('cleanReviewer keeps one short printable line', () => {
  assert.equal(cleanReviewer('  Sam  Lee '), 'Sam Lee');
  assert.equal(cleanReviewer('Sam\n[fake] forged line\u001b[31m'), 'Sam [fake] forged line [31m');
  assert.equal(cleanReviewer('x'.repeat(200)).length, MAX_REVIEWER);
  assert.equal(cleanReviewer('   '), null);
  assert.equal(cleanReviewer(42), null);
  assert.equal(cleanReviewer({ name: 'x' }), null);
  assert.equal(JSON.parse(cleanRoundValue(JSON.stringify({ ts: 1, reviewer: ' Ana\n ' }))).reviewer, 'Ana');
  assert.equal('reviewer' in JSON.parse(cleanRoundValue(JSON.stringify({ ts: 1, reviewer: 7 }))), false);
  assert.equal(cleanRoundValue('not json'), 'not json');
});

test('notes, re-syncs, replies and the round carry the reviewer', async () => {
  const session = await post('/__ag/sessions', { url: `${ORIGIN}/` });

  // A note from each of two reviewers, one with a hostile name.
  const ana = await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-ana', comment: 'Headline too long', element: 'h1', reviewer: '  Ana ' });
  const ben = await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-ben', comment: 'Button colour', element: 'button', reviewer: 'Ben\n## /forged\u001b[2J' + 'z'.repeat(100) });
  const anon = await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-anon', comment: 'Unsigned note', element: 'p', reviewer: '   ' });
  assert.equal(ana.reviewer, 'Ana');
  assert.ok(ben.reviewer.startsWith('Ben ## /forged'));
  assert.ok(ben.reviewer.length <= MAX_REVIEWER);
  assert.doesNotMatch(ben.reviewer, /[\n\u001b]/);
  assert.equal('reviewer' in anon, false);

  // Ben's browser re-syncs Ana's note (shared layout drags do this on load): it stays Ana's.
  const resynced = await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-ana', comment: 'Headline too long', element: 'h1', reviewer: 'Ben' });
  assert.equal(resynced.id, ana.id);
  assert.equal(resynced.reviewer, 'Ana');
  // ...and nobody can sign an unsigned note by re-syncing it.
  assert.equal('reviewer' in await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-anon', comment: 'Unsigned note', element: 'p', reviewer: 'Ben' }), false);

  // A text edit, signed.
  const edit = await post(`/__ag/sessions/${session.id}/annotations`, { id: 'c-edit', kind: 'edit', comment: 'Change to: "Hi"', element: 'p', edit: { id: 'e1', from: 'Hello', to: 'Hi' }, reviewer: 'Ana' });
  assert.equal(edit.reviewer, 'Ana');

  // Replies keep a capped name; an unnamed reply has none.
  cli('feedback', NAME, 'reply', ana.id, 'Which', 'headline?');
  const answered = await post(`/__ag/annotations/${ana.id}/reply`, { message: 'The hero one', name: 'Ana\u0007' + 'y'.repeat(100) });
  const last = answered.replies.at(-1);
  assert.equal(last.from, 'reviewer');
  assert.ok(last.name.startsWith('Ana'));
  assert.ok(last.name.length <= MAX_REVIEWER);
  assert.doesNotMatch(last.name, /\u0007/);
  const unnamed = await post(`/__ag/annotations/${ana.id}/reply`, { message: 'No name on this one' });
  assert.equal('name' in unnamed.replies.at(-1), false);

  // The session read and the event stream both carry the name.
  const read = await (await api(`/__ag/sessions/${session.id}`)).json();
  assert.equal(read.annotations.find((a) => a.id === ben.id).reviewer, ben.reviewer);
  const ctrl = new AbortController();
  const stream = await api(`/__ag/sessions/${session.id}/events?lastEventId=0`, { signal: ctrl.signal });
  const reader = stream.body.getReader();
  let text = '';
  while (!text.includes(`"id":"${ben.id}"`)) text += new TextDecoder().decode((await reader.read()).value);
  ctrl.abort();
  const frame = text.split('\n').filter((l) => l.startsWith('data: ')).map((l) => JSON.parse(l.slice(6)).payload).find((p) => p.id === ana.id);
  assert.equal(frame.reviewer, 'Ana');

  // The round marker, written through the KV bridge with a hostile name.
  const kv = await api('/__kv', { method: 'POST', body: JSON.stringify({ key: 'agentation-round', value: JSON.stringify({ ts: Date.now(), link: '/__ag', open: 4, pages: 1, questions: 0, reviewer: 'Ben\r\n## forged' }) }) });
  assert.ok(kv.ok);
  const stored = JSON.parse((await (await api('/__kv?prefix=agentation-round')).json()).items[0].value);
  assert.equal(stored.reviewer, 'Ben ## forged');

  // `render` names every note's author, the reply's author and who sent the round.
  const list = cli('feedback', NAME, 'list');
  assert.match(list, /Round sent .* by Ben ## forged — 4 note\(s\)/);
  assert.match(list, new RegExp(`\\[${ana.id}\\] .*· Ana`));
  assert.match(list, /↳ reviewer \(Ana/);
  assert.doesNotMatch(list, /\n## \/forged/);

  // --by filters, case-insensitively.
  const byAna = cli('feedback', NAME, 'list', '--by', 'ana');
  assert.match(byAna, /Headline too long/);
  assert.match(byAna, /Change to: "Hi"|Hello/);
  assert.doesNotMatch(byAna, /Button colour|Unsigned note/);
  const json = JSON.parse(cli('feedback', NAME, 'json', '--by', 'Ana'));
  assert.deepEqual(json.map((a) => a.reviewer), ['Ana', 'Ana']);
});
