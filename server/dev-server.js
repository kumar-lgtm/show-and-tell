// The review server, started inside a dev server's own process (the Vite,
// Astro and Next.js integrations) instead of `show-and-tell serve` in a second
// terminal. Same app (server/app.js), same store, same port.
//
// One review server per port per process, reference-counted: a dev server that
// restarts (config change) attaches again before the old one detaches, so the
// port is never dropped and re-bound mid-session.
//
// Across processes (two dev servers for the same project, say `vite` and
// `vite --port 5180`): the second finds the port taken by a review server for
// the same project name and attaches to it instead. It registers its page
// origins with the owner over a loopback-only `POST /__origins`, and polls the
// owner every few seconds: when the owner exits, the attached process binds the
// port itself and carries on. A different project name on the port is an error
// rather than notes silently filed under the wrong project.
import { createServer } from 'node:http';
import { createReviewApp, twin } from './app.js';
import { assertSlug } from '../bin/lib.mjs';
import { DEFAULT_PORT } from './loader-tag.js';
import { sanitizeName, defaultName } from './project-name.js';
import { registerServer } from './registry.js';

export { sanitizeName, defaultName };

const KEY = Symbol.for('show-and-tell.review-servers');
const registry = (globalThis[KEY] ??= new Map());
/** How often an attached process checks that the owning process is still there. */
export const TAKEOVER_MS = Number(process.env.AGENTATION_KIT_TAKEOVER_MS) || 3000;

/** Plugin options → the toolbar config createReviewApp takes (same as serve's flags). */
export function toolbarConfig({ framed, routeKey, critique, layoutIntent } = {}) {
  const key = routeKey == null || routeKey === false ? null
    : routeKey === 'search' ? 'search'
    : Array.isArray(routeKey) ? routeKey
    : String(routeKey).split(',').map((s) => s.trim()).filter(Boolean);
  return {
    ...(framed ? { framed: true } : {}),
    ...(key && key.length ? { routeKey: key } : {}),
    ...(critique != null ? { critique: !!critique } : {}),
    ...(layoutIntent != null ? { layoutIntent: !!layoutIntent } : {}),
  };
}

const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const LOOPBACK_ADDR = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

async function probe(base) {
  try {
    const res = await fetch(base + '/', { signal: AbortSignal.timeout(1500) });
    const body = await res.json();
    return body && body.ok && typeof body.name === 'string' ? body : null;
  } catch { return null; }
}

/** Does the owner take origin registrations (a dev-server-hosted review server does; `serve` may not)? */
async function takesOrigins(base) {
  try {
    const res = await fetch(base + '/__origins', { signal: AbortSignal.timeout(1500) });
    return res.ok && (await res.json())?.origins === true;
  } catch { return false; }
}

/** Register page origins with the process that owns the port. Resolves true when accepted. */
async function registerOrigins(base, name, origins) {
  try {
    const res = await fetch(base + '/__origins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, origins }), signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch { return false; }
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const fail = (e) => { server.off('listening', ok); reject(e); };
    const ok = () => { server.off('error', fail); resolve(); };
    server.once('error', fail);
    server.once('listening', ok);
    server.listen(port, '127.0.0.1');
  });
}

const readJson = async (req) => {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 16384) throw new Error('too large'); }
  return JSON.parse(raw || '{}');
};

/**
 * `/__origins`: another dev-server process for the same project adds its page
 * origins. Only from this machine (loopback peer), and never from a browser: a
 * page's fetch always carries Origin (or Sec-Fetch-Site), and the JSON body
 * forces a preflight this endpoint never answers.
 */
async function originsEndpoint(req, res, entry) {
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
  const host = String(req.headers.host || '');
  const hostOk = host === `127.0.0.1:${entry.port}` || host === `localhost:${entry.port}`; // DNS rebinding
  if (!LOOPBACK_ADDR.has(req.socket.remoteAddress) || !hostOk || req.headers.origin || req.headers['sec-fetch-site']) return send(403, { error: 'loopback processes only' });
  if (req.method === 'GET') return send(200, { ok: true, origins: true, name: entry.name });
  if (req.method !== 'POST') return send(405, { error: 'GET or POST' });
  if (!/^application\/json\b/.test(req.headers['content-type'] || '')) return send(415, { error: 'application/json only' });
  let body;
  try { body = await readJson(req); } catch { return send(400, { error: 'bad JSON' }); }
  if (body.name !== entry.name) return send(409, { error: `this review server is for "${entry.name}", not "${body.name}"` });
  const list = Array.isArray(body.origins) ? body.origins : [];
  const valid = list.filter((o) => { try { const u = new URL(o); return /^https?:$/.test(u.protocol) && u.origin === o; } catch { return false; } });
  if (valid.length !== list.length) return send(422, { error: 'origins must be http(s) origins, e.g. http://localhost:5180' });
  for (const o of valid) entry.allow(o);
  send(200, { ok: true, origin: [...entry.app.allowed] });
}

function makeServer(entry) {
  const app = entry.app;
  return createServer((req, res) => {
    if (req.url === '/__origins' || req.url.startsWith('/__origins?')) {
      originsEndpoint(req, res, entry).catch(() => { if (!res.headersSent) { res.writeHead(500); res.end(); } });
      return;
    }
    const origin = req.headers.origin;
    if (origin && !app.allowed.has(origin)) {
      // Next.js doesn't say which port it took, so the plugin trusts the first
      // localhost page that asks, and only that one: another local app's page
      // (a second dev server, a tool's UI) can't read or write this project's notes.
      if (entry.loopback && !entry.learned && LOOPBACK.test(origin)) {
        entry.learned = origin;
        entry.allow(origin);
        if (entry.log) entry.log.info?.(`show-and-tell: accepting pages from ${origin} (set the plugin's \`origin\` option to choose it yourself)`);
      }
      else for (const refresh of entry.refreshers) refresh();
    }
    app.handler(req, res);
  });
}

/** Bind the port with this process's app. false when another process holds it. */
async function own(entry, log, why) {
  const server = makeServer(entry);
  try {
    await listen(server, entry.port);
  } catch (e) {
    if (e.code === 'EADDRINUSE') return false;
    throw e;
  }
  // The dev server keeps the process alive; this one never should on its own.
  server.unref();
  entry.server = server;
  entry.external = null;
  const unregister = registerServer({ port: entry.port, name: entry.name, origin: null, kind: 'plugin', signals: false });
  server.once('close', unregister); // release() closes it while the host process lives on
  log.info(`show-and-tell: review server for "${entry.name}" on ${entry.base}${why ? ` (${why})` : ''} · notes: show-and-tell feedback ${entry.name} list`);
  return true;
}

/** Attached to another process's server: register our origins, and take the port over if it goes away. */
function watchOwner(entry, log) {
  let busy = false;
  entry.timer = setInterval(async () => {
    if (busy || !entry.external) return;
    busy = true;
    try {
      const other = await probe(entry.base);
      if (other && other.name === entry.name) {
        entry.external = { ...other, takesOrigins: entry.external.takesOrigins };
        // A new owner (after a takeover) doesn't know our origins yet.
        const missing = [...entry.origins].filter((o) => !(other.origin || []).includes(o));
        if (missing.length && (entry.external.takesOrigins ||= await takesOrigins(entry.base))) await registerOrigins(entry.base, entry.name, missing);
        return;
      }
      if (other) return; // a different project took the port: nothing we can do from here
      if (await own(entry, log, 'took over: the process that served it stopped')) { clearInterval(entry.timer); entry.timer = null; }
    } catch (e) {
      log.warn(`show-and-tell: could not take over port ${entry.port}: ${e.message}`);
    } finally { busy = false; }
  }, TAKEOVER_MS);
  entry.timer.unref();
}

async function start(entry, { name, port, config, log }) {
  entry.app = createReviewApp({ name, base: entry.base, origins: [entry.base], config, voiceLocal: true });
  if (await own(entry, log)) return;
  const other = await probe(entry.base);
  if (!other) throw new Error(`show-and-tell: port ${port} is taken by something that isn't an show-and-tell review server. Pass a different \`port\` to the plugin (and the same port wherever the loader is rendered).`);
  if (other.name !== name) throw new Error(`show-and-tell: port ${port} is already serving project "${other.name}", not "${name}". Stop that server, or give this project its own \`port\`.`);
  entry.external = { ...other, takesOrigins: await takesOrigins(entry.base) };
  log.info(`show-and-tell: reusing the review server already running for "${name}" on ${entry.base}${entry.external.takesOrigins ? '; this process takes over the port if that one stops' : ''}`);
  if (entry.external.takesOrigins) watchOwner(entry, log);
}

/**
 * Start (or join) the review server for `name` on `port` in this process.
 *
 * @param {object} o
 * @param {string} o.name
 * @param {number} [o.port]
 * @param {object} [o.config]      toolbar config (see toolbarConfig)
 * @param {string[]} [o.origins]   page origins to accept now; more can be added with handle.allow()
 * @param {boolean} [o.loopback]   accept any http(s)://localhost|127.0.0.1 origin (when the dev
 *                                 server's own origin isn't knowable, as in Next.js)
 * @param {{info:Function,warn:Function}} [o.log]
 */
export async function acquireReviewServer({ name, port = DEFAULT_PORT, config = {}, origins = [], loopback = false, log = console }) {
  assertSlug(name);
  port = Number(port);
  let entry = registry.get(port);
  if (entry && entry.name !== name) throw new Error(`show-and-tell: port ${port} is already serving project "${entry.name}" in this process, not "${name}". Give each project its own \`port\`.`);
  if (!entry) {
    const mine = new Set(); // page origins this process has been asked to accept
    entry = {
      name, port, base: `http://127.0.0.1:${port}`, refs: 0, server: null, external: null, app: null, timer: null,
      loopback: false, refreshers: new Set(), warned: new Set(), origins: mine,
      allow(o) {
        const fresh = !mine.has(o);
        for (const v of [o, twin(o)]) mine.add(v);
        if (entry.app) for (const v of mine) entry.app.allowed.add(v);
        const ext = entry.external;
        if (!ext || !fresh || (ext.origin || []).includes(o)) return;
        const warn = () => {
          if (entry.warned.has(o)) return;
          entry.warned.add(o);
          log.warn(`show-and-tell: the review server on port ${port} was started without ${o}, so this page will get 403s. Restart it with --origin ${o}, or stop it and let the plugin start its own.`);
        };
        // Another dev server for this project: tell it about our page. A bare `serve` can't be told.
        if (ext.takesOrigins) registerOrigins(entry.base, name, [o, twin(o)]).then((ok) => { if (!ok) warn(); });
        else warn();
      },
    };
    entry.log = log;
    entry.ready = start(entry, { name, port, config, log });
    registry.set(port, entry);
    entry.ready.catch(() => { if (registry.get(port) === entry) registry.delete(port); });
  }
  entry.refs++;
  try { await entry.ready; } catch (e) { entry.refs--; throw e; }
  if (loopback) entry.loopback = true;
  for (const o of origins) entry.allow(o);

  let released = false;
  const refreshers = new Set();
  return {
    name, port, base: entry.base,
    /** 'external' while another process owns the port; false when this process does. */
    get reused() { return entry.external ? 'external' : false; },
    allow: (o) => entry.allow(o),
    /** Called when an unknown origin knocks, before it is refused (late-resolving dev server URLs). */
    onUnknownOrigin(fn) { refreshers.add(fn); entry.refreshers.add(fn); },
    async release() {
      if (released) return; released = true;
      for (const fn of refreshers) entry.refreshers.delete(fn);
      if (--entry.refs > 0) return;
      if (registry.get(port) === entry) registry.delete(port);
      if (entry.timer) { clearInterval(entry.timer); entry.timer = null; }
      const s = entry.server;
      if (!s) return;
      await new Promise((r) => { s.close(() => r()); s.closeAllConnections?.(); });
    },
  };
}

/**
 * Attach a review server to a running (or about-to-listen) Vite dev server:
 * Vite itself and Astro's dev server. Origins come from Vite's resolved URLs,
 * which only exist after listen, so they are read on `listening` and again
 * whenever an unknown origin knocks. Detaches when Vite's HTTP server closes.
 */
export async function attachToVite(vite, { name, port, config, log = console }) {
  const preset = vite.config?.server?.origin;
  const handle = await acquireReviewServer({ name, port, config, origins: preset ? [new URL(preset).origin] : [], log });
  const http = vite.httpServer;
  const refresh = () => {
    const urls = vite.resolvedUrls;
    for (const u of [...(urls?.local ?? []), ...(urls?.network ?? [])]) { try { handle.allow(new URL(u).origin); } catch {} }
    const a = http?.address?.();
    if (a && typeof a === 'object') handle.allow(`${vite.config?.server?.https ? 'https' : 'http'}://localhost:${a.port}`);
  };
  handle.onUnknownOrigin(refresh);
  if (http) {
    if (http.listening) refresh(); else http.once('listening', refresh);
    http.once('close', () => { handle.release(); });
  } else if (!preset) {
    // Middleware mode: the host server owns the port, so its origin is unknowable here.
    log.warn('show-and-tell: Vite is in middleware mode; set server.origin so the review server accepts your page.');
  }
  return handle;
}
