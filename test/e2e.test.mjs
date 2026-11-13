// End to end, the way a reviewer and an agent use it: start the server, load
// the toolbar the way an installed page does, leave a note through the HTTP
// API, then read, answer and resolve it from the feedback CLI.
// Needs to bind a local port.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const STORE = mkdtempSync(join(tmpdir(), 'agk-store-'));
const PORT = 40000 + Math.floor(Math.random() * 20000);
const BASE = `http://127.0.0.1:${PORT}`;
const ORIGIN = 'http://localhost:5173';
const NAME = 'e2e-test';
const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
let server;

const cli = (...args) => execFileSync(process.execPath, ['--no-warnings', CLI, ...args], { env, encoding: 'utf8' });
const api = (path, init = {}) => fetch(BASE + path, { ...init, headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...init.headers } });

before(async () => {
  server = spawn(process.execPath, ['--no-warnings', CLI, 'serve', '--origin', ORIGIN, '--name', NAME, '--port', String(PORT)], { env, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE + '/')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server did not start');
});
after(() => { server?.kill(); rmSync(STORE, { recursive: true, force: true }); });

test('serves the loader and the bundle', async () => {
  const loader = await (await api('/loader.js')).text();
  assert.match(loader, /__AGENTATION_KIT_AGENTATION__/);
  assert.match(loader, new RegExp(`${BASE}/__ag`));
  assert.match(loader, /show-and-tell\.js/);
  const bundle = await api('/show-and-tell.js');
  assert.equal(bundle.status, 200);
  assert.ok((await bundle.text()).length > 300000);
});

test('refuses an origin it was not started for', async () => {
  const res = await fetch(BASE + '/__ag/health', { headers: { Origin: 'http://evil.example' } });
  assert.equal(res.status, 403);
});

test('a note round-trips: post → list → reply → resolve', async () => {
  const session = await (await api('/__ag/sessions', { method: 'POST', body: JSON.stringify({ url: `${ORIGIN}/pricing` }) })).json();
  assert.ok(session.id);
  const posted = await api(`/__ag/sessions/${session.id}/annotations`, {
    method: 'POST',
    body: JSON.stringify({ id: 'client-1', comment: 'Make the headline shorter', element: 'h1', elementPath: 'main > h1', selectedText: 'Pricing for everyone' }),
  });
  assert.ok(posted.ok, `annotation POST ${posted.status}`);
  const note = await posted.json();

  const list = cli('feedback', NAME, 'list');
  assert.match(list, /## \/pricing/);
  assert.match(list, /Make the headline shorter/);
  assert.match(list, new RegExp(note.id));

  assert.match(cli('feedback', NAME, 'reply', note.id, 'How', 'short?'), /acknowledged/);
  const afterReply = await (await api(`/__ag/sessions/${session.id}`)).json();
  const replied = afterReply.annotations.find((a) => a.id === note.id);
  assert.equal(replied.replies.at(-1).message, 'How short?');

  assert.match(cli('feedback', NAME, 'resolve', note.id, 'Cut to four words'), /resolved/);
  assert.match(cli('feedback', NAME, 'list'), /No open feedback/);
  assert.match(cli('feedback', NAME, 'list', '--all'), /resolved/);
});

test('install adds a gated loader and --remove restores the exact bytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agk-site-'));
  const file = join(dir, 'index.html');
  const original = '<!doctype html>\n<html>\n  <head>\n    <title>x</title>\n  </head>\n  <body></body>\n</html>\n';
  writeFileSync(file, original);
  cli('install', dir, '--port', String(PORT));
  const installed = readFileSync(file, 'utf8');
  assert.match(installed, /show-and-tell:start/);
  assert.match(installed, new RegExp(`127\\.0\\.0\\.1:${PORT}/loader\\.js`));
  assert.match(installed, /location\.hostname/);
  cli('install', dir, '--remove');
  assert.equal(readFileSync(file, 'utf8'), original);
  rmSync(dir, { recursive: true, force: true });
});
