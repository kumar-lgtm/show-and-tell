// The framework integrations and the shared loader tag. The Vite plugin's hooks
// are driven with a stand-in dev server (an EventEmitter http server), so no
// Vite install is needed; the review server binds real random ports.
// The fixtures under fixtures/install were written by install.mjs before the
// loader tag moved to server/loader-tag.js: installs must stay byte-identical
// (apart from the ?name= the loader URL now carries, and the created-file mark).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE = mkdtempSync(join(tmpdir(), 'agk-plugin-store-'));
process.env.AGENTATION_KIT_STORE = STORE;
process.env.AGENTATION_KIT_TAKEOVER_MS = '150'; // dev-server.js reads it at load
delete process.env.VITEST;
const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const FIX = fileURLToPath(new URL('./fixtures/install/', import.meta.url));

// Imported after the store is set: lib.mjs reads it at load.
const { loaderGate, loaderUrl, DEFAULT_PORT } = await import('../server/loader-tag.js');
const { sanitizeName, defaultName, toolbarConfig, acquireReviewServer } = await import('../server/dev-server.js');
const { default: viteKit } = await import('../integrations/vite.js');
const { default: astroKit } = await import('../integrations/astro.js');
const { withShowAndTell, PHASE_DEVELOPMENT_SERVER } = await import('../integrations/next.js');
const { ShowAndTell } = await import('../integrations/react.js');

let nextPort = 40000 + Math.floor(Math.random() * 15000);
const freshPort = () => nextPort++;
const status = (port, origin) => fetch(`http://127.0.0.1:${port}/`, { headers: origin ? { Origin: origin } : {} });
const isDown = async (port) => { try { await status(port); return false; } catch { return true; } };

/** A Vite dev server, as far as the plugin can tell. */
function fakeVite({ root = '/tmp/x', devPort = 5173 } = {}) {
  const http = new EventEmitter();
  http.listening = false;
  http.address = () => (http.listening ? { port: devPort, address: '::1', family: 'IPv6' } : null);
  const logs = [];
  const logger = { info: (m) => logs.push(['info', m]), warn: (m) => logs.push(['warn', m]), error: (m) => logs.push(['error', m]) };
  return {
    http, logs,
    server: { httpServer: http, resolvedUrls: null, config: { root, logger, server: {} } },
    listen() { http.listening = true; http.emit('listening'); },
    close() { http.listening = false; http.emit('close'); },
  };
}

after(() => rmSync(STORE, { recursive: true, force: true }));

test('loaderGate: localhost-only gate, loader url, offline pill', () => {
  const g = loaderGate({ port: 41234 });
  assert.ok(g.startsWith('if(["localhost","127.0.0.1"].indexOf(location.hostname)>=0){'));
  assert.ok(g.includes(`s.src="${loaderUrl(41234)}"`));
  assert.ok(g.includes('Review toolbar offline: run show-and-tell serve (port 41234) \\u00d7'));
  assert.ok(!g.includes('webdriver'));
  assert.ok(loaderGate({ storybook: true }).includes('!navigator.webdriver'));
  assert.ok(loaderGate().includes(`127.0.0.1:${DEFAULT_PORT}/loader.js`));
  // A hint can't break out of its string literal.
  assert.ok(loaderGate({ hint: 'say "hi"' }).includes('say \\"hi\\"'));
  // It's valid JS.
  new Function(loaderGate({ storybook: true, hint: 'x' }));
});

test('install output is byte-identical to before the loader tag moved, and --remove restores it', () => {
  const cases = [
    ['index.html', 'index.html', 'index.installed.html'],
    ['app/layout.tsx', 'layout.tsx', 'layout.installed.tsx'],
  ];
  for (const [rel, from, expected] of cases) {
    const dir = mkdtempSync(join(tmpdir(), 'agk-install-'));
    mkdirSync(join(dir, rel, '..'), { recursive: true });
    cpSync(join(FIX, from), join(dir, rel));
    execFileSync(process.execPath, [CLI, 'install', dir, '--port', '41234', '--name', 'demo'], { stdio: 'ignore' });
    assert.equal(readFileSync(join(dir, rel), 'utf8'), readFileSync(join(FIX, expected), 'utf8'), rel);
    execFileSync(process.execPath, [CLI, 'install', dir, '--remove'], { stdio: 'ignore' });
    assert.equal(readFileSync(join(dir, rel), 'utf8'), readFileSync(join(FIX, from), 'utf8'), `${rel} --remove`);
    rmSync(dir, { recursive: true, force: true });
  }
  const sb = mkdtempSync(join(tmpdir(), 'agk-sb-'));
  mkdirSync(join(sb, '.storybook'));
  writeFileSync(join(sb, '.storybook', 'main.js'), 'export default {}\n');
  execFileSync(process.execPath, [CLI, 'install', sb, '--port', '41234', '--name', 'demo'], { stdio: 'ignore' });
  assert.equal(readFileSync(join(sb, '.storybook', 'preview-head.html'), 'utf8'), readFileSync(join(FIX, 'preview-head.installed.html'), 'utf8'));
  execFileSync(process.execPath, [CLI, 'install', sb, '--remove'], { stdio: 'ignore' });
  assert.equal(existsSync(join(sb, '.storybook', 'preview-head.html')), false, 'a preview-head install created is removed');
  rmSync(sb, { recursive: true, force: true });
});

test('names and toolbar config', () => {
  assert.equal(sanitizeName('@Acme/Web App'), 'acme-web-app');
  assert.equal(sanitizeName('my_site.v2'), 'my-site-v2');
  const root = mkdtempSync(join(tmpdir(), 'agk-root-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@scope/Cool_App' }));
  assert.equal(defaultName(root), 'scope-cool-app');
  rmSync(join(root, 'package.json'));
  assert.match(defaultName(root), /^agk-root-[a-z0-9-]+$/);
  rmSync(root, { recursive: true, force: true });
  assert.deepEqual(toolbarConfig({}), {});
  assert.deepEqual(toolbarConfig({ framed: true, routeKey: 'id, story', critique: true, layoutIntent: false }), { framed: true, routeKey: ['id', 'story'], critique: true, layoutIntent: false });
  assert.deepEqual(toolbarConfig({ routeKey: 'search' }), { routeKey: 'search' });
});

test('vite plugin: serve only, not builds, preview or Vitest', () => {
  const p = viteKit();
  assert.equal(p.name, 'show-and-tell');
  assert.equal(p.apply({}, { command: 'serve', mode: 'development' }), true);
  assert.equal(p.apply({}, { command: 'build', mode: 'production' }), false);
  assert.equal(p.apply({}, { command: 'serve', mode: 'production', isPreview: true }), false);
  process.env.VITEST = 'true';
  try { assert.equal(p.apply({}, { command: 'serve' }), false); } finally { delete process.env.VITEST; }
});

test('vite plugin: transformIndexHtml injects the gated loader into <head>', () => {
  const tags = viteKit({ port: 41999 }).transformIndexHtml('<html></html>');
  assert.equal(tags.length, 1);
  assert.equal(tags[0].tag, 'script');
  assert.equal(tags[0].injectTo, 'head');
  assert.ok(tags[0].children.includes('location.hostname'));
  assert.ok(tags[0].children.includes('http://127.0.0.1:41999/loader.js'));
  assert.ok(tags[0].children.includes('restart the dev server'));
  assert.ok(viteKit({ start: false }).transformIndexHtml()[0].children.includes('run show-and-tell serve'));
});

test('vite plugin: starts the review server, accepts the dev origin once listening, stops with Vite', async () => {
  const port = freshPort();
  const root = mkdtempSync(join(tmpdir(), 'agk-vite-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'Vite Demo' }));
  const v = fakeVite({ root, devPort: 5199 });
  const p = viteKit({ port, framed: true, routeKey: 'id' });
  p.configResolved(v.server.config);
  await p.configureServer(v.server);

  const s = await (await status(port)).json();
  assert.equal(s.name, 'vite-demo');
  assert.equal((await status(port, 'http://localhost:5199')).status, 403, 'refused before Vite listens');
  v.listen();
  assert.equal((await status(port, 'http://localhost:5199')).status, 200);
  assert.equal((await status(port, 'http://127.0.0.1:5199')).status, 200, 'twin origin');
  assert.equal((await status(port, 'http://evil.example')).status, 403);

  // URLs Vite resolves late are picked up when they first knock.
  v.server.resolvedUrls = { local: ['http://localhost:5199/'], network: ['http://192.168.1.9:5199/'] };
  assert.equal((await status(port, 'http://192.168.1.9:5199')).status, 200);

  const loader = await (await fetch(`http://127.0.0.1:${port}/loader.js`)).text();
  assert.match(loader, /"framed":true/);
  assert.match(loader, /"routeKey":\["id"\]/);
  assert.ok(v.logs.some(([, m]) => m.includes('vite-demo')));

  v.close();
  for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));
  assert.ok(await isDown(port), 'review server closed with Vite');
  rmSync(root, { recursive: true, force: true });
});

test('vite plugin: a restart re-attaches before the old server detaches, and the port stays up', async () => {
  const port = freshPort();
  const a = fakeVite(), b = fakeVite();
  const p1 = viteKit({ port, name: 'restart' }); p1.configResolved(a.server.config);
  await p1.configureServer(a.server); a.listen();
  const p2 = viteKit({ port, name: 'restart' }); p2.configResolved(b.server.config);
  await p2.configureServer(b.server);
  a.close();
  await new Promise((r) => setTimeout(r, 50));
  assert.equal((await (await status(port)).json()).name, 'restart');
  b.close();
  for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));
  assert.ok(await isDown(port));
});

test('vite plugin: a different project on the port in this process is a clear error', async () => {
  const port = freshPort();
  const held = await acquireReviewServer({ name: 'first', port, log: { info() {}, warn() {} } });
  const v = fakeVite();
  const p = viteKit({ port, name: 'second' }); p.configResolved(v.server.config);
  await assert.rejects(p.configureServer(v.server), /already serving project "first".*not "second"/);
  await held.release();
});

test('vite plugin: reuses a separate `serve` process for the same name; refuses a different name', async () => {
  const port = freshPort();
  const env = { ...process.env, SHOW_AND_TELL_STORE: STORE };
  const serve = spawn(process.execPath, ['--no-warnings', CLI, 'serve', '--origin', 'http://localhost:5173', '--name', 'shared', '--port', String(port)], { env, stdio: 'ignore' });
  try {
    for (let i = 0; i < 50 && (await isDown(port)); i++) await new Promise((r) => setTimeout(r, 100));
    const v = fakeVite({ devPort: 5173 });
    const p = viteKit({ port, name: 'shared' }); p.configResolved(v.server.config);
    await p.configureServer(v.server);
    v.listen();
    assert.ok(v.logs.some(([lvl, m]) => lvl === 'info' && m.includes('reusing')));
    assert.ok(!v.logs.some(([lvl]) => lvl === 'warn'), 'origin already accepted, no warning');
    v.close();
    await new Promise((r) => setTimeout(r, 50));
    assert.equal((await (await status(port)).json()).name, 'shared', "closing Vite leaves someone else's server alone");

    const w = fakeVite({ devPort: 5180 });
    const q = viteKit({ port, name: 'shared' }); q.configResolved(w.server.config);
    await q.configureServer(w.server); w.listen();
    assert.ok(w.logs.some(([lvl, m]) => lvl === 'warn' && m.includes('--origin http://localhost:5180')), 'warns that the other server will refuse this origin');
    w.close();

    const x = fakeVite();
    const r = viteKit({ port, name: 'other' }); r.configResolved(x.server.config);
    await assert.rejects(r.configureServer(x.server), /already serving project "shared", not "other"/);
  } finally { serve.kill(); }
});

test('vite plugin: start: false injects the loader but binds nothing', async () => {
  const port = freshPort();
  const v = fakeVite();
  const p = viteKit({ port, start: false, name: 'nostart' }); p.configResolved(v.server.config);
  await p.configureServer(v.server);
  assert.ok(await isDown(port));
});

test('astro integration: dev only, injects into head-inline and starts the server', async () => {
  const port = freshPort();
  const injected = [];
  const it = astroKit({ port, name: 'astro-demo' });
  it.hooks['astro:config:setup']({ command: 'build', config: { root: new URL('file:///tmp/') }, injectScript: (...a) => injected.push(a) });
  assert.equal(injected.length, 0);
  await it.hooks['astro:server:setup']({ server: fakeVite().server });
  assert.ok(await isDown(port), 'nothing started outside dev');

  it.hooks['astro:config:setup']({ command: 'dev', config: { root: new URL('file:///tmp/') }, injectScript: (...a) => injected.push(a) });
  assert.equal(injected[0][0], 'head-inline');
  assert.ok(injected[0][1].includes(`127.0.0.1:${port}/loader.js`));
  const v = fakeVite({ devPort: 4321 });
  await it.hooks['astro:server:setup']({ server: v.server, logger: v.server.config.logger });
  v.listen();
  assert.equal((await status(port, 'http://localhost:4321')).status, 200);
  v.close();
  for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));
  assert.ok(await isDown(port));
});

test('next: withShowAndTell passes the config through and starts only for the dev server', async () => {
  const port = freshPort();
  const cfg = withShowAndTell({ reactStrictMode: true }, { port, name: 'next-demo' });
  assert.deepEqual(await cfg('phase-production-build', {}), { reactStrictMode: true });
  assert.ok(await isDown(port), 'build starts nothing');
  const fn = withShowAndTell((phase) => ({ phase }), { port: freshPort(), start: false });
  assert.deepEqual(await fn(PHASE_DEVELOPMENT_SERVER, {}), { phase: PHASE_DEVELOPMENT_SERVER });

  assert.deepEqual(await cfg(PHASE_DEVELOPMENT_SERVER, {}), { reactStrictMode: true });
  assert.equal((await (await status(port)).json()).name, 'next-demo');
  // Next doesn't say which port it took: the first localhost page is trusted
  // (with its 127.0.0.1 twin), and no other local origin after it.
  assert.equal((await status(port, 'http://localhost:3123')).status, 200);
  assert.equal((await status(port, 'http://127.0.0.1:3123')).status, 200);
  assert.equal((await status(port, 'http://127.0.0.1:3000')).status, 403);
  assert.equal((await status(port, 'http://evil.example')).status, 403);
  // Loading the config again (Next does, per process) joins the same server.
  await cfg(PHASE_DEVELOPMENT_SERVER, {});
});

test('react: <ShowAndTell /> renders only in development', () => {
  const prev = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.equal(ShowAndTell({}), null);
    process.env.NODE_ENV = 'development';
    const el = ShowAndTell({ port: 41777 });
    assert.equal(el.type, 'script');
    assert.ok(el.props.dangerouslySetInnerHTML.__html.includes('127.0.0.1:41777/loader.js'));
    assert.ok(el.props.dangerouslySetInnerHTML.__html.includes('location.hostname'));
  } finally { process.env.NODE_ENV = prev; }
});

test('install: prefers the app entry over Storybook unless --storybook; says which and why', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agk-both-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: '@acme/Shop Front' }));
  mkdirSync(join(dir, '.storybook'));
  writeFileSync(join(dir, '.storybook', 'main.ts'), 'export default {}\n');
  cpSync(join(FIX, 'index.html'), join(dir, 'index.html'));
  const out = execFileSync(process.execPath, [CLI, 'install', dir], { encoding: 'utf8' });
  assert.match(out, /"file": ".*index\.html"/);
  assert.match(out, /add --storybook to install into \.storybook\/preview-head\.html instead/);
  assert.match(out, /"name": "acme-shop-front"/);
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /loader\.js\?name=acme-shop-front"/);
  assert.equal(existsSync(join(dir, '.storybook', 'preview-head.html')), false);
  // --storybook: into the preview head, with the webdriver gate.
  const sb = execFileSync(process.execPath, [CLI, 'install', dir, '--storybook'], { encoding: 'utf8' });
  assert.match(sb, /Storybook preview \(--storybook\)/);
  assert.match(readFileSync(join(dir, '.storybook', 'preview-head.html'), 'utf8'), /navigator\.webdriver/);
  rmSync(dir, { recursive: true, force: true });
});

test('install --remove keeps a preview-head that existed (even empty) and deletes one it created', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agk-sbempty-'));
  mkdirSync(join(dir, '.storybook'));
  writeFileSync(join(dir, '.storybook', 'main.js'), 'export default {}\n');
  const head = join(dir, '.storybook', 'preview-head.html');
  writeFileSync(head, '');
  execFileSync(process.execPath, [CLI, 'install', dir], { stdio: 'ignore' });
  assert.doesNotMatch(readFileSync(head, 'utf8'), /created-file/);
  execFileSync(process.execPath, [CLI, 'install', dir, '--remove'], { stdio: 'ignore' });
  assert.equal(readFileSync(head, 'utf8'), '', 'the empty file the user had is still there');
  rmSync(dir, { recursive: true, force: true });
});

test('install keeps CRLF line endings, and --remove restores the exact bytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agk-crlf-'));
  const crlf = readFileSync(join(FIX, 'index.html'), 'utf8').replace(/\r?\n/g, '\r\n');
  writeFileSync(join(dir, 'index.html'), crlf);
  execFileSync(process.execPath, [CLI, 'install', dir, '--name', 'crlf'], { stdio: 'ignore' });
  const installed = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.match(installed, /show-and-tell:start/);
  assert.equal(installed.split('\n').length, installed.split('\r\n').length, 'every line ends in CRLF');
  execFileSync(process.execPath, [CLI, 'install', dir, '--remove'], { stdio: 'ignore' });
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), crlf);
  rmSync(dir, { recursive: true, force: true });
});

test('plugins: an explicit name with spaces or capitals is sanitised, and the loader carries it', async () => {
  const port = freshPort();
  const v = fakeVite();
  const p = viteKit({ port, name: 'My App' });
  p.configResolved(v.server.config);
  await p.configureServer(v.server);
  assert.equal((await (await status(port)).json()).name, 'my-app');
  assert.ok(p.transformIndexHtml()[0].children.includes(`127.0.0.1:${port}/loader.js?name=my-app"`));
  v.close();
  for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));

  const injected = [];
  const it = astroKit({ port: freshPort(), name: 'Astro Site!' });
  it.hooks['astro:config:setup']({ command: 'dev', config: { root: new URL('file:///tmp/') }, injectScript: (...a) => injected.push(a) });
  assert.match(injected[0][1], /loader\.js\?name=astro-site"/);
  process.env.NODE_ENV = 'development';
  try { assert.match(ShowAndTell({ name: 'Next App' }).props.dangerouslySetInnerHTML.__html, /loader\.js\?name=next-app"/); }
  finally { delete process.env.NODE_ENV; }
});

test('vite plugin inside Storybook: webdriver gate, framed, routeKey id', async () => {
  const { isStorybook } = await import('../integrations/vite.js');
  assert.equal(isStorybook({ root: '/x/app', plugins: [{ name: 'vite:css' }] }), false);
  assert.equal(isStorybook({ root: '/x/app', plugins: [{ name: 'storybook:inject-export-order-plugin' }] }), true);
  assert.equal(isStorybook({ root: '/x/app/.storybook' }), true);
  const port = freshPort();
  const v = fakeVite();
  v.server.config.plugins = [{ name: 'storybook:code-generator-plugin' }];
  const p = viteKit({ port, name: 'sb' });
  p.configResolved(v.server.config);
  assert.ok(p.transformIndexHtml()[0].children.includes('!navigator.webdriver'));
  await p.configureServer(v.server);
  const loader = await (await fetch(`http://127.0.0.1:${port}/loader.js`)).text();
  assert.match(loader, /"framed":true/);
  assert.match(loader, /"routeKey":\["id"\]/);
  // An explicit option still wins, and storybook: false turns detection off.
  const q = viteKit({ port, name: 'sb', storybook: false }); q.configResolved(v.server.config);
  assert.ok(!q.transformIndexHtml()[0].children.includes('webdriver'));
  v.close();
  for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));
});

test('a second dev-server process registers its origin with the owner, and takes the port over when the owner exits', async () => {
  const port = freshPort();
  const script = join(STORE, 'owner.mjs');
  writeFileSync(script, `const { acquireReviewServer } = await import(${JSON.stringify(new URL('../server/dev-server.js', import.meta.url).href)});
await acquireReviewServer({ name: 'multi', port: ${port}, origins: ['http://localhost:5173'], log: { info() {}, warn() {} } });
console.log('ready'); setInterval(() => {}, 1000);`);
  const owner = spawn(process.execPath, ['--no-warnings', script], { env: { ...process.env, SHOW_AND_TELL_STORE: STORE }, stdio: ['ignore', 'pipe', 'inherit'] });
  try {
    await new Promise((ok, fail) => { owner.stdout.once('data', ok); owner.once('exit', fail); });
    assert.equal((await status(port, 'http://localhost:5180')).status, 403, 'unknown before the second process attaches');

    // The endpoint is for processes, not pages, and only for the same project.
    const reg = (body, headers = {}) => fetch(`http://127.0.0.1:${port}/__origins`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
    assert.equal((await reg({ name: 'multi', origins: ['http://evil.example'] }, { Origin: 'http://evil.example' })).status, 403);
    assert.equal((await reg({ name: 'other', origins: ['http://localhost:9'] })).status, 409);
    assert.equal((await reg({ name: 'multi', origins: ['javascript:alert(1)'] })).status, 422);

    const v = fakeVite({ devPort: 5180 });
    const p = viteKit({ port, name: 'multi' }); p.configResolved(v.server.config);
    await p.configureServer(v.server);
    v.listen();
    assert.ok(v.logs.some(([lvl, m]) => lvl === 'info' && m.includes('takes over the port')), JSON.stringify(v.logs));
    let code = 0;
    for (let i = 0; i < 20 && code !== 200; i++) { code = (await status(port, 'http://localhost:5180')).status; if (code !== 200) await new Promise((r) => setTimeout(r, 50)); }
    assert.equal(code, 200, 'the owner now accepts the second dev server\'s page');
    assert.equal((await status(port, 'http://127.0.0.1:5180')).status, 200, 'and its twin');
    assert.ok(!v.logs.some(([lvl]) => lvl === 'warn'), JSON.stringify(v.logs));

    owner.kill();
    await new Promise((r) => owner.once('exit', r));
    let s = null;
    for (let i = 0; i < 40 && !s; i++) { try { s = await (await status(port, 'http://localhost:5180')).json(); } catch { await new Promise((r) => setTimeout(r, 50)); } }
    assert.equal(s?.name, 'multi', 'the attached process took the port over');
    assert.ok(v.logs.some(([, m]) => m.includes('took over')));
    v.close();
    for (let i = 0; i < 20 && !(await isDown(port)); i++) await new Promise((r) => setTimeout(r, 50));
    assert.ok(await isDown(port), 'and released it with its dev server');
  } finally { owner.kill(); }
});

test('the names from before the rename still work: plugin exports, the old command, old loader blocks', async () => {
  const vite = await import('../integrations/vite.js'), astro = await import('../integrations/astro.js');
  const next = await import('../integrations/next.js'), react = await import('../integrations/react.js');
  assert.equal(vite.agentationKit, vite.showAndTell); assert.equal(vite.default, vite.showAndTell);
  assert.equal(astro.agentationKit, astro.showAndTell);
  assert.equal(next.withAgentationKit, next.withShowAndTell); assert.equal(next.default, next.withShowAndTell);
  assert.equal(react.AgentationKit, react.ShowAndTell);
  const { stripLoader, hasLoader, START } = await import('../server/loader-strip.js');
  assert.equal(START, 'show-and-tell:start');
  const old = '<head>\n  <!-- agentation-kit:start — local review toolbar; remove before committing -->\n  <script>x</script>\n  <!-- agentation-kit:end -->\n</head>\n';
  assert.equal(hasLoader(old), true, 'a block written before the rename is still found');
  assert.equal(stripLoader(old), '<head>\n</head>\n', 'and still removed byte for byte');
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const out = execFileSync(process.execPath, ['--no-warnings', fileURLToPath(new URL('../bin/agentation-kit.mjs', import.meta.url)), '--help'], { encoding: 'utf8' });
  assert.match(out, /usage: show-and-tell/, 'the old command is the same program');
});

test('SHOW_AND_TELL_* environment names are read; the old AGENTATION_KIT_* names still work', async () => {
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const probe = "await import(process.argv[1]); console.log(process.env.AGENTATION_KIT_STORE)";
  const envJs = fileURLToPath(new URL('../server/env.js', import.meta.url));
  const run = (env) => execFileSync(process.execPath, ['--input-type=module', '-e', probe, envJs], { encoding: 'utf8', env: { PATH: process.env.PATH, ...env } }).trim();
  assert.equal(run({ SHOW_AND_TELL_STORE: '/new' }), '/new');
  assert.equal(run({ AGENTATION_KIT_STORE: '/old' }), '/old');
  assert.equal(run({ SHOW_AND_TELL_STORE: '/new', AGENTATION_KIT_STORE: '/old' }), '/old', 'an explicit old name is left alone');
});
