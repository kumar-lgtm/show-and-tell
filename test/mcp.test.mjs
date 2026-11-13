// The MCP server end to end: a real review server takes a note over HTTP the way
// the toolbar does, and an MCP client on stdio reads, answers and resolves it.
// Needs to bind a local port.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const STORE = mkdtempSync(join(tmpdir(), 'agk-mcp-'));
const PORT = 40000 + Math.floor(Math.random() * 20000);
const BASE = `http://127.0.0.1:${PORT}`;
const ORIGIN = 'http://localhost:5174';
const NAME = 'mcp-test';
const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
let server, mcp, nextId = 1;
const waiting = new Map();
const notes = [];
let stdout = [];

const api = (path, init = {}) => fetch(BASE + path, { ...init, headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...init.headers } });

function rpc(method, params) {
  const id = nextId++;
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) }) + '\n');
  return new Promise((done, failed) => {
    const t = setTimeout(() => failed(new Error(`no answer to ${method}`)), 15000);
    waiting.set(id, (m) => { clearTimeout(t); done(m); });
  });
}
const call = async (name, args = {}, meta) => (await rpc('tools/call', { name, arguments: args, ...(meta ? { _meta: meta } : {}) })).result;

before(async () => {
  server = spawn(process.execPath, ['--no-warnings', CLI, 'serve', '--origin', ORIGIN, '--name', NAME, '--port', String(PORT)], { env, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE + '/')).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  mcp = spawn(process.execPath, ['--no-warnings', CLI, 'mcp'], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  createInterface({ input: mcp.stdout }).on('line', (line) => {
    stdout.push(line);
    const m = JSON.parse(line); // anything that is not JSON-RPC on stdout fails here
    if (m.id != null && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } else notes.push(m);
  });
});
after(() => { mcp?.kill(); server?.kill(); rmSync(STORE, { recursive: true, force: true }); });

test('handshake: initialize negotiates the version, ping answers', async () => {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
  assert.equal(init.result.protocolVersion, '2025-06-18');
  assert.ok(init.result.capabilities.tools);
  assert.equal(init.result.serverInfo.name, 'show-and-tell');
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const old = await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
  assert.equal(old.result.protocolVersion, '2024-11-05');
  const future = await rpc('initialize', { protocolVersion: '2099-01-01', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
  assert.equal(future.result.protocolVersion, '2025-06-18');
  assert.deepEqual((await rpc('ping')).result, {});
  assert.equal((await rpc('resources/list')).error.code, -32601);
});

test('tools/list describes every tool with a schema', async () => {
  const { tools } = (await rpc('tools/list')).result;
  assert.deepEqual(tools.map((t) => t.name).sort(), ['acknowledge', 'annotate', 'clear_critique', 'dismiss', 'get_critique', 'get_note', 'get_pending', 'list_projects', 'reply', 'resolve', 'shot', 'wait_for_round']);
  for (const t of tools) {
    assert.ok(t.description.length > 40, `${t.name} needs a real description`);
    assert.equal(t.inputSchema.type, 'object');
  }
  assert.ok(tools.find((t) => t.name === 'reply').inputSchema.required.includes('message'));
});

test('a full round over MCP: seed → get_pending → reply → wait → resolve', async () => {
  const session = await (await api('/__ag/sessions', { method: 'POST', body: JSON.stringify({ url: `${ORIGIN}/pricing` }) })).json();
  const note = await (await api(`/__ag/sessions/${session.id}/annotations`, {
    method: 'POST',
    body: JSON.stringify({ id: 'client-1', comment: 'Make the headline shorter', element: 'h1', elementPath: 'main > h1', selectedText: 'Pricing for everyone' }),
  })).json();

  const projects = await call('list_projects');
  assert.equal(projects.structuredContent.projects.find((p) => p.name === NAME).open, 1);

  const pending = await call('get_pending', { project: NAME });
  assert.ok(!pending.isError);
  assert.match(pending.content[0].text, /## \/pricing/);
  assert.match(pending.content[0].text, /Make the headline shorter/);
  assert.equal(pending.structuredContent.count, 1);
  assert.equal(pending.structuredContent.notes[0].id, note.id);

  const one = await call('get_note', { project: NAME, id: note.id });
  assert.equal(one.structuredContent.note.comment, 'Make the headline shorter');

  const replied = await call('reply', { project: NAME, id: note.id, message: 'How short?' });
  assert.equal(replied.structuredContent.note.status, 'acknowledged');
  const live = await (await api(`/__ag/sessions/${session.id}`)).json();
  assert.equal(live.annotations.find((a) => a.id === note.id).replies.at(-1).message, 'How short?');

  // Nothing new since get_pending: the wait times out, and reports progress while it waits.
  const quiet = await call('wait_for_round', { project: NAME, timeout: 3 }, { progressToken: 'w1' });
  assert.equal(quiet.structuredContent.reason, 'timeout');
  assert.ok(notes.some((m) => m.method === 'notifications/progress' && m.params.progressToken === 'w1'));

  // The reviewer presses "Send to agent" while the agent waits.
  const woke = call('wait_for_round', { project: NAME, timeout: 20 });
  await new Promise((r) => setTimeout(r, 500));
  await api('/__kv', { method: 'POST', body: JSON.stringify({ key: 'agentation-round', value: JSON.stringify({ ts: Date.now(), open: 1, pages: 1 }) }) });
  const round = await woke;
  assert.equal(round.structuredContent.reason, 'round');
  assert.match(round.content[0].text, /Reviewer sent the round/);

  const resolved = await call('resolve', { project: NAME, id: note.id, note: 'Cut to four words' });
  assert.equal(resolved.structuredContent.note.status, 'resolved');
  assert.match((await call('get_pending', { project: NAME })).content[0].text, /No open feedback/);
  assert.equal((await call('get_pending', { project: NAME, all: true })).structuredContent.notes[0].resolution, 'Cut to four words');
});

test('annotate and clear_critique leave and remove the agent\'s own notes', async () => {
  const r = await call('annotate', { project: NAME, url: `${ORIGIN}/pricing`, items: [{ selector: 'main h1', comment: 'Headline wraps at 390px', severity: 'blocking' }, { comment: 'No pricing FAQ' }] });
  assert.ok(!r.isError, r.content[0].text);
  assert.equal(r.structuredContent.annotations.length, 2);
  const agent = await (await api('/__ag/sessions?author=agent', { method: 'POST', body: JSON.stringify({ url: `${ORIGIN}/pricing` }) })).json();
  assert.equal(agent.annotations.filter((a) => a.author === 'agent').length, 2);
  const cleared = await call('clear_critique', { project: NAME });
  assert.equal(cleared.structuredContent.removed, 2);
});

test('errors come back as isError with something to act on', async () => {
  const missing = await call('get_pending', {});
  assert.ok(missing.isError);
  assert.match(missing.content[0].text, /project/);
  const unknown = await call('get_pending', { project: 'nope' });
  assert.ok(unknown.isError);
  assert.match(unknown.content[0].text, new RegExp(`Known: ${NAME}`));
  const badId = await call('resolve', { project: NAME, id: 'ann_missing' });
  assert.ok(badId.isError);
  assert.match(badId.content[0].text, /No note ann_missing/);
  const badSeverity = await call('annotate', { project: NAME, url: `${ORIGIN}/`, items: [{ comment: 'x', severity: 'meh' }] });
  assert.ok(badSeverity.isError);
  const relative = await call('annotate', { project: NAME, url: '/pricing', items: [{ comment: 'x' }] });
  assert.match(relative.content[0].text, /full URL/);
  const tool = await rpc('tools/call', { name: 'nope', arguments: {} });
  assert.equal(tool.error.code, -32602);
  assert.ok(stdout.every((l) => JSON.parse(l).jsonrpc === '2.0'));
});

test('an argument whose schema type is a list (resolve shot: true or a path) passes the type check', async () => {
  const text = (r) => r.content.map((c) => c.text).join(' ');
  for (const shot of [true, '/nope/proof.png']) {
    const r = await call('resolve', { project: NAME, id: 'no-such-note', note: 'x', shot });
    assert.doesNotMatch(text(r), /"shot" must be/, `shot: ${JSON.stringify(shot)} is a valid type`);
  }
  const wrong = await call('resolve', { project: NAME, id: 'no-such-note', shot: 5 });
  assert.ok(wrong.isError);
  assert.match(text(wrong), /"shot" must be one of boolean, string/);
});
