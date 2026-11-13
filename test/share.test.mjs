// `share`: the key-gated proxy in front of a dev server. A tiny upstream stands
// in for Vite/Next; the proxy runs in-process, and the CLI is spawned once with a
// fake `cloudflared` on PATH (never a real tunnel). Needs to bind local ports.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE = mkdtempSync(join(tmpdir(), 'agk-share-store-'));
process.env.AGENTATION_KIT_STORE = STORE; // before the store module loads
const { createShareProxy, injectLoader, keyMatches, LOADER_TAG } = await import('../server/proxy.js');

const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
const NAME = 'share-test';
const KEY = 'test-key-0123456789abcdef';
const PAGE = '<!doctype html><html><head><title>t</title></head><body><h1>Héllo</h1></body></html>';
let upstream, proxy, UP, PX;
const COOKIE = `agk_key=${encodeURIComponent(KEY)}`;

const listen = (server) => new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));
const get = (path, headers = {}) => fetch(PX + path, { redirect: 'manual', headers });
const authed = (path, init = {}) => fetch(PX + path, { redirect: 'manual', ...init, headers: { Cookie: COOKIE, ...init.headers } });

before(async () => {
  upstream = createServer((req, res) => {
    const html = (body, extra = {}) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(body), ETag: '"x"', ...extra }); res.end(body); };
    switch (req.url.split('?')[0]) {
      case '/': return html(PAGE);
      case '/gz': { const z = gzipSync(PAGE); res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Encoding': 'gzip', 'Content-Length': z.length }); return res.end(z); }
      case '/nohead': return html('<html><body><p>no head</p></body></html>');
      case '/fragment': return html('<p>just a fragment</p>');
      case '/stream': {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<!doctype html><html><he');
        setTimeout(() => { res.write('ad><title>s</title></HEAD><body>'); setTimeout(() => res.end('<p>late</p></body></html>'), 30); }, 30);
        return;
      }
      case '/data.json': { const b = JSON.stringify({ a: '</head>' }); res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': b.length }); return res.end(b); }
      case '/events': {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write('data: one\n\n');
        setTimeout(() => res.end('data: two\n\n'), 50);
        return;
      }
      case '/redirect': res.writeHead(302, { Location: `http://localhost:${UP}/landed?x=1` }); return res.end();
      case '/redirect-127': res.writeHead(301, { Location: `http://127.0.0.1:${UP}/landed#top` }); return res.end();
      case '/redirect-away': res.writeHead(302, { Location: 'https://example.com/elsewhere' }); return res.end();
      case '/echo': { const b = JSON.stringify({ url: req.url, headers: req.headers }); res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(b); }
      case '/upload': { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(Buffer.concat(c)); }); return; }
      default: res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('nope');
    }
  });
  // A raw WebSocket handshake that then echoes bytes: enough to prove the splice.
  upstream.on('upgrade', (req, socket) => {
    if (req.headers.host !== `localhost:${UP}`) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\nX-Seen-Cookie: ${req.headers.cookie || ''}\r\n\r\n`);
    socket.on('data', (d) => socket.write(d));
  });
  UP = await listen(upstream);
  proxy = createShareProxy({ target: `http://localhost:${UP}`, name: NAME, key: KEY });
  PX = `http://127.0.0.1:${await listen(proxy.server)}`;
});

after(() => {
  proxy?.close();
  upstream?.closeAllConnections?.(); upstream?.close();
  rmSync(STORE, { recursive: true, force: true });
});

test('injectLoader: before </head>, else </body>, else prepended', () => {
  assert.equal(injectLoader(Buffer.from('<head></head><body></body>')).toString(), `<head>${LOADER_TAG}</head><body></body>`);
  assert.equal(injectLoader(Buffer.from('<body>x</BODY>')).toString(), `<body>x${LOADER_TAG}</BODY>`);
  assert.equal(injectLoader(Buffer.from('<p>x</p>')).toString(), `${LOADER_TAG}<p>x</p>`);
});

test('keyMatches is exact', () => {
  assert.ok(keyMatches(KEY, KEY));
  assert.ok(!keyMatches(KEY + 'x', KEY));
  assert.ok(!keyMatches('', KEY));
  assert.ok(!keyMatches(undefined, KEY));
});

test('gate: no key or a wrong key gets a plain 401, page and API alike', async () => {
  for (const path of ['/', '/data.json', '/__show-and-tell/loader.js', `/?agk_key=wrong`]) {
    const res = await get(path);
    assert.equal(res.status, 401, path);
    assert.match(await res.text(), /needs its key/);
  }
  const wrongCookie = await get('/', { Cookie: 'agk_key=nope' });
  assert.equal(wrongCookie.status, 401);
});

test('gate: the key link sets an HttpOnly SameSite=Lax cookie and redirects without the key', async () => {
  const res = await get(`/pricing?plan=pro&agk_key=${KEY}`);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/pricing?plan=pro');
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, new RegExp(`^agk_key=${KEY};`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(cookie, /Secure/);
  // Behind an https tunnel the cookie is Secure.
  const tunneled = await get(`/?agk_key=${KEY}`, { 'X-Forwarded-Proto': 'https' });
  assert.match(tunneled.headers.get('set-cookie'), /; Secure/);
});

test('gate: the cookie lets requests through, and the dev server never sees it', async () => {
  const res = await authed('/echo', { headers: { Cookie: `${COOKIE}; theirs=1` } });
  assert.equal(res.status, 200);
  const seen = await res.json();
  assert.equal(seen.headers.cookie, 'theirs=1');
  assert.equal(seen.headers.host, `localhost:${UP}`, 'Host is rewritten to the dev server');
  assert.equal(seen.headers['accept-encoding'], 'identity');
});

test('Origin from the public host is rewritten to the dev origin', async () => {
  const seen = await (await authed('/echo', { headers: { Origin: PX } })).json();
  assert.equal(seen.headers.origin, `http://localhost:${UP}`);
});

test('HTML gets the loader before </head> and a correct content-length', async () => {
  const res = await authed('/');
  const body = await res.text();
  assert.equal(body, PAGE.replace('</head>', `${LOADER_TAG}</head>`));
  assert.equal(Number(res.headers.get('content-length')), Buffer.byteLength(body));
  assert.equal(res.headers.get('etag'), null);
});

test('gzip HTML from upstream is decoded, injected and sent plain', async () => {
  const res = await authed('/gz');
  assert.equal(res.headers.get('content-encoding'), null);
  assert.equal(await res.text(), PAGE.replace('</head>', `${LOADER_TAG}</head>`));
});

test('HTML without </head> falls back to </body>, then to prepending', async () => {
  assert.equal(await (await authed('/nohead')).text(), `<html><body><p>no head</p>${LOADER_TAG}</body></html>`);
  assert.equal(await (await authed('/fragment')).text(), `${LOADER_TAG}<p>just a fragment</p>`);
});

test('streamed HTML is injected once, across chunk boundaries', async () => {
  const body = await (await authed('/stream')).text();
  assert.equal(body, `<!doctype html><html><head><title>s</title>${LOADER_TAG}</HEAD><body><p>late</p></body></html>`);
});

test('non-HTML is untouched, including streams', async () => {
  const json = await authed('/data.json');
  assert.equal(await json.text(), JSON.stringify({ a: '</head>' }));
  const sse = await authed('/events');
  assert.equal(sse.headers.get('content-type'), 'text/event-stream');
  assert.equal(await sse.text(), 'data: one\n\ndata: two\n\n');
  const body = 'x'.repeat(100000);
  assert.equal(await (await authed('/upload', { method: 'POST', body })).text(), body);
  assert.equal((await authed('/missing')).status, 404);
});

test('absolute redirects to the dev server come back relative; others are left alone', async () => {
  assert.equal((await authed('/redirect')).headers.get('location'), '/landed?x=1');
  assert.equal((await authed('/redirect-127')).headers.get('location'), '/landed#top');
  assert.equal((await authed('/redirect-away')).headers.get('location'), 'https://example.com/elsewhere');
});

function upgradeVia(headers) {
  return new Promise((resolve, reject) => {
    const req = request(`${PX}/hmr?token=t`, { headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Version': '13', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==', ...headers } });
    req.on('upgrade', (res, socket) => resolve({ status: res.statusCode, headers: res.headers, socket }));
    req.on('response', (res) => { res.resume(); resolve({ status: res.statusCode }); });
    req.on('error', reject);
    req.end();
  });
}

test('WebSocket upgrades pass through with the cookie, and echo', async () => {
  const { status, headers, socket } = await upgradeVia({ Cookie: `${COOKIE}; theirs=1` });
  assert.equal(status, 101);
  assert.equal(headers['sec-websocket-accept'], 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=');
  assert.equal(headers['x-seen-cookie'], 'theirs=1');
  const echoed = await new Promise((r) => { socket.once('data', (d) => r(d.toString())); socket.write('ping'); });
  assert.equal(echoed, 'ping');
  socket.destroy();
});

test('WebSocket upgrades without the key are refused', async () => {
  assert.equal((await upgradeVia({})).status, 401);
  assert.equal((await upgradeVia({ Cookie: 'agk_key=wrong' })).status, 401);
});

test('the review app answers under /__show-and-tell, same origin', async () => {
  const loader = await (await authed('/__show-and-tell/loader.js')).text();
  assert.match(loader, /"endpoint":"\/__show-and-tell\/__ag"/);
  assert.match(loader, /"\/__show-and-tell\/show-and-tell\.js"/);
  const bundle = await authed('/__show-and-tell/show-and-tell.js');
  assert.equal(bundle.status, 200);
  assert.ok((await bundle.arrayBuffer()).byteLength > 300000);

  const json = { Cookie: COOKIE, 'Content-Type': 'application/json', Origin: PX };
  const session = await (await authed('/__show-and-tell/__ag/sessions', { method: 'POST', headers: json, body: JSON.stringify({ url: `${PX}/pricing` }) })).json();
  assert.ok(session.id);
  const posted = await authed(`/__show-and-tell/__ag/sessions/${session.id}/annotations`, {
    method: 'POST', headers: json,
    body: JSON.stringify({ id: 'c1', comment: 'Shared review note', element: 'h1', elementPath: 'main > h1' }),
  });
  assert.ok(posted.ok, `annotation POST ${posted.status}`);
  const list = execFileSync(process.execPath, ['--no-warnings', CLI, 'feedback', NAME, 'list'], { env: { ...process.env, SHOW_AND_TELL_STORE: STORE }, encoding: 'utf8' });
  assert.match(list, /## \/pricing/);
  assert.match(list, /Shared review note/);

  // A foreign site posting into the review API is refused even with the cookie.
  const foreign = await authed(`/__show-and-tell/__ag/sessions`, { method: 'POST', headers: { ...json, Origin: 'https://evil.example' }, body: '{}' });
  assert.equal(foreign.status, 403);
});

test('a dead dev server gives a 502, not a hang', async () => {
  const dead = createShareProxy({ target: 'http://127.0.0.1:1', name: NAME, key: KEY });
  const port = await listen(dead.server);
  const res = await fetch(`http://127.0.0.1:${port}/`, { headers: { Cookie: COOKIE } });
  assert.equal(res.status, 502);
  dead.close();
});

test('CLI: --tunnel runs cloudflared, prints the share link with the key, and stops it on exit', async () => {
  const bin = mkdtempSync(join(tmpdir(), 'agk-fake-cf-'));
  const marker = join(bin, 'stopped');
  // Fake cloudflared: logs like the real one (to stderr), records SIGTERM.
  writeFileSync(join(bin, 'cloudflared'), `#!/bin/sh
if [ "$1" = "--version" ]; then echo "cloudflared version fake"; exit 0; fi
echo "args: $*" >&2
echo "INF |  https://fake-tunnel-words.trycloudflare.com  |" >&2
trap 'echo stopped > ${marker}; exit 0' TERM
while true; do sleep 0.1; done
`);
  chmodSync(join(bin, 'cloudflared'), 0o755);
  const port = 40000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ['--no-warnings', CLI, 'share', '--origin', `http://localhost:${UP}`, '--name', NAME, '--port', String(port), '--tunnel', '--key', KEY], {
    env: { ...process.env, SHOW_AND_TELL_STORE: STORE, PATH: `${bin}:${process.env.PATH}` }, stdio: 'pipe',
  });
  let out = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { out += d; });
  for (let i = 0; i < 100 && !out.includes('share link'); i++) await new Promise((r) => setTimeout(r, 50));
  assert.match(out, new RegExp(`share link\\s+https://fake-tunnel-words\\.trycloudflare\\.com/\\?agk_key=${KEY}`));
  assert.match(out, /WARNING: anyone with the link/);
  assert.equal((await fetch(`http://127.0.0.1:${port}/`)).status, 401);
  assert.equal((await fetch(`http://127.0.0.1:${port}/`, { headers: { Cookie: COOKIE } })).status, 200);
  child.kill('SIGINT');
  await new Promise((r) => child.on('exit', r));
  for (let i = 0; i < 40; i++) { try { execFileSync('test', ['-f', marker]); break; } catch { await new Promise((r) => setTimeout(r, 50)); } }
  assert.doesNotThrow(() => execFileSync('test', ['-f', marker]), 'cloudflared got SIGTERM');
  rmSync(bin, { recursive: true, force: true });
});

test('CLI: --tunnel without cloudflared explains how to install it or use another tunnel', async () => {
  const bin = mkdtempSync(join(tmpdir(), 'agk-no-cf-'));
  const port = 40000 + Math.floor(Math.random() * 20000);
  // PATH without cloudflared: just the node binary's dir would include homebrew, so use an empty dir.
  const child = spawn(process.execPath, ['--no-warnings', CLI, 'share', '--origin', `http://localhost:${UP}`, '--name', NAME, '--port', String(port), '--tunnel'], {
    env: { ...process.env, SHOW_AND_TELL_STORE: STORE, PATH: bin }, stdio: 'pipe',
  });
  let out = '';
  child.stdout.on('data', (d) => { out += d; });
  for (let i = 0; i < 400 && !out.includes('ngrok'); i++) await new Promise((r) => setTimeout(r, 50)); // up to 20s: a cold CI runner is slow to start node
  assert.match(out, /needs cloudflared/);
  assert.match(out, /brew install cloudflared/);
  assert.match(out, new RegExp(`ngrok http ${port}`));
  assert.match(out, /agk_key=[A-Za-z0-9_-]{20,}/, 'a generated key is printed');
  child.kill('SIGINT');
  await new Promise((r) => child.on('exit', r));
  rmSync(bin, { recursive: true, force: true });
});
