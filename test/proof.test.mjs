// Three answers to one real failure (pollut.ai, 2026-11-07): the reviewer saw an
// old page and read it as "not done", and notes were closed on passing tests.
//   - freshness: the page learns which of its files changed since it loaded them;
//   - shots: the agent's screenshot of the target, attached to the note;
//   - plan: a reply that says what the agent will do and asks for a go-ahead.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, utimesSync, symlinkSync, mkdtempSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';
import { seedNote, readNote, uniqueName, cleanup, tree, cli, ORIGIN, STORE } from './_seed.mjs';

const { createFreshness, SLACK_MS } = await import('../server/freshness.js');
const { sniff, imageSize, storeShot, shotFile, shotDir, noteSelectors } = await import('../server/shots.js');
const { openProject } = await import('../server/agent.js');
const { createReviewApp } = await import('../server/app.js');
const { handle } = await import('../server/store.js');
const { staleText, loadedFiles, reloadBlocker, nextCacheProbes } = await import('../toolbar/fresh.js');
const { shotsOf } = await import('../toolbar/check.js');
const { noticeText, isPlan } = await import('../toolbar/replies.js');

const dirs = [];
after(() => cleanup(...dirs));

/** A real, minimal PNG of w×h. */
function png(w = 4, h = 3) {
  const crc = (buf) => { let c, crcTable = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; } let x = 0xffffffff; for (const b of buf) x = crcTable[(x ^ b) & 0xff] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---- freshness ---------------------------------------------------------------

test('freshness maps loaded paths to files under src, from a parent or a child folder', () => {
  const src = tree({ 'index.html': '<h1>x</h1>', 'app.js': '1', 'about/index.html': 'a', 'public/logo.svg': '<svg/>', 'data/people.json': '[]' });
  dirs.push(src);
  const f = createFreshness(src);
  assert.equal(f.fileOf('/app.js'), 'app.js');
  // Served from a parent of src (pollut: /explorations/nobody-everywhere/app.js).
  assert.equal(f.fileOf('/explorations/nobody-everywhere/app.js'), 'app.js');
  // Served from a child of src (public/).
  assert.equal(f.fileOf('/logo.svg'), 'public/logo.svg');
  assert.equal(f.fileOf('/data/people.json'), 'data/people.json');
  // Documents: / and /about/ are their index.html.
  assert.equal(f.fileOf('/', { doc: true }), 'index.html');
  assert.equal(f.fileOf('/about/', { doc: true }), 'about/index.html');
  // Nothing guessed: a bundler chunk, a traversal.
  assert.equal(f.fileOf('/assets/index-3f2a.js'), null);
  assert.equal(f.fileOf('/../etc/passwd'), null);
  assert.equal(f.fileOf('/@fs/etc/hosts'), null);
});

test('freshness never follows a link out of src', () => {
  const outside = tree({ 'secret.js': 'x' });
  const src = tree({ 'app.js': '1' });
  dirs.push(outside, src);
  symlinkSync(join(outside, 'secret.js'), join(src, 'linked.js'));
  assert.equal(createFreshness(src).fileOf('/linked.js'), null);
});

test('a file changed after the page loaded it is stale; one changed before is not', () => {
  const src = tree({ 'index.html': 'x', 'app.js': '1', 'style.css': 'a{}' });
  dirs.push(src);
  const loadedAt = Date.now() - 60_000;
  utimesSync(join(src, 'app.js'), new Date(), new Date()); // changed after the load
  utimesSync(join(src, 'style.css'), new Date(loadedAt - 5000), new Date(loadedAt - 5000)); // before
  utimesSync(join(src, 'index.html'), new Date(loadedAt + SLACK_MS / 2), new Date(loadedAt + SLACK_MS / 2)); // inside the slack
  const r = createFreshness(src).check([
    { path: '/', at: loadedAt, doc: true },
    { path: '/app.js', at: loadedAt },
    { path: '/style.css', at: loadedAt },
    { path: '/assets/chunk-1.js', at: loadedAt },
    { path: '/app.js', at: loadedAt }, // the same file twice counts once
  ]);
  assert.equal(r.checked, 3);
  assert.deepEqual(r.stale.map((s) => s.file), ['app.js']);
  assert.ok(r.stale[0].changedAt > loadedAt);
});

test('POST /__ag/freshness answers through the review server', async () => {
  const src = tree({ 'index.html': 'x', 'app.js': '1' });
  dirs.push(src);
  const name = uniqueName('fresh');
  const app = createReviewApp({ name, base: '/__review', src, hosts: false });
  const server = createServer((req, res) => app.handler(req, res, new URL(req.url, 'http://x').pathname.replace(/^\/__review/, '')));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const url = `http://127.0.0.1:${server.address().port}/__review/__ag/freshness`;
    const ok = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ loaded: [{ path: '/app.js', at: Date.now() - 60_000 }] }) });
    assert.equal(ok.status, 200);
    assert.deepEqual((await ok.json()).stale.map((s) => s.file), ['app.js']);
    assert.equal((await fetch(url)).status, 405);
    assert.equal((await fetch(url, { method: 'POST', body: '{"loaded":3}' })).status, 422);
    assert.equal((await fetch(url, { method: 'POST', body: 'nope' })).status, 400);
  } finally { server.closeAllConnections(); await new Promise((r) => server.close(r)); }
});

test('the toolbar reports what it loaded: same origin, newest load per path, cached copies by Last-Modified', () => {
  const t0 = 1_000_000;
  const entries = [
    { name: 'http://localhost:5190/app.js', startTime: 100, transferSize: 900, decodedBodySize: 900 },
    { name: 'http://localhost:5190/app.js?t=2', startTime: 5000, transferSize: 900, decodedBodySize: 900 }, // a hot reload re-fetch
    { name: 'http://localhost:5190/data.js', startTime: 120, transferSize: 0, decodedBodySize: 400 }, // from the cache
    { name: 'http://localhost:5190/old.js', startTime: 130, transferSize: 0, decodedBodySize: 400 }, // cached, age unknown
    { name: 'http://cdn.example/lib.js', startTime: 90, transferSize: 900, decodedBodySize: 900 },
    { name: 'http://localhost:5190/@vite/client', startTime: 10, transferSize: 900, decodedBodySize: 900 },
    { name: 'http://localhost:5190/__show-and-tell/agentation.js', startTime: 10, transferSize: 900, decodedBodySize: 900 },
  ];
  const { loaded, urls } = loadedFiles({
    perf: { timeOrigin: t0, getEntriesByType: () => entries },
    loc: { origin: 'http://localhost:5190', href: 'http://localhost:5190/#context' },
    doc: { lastModified: new Date(t0 - 3_600_000).toUTCString() },
    cachedAt: new Map([['http://localhost:5190/data.js', t0 - 86_400_000]]),
  });
  const at = Object.fromEntries(loaded.map((l) => [l.path, l.at]));
  assert.deepEqual(Object.keys(at).sort(), ['/', '/app.js', '/data.js', '/old.js']);
  assert.equal(at['/app.js'], t0 + 5000, 'the latest fetch wins');
  assert.equal(at['/data.js'], t0 - 86_400_000, 'a cached copy is as old as its Last-Modified');
  assert.equal(at['/old.js'], t0, 'a cached copy of unknown age is no newer than the page');
  assert.ok(Math.abs(at['/'] - (t0 - 3_600_000)) < 1000, "the document's own Last-Modified");
  assert.equal(loaded.find((l) => l.path === '/').doc, true);
  assert.deepEqual([...urls.get('/app.js')], ['http://localhost:5190/app.js', 'http://localhost:5190/app.js?t=2']);
});

test('the strip names what changed, briefly', () => {
  assert.equal(staleText([{ file: 'js/app.js' }]), 'app.js');
  assert.equal(staleText([{ file: 'app.js' }, { file: 'index.html' }]), 'app.js and index.html');
  assert.equal(staleText([{ file: 'a.js' }, { file: 'b.js' }, { file: 'c.css' }]), 'a.js and 2 more');
});

test('reload waits for whatever only this tab holds (Codex review P1)', () => {
  const doc = (texts = []) => ({ querySelectorAll: () => texts.length ? [{ shadowRoot: { querySelectorAll: () => texts.map((value) => ({ value })) }, querySelectorAll: () => [] }] : [] });
  const ok = reloadBlocker({ win: {}, doc: doc() });
  assert.equal(ok, '');
  assert.match(reloadBlocker({ win: { __AGENTATION_KIT_VOICE_RECORDING__: true }, doc: doc() }), /recording/);
  assert.match(reloadBlocker({ win: { __AGENTATION_KIT_VOICE__: { state: 'transcribing' } }, doc: doc() }), /transcript/);
  // Stopped, audio in memory, no transcript yet: the only copy of what was said.
  assert.match(reloadBlocker({ win: { __AGENTATION_KIT_VOICE__: { state: 'editor', hasAudio: true, draft: { passages: [] } } }, doc: doc() }), /transcript/);
  // Transcribed: the draft is saved per reviewer and survives.
  assert.equal(reloadBlocker({ win: { __AGENTATION_KIT_VOICE__: { state: 'editor', hasAudio: true, draft: { passages: [{}] } } }, doc: doc() }), '');
  assert.match(reloadBlocker({ win: { __AGENTATION_KIT_TWEAK__: { count: 1 } }, doc: doc() }), /your tweak first/);
  assert.match(reloadBlocker({ win: { __AGENTATION_KIT_TWEAK__: { count: 3 } }, doc: doc() }), /3 tweaks/);
  assert.match(reloadBlocker({ win: {}, doc: doc(['half a note']) }), /typing/);
  assert.equal(reloadBlocker({ win: {}, doc: doc(['   ']) }), '');
});

test('cached copies are asked their age once each, so one without Last-Modified never blocks the rest (Codex review P2)', () => {
  const cached = (name) => ({ name, transferSize: 0, decodedBodySize: 10 });
  const entries = [...Array.from({ length: 40 }, (_, i) => cached(`http://x/lib-${i}.js`)), cached('http://x/app.js'), { name: 'http://x/net.js', transferSize: 50, decodedBodySize: 50 }];
  const tried = new Set();
  const first = nextCacheProbes(entries, tried);
  assert.equal(first.length, 40);
  for (const e of first) tried.add(e.name); // none had Last-Modified
  assert.deepEqual(nextCacheProbes(entries, tried).map((e) => e.name), ['http://x/app.js'], 'the next poll reaches app.js');
});

// ---- shots -----------------------------------------------------------------------

test('images are recognised by their bytes and measured from their headers', () => {
  const p = png(7, 5);
  assert.equal(sniff(p), 'png');
  assert.deepEqual(imageSize(p), { width: 7, height: 5 });
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x2c, 0x02, 0x58, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(sniff(jpg), 'jpg');
  assert.deepEqual(imageSize(jpg), { width: 600, height: 300 });
  assert.equal(sniff(Buffer.from('<svg/>')), null);
});

test('a stored shot replaces the earlier one of its kind and is served only by its exact name', () => {
  const name = uniqueName('shots');
  const a = storeShot(name, 'note-1', 'after', png(2, 2));
  const b = storeShot(name, 'note-1', 'after', png(3, 3));
  storeShot(name, 'note-1', 'before', png(1, 1));
  assert.notEqual(a.file, b.file);
  const files = readdirSync(shotDir(name, 'note-1')).sort();
  assert.equal(files.length, 2);
  assert.ok(files.includes(b.file) && files.some((f) => f.startsWith('before-')));
  assert.ok(shotFile(name, 'note-1', b.file));
  assert.equal(shotFile(name, 'note-1', a.file), null, 'the older after is gone');
  assert.equal(shotFile(name, '../note-1', b.file), null);
  assert.equal(shotFile(name, 'note-1', `../${b.file}`), null);
  assert.equal(shotFile(name, 'note-1', 'after-1.gif'), null);
  assert.throws(() => storeShot(name, 'note-1', 'after', Buffer.from('not an image')), /PNG or JPEG/);
  assert.throws(() => storeShot(name, 'note-1', 'during', png()), /before or after/);
});

test('a symlinked shot or note folder is never served (Codex review P2)', () => {
  const name = uniqueName('shotlink');
  const outside = tree({ 'secret.png': png(1, 1).toString('binary') });
  dirs.push(outside);
  const real = storeShot(name, 'note-ok', 'after', png(2, 2));
  assert.ok(shotFile(name, 'note-ok', real.file), 'a real shot is served');
  // A file link inside a real note folder.
  mkdirSync(shotDir(name, 'note-a'), { recursive: true });
  symlinkSync(join(outside, 'secret.png'), join(shotDir(name, 'note-a'), 'after-1700000000000.png'));
  assert.equal(shotFile(name, 'note-a', 'after-1700000000000.png'), null);
  // A note folder that is itself a link.
  symlinkSync(outside, shotDir(name, 'note-b'));
  writeFileSync(join(outside, 'after-1700000000001.png'), png(1, 1));
  assert.equal(shotFile(name, 'note-b', 'after-1700000000001.png'), null);
  assert.ok(STORE);
});

test('resolve --shot-file attaches the proof; list shows it; the toolbar re-sync keeps it; the server serves it', async () => {
  const name = uniqueName('proof');
  const note = await seedNote(name, { comment: 'Make the headline say who it is for', elementPath: 'main > h1', element: 'h1' });
  const img = join(mkdtempSync(join(tmpdir(), 'agk-img-')), 'after.png');
  dirs.push(join(img, '..'));
  writeFileSync(img, png(12, 8));

  const r = cli(['feedback', name, 'resolve', note.id, 'Headline now names freelancers', '--shot-file', img]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /resolved.*after shot 12×8/);
  const stored = await readNote(name, note.id);
  assert.equal(stored.status, 'resolved');
  assert.equal(stored.shots.after.width, 12);
  assert.equal(stored.shots.after.by, 'file');
  assert.match(cli(['feedback', name, 'list', '--all']).out, /after shot: 12×8/);
  assert.deepEqual(shotsOf(stored).map((s) => s.kind), ['after']);

  // The toolbar re-POSTs a note with the same client id on load: the proof stays.
  const resync = await handle(new Request(`http://127.0.0.1:55930/__ag/sessions/${stored.sessionId}/annotations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ id: stored.clientId, comment: stored.comment, element: 'h1', elementPath: 'main > h1' }),
  }), name, `sessions/${stored.sessionId}/annotations`);
  assert.ok(resync.ok);
  assert.equal((await readNote(name, note.id)).shots?.after?.file, stored.shots.after.file);

  const app = createReviewApp({ name, base: '/__review', hosts: false });
  const server = createServer((req, res) => app.handler(req, res, new URL(req.url, 'http://x').pathname.replace(/^\/__review/, '')));
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  try {
    const base = `http://127.0.0.1:${server.address().port}/__review/__ag/shots/${note.id}`;
    const got = await fetch(`${base}/${stored.shots.after.file}`);
    assert.equal(got.status, 200);
    assert.equal(got.headers.get('content-type'), 'image/png');
    assert.equal(sniff(Buffer.from(await got.arrayBuffer())), 'png');
    assert.equal((await fetch(`${base}/after-1.png`)).status, 404);
    assert.equal((await fetch(`${base}/..%2F..%2Fsecret`)).status, 404);
    assert.equal((await fetch(`${base}/${stored.shots.after.file}`, { method: 'POST' })).status, 405);
  } finally { server.closeAllConnections(); await new Promise((done) => server.close(done)); }
});

test('a failed picture does not close the note', async () => {
  const name = uniqueName('noproof');
  const note = await seedNote(name, { comment: 'Tighten the spacing' });
  const r = cli(['feedback', name, 'resolve', note.id, 'Done', '--shot-file', '/nope/missing.png']);
  assert.equal(r.code, 1);
  assert.match(r.err, /no file at/);
  assert.equal((await readNote(name, note.id)).status, 'pending');
  assert.equal(cli(['feedback', name, 'reply', note.id, 'Q?', '--shot']).code, 2, '--shot is for resolve and dismiss');
  assert.equal(cli(['feedback', name, 'resolve', note.id, '--shot', '--shot-file', '/x.png']).code, 2);
});

test('shot <id> takes a before for an open note without changing it', async () => {
  const name = uniqueName('before');
  const note = await seedNote(name, { comment: 'Hero image is cropped' });
  const img = join(mkdtempSync(join(tmpdir(), 'agk-img-')), 'b.png');
  dirs.push(join(img, '..'));
  writeFileSync(img, png(5, 5));
  const r = cli(['feedback', name, 'shot', note.id, '--shot-file', img]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /before shot 5×5/);
  const n = await readNote(name, note.id);
  assert.equal(n.status, 'pending');
  assert.equal(n.shots.before.kind, 'before');
});

test('a note is found by its element path first', () => {
  assert.deepEqual(noteSelectors({ elementPath: 'main > h1', selector: '#x', voice: { target: { selector: 'main > h1' } } }), ['main > h1', '#x']);
  assert.deepEqual(noteSelectors({}), []);
});

// ---- plan ------------------------------------------------------------------------

test('reply --plan asks for a go-ahead, and the go-ahead wakes the agent', async () => {
  const name = uniqueName('plan');
  const note = await seedNote(name, { comment: 'Make it feel procedurally generated' });
  const r = cli(['feedback', name, 'reply', note.id, "Here's what I'll do: a different job, city and age on every platform, drawn fresh on each load.", '--plan']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /plan: the reviewer gets Go ahead/);
  const n = await readNote(name, note.id);
  assert.equal(n.replies.at(-1).plan, true);
  assert.equal(isPlan({ reply: n.replies.at(-1) }), true);
  assert.match(cli(['feedback', name, 'list']).out, /plan waiting on a go-ahead[\s\S]*agent \(plan\): Here's what I'll do/);
  assert.equal(cli(['feedback', name, 'resolve', note.id, 'x', '--plan']).code, 2, '--plan is for reply');

  // The reviewer presses Go ahead: an ordinary answer, so wait wakes on it.
  const p = openProject(name);
  p.read();
  // An answer in the same millisecond as the read counts as already read (wait wants newer).
  await new Promise((done) => setTimeout(done, 5));
  await handle(new Request(`http://127.0.0.1:55930/__ag/annotations/${note.id}/reply`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ message: 'Go ahead.' }),
  }), name, `annotations/${note.id}/reply`);
  const woke = await p.wait({ timeout: 5, poll: 50 });
  assert.equal(woke.reason, 'answered');
  assert.deepEqual(woke.answered, [note.id]);
});

test('the notice says plan when every waiting item is a plan', () => {
  assert.equal(noticeText(1, 1), 'The agent has a plan for your note');
  assert.equal(noticeText(2, 2), 'The agent has 2 plans for you');
  assert.equal(noticeText(2, 1), '2 questions from the agent');
  assert.equal(noticeText(1), '1 question from the agent');
});
