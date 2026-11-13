// The review server as a request handler, so it can run on its own port beside a
// dev server (`serve`) or be mounted inside another server under a prefix (the
// hosted `share` proxy). Everything it serves:
//
//   /            status JSON          /loader.js   config + bridge + bundle loader
//   /show-and-tell.js  toolbar bundle    /__ag/*      sessions + notes API, SSE
//   /__kv        localStorage mirror           /__ag/copy-map  the page's copy, joined with the source's
//   /__ag/freshness  which loaded files changed /__ag/shots/<id>/<file>  the agent's proof screenshots
import './env.js';
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { bundlePath, STORE } from '../bin/lib.mjs';
import { handle, pipeWebResponse, openDb } from './store.js';
import { kvList, kvSet, kvDelete } from './kv-store.js';
import { kvBridge, agentationConfig } from './client.js';
import { createVoiceHandler, VOICE_LIMITS } from './voice.js';
import { voiceTranscriberFromEnv } from './voice-providers.js';
import { createVoiceBudget } from './voice-budget.js';
import { publicAgentWork } from './agent-work.js';
import { extractCopy } from './copy-map.js';
import { placeCopy } from './copy-place.js';
import { checkCopyEdits } from './copy-edit.js';
import { createFreshness } from './freshness.js';
import { shotFile } from './shots.js';
import { managedLocalTranscriber } from './voice-local.js';

/** Built-in local transcription is on unless SHOW_AND_TELL_VOICE says off. */
const builtInVoice = (env = process.env) => !/^(off|0|false|no)$/i.test(String(env.SHOW_AND_TELL_VOICE ?? env.AGENTATION_KIT_VOICE ?? ''));

/**
 * The Host values a loopback server on `port` answers to.
 *
 * WHY: a page on any website can make the browser send requests to
 * 127.0.0.1:<port>, and with DNS rebinding (attacker.example resolving to
 * 127.0.0.1 after the page loads) those requests are same-origin to the attacker
 * and can READ the answers — every note, every KV key. The one thing the
 * attacker cannot change is the Host header, which still says attacker.example.
 * So a server that only answers to its own loopback names is out of reach.
 */
export function loopbackHosts(port) {
  return new Set(['127.0.0.1', 'localhost', '[::1]'].map((h) => `${h}:${port}`));
}

/** The loopback Host set for an absolute base on a loopback host, else null (no check). */
function hostsFor(base) {
  try {
    const u = new URL(base);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname)) return null;
    return loopbackHosts(u.port || (u.protocol === 'https:' ? '443' : '80'));
  } catch { return null; } // a root path (`/__show-and-tell`): mounted inside another server
}

// localhost and 127.0.0.1 are different origins to the browser; accept both.
export const twin = (o) => o.includes('//localhost') ? o.replace('//localhost', '//127.0.0.1') : o.replace('//127.0.0.1', '//localhost');

/**
 * @param {object} o
 * @param {string} o.name      project name ([a-z0-9-])
 * @param {string} o.base      how the BROWSER reaches this app: an origin
 *                             (`http://127.0.0.1:55930`) or a root path on the page's own origin (`/__show-and-tell`)
 * @param {string[]} [o.origins] page origins allowed to call it cross-origin
 * @param {object} [o.config]  extra toolbar config (critique, layoutIntent, framed, routeKey, …)
 * @param {string} [o.src]     the project's source root, read by copy edit mode (default: cwd).
 *                             Never sent to the page.
 * @param {Iterable<string>|false} [o.hosts]  Host header values to answer (DNS-rebinding guard).
 *                             Defaults to the loopback names on base's port when base is an
 *                             absolute loopback origin, and to no check when base is a path —
 *                             the `share` proxy mounts the app that way, and it has its own key
 *                             gate and a public (tunnel) host that is not known in advance.
 *                             `false` turns the check off.
 */
export function createReviewApp({ name, base, origins = [], config = {}, hosts, voiceTranscriber, voiceLocal = false, voiceLimits, voiceBudget, src = process.cwd() }) {
  const allowed = new Set(origins.flatMap((o) => [o, twin(o)]));
  const allowedHosts = hosts === false ? null : hosts ? new Set([...hosts].map((h) => String(h).toLowerCase())) : hostsFor(base);
  const routeKey = config.routeKey ?? null;
  const voice = createVoiceHandler({
    // An explicit provider wins, then a configured URL, then (where the caller
    // asks for it: serve, the plugins, share) the built-in local model.
    transcriber: voiceTranscriber === undefined ? (voiceTranscriberFromEnv() || (voiceLocal && builtInVoice() ? managedLocalTranscriber(typeof voiceLocal === 'object' ? voiceLocal : {}) : null)) : voiceTranscriber,
    limits: voiceLimits,
    budget: voiceBudget === undefined ? createVoiceBudget(name, process.env.AGENTATION_KIT_VOICE_DAILY_SECONDS ?? 1800) : voiceBudget,
  });
  const js = (tag) => tag.replace(/^\s*<script>/, '').replace(/<\/script>\s*$/, '');
  const isolate = `(function(){
    var NAME = ${JSON.stringify(name)}, MARK = "sk-dev-project", STASH = "sk-dev-stash:";
    var tool = function(k){ return k && k.indexOf("feedback-toolbar-") !== 0 && k.indexOf("sk-dev-") !== 0 &&
      (k.indexOf("agentation") === 0 || k.indexOf("feedback-") === 0 || k.indexOf("sk-") === 0); };
    try {
      var prev = localStorage.getItem(MARK);
      if (prev === NAME) return;
      var out = {}, keys = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (tool(k)) keys.push(k); }
      keys.forEach(function(k){ out[k] = localStorage.getItem(k); localStorage.removeItem(k); });
      // Keys from before isolation existed have no owner; park them, never drop.
      if (keys.length) localStorage.setItem(STASH + (prev || "unlabelled"), JSON.stringify(out));
      var mine = localStorage.getItem(STASH + NAME);
      if (mine) { var o = JSON.parse(mine); for (var key in o) localStorage.setItem(key, o[key]); localStorage.removeItem(STASH + NAME); }
      localStorage.setItem(MARK, NAME);
    } catch (e) {}
  })();`;

  // Order is load-bearing: config, bridge, then the bundle.
  const loader = `(function(){
if (window.__AGENTATION_KIT__) return; window.__AGENTATION_KIT__ = ${JSON.stringify(name)};
${isolate}
${js(agentationConfig({
  endpoint: `${base}/__ag`,
  // Local dev defaults: one reviewer and one agent. Critique markers and the
  // layout-intent prompt are opt-in (serve --critique / --layout-intent).
  critique: false,
  layoutIntent: false,
  ...Object.fromEntries(Object.entries(config).filter(([, v]) => v != null)),
}))}
${js(kvBridge(`${base}/__kv`))}
var s = document.createElement("script"); s.src = ${JSON.stringify(`${base}/show-and-tell.js`)}; s.defer = true;
document.head.appendChild(s);
})();`;

  // `feedback` groups notes by the same page key the toolbar used. Written to a
  // temp file and renamed, so a reader never sees half of it.
  try {
    mkdirSync(STORE, { recursive: true });
    const file = join(STORE, `${name}.route.json`), tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify({ routeKey }));
    renameSync(tmp, file);
  } catch {}
  // The store exists from the moment a review server does, so `feedback` and the
  // MCP tools can tell a real project with no notes yet from a mistyped name.
  try { openDb(name); } catch {}

  // Copy view snapshots: the page's outline joined with the source at the moment
  // the reviewer opened the view, plus the session their notes go to. Memory only;
  // the view re-opens from the page if one expires.
  const snapshots = new Map();
  const SNAPSHOT_MS = 6 * 60 * 60 * 1000, SNAPSHOT_MAX = 24;
  const keepSnapshot = (value) => {
    const now = Date.now();
    for (const [k, v] of snapshots) if (now - v.createdAt > SNAPSHOT_MS) snapshots.delete(k);
    while (snapshots.size >= SNAPSHOT_MAX) snapshots.delete(snapshots.keys().next().value);
    const id = randomBytes(12).toString('base64url');
    snapshots.set(id, { ...value, createdAt: now });
    return id;
  };
  const viewFile = (f) => readFileSync(new URL(`./copy-view/${f}`, import.meta.url));
  const FONT_FILES = new Map(['dm-sans.woff2', 'bricolage-grotesque.woff2', 'dm-mono.woff2'].map((f) => [f, () => readFileSync(new URL(`./fonts/${f}`, import.meta.url))]));
  // Is the reviewer's page older than its source? (freshness.js, toolbar/fresh.js)
  const freshness = createFreshness(src);

  const readBody = async (req, maxBytes = 262144) => {
    const chunks = []; let length = 0;
    for await (const c of req) { length += c.length; if (length > maxBytes) throw Object.assign(new Error('too large'), { status: 413 }); chunks.push(c); }
    return Buffer.concat(chunks);
  };
  const send = (res, status, body, type = 'application/json') => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(type === 'application/json' ? JSON.stringify(body) : body);
  };

  /** Handle one request. `path` is the path relative to the app's mount point. */
  async function handler(req, res, path = new URL(req.url, 'http://x').pathname) {
    if (allowedHosts && !allowedHosts.has(String(req.headers.host || '').toLowerCase())) {
      return send(res, 403, { error: `host ${req.headers.host || '(none)'} not served here; use ${[...allowedHosts][0]}` });
    }
    const origin = req.headers.origin;
    if (origin && allowed.size && !allowed.has(origin)) return send(res, 403, { error: `origin ${origin} not allowed; restart with --origin ${origin}` });
    if (origin && allowed.has(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Event-ID, X-Agentation-Reviewer');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (path === '/' || path === '') return send(res, 200, { ok: true, name, origin: [...allowed], bundle: bundlePath(), store: STORE });
      if (path === '/loader.js') {
        // The page names the project it was installed for (`/loader.js?name=…`).
        // Another project's server on this port must not take its notes. 200 with
        // a warning, not a 4xx: a failed script load shows the toolbar as offline,
        // which points the developer at the wrong problem. No name = old install.
        const wanted = url.searchParams.get('name');
        if (wanted && wanted !== name) {
          const port = String(req.headers.host || '').match(/:(\d+)$/)?.[1] || (() => { try { return new URL(base).port; } catch { return ''; } })() || '?';
          const msg = `show-and-tell: the review server on port ${port} is for project ${JSON.stringify(name)}, not ${JSON.stringify(wanted)}; use the same --name or another --port`;
          return send(res, 200, `console.warn(${JSON.stringify(msg)});\n`, 'text/javascript');
        }
        return send(res, 200, loader, 'text/javascript');
      }
      // Read per request so a rebuild is live on the next reload.
      // `/agentation.js` is the bundle's address from before the rename: a page loaded then still asks for it.
      if (path === '/show-and-tell.js' || path === '/agentation.js') return send(res, 200, readFileSync(bundlePath()), 'text/javascript');
      if (path === '/__ag/agent-work' && config.agentWork) {
        if (req.method !== 'GET') return send(res, 405, { error: 'read only' });
        return send(res, 200, publicAgentWork(name));
      }

      // Copy edit mode: every piece of copy, by where it sits on the page. The page
      // POSTs its outline (toolbar/copy-outline.js); a GET returns the source side only.
      // Reads text source files under `src`, which the dev server serves anyway.
      // The copy view: a full page served from here, so it has the room and none
      // of the host page's CSS or scripts. The toolbar opens it with a snapshot id.
      if (path === '/__ag/copy') return send(res, 200, viewFile('index.html'), 'text/html; charset=utf-8');
      if (path === '/__ag/copy-view.js') return send(res, 200, viewFile('view.js'), 'text/javascript; charset=utf-8');
      if (path === '/__ag/copy-map/snapshot') {
        if (req.method === 'GET') {
          const snap = snapshots.get(url.searchParams.get('id') || '');
          return snap ? send(res, 200, snap) : send(res, 404, { error: 'this copy view has expired; open it again from the page' });
        }
        if (req.method !== 'POST') return send(res, 405, { error: 'GET or POST' });
        let body;
        try { body = JSON.parse((await readBody(req, 4 * 1024 * 1024)).toString() || '{}'); } catch (e) {
          if (e.status) throw e;
          return send(res, 400, { error: 'body must be JSON: {outline, sessionId, reviewer}' });
        }
        const outline = body?.outline;
        if (!outline || !Array.isArray(outline.items)) return send(res, 422, { error: 'outline.items must be an array' });
        const placed = placeCopy(outline, extractCopy(src));
        const id = keepSnapshot({
          placed, url: String(outline.url || ''), title: String(outline.title || '').slice(0, 200),
          sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 128) : null,
          reviewer: typeof body.reviewer === 'string' ? body.reviewer.slice(0, 80) : null,
          viewport: body.viewport && typeof body.viewport === 'object' ? { name: String(body.viewport.name || '').slice(0, 20), width: Number(body.viewport.width) || 0, height: Number(body.viewport.height) || 0 } : null,
        });
        return send(res, 200, { id, view: `copy?id=${id}`, stats: placed.stats });
      }
      // Before saving: can each edit still be placed? Reads the files, writes nothing.
      if (path === '/__ag/copy-map/check') {
        if (req.method !== 'POST') return send(res, 405, { error: 'POST' });
        let body;
        try { body = JSON.parse((await readBody(req, 4 * 1024 * 1024)).toString() || '{}'); } catch (e) {
          if (e.status) throw e;
          return send(res, 400, { error: 'body must be JSON: {edits: [{unit, to}]}' });
        }
        if (!Array.isArray(body?.edits)) return send(res, 422, { error: 'edits must be an array' });
        return send(res, 200, { results: checkCopyEdits(src, body.edits.slice(0, 2000)) });
      }
      if (path === '/__ag/copy-map') {
        if (req.method === 'GET') return send(res, 200, extractCopy(src));
        if (req.method !== 'POST') return send(res, 405, { error: 'GET or POST' });
        let outline;
        try { outline = JSON.parse((await readBody(req, 4 * 1024 * 1024)).toString() || '{}'); } catch (e) {
          if (e.status) throw e;
          return send(res, 400, { error: 'body must be JSON: {url, items, resources}' });
        }
        if (!outline || !Array.isArray(outline.items)) return send(res, 422, { error: 'items must be an array' });
        return send(res, 200, placeCopy(outline, extractCopy(src)));
      }

      // The page sends what it loaded and when; the answer is which of those files changed since.
      if (path === '/__ag/freshness') {
        if (req.method !== 'POST') return send(res, 405, { error: 'POST' });
        let body;
        try { body = JSON.parse((await readBody(req, 512 * 1024)).toString() || '{}'); } catch (e) {
          if (e.status) throw e;
          return send(res, 400, { error: 'body must be JSON: {loaded: [{path, at, doc?}]}' });
        }
        if (!Array.isArray(body?.loaded)) return send(res, 422, { error: 'loaded must be an array' });
        return send(res, 200, freshness.check(body.loaded));
      }
      // The brand's fonts (toolbar/brand.js installFonts). A fixed list of
      // files, never a path from the request.
      if (path.startsWith('/__ag/fonts/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'read only' });
        const file = FONT_FILES.get(path.slice('/__ag/fonts/'.length));
        if (!file) return send(res, 404, { error: 'no such font' });
        // Vary on every answer: a copy cached from a request with no Origin has
        // no CORS header, and must not be reused for a page's cross-origin fetch.
        res.setHeader('Vary', 'Origin');
        res.writeHead(200, { 'Content-Type': 'font/woff2', 'Cache-Control': 'public, max-age=86400' });
        return res.end(req.method === 'HEAD' ? undefined : file());
      }

      // The agent's screenshots of a note (feedback resolve --shot), shown in Check the fix.
      if (path.startsWith('/__ag/shots/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'read only' });
        const [noteId, file] = path.slice('/__ag/shots/'.length).split('/');
        const found = shotFile(name, noteId, file);
        if (!found) return send(res, 404, { error: 'no such screenshot' });
        res.writeHead(200, { 'Content-Type': found.type, 'Cache-Control': 'private, max-age=86400' });
        return res.end(req.method === 'HEAD' ? undefined : readFileSync(found.path));
      }

      // Binary audio has its own bounded route; never raise the annotation JSON cap.
      if (path.startsWith('/__ag/voice/')) {
        const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req, (voice.limits.maxBytes || VOICE_LIMITS.maxBytes) + 65536);
        const controller = new AbortController();
        const abort = () => controller.abort();
        req.once('aborted', abort);
        res.once('close', () => { if (!res.writableEnded) abort(); });
        try {
          const request = new Request(url, { method: req.method, headers: req.headers, body, signal: controller.signal });
          return await pipeWebResponse(await voice.handle(request, path.slice('/__ag/voice/'.length)), res);
        } finally { req.removeListener('aborted', abort); }
      }

      if (path.startsWith('/__ag/')) {
        const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
        const request = new Request(url, { method: req.method, headers: req.headers, body });
        return await pipeWebResponse(await handle(request, name, path.slice(6)), res);
      }

      if (path === '/__kv') {
        if (req.method === 'GET') return send(res, 200, kvList(name, url.searchParams.get('prefix') || 'agentation'));
        // Writes are limited to the toolbar's own keys: the agent's read receipt
        // and anything else in the store are not the page's to change.
        if (req.method === 'DELETE') {
          const key = url.searchParams.get('key') || '';
          if (!key.startsWith('agentation')) return send(res, 422, { error: 'only agentation* keys' });
          return send(res, 200, kvDelete(name, key));
        }
        if (req.method === 'POST') {
          let body;
          try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch { return send(res, 400, { error: 'body must be JSON: {"key", "value"}' }); }
          const { key, value } = body && typeof body === 'object' ? body : {};
          if (!String(key || '').startsWith('agentation')) return send(res, 422, { error: 'only agentation* keys' });
          const r = kvSet(name, key, value);
          return send(res, r.error ? r.status : 200, r);
        }
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'show-and-tell server failed' });
      else res.end();
      if (!e.status) console.error(e);
    }
  }

  return { handler, loader, allowed };
}
