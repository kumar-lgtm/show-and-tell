// Critique and layout-intent modes: serve flags reach the toolbar config, and
// the feedback CLI leaves and clears the agent's own notes. Needs to bind a local port.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const STORE = mkdtempSync(join(tmpdir(), 'agk-crit-'));
const PORT = 40000 + Math.floor(Math.random() * 20000);
const ORIGIN = 'http://localhost:5175';
const NAME = 'critique-test';
const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
const servers = [];

const cli = (...args) => execFileSync(process.execPath, ['--no-warnings', CLI, ...args], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const config = (loader) => JSON.parse(loader.match(/__AGENTATION_KIT_AGENTATION__=(\{.*?\});/)[1]);

async function serve(port, ...flags) {
  const s = spawn(process.execPath, ['--no-warnings', CLI, 'serve', '--origin', ORIGIN, '--name', NAME, '--port', String(port), ...flags], { env, stdio: 'pipe' });
  servers.push(s);
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return `http://127.0.0.1:${port}`; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server did not start');
}
const agentNotes = async (base, path) => (await (await fetch(`${base}/__ag/sessions?author=agent`, {
  method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify({ url: `${ORIGIN}${path}` }),
})).json()).annotations.filter((a) => a.author === 'agent');

let base;
before(async () => { base = await serve(PORT, '--critique', '--layout-intent'); });
after(() => { for (const s of servers) s.kill(); rmSync(STORE, { recursive: true, force: true }); });

test('modes are off by default and on with --critique / --layout-intent', async () => {
  const on = config(await (await fetch(`${base}/loader.js`)).text());
  assert.equal(on.critique, true);
  assert.equal(on.layoutIntent, true);
  const plain = await serve(PORT + 1);
  const off = config(await (await fetch(`${plain}/loader.js`)).text());
  assert.equal(off.critique, false);
  assert.equal(off.layoutIntent, false);
});

test('feedback annotate leaves an agent note; --replace and clear-critique remove them', async () => {
  const out = cli('feedback', NAME, 'annotate', `${ORIGIN}/pricing`, 'Headline', 'wraps', 'at', '390px', '--selector', 'main h1', '--severity', 'blocking');
  assert.match(out, /annotate → ann_\S+ on .*\/pricing at main h1 · blocking/);
  cli('feedback', NAME, 'annotate', `${ORIGIN}/pricing`, 'No FAQ');
  let notes = await agentNotes(base, '/pricing');
  assert.equal(notes.length, 2);
  assert.equal(notes.find((a) => a.severity === 'blocking').comment, 'Headline wraps at 390px');
  assert.equal(notes.find((a) => a.severity === 'blocking').selector, 'main h1');

  // A boolean flag before the comment must not swallow it.
  cli('feedback', NAME, 'annotate', `${ORIGIN}/pricing`, '--replace', 'One', 'fresh', 'take');
  notes = await agentNotes(base, '/pricing');
  assert.deepEqual(notes.map((a) => a.comment), ['One fresh take']);

  // Agent notes never show up as the reviewer's feedback.
  assert.match(cli('feedback', NAME, 'list'), /No open feedback/);

  assert.match(cli('feedback', NAME, 'clear-critique'), /removed 1 agent note/);
  assert.equal((await agentNotes(base, '/pricing')).length, 0);
});

test('annotate refuses what it cannot place, with a reason', () => {
  assert.throws(() => cli('feedback', NAME, 'annotate', '/pricing', 'x'), (e) => /full URL/.test(e.stderr));
  assert.throws(() => cli('feedback', NAME, 'annotate', `${ORIGIN}/`, 'x', '--severity', 'meh'), (e) => /severity must be one of/.test(e.stderr));
  assert.throws(() => cli('feedback', NAME, 'annotate', `${ORIGIN}/`), (e) => e.status === 2);
});
