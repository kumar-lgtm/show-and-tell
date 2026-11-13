// Fixes from the first real show-and-tell round (pollut.ai, 2026-11-05):
// glued container edits, closing a split thought at once, default names, the
// commit filter for the loader block, and the on-disk server registry.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seedEdit, seedVoice, readNote, tree, cli, cleanup, uniqueName, STORE } from './_seed.mjs';
import { narrowCandidates } from '../server/narrow-edit.js';
import { projectName, projectRoot } from '../server/project-name.js';

const dirs = [];
after(() => cleanup(...dirs));
const src = (files) => { const d = tree(files); dirs.push(d); return d; };

const NAV = `<header class="global-nav"><a class="wordmark" href="#top">pollut.ai<span>®</span></a><span class="nav-statement mono">Personal misinformation as a service</span><a class="nav-cta mono" href="#generator">Pollute me <span>↗</span></a></header>\n`;
const GLUED = { from: 'pollut.ai®Personal misinformation as a servicePollute me ↗', to: 'pollut.ai®Hallucination as a servicePollute me ↗' };

test('narrowCandidates: the changed words, widest context first, never splitting a word', () => {
  const c = narrowCandidates(GLUED.from, GLUED.to);
  assert.deepEqual(c.at(-1), { from: 'Personal misinformation', to: 'Hallucination' });
  assert.ok(c.every((x) => !x.from.startsWith('®') && !x.from.includes('pollut.ai')));
  assert.deepEqual(narrowCandidates('same', 'same'), []);
  assert.deepEqual(narrowCandidates('Alpha', 'Omega'), []); // nothing shared: nothing to narrow
});

test('apply: an edit captured on a container lands on the one element that changed', async () => {
  const name = uniqueName('glued');
  const dir = src({ 'index.html': NAV });
  const note = await seedEdit(name, { ...GLUED, element: 'header', elementPath: 'header.global-nav' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /1 applied/);
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), NAV.replace('Personal misinformation as a service', 'Hallucination as a service'));
  assert.equal((await readNote(name, note.id)).status, 'resolved');
});

test('list: the find pointer for a glued edit names the changed words', async () => {
  const name = uniqueName('gluedptr');
  const dir = src({ 'index.html': NAV });
  await seedEdit(name, { ...GLUED, element: 'header', elementPath: 'header.global-nav' });
  const r = cli(['feedback', name, 'list', '--src', dir]);
  assert.match(r.out, /find: index\.html:1/);
  assert.match(r.out, /change: "Personal misinformation[^"]*" → "Hallucination/);
});

test('apply: a FROM with data in it (not glued source copy) is still refused', async () => {
  const name = uniqueName('data');
  const dir = src({ 'src/G.jsx': 'export const G = ({ name }) => <h2>Welcome back, {name}!</h2>;\n' });
  await seedEdit(name, { from: 'Welcome back, Ana!', to: 'Hi, Ana!' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /0 applied/);
});

test('resolve: a comma list, and --same-target closes one thought split at pauses', async () => {
  const name = uniqueName('voice');
  const s = crypto.randomUUID();
  const a = await seedVoice(name, { comment: 'I feel like it could be more', sessionId: s, passage: 'p1.0', targetId: 'a4' });
  const b = await seedVoice(name, { comment: 'impactfully designed', sessionId: s, passage: 'p2.0', targetId: 'a4' });
  const c = await seedVoice(name, { comment: 'and this other section', sessionId: s, passage: 'p3.0', targetId: 'a5' });
  const d = await seedVoice(name, { comment: 'one more', sessionId: s, passage: 'p4.0', targetId: 'a6' });
  let r = cli(['feedback', name, 'resolve', a.id, 'Lengthened the pin', '--same-target']);
  assert.equal(r.code, 0, r.err);
  assert.equal((await readNote(name, a.id)).status, 'resolved');
  assert.equal((await readNote(name, b.id)).status, 'resolved');
  assert.equal((await readNote(name, b.id)).resolution, 'Lengthened the pin');
  assert.equal((await readNote(name, c.id)).status, 'pending');
  r = cli(['feedback', name, 'dismiss', `${c.id},${d.id}`, 'Out of scope']);
  assert.equal(r.code, 0, r.err);
  assert.equal((await readNote(name, c.id)).status, 'dismissed');
  assert.equal((await readNote(name, d.id)).status, 'dismissed');
  assert.equal(cli(['feedback', name, 'reply', `${c.id},${d.id}`, 'q?']).code, 2);
});

test('default name: stops at the git root, and a worktree is named for its repo', () => {
  const ws = mkdtempSync(join(tmpdir(), 'agk-ws-')); dirs.push(ws);
  writeFileSync(join(ws, 'package.json'), JSON.stringify({ name: 'whole-workspace' }));
  const repo = join(ws, 'pollut.ai'); mkdirSync(join(repo, 'site'), { recursive: true });
  execFileSync('git', ['init', '-q', repo]);
  assert.equal(projectName(undefined, projectRoot(join(repo, 'site'))), 'pollut-ai');
  const wt = join(repo, '.worktrees', 'spike'); mkdirSync(join(wt, 'site'), { recursive: true });
  writeFileSync(join(wt, '.git'), `gitdir: ${join(repo, '.git', 'worktrees', 'spike')}\n`);
  assert.equal(projectName(undefined, projectRoot(join(wt, 'site'))), 'pollut-ai');
});

test('install: commits leave the loader out while the file keeps it; --remove undoes it', () => {
  const repo = mkdtempSync(join(tmpdir(), 'agk-git-')); dirs.push(repo);
  const html = '<html>\n<head>\n  <title>x</title>\n</head>\n<body>hi</body>\n</html>\n';
  const g = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], { encoding: 'utf8' });
  g('init', '-q'); writeFileSync(join(repo, 'index.html'), html); g('add', '.'); g('commit', '-qm', 'init');
  const r = cli(['install', join(repo, 'index.html'), '--port', '55998']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /commits leave the loader out/);
  assert.match(r.out, /Project name "/);
  // Only the loader changed: nothing to commit (status can lag on the stat cache within the same second).
  assert.equal(g('diff'), '');
  g('add', 'index.html');
  assert.equal(g('diff', '--cached'), '');
  writeFileSync(join(repo, 'index.html'), readFileSync(join(repo, 'index.html'), 'utf8').replace('<body>hi', '<body>hello'));
  g('add', 'index.html');
  const staged = g('show', ':index.html');
  assert.equal(staged, html.replace('<body>hi', '<body>hello'));
  assert.match(readFileSync(join(repo, 'index.html'), 'utf8'), /show-and-tell:start/);
  assert.equal(cli(['install', join(repo, 'index.html'), '--remove']).code, 0);
  assert.doesNotMatch(g('check-attr', 'filter', 'index.html'), /show-and-tell|agentation-kit/);
});

test('servers: lists live servers from disk and drops stale records', () => {
  const dir = join(STORE, 'servers'); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '55997.json'), JSON.stringify({ port: 55997, name: 'live-one', origin: 'http://localhost:5189', pid: process.pid, startedAt: 'now' }));
  writeFileSync(join(dir, '55996.json'), JSON.stringify({ port: 55996, name: 'gone', pid: 999999, startedAt: 'then' }));
  const r = cli(['servers']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /55997 {2}live-one/);
  assert.doesNotMatch(r.out, /gone/);
  rmSync(join(dir, '55997.json'));
});

// ---- From the Codex review of the first version (6087c29) ----

test('apply: narrowing never edits text outside the one region FROM came from', async () => {
  const name = uniqueName('region');
  const page = '<h2>Hello {name} world</h2>\n<aside>Ana</aside>\n';
  const dir = src({ 'src/P.jsx': page });
  await seedEdit(name, { from: 'Hello Ana world', to: 'Hello Beth world' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /0 applied/);
  assert.equal(readFileSync(join(dir, 'src/P.jsx'), 'utf8'), page);
});

test('install filter: byte-exact for non-UTF-8 files, paths with spaces, required, shared by worktrees', () => {
  const base = mkdtempSync(join(tmpdir(), 'agk-git2-')); dirs.push(base);
  const repo = join(base, 'my repo');
  const g = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], { encoding: 'utf8' });
  mkdirSync(join(repo, 'My Site'), { recursive: true }); execFileSync('git', ['init', '-q', repo]);
  const page = join(repo, 'My Site', 'index.html');
  writeFileSync(page, '<html>\n<head>\n</head>\n<body>hi</body>\n</html>\n');
  writeFileSync(join(repo, 'legacy.txt'), Buffer.from([0x63, 0x61, 0x66, 0xe9, 0x0a])); // "café" in Windows-1252
  g(repo, 'add', '.'); g(repo, 'commit', '-qm', 'init');
  g(repo, 'worktree', 'add', '-q', join(base, 'wt-b'));
  const pageB = join(base, 'wt-b', 'My Site', 'index.html');
  assert.equal(cli(['install', page, '--port', '55995']).code, 0);
  assert.equal(cli(['install', pageB, '--port', '55995']).code, 0);
  assert.match(g(repo, 'check-attr', 'filter', '--', 'My Site/index.html'), /filter: show-and-tell/);
  assert.equal(g(repo, 'config', '--get', 'filter.show-and-tell.required'), 'true\n');
  // A path with a space is one pattern: staging leaves the loader out.
  g(repo, 'add', 'My Site/index.html');
  assert.doesNotMatch(g(repo, 'show', ':My Site/index.html'), /show-and-tell|agentation-kit/);
  // Bytes in other files survive the filter untouched (only the loader path is filtered,
  // but the helper must be byte-exact anyway).
  const helper = join(repo, '.git', 'show-and-tell-strip.mjs');
  const out = execFileSync(process.execPath, [helper], { input: Buffer.from([0x63, 0x61, 0x66, 0xe9, 0x0a]) });
  assert.deepEqual([...out], [0x63, 0x61, 0x66, 0xe9, 0x0a]);
  // Removing A keeps the shared rule while B still has its loader.
  assert.equal(cli(['install', page, '--remove']).code, 0);
  assert.match(g(join(base, 'wt-b'), 'check-attr', 'filter', '--', 'My Site/index.html'), /filter: show-and-tell/);
  assert.equal(cli(['install', pageB, '--remove']).code, 0);
  assert.doesNotMatch(g(repo, 'check-attr', 'filter', '--', 'My Site/index.html'), /filter: show-and-tell/);
});

test('servers: a record whose pid was reused by a newer process is not reported', () => {
  const dir = join(STORE, 'servers'); mkdirSync(dir, { recursive: true });
  // Our pid is alive, but this process started after "2001": not the recorded server.
  writeFileSync(join(dir, '55994.json'), JSON.stringify({ port: 55994, name: 'reused', pid: process.pid, startedAt: '2001-01-01T00:00:00Z' }));
  assert.doesNotMatch(cli(['servers']).out, /reused/);
});
