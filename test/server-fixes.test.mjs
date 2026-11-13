// Regressions for the server, store and CLI fixes: DELETE as a tombstone, JSON
// never cut to fit, the Host check, KV in SQLite, unknown projects, /__kv input,
// CLI argument errors, critique on query-routed pages, reply timestamps, and the
// agent reading replies to its own critique. Binds local ports for the HTTP parts.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest, createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STORE, CLI, ORIGIN, uniqueName, seedNote, seedEdit, cli, cleanup } from './_seed.mjs';

const { handle, openDb } = await import('../server/store.js');
const { openProject } = await import('../server/agent.js');
const { kvGet, kvSet, kvList } = await import('../server/kv-store.js');
const { createReviewApp } = await import('../server/app.js');
const { fitReplies, TooLarge } = await import('../server/sessions.js');

after(() => cleanup());

const PORT0 = 40000 + Math.floor(Math.random() * 20000);
let portN = 0;
const nextPort = () => PORT0 + portN++;

/** One toolbar API call, in process. Returns {status, body}. */
async function api(name, method, rest, body, headers = {}) {
  // Like app.js: the URL keeps its query, `rest` is the path only.
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }, body: body ? JSON.stringify(body) : undefined,
  }), name, rest.split('?')[0]);
  return { status: res.status, body: await res.json() };
}

async function signedNote(name, reviewer, comment = 'note') {
  const s = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/` });
  return (await api(name, 'POST', `sessions/${s.body.id}/annotations`, { id: crypto.randomUUID(), comment, reviewer, element: 'p', elementPath: 'p' })).body;
}

/** A raw HTTP request with a chosen Host header (fetch will not set one). */
function raw(port, { method = 'GET', path = '/', host, body, headers = {} } = {}) {
  return new Promise((done, fail) => {
    const req = httpRequest({ host: '127.0.0.1', port, method, path, headers: { ...(host ? { Host: host } : {}), ...headers } }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => done({ status: res.statusCode, text }));
    });
    req.on('error', fail);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

async function listen(app) {
  const port = nextPort();
  const server = createServer((req, res) => app.handler(req, res));
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { port, close: () => server.close() };
}

// ---- 1. DELETE is a tombstone, scoped to the reviewer ------------------------

test('DELETE dismisses instead of removing, keeps replies, and only clears your own signed notes', async () => {
  const name = uniqueName('del');
  const alice = await signedNote(name, 'Alice', 'Alice says');
  const p = openProject(name);
  await p.act('reply', alice.id, 'Which colour?');
  await api(name, 'POST', `annotations/${alice.id}/reply`, { message: 'Blue', name: 'Alice' });

  // Bob's "Clear all" cannot take Alice's note, by query or by header.
  let r = await api(name, 'DELETE', `annotations/${alice.id}?reviewer=Bob`);
  assert.equal(r.status, 403);
  assert.match(r.body.error, /Alice/);
  r = await api(name, 'DELETE', `annotations/${alice.id}`, null, { 'X-Agentation-Reviewer': 'Bob' });
  assert.equal(r.status, 403);
  assert.equal(p.get(alice.id).status, 'acknowledged');

  // Alice can (case-insensitive), and the row and its thread survive.
  r = await api(name, 'DELETE', `annotations/${alice.id}?reviewer=alice`);
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'dismissed');
  const kept = p.get(alice.id);
  assert.equal(kept.status, 'dismissed');
  assert.deepEqual(kept.replies.map((m) => m.message), ['Which colour?', 'Blue']);
  assert.ok(p.items({ all: true }).some((a) => a.id === alice.id), 'list --all still shows it');

  // Closed notes are refused like PATCH refuses them.
  r = await api(name, 'DELETE', `annotations/${alice.id}`);
  assert.equal(r.status, 409);
  assert.equal(r.body.error, 'feedback is already closed');
  const done = await signedNote(name, 'Alice');
  await p.act('resolve', done.id, 'Done');
  assert.equal((await api(name, 'DELETE', `annotations/${done.id}`)).status, 409);
  assert.equal(p.get(done.id).status, 'resolved');

  // Unsigned notes, and requests with no name (an older toolbar), still clear.
  const unsigned = await signedNote(name, undefined);
  assert.equal((await api(name, 'DELETE', `annotations/${unsigned.id}?reviewer=Bob`)).status, 200);
  const other = await signedNote(name, 'Carol');
  assert.equal((await api(name, 'DELETE', `annotations/${other.id}`)).status, 200);
});

test('DELETE refuses the agent\'s critique rows', async () => {
  const name = uniqueName('delagent');
  await signedNote(name, 'Alice');
  const p = openProject(name);
  const { annotations: [crit] } = await p.annotate(`${ORIGIN}/`, [{ comment: 'Too tight' }]);
  const r = await api(name, 'DELETE', `annotations/${crit.id}`);
  assert.equal(r.status, 403);
  assert.equal(r.body.error, 'agent feedback is read-only');
  assert.equal(p.items({ author: 'agent' }).length, 1);
});

test('the name prompt can sign a saved unsigned note without rewriting an existing author', async () => {
  const name = uniqueName('sign');
  const note = await signedNote(name, undefined, 'Saved before the prompt was answered');
  const signed = await api(name, 'PATCH', `annotations/${note.id}`, { reviewer: '  Ana\n ' });
  assert.equal(signed.status, 200);
  assert.equal(signed.body.reviewer, 'Ana');
  assert.equal(signed.body.comment, note.comment);
  const changed = await api(name, 'PATCH', `annotations/${note.id}`, { reviewer: 'Ben' });
  assert.equal(changed.body.reviewer, 'Ana');
  assert.equal(openProject(name).get(note.id).reviewer, 'Ana');
  const edit = await seedEdit(name, { from: 'Before', to: 'After' });
  const combined = await api(name, 'PATCH', `annotations/${edit.id}`, { reviewer: 'Ana', edit: { to: 'Better' } });
  assert.equal(combined.body.reviewer, 'Ana');
  assert.equal(combined.body.edit.from, 'Before');
  assert.equal(combined.body.edit.to, 'Better');
});

// ---- 2. Serialized JSON is never sliced ----------------------------------------

test('an oversized payload is trimmed field by field, never cut mid-JSON', async () => {
  const name = uniqueName('big');
  const s = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/` });
  const r = await api(name, 'POST', `sessions/${s.body.id}/annotations`, {
    id: 'big-1', comment: 'Keep me', element: 'p', elementPath: 'p', reviewer: 'Alice',
    nearbyText: 'n'.repeat(90_000), computedStyles: { a: 'x'.repeat(40_000) }, fullPath: 'f'.repeat(5000),
  });
  assert.equal(r.status, 201);
  const row = openDb(name).prepare('SELECT payload FROM ag_annotations WHERE id = ?').get(r.body.id);
  const payload = JSON.parse(row.payload); // valid JSON, not a truncated string
  assert.equal(payload.reviewer, 'Alice');
  assert.ok(payload.nearbyText.length <= 2001);
  assert.equal(openProject(name).get(r.body.id).comment, 'Keep me');
});

test('a payload that cannot be trimmed (a huge text edit) is refused with 413', async () => {
  const name = uniqueName('big413');
  const s = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/` });
  const r = await api(name, 'POST', `sessions/${s.body.id}/annotations`, {
    id: 'e1', kind: 'edit', comment: 'x', edit: { id: 'e', from: 'a', to: 'b'.repeat(70_000) },
  });
  assert.equal(r.status, 413);
  assert.equal(openDb(name).prepare('SELECT COUNT(*) AS n FROM ag_annotations').get().n, 0);
});

test('a long reply thread drops its oldest messages, keeping the first question and valid JSON', async () => {
  const name = uniqueName('thread');
  const note = await seedNote(name, { comment: 'Shorter?' });
  const p = openProject(name);
  await p.act('reply', note.id, 'FIRST QUESTION');
  for (let i = 0; i < 12; i++) {
    const r = await api(name, 'POST', `annotations/${note.id}/reply`, { message: `${i} ${'w'.repeat(8000)}` });
    assert.equal(r.status, 200);
  }
  const stored = openDb(name).prepare('SELECT replies FROM ag_annotations WHERE id = ?').get(note.id).replies;
  const thread = JSON.parse(stored);
  assert.ok(stored.length <= 64 * 1024);
  assert.equal(thread[0].message, 'FIRST QUESTION');
  assert.ok(thread.at(-1).message.startsWith('11 '));
  assert.ok(!thread.some((m) => m.message.startsWith('0 ')), 'oldest answers went first');
  // The agent can still add to it.
  await p.act('reply', note.id, 'Thanks');
  assert.equal(p.get(note.id).replies.at(-1).message, 'Thanks');
});

test('one message too big for a thread on its own is a TooLarge, not a cut', () => {
  assert.throws(() => fitReplies([{ from: 'reviewer', message: 'x'.repeat(70_000), ts: 1 }]), TooLarge);
});

test('a reply thread that is already corrupt is never saved over', async () => {
  const name = uniqueName('corrupt');
  const note = await seedNote(name, { comment: 'x' });
  const db = openDb(name);
  db.prepare('UPDATE ag_annotations SET replies = ? WHERE id = ?').run('[{"from":"agent","mess', note.id);
  const r = await api(name, 'POST', `annotations/${note.id}/reply`, { message: 'hello' });
  assert.equal(r.status, 409);
  await assert.rejects(openProject(name).act('reply', note.id, 'q'), /unreadable/);
  assert.equal(db.prepare('SELECT replies FROM ag_annotations WHERE id = ?').get(note.id).replies, '[{"from":"agent","mess');

  // PATCH of a text edit whose payload is corrupt: refused, not reset to {}.
  const edit = await seedEdit(name, { from: 'Old', to: 'New' });
  db.prepare('UPDATE ag_annotations SET payload = ? WHERE id = ?').run('{"edit":', edit.id);
  const patched = await api(name, 'PATCH', `annotations/${edit.id}`, { edit: { to: 'Newer' } });
  assert.notEqual(patched.status, 200);
  assert.equal(db.prepare('SELECT payload FROM ag_annotations WHERE id = ?').get(edit.id).payload, '{"edit":');
});

// ---- 3. Host check ------------------------------------------------------------

test('a standalone review app answers only to its loopback Host names (DNS rebinding)', async () => {
  const name = uniqueName('host');
  const port = nextPort();
  const app = createReviewApp({ name, base: `http://127.0.0.1:${port}`, origins: [ORIGIN] });
  const server = createServer((req, res) => app.handler(req, res));
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  try {
    assert.equal((await raw(port, { host: `evil.example:${port}`, path: '/__kv' })).status, 403);
    assert.equal((await raw(port, { host: `127.0.0.1.nip.io:${port}`, path: '/__ag/sessions' })).status, 403);
    assert.equal((await raw(port, { host: `127.0.0.1:${port + 1}` })).status, 403);
    for (const host of [`127.0.0.1:${port}`, `localhost:${port}`, `LOCALHOST:${port}`, `[::1]:${port}`]) {
      assert.equal((await raw(port, { host })).status, 200, host);
    }
  } finally { server.close(); }
});

test('mounted under a path (the share proxy) the app leaves Host to its host server', async () => {
  const app = createReviewApp({ name: uniqueName('mount'), base: '/__show-and-tell' });
  const { port, close } = await listen(app);
  try {
    assert.equal((await raw(port, { host: 'abc.trycloudflare.com' })).status, 200);
  } finally { close(); }
  const forced = createReviewApp({ name: uniqueName('mount'), base: '/x', hosts: ['review.test'] });
  const s = await listen(forced);
  try {
    assert.equal((await raw(s.port, { host: 'review.test' })).status, 200);
    assert.equal((await raw(s.port, { host: 'other.test' })).status, 403);
  } finally { s.close(); }
});

// ---- 4. KV in SQLite --------------------------------------------------------------

test('KV: a legacy <name>.json is imported once and kept as .json.imported', () => {
  const name = uniqueName('legacy');
  const file = join(STORE, `${name}.json`);
  writeFileSync(file, JSON.stringify({ 'agentation-design-x': '{"a":1}', 'agent-last-read': '{"round":0,"at":5}' }));
  assert.equal(kvGet(name, 'agentation-design-x').value, '{"a":1}');
  assert.ok(!existsSync(file));
  assert.ok(existsSync(`${file}.imported`));
  assert.deepEqual(kvList(name, 'agentation').items.map((i) => i.key), ['agentation-design-x']);
  // Imported once: a later edit is not overwritten by the old file.
  kvSet(name, 'agentation-design-x', 'new');
  assert.equal(kvGet(name, 'agentation-design-x').value, 'new');
});

test('KV: a corrupt legacy file is left alone and nothing is saved over it', () => {
  const name = uniqueName('legacybad');
  const file = join(STORE, `${name}.json`);
  writeFileSync(file, '{"agentation-round": "{\\"ts');
  assert.deepEqual(kvSet(name, 'agentation-x', '1'), { ok: true });
  assert.equal(readFileSync(file, 'utf8'), '{"agentation-round": "{\\"ts');
  assert.equal(kvGet(name, 'agentation-x').value, '1');
});

test('KV: two processes writing different keys at once lose nothing', async () => {
  const name = uniqueName('race');
  openDb(name);
  const script = (tag) => `const { kvSet } = await import(${JSON.stringify(new URL('../server/kv-store.js', import.meta.url).href)});
    for (let i = 0; i < 60; i++) kvSet(${JSON.stringify(name)}, 'agentation-${tag}-' + i, String(i));`;
  const run = (tag) => new Promise((done) => {
    const c = spawn(process.execPath, ['--input-type=module', '-e', script(tag)], { env: { ...process.env, SHOW_AND_TELL_STORE: STORE }, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = ''; c.stderr.on('data', (d) => { err += d; });
    c.on('exit', (code) => done({ code, err }));
  });
  const results = await Promise.all([run('a'), run('b')]);
  for (const r of results) assert.equal(r.code, 0, r.err);
  assert.equal(kvList(name, 'agentation-').items.length, 120);
});

// ---- 5. Unknown projects ---------------------------------------------------------

test('feedback refuses an unknown project for every command, without creating a store', () => {
  const known = uniqueName('known');
  openDb(known);
  for (const args of [['list'], ['json'], ['wait', '--timeout', '1'], ['resolve', 'ann_x'], ['clear-critique'], ['export'], ['apply'],
    ['annotate', `${ORIGIN}/`, 'note']]) {
    const r = cli(['feedback', 'no-such-project', ...args]);
    assert.equal(r.code, 2, args.join(' '));
    assert.match(r.err, /No review project "no-such-project"/);
    assert.match(r.err, new RegExp(`Known: .*${known}`));
  }
  assert.ok(!existsSync(join(STORE, 'no-such-project.sqlite')));
  const made = cli(['feedback', 'made-here', 'annotate', `${ORIGIN}/`, 'First', 'note', '--create']);
  assert.equal(made.code, 0, made.err);
  assert.ok(existsSync(join(STORE, 'made-here.sqlite')));
});

// ---- 6. /__kv input ---------------------------------------------------------------

test('/__kv: bad JSON is a 400, and DELETE only touches agentation* keys', async () => {
  const name = uniqueName('kvhttp');
  const app = createReviewApp({ name, base: '/m' });
  const { port, close } = await listen(app);
  try {
    const bad = await raw(port, { method: 'POST', path: '/__kv', body: '{nope', headers: { 'Content-Type': 'application/json' } });
    assert.equal(bad.status, 400);
    kvSet(name, 'agent-last-read', '{"at":1}');
    const del = await raw(port, { method: 'DELETE', path: '/__kv?key=agent-last-read' });
    assert.equal(del.status, 422);
    assert.equal(kvGet(name, 'agent-last-read').value, '{"at":1}');
    kvSet(name, 'agentation-x', '1');
    assert.equal((await raw(port, { method: 'DELETE', path: '/__kv?key=agentation-x' })).status, 200);
    assert.equal(kvGet(name, 'agentation-x').value, null);
  } finally { close(); }
});

// ---- 7/8. CLI argument errors and usage ----------------------------------------------

test('bad arguments get one clear line and exit 2, never a stack trace', () => {
  const name = uniqueName('args');
  openDb(name);
  const cases = [
    [['feedback'], /needs a project name/],
    [['feedback', 'Bad Name'], /name must be/],
    [['feedback', name, 'wait', '--timeout', 'abc'], /--timeout must be a positive number/],
    [['feedback', name, 'wait', '--timeout', '-5'], /--timeout must be a positive number/],
    [['feedback', name, 'wait', '--timeout'], /--timeout must be a positive number/],
    [['serve', '--origin', ORIGIN, '--name', name, '--port', 'abc'], /--port must be a number/],
    [['serve', '--origin', 'notaurl', '--name', name], /--origin must be/],
    [['share', '--origin', ORIGIN, '--name', name, '--port', 'abc'], /--port must be a number/],
    [['share', '--origin', 'notaurl', '--name', name], /--origin must be/],
  ];
  for (const [args, message] of cases) {
    const r = cli(args);
    assert.equal(r.code, 2, `${args.join(' ')}: ${r.err}`);
    assert.match(r.err, message);
    assert.doesNotMatch(r.err, /\n\s+at /, `${args.join(' ')} printed a stack trace`);
  }
});

test('apply and export print no usage text; an unknown command prints it once', () => {
  const name = uniqueName('usage');
  openDb(name);
  for (const args of [['apply'], ['export']]) {
    const r = spawnSync(process.execPath, [CLI, 'feedback', name, ...args], { encoding: 'utf8', env: { ...process.env, SHOW_AND_TELL_STORE: STORE } });
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stderr, /usage/);
  }
  const bad = cli(['feedback', name, 'frobnicate']);
  assert.equal(bad.code, 2);
  assert.equal(bad.err.match(/usage:/g).length, 1);
});

// ---- 10. The SQLite ExperimentalWarning ----------------------------------------------

test('no SQLite ExperimentalWarning from our commands or the in-process server; other warnings still print', () => {
  const name = uniqueName('warn');
  openDb(name);
  const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
  const listed = spawnSync(process.execPath, [CLI, 'feedback', name, 'list'], { encoding: 'utf8', env });
  assert.equal(listed.status, 0);
  assert.doesNotMatch(listed.stderr, /ExperimentalWarning/);
  const inProcess = spawnSync(process.execPath, ['--input-type=module', '-e',
    `await import(${JSON.stringify(new URL('../server/dev-server.js', import.meta.url).href)}); process.emitWarning('still here');`], { encoding: 'utf8', env });
  assert.equal(inProcess.status, 0, inProcess.stderr);
  assert.doesNotMatch(inProcess.stderr, /SQLite/);
  assert.match(inProcess.stderr, /still here/);
});

// ---- 11. Critique on query-routed pages ---------------------------------------------

test('annotate with --route-key files a critique under the right story', async () => {
  const name = uniqueName('stories');
  createReviewApp({ name, base: '/m', config: { routeKey: ['id'] } }); // writes <name>.route.json
  const a = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/iframe.html?id=a&viewMode=story`, pageKey: '/iframe.html?id=a' });
  const b = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/iframe.html?id=b&viewMode=story`, pageKey: '/iframe.html?id=b' });
  assert.notEqual(a.body.id, b.body.id);
  const r = await openProject(name).annotate(`http://127.0.0.1:6006/iframe.html?id=b`, [{ comment: 'Story b only' }]);
  assert.equal(r.sessionId, b.body.id);
});

// ---- 12/13. Reply timestamps; reading and waiting on critique replies ------------------

test('wait wakes on a reviewer reply even when its timestamp was stored in seconds', async () => {
  const name = uniqueName('secs');
  const note = await seedNote(name, { comment: 'x' });
  const p = openProject(name);
  p.read(); // receipt: now
  await new Promise((r) => setTimeout(r, 20));
  const secs = Date.now() / 1000 + 1;
  openDb(name).prepare('UPDATE ag_annotations SET replies = ? WHERE id = ?').run(JSON.stringify([{ from: 'reviewer', message: 'old-style', ts: secs }]), note.id);
  assert.ok(p.get(note.id).replies[0].ts > 1e12, 'read back in ms');
  const r = await p.wait({ timeout: 3, poll: 50 });
  assert.equal(r.reason, 'answered');
  assert.deepEqual(r.answered, [note.id]);
});

test('the agent reads its critique with replies (list --agent) and wait wakes on a reply to it', async () => {
  const name = uniqueName('critreply');
  await seedNote(name, { comment: 'reviewer note' });
  const p = openProject(name);
  const { annotations: [crit] } = await p.annotate(`${ORIGIN}/`, [{ comment: 'Contrast is low', selector: 'main' }]);
  p.read();
  await new Promise((r) => setTimeout(r, 20));
  const waiting = p.wait({ timeout: 5, poll: 50 });
  await api(name, 'POST', `annotations/${crit.id}/reply`, { message: 'Agreed, fix it', name: 'Alice' });
  const r = await waiting;
  assert.equal(r.reason, 'answered');
  assert.deepEqual(r.critique.map((a) => a.id), [crit.id]);

  const out = cli(['feedback', name, 'list', '--agent']);
  assert.equal(out.code, 0, out.err);
  assert.match(out.out, /Contrast is low/);
  assert.match(out.out, /reviewer \(Alice\): Agreed, fix it/);
  assert.doesNotMatch(out.out, /reviewer note/);
});

// ---- 5/9/13 over MCP -------------------------------------------------------------------

test('MCP: unknown names never create a store, list_projects skips a corrupt one, get_critique reads replies', async () => {
  const good = uniqueName('mcpgood');
  await seedNote(good, { comment: 'hi' });
  const { annotations: [crit] } = await openProject(good).annotate(`${ORIGIN}/`, [{ comment: 'Spacing is off' }]);
  await api(good, 'POST', `annotations/${crit.id}/reply`, { message: 'Where?', name: 'Bo' });
  writeFileSync(join(STORE, 'broken.sqlite'), 'this is not a database, just text that is long enough to be read');

  const mcp = spawn(process.execPath, [CLI, 'mcp'], { env: { ...process.env, SHOW_AND_TELL_STORE: STORE }, stdio: ['pipe', 'pipe', 'pipe'] });
  const waiting = new Map(); let id = 0; let stderr = '';
  mcp.stderr.on('data', (d) => { stderr += d; });
  createInterface({ input: mcp.stdout }).on('line', (l) => { const m = JSON.parse(l); waiting.get(m.id)?.(m); });
  const call = (name, args = {}) => new Promise((done) => {
    const n = ++id; waiting.set(n, (m) => done(m.result));
    mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method: 'tools/call', params: { name, arguments: args } }) + '\n');
  });
  try {
    const listed = await call('list_projects');
    assert.ok(!listed.isError, listed.content[0].text);
    assert.ok(listed.structuredContent.projects.some((p) => p.name === good));
    assert.deepEqual(listed.structuredContent.skipped.map((s) => s.name), ['broken']);

    const ann = await call('annotate', { project: 'typo-name', url: `${ORIGIN}/`, items: [{ comment: 'x' }] });
    assert.ok(ann.isError);
    assert.match(ann.content[0].text, /No review project "typo-name"/);
    const clr = await call('clear_critique', { project: 'typo-name' });
    assert.ok(clr.isError);
    assert.ok(!existsSync(join(STORE, 'typo-name.sqlite')));
    const created = await call('annotate', { project: 'typo-ok', url: `${ORIGIN}/`, items: [{ comment: 'x' }], create: true });
    assert.ok(!created.isError, created.content[0].text);

    const crit2 = await call('get_critique', { project: good });
    assert.equal(crit2.structuredContent.count, 1);
    assert.match(crit2.content[0].text, /Spacing is off/);
    assert.match(crit2.content[0].text, /Where\?/);
    assert.doesNotMatch(stderr, /ExperimentalWarning/);
  } finally { mcp.kill(); }
});

// ---- /loader.js?name= ------------------------------------------------------------------

test('/loader.js with another project\'s name loads nothing and warns; no name or the same name loads', async () => {
  const name = uniqueName('loadername');
  const port = nextPort();
  const app = createReviewApp({ name, base: `http://127.0.0.1:${port}`, origins: [ORIGIN] });
  const server = createServer((req, res) => app.handler(req, res));
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  try {
    const other = await raw(port, { path: '/loader.js?name=someone-else', host: `localhost:${port}` });
    assert.equal(other.status, 200);
    assert.doesNotMatch(other.text, /show-and-tell\.js/);
    assert.match(other.text, /console\.warn/);
    assert.match(other.text, new RegExp(`port ${port} is for project \\\\"${name}\\\\", not \\\\"someone-else\\\\"`));
    for (const path of ['/loader.js', `/loader.js?name=${name}`]) {
      const ok = await raw(port, { path, host: `127.0.0.1:${port}` });
      assert.equal(ok.status, 200);
      assert.match(ok.text, /show-and-tell\.js/, path);
    }
    // Plugin takeover still relies on these.
    assert.ok(app.allowed instanceof Set);
    app.allowed.add('http://localhost:7777');
    const status = JSON.parse((await raw(port, { host: `127.0.0.1:${port}` })).text);
    assert.equal(status.ok, true);
    assert.equal(status.name, name);
    assert.ok(status.origin.includes('http://localhost:7777'));
  } finally { server.close(); }
});
