// The hosted review proxy behind `show-and-tell share`: one port that forwards
// everything to the project's dev server, injects the toolbar loader into HTML,
// serves the review app on the same origin under /__show-and-tell, and turns
// away anyone without the share key.
//
//   browser ──▶ proxy (127.0.0.1:55940) ──▶ dev server (http://localhost:5173)
//                 ├─ key gate (cookie, else 401) on every request and WebSocket
//                 ├─ /__show-and-tell/*  review app (createReviewApp, same origin)
//                 └─ text/html responses get <script src="/__show-and-tell/loader.js">
//
// WHY a key and not the localhost gate `install` uses: a tunnel makes the dev
// server reachable from the internet, so the hostname says nothing about who is
// asking. The key in the share link is the only thing standing in the way.
import { createServer, request as httpRequest, Agent as HttpAgent } from 'node:http';
import { request as httpsRequest, Agent as HttpsAgent } from 'node:https';
import { createHash, timingSafeEqual, randomBytes } from 'node:crypto';
import { createGunzip, createInflate, createBrotliDecompress } from 'node:zlib';
import { createReviewApp, twin } from './app.js';

export const PREFIX = '/__show-and-tell';
export const KEY_PARAM = 'agk_key';
export const COOKIE = 'agk_key';
export const LOADER_TAG = `<script src="${PREFIX}/loader.js"></script>`;

// Hop-by-hop headers (RFC 9110 §7.6.1) are per connection, never forwarded.
const HOP = ['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'te', 'trailer', 'proxy-authorization', 'proxy-authenticate'];

export const generateKey = () => randomBytes(18).toString('base64url');

/** Constant-time: hash both sides so neither the length nor the content leaks through timing. */
export function keyMatches(given, key) {
  if (typeof given !== 'string' || !given) return false;
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(key).digest();
  return timingSafeEqual(a, b);
}

function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/** The request's Cookie header minus our key, so the dev server never sees it. */
function cookieWithoutKey(header) {
  if (!header) return header;
  const kept = String(header).split(';').filter((p) => p.split('=')[0].trim() !== COOKIE).map((p) => p.trim()).filter(Boolean);
  return kept.length ? kept.join('; ') : undefined;
}

/**
 * Put the loader tag before </head>, else before </body>, else at the very
 * start. Works on bytes (latin1 keeps byte offsets), so UTF-8 is untouched.
 */
export function injectLoader(buf, tag = LOADER_TAG) {
  const lower = buf.toString('latin1').toLowerCase();
  let at = lower.indexOf('</head>');
  if (at < 0) at = lower.lastIndexOf('</body>');
  if (at < 0) at = 0;
  return Buffer.concat([buf.subarray(0, at), Buffer.from(tag), buf.subarray(at)]);
}

const unauthorizedPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Link key needed</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#1b1b1b}</style></head>
<body><h1>This review link needs its key</h1>
<p>Open the full link you were sent (it ends in <code>?${KEY_PARAM}=…</code>). If you don't have it, ask the person who shared it.</p></body></html>
`;

/**
 * @param {object} o
 * @param {string} o.target  the dev server origin, e.g. http://localhost:5173
 * @param {string} o.name    project name; picks the same store `serve` uses
 * @param {string} o.key     the share key
 * @param {object} [o.config] extra toolbar config (framed, routeKey)
 */
export function createShareProxy({ target, name, key, config = {}, src, voiceLocal = false }) {
  if (!key) throw new Error('a share key is required');
  const up = new URL(target);
  if (!/^https?:$/.test(up.protocol)) throw new Error(`--origin must be http(s), got ${target}`);
  const send = up.protocol === 'https:' ? httpsRequest : httpRequest;
  // Our own pool, so close() can let go of every connection to the dev server.
  const agent = up.protocol === 'https:' ? new HttpsAgent({ keepAlive: true, rejectUnauthorized: false }) : new HttpAgent({ keepAlive: true });
  const live = new Set(); // spliced WebSocket sockets, which server.close() doesn't track
  const targetOrigins = new Set([up.origin, twin(up.origin)]);
  // Same origin as the page: no CORS list, the browser treats it as first-party.
  const app = createReviewApp({ name, base: PREFIX, origins: [], config, ...(src ? { src } : {}), voiceLocal, remote: true });

  const publicHost = (req) => String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const isHttps = (req) => String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' || !!req.socket.encrypted;

  /** 'cookie' | 'param' | null. A wrong key in the URL is a no, not a fallback. */
  function authorize(req, url) {
    if (url.searchParams.has(KEY_PARAM)) return keyMatches(url.searchParams.get(KEY_PARAM), key) ? 'param' : null;
    return keyMatches(readCookie(req.headers.cookie, COOKIE), key) ? 'cookie' : null;
  }

  function keyCookie(req) {
    return `${COOKIE}=${encodeURIComponent(key)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 86400}${isHttps(req) ? '; Secure' : ''}`;
  }

  /** Headers for the dev server: its own Host (Vite allowedHosts, Next dev origins), no key cookie. */
  function upstreamHeaders(req, { keepUpgrade = false } = {}) {
    const h = { ...req.headers };
    if (!keepUpgrade) for (const k of HOP) delete h[k];
    h.host = up.host;
    const cookie = cookieWithoutKey(h.cookie);
    if (cookie) h.cookie = cookie; else delete h.cookie;
    // The page's own origin, seen from the dev server's side, is the dev origin.
    for (const k of ['origin', 'referer']) {
      if (!h[k]) continue;
      try {
        const u = new URL(h[k]);
        if (u.host === publicHost(req)) h[k] = up.origin + (k === 'referer' ? u.pathname + u.search : '');
      } catch {}
    }
    return h;
  }

  /** Response headers going back to the browser. */
  function downstreamHeaders(upRes) {
    const h = { ...upRes.headers };
    for (const k of HOP) delete h[k];
    // An absolute redirect to the dev server would send the reviewer to their own localhost.
    if (h.location) {
      try {
        const loc = new URL(h.location, up.origin);
        if (/^[a-z]+:/i.test(h.location) && targetOrigins.has(loc.origin)) h.location = loc.pathname + loc.search + loc.hash;
      } catch {}
    }
    // A cookie pinned to Domain=localhost would be dropped on the public host.
    if (h['set-cookie']) h['set-cookie'] = h['set-cookie'].map((c) => c.replace(/;\s*domain=(localhost|127\.0\.0\.1)(?=;|$)/i, ''));
    h['x-robots-tag'] = 'noindex, nofollow';
    return h;
  }

  function badGateway(res, e) {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(`show-and-tell share: the dev server at ${up.origin} did not answer (${e.code || e.message}). Is it running?\n`);
  }

  function proxy(req, res, url) {
    url.searchParams.delete(KEY_PARAM);
    const upReq = send({
      protocol: up.protocol, hostname: up.hostname, port: up.port || (up.protocol === 'https:' ? 443 : 80),
      method: req.method, path: url.pathname + url.search, agent,
      // identity: the HTML has to be readable to inject into it.
      headers: { ...upstreamHeaders(req), 'accept-encoding': 'identity' },
      rejectUnauthorized: false, // dev servers on https use self-signed certs
    }, (upRes) => {
      // The dev server died mid-response: end ours too, or the reviewer's
      // browser waits on a page that will never finish.
      upRes.on('close', () => { if (!upRes.complete && !res.writableEnded) res.destroy(); });
      const headers = downstreamHeaders(upRes);
      const isHtml = /^\s*text\/html/i.test(headers['content-type'] || '');
      const hasBody = req.method !== 'HEAD' && ![204, 304].includes(upRes.statusCode) && !(upRes.statusCode >= 100 && upRes.statusCode < 200);
      if (!isHtml || !hasBody) {
        res.writeHead(upRes.statusCode, headers);
        upRes.pipe(res);
        return;
      }

      // HTML. Some servers compress anyway; decode so the tag can go in.
      let body = upRes;
      const enc = String(headers['content-encoding'] || '').toLowerCase().trim();
      const decoders = { gzip: createGunzip, 'x-gzip': createGunzip, deflate: createInflate, br: createBrotliDecompress };
      if (enc && enc !== 'identity') {
        if (!decoders[enc]) { res.writeHead(upRes.statusCode, headers); upRes.pipe(res); return; }
        body = upRes.pipe(decoders[enc]());
        body.on('error', (e) => badGateway(res, e));
        delete headers['content-encoding'];
      }
      // Our tag changes the bytes; these describe the old ones.
      delete headers.etag;
      delete headers['content-md5'];

      if (headers['content-length'] && !enc) {
        // A sized page: read it whole, inject, send the exact new length.
        const chunks = [];
        body.on('data', (c) => chunks.push(c));
        body.on('end', () => {
          const out = injectLoader(Buffer.concat(chunks));
          headers['content-length'] = String(out.length);
          res.writeHead(upRes.statusCode, headers);
          res.end(out);
        });
        return;
      }

      // A streamed page (Next, Remix, Astro SSR): hold bytes only until </head>,
      // then let the rest stream through as it comes.
      delete headers['content-length'];
      res.writeHead(upRes.statusCode, headers);
      let held = [];
      let done = false;
      body.on('data', (c) => {
        if (done) return res.write(c);
        held.push(c);
        const buf = Buffer.concat(held);
        if (buf.toString('latin1').toLowerCase().includes('</head>')) {
          res.write(injectLoader(buf));
          held = []; done = true;
        }
      });
      body.on('end', () => {
        if (!done) res.write(injectLoader(Buffer.concat(held)));
        res.end();
      });
    });
    upReq.on('error', (e) => badGateway(res, e));
    res.on('close', () => { if (!res.writableFinished) upReq.destroy(); });
    req.pipe(upReq);
  }

  async function handler(req, res) {
    let url;
    try { url = new URL(req.url, 'http://proxy.invalid'); } catch { res.writeHead(400); return res.end(); }

    const auth = authorize(req, url);
    if (!auth) {
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
      return res.end(req.method === 'HEAD' ? undefined : unauthorizedPage);
    }
    if (auth === 'param') {
      res.setHeader('Set-Cookie', keyCookie(req));
      if (req.method === 'GET' || req.method === 'HEAD') {
        // Take the key out of the address bar (and out of history and Referer).
        url.searchParams.delete(KEY_PARAM);
        // One leading slash: `//evil.com/x` would be a protocol-relative link off this host.
        res.writeHead(302, { Location: '/' + url.pathname.replace(/^[\/\\]+/, '') + url.search, 'Cache-Control': 'no-store' });
        return res.end();
      }
    }

    if (url.pathname === PREFIX || url.pathname.startsWith(PREFIX + '/')) {
      // Cross-site writes: the SameSite cookie already keeps them out; refuse a
      // foreign Origin outright as well.
      const origin = req.headers.origin;
      if (origin && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        let host = null; try { host = new URL(origin).host; } catch {}
        if (host !== publicHost(req) && host !== req.headers.host) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'cross-origin request refused' }));
        }
      }
      return app.handler(req, res, url.pathname.slice(PREFIX.length) || '/');
    }
    proxy(req, res, url);
  }

  /** WebSocket upgrades (Vite / Next HMR): gate, then splice the two sockets together. */
  function upgrade(req, socket, head) {
    const refuse = (status, text) => {
      socket.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Type: text/plain\r\nContent-Length: ${text.length}\r\n\r\n${text}`);
    };
    socket.on('error', () => socket.destroy());
    live.add(socket); socket.on('close', () => live.delete(socket));
    let url;
    try { url = new URL(req.url, 'http://proxy.invalid'); } catch { return refuse(400, 'Bad Request'); }
    if (!authorize(req, url)) return refuse(401, 'Unauthorized');
    if (url.pathname.startsWith(PREFIX)) return refuse(404, 'Not Found');
    url.searchParams.delete(KEY_PARAM);

    const headers = upstreamHeaders(req, { keepUpgrade: true });
    const upReq = send({
      protocol: up.protocol, hostname: up.hostname, port: up.port || (up.protocol === 'https:' ? 443 : 80),
      method: req.method, path: url.pathname + url.search, headers, rejectUnauthorized: false,
    });
    upReq.on('upgrade', (upRes, upSocket, upHead) => {
      const lines = [`HTTP/1.1 ${upRes.statusCode} ${upRes.statusMessage}`];
      for (let i = 0; i < upRes.rawHeaders.length; i += 2) lines.push(`${upRes.rawHeaders[i]}: ${upRes.rawHeaders[i + 1]}`);
      socket.write(lines.join('\r\n') + '\r\n\r\n');
      if (upHead?.length) socket.write(upHead);
      if (head?.length) upSocket.write(head);
      live.add(upSocket); upSocket.on('close', () => live.delete(upSocket));
      upSocket.on('error', () => socket.destroy());
      socket.on('close', () => upSocket.destroy());
      upSocket.on('close', () => socket.destroy());
      upSocket.pipe(socket);
      socket.pipe(upSocket);
    });
    // The dev server answered without upgrading: pass its answer on and hang up.
    upReq.on('response', (upRes) => {
      const lines = [`HTTP/1.1 ${upRes.statusCode} ${upRes.statusMessage}`];
      const h = downstreamHeaders(upRes);
      for (const [k, v] of Object.entries(h)) for (const one of [].concat(v)) lines.push(`${k}: ${one}`);
      lines.push('Connection: close');
      socket.write(lines.join('\r\n') + '\r\n\r\n');
      upRes.pipe(socket);
    });
    upReq.on('error', () => refuse(502, 'Bad Gateway'));
    upReq.end();
  }

  const server = createServer((req, res) => {
    handler(req, res).catch((e) => { console.error(e); if (!res.headersSent) { res.writeHead(500); } res.end(); });
  });
  server.on('upgrade', upgrade);
  /** Stop listening and drop every open connection, both directions. */
  function close() {
    server.close();
    server.closeAllConnections();
    for (const s of live) s.destroy();
    agent.destroy();
  }
  return { server, handler, upgrade, close, app, target: up.origin };
}
