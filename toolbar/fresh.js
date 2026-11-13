import { createHost, slotPanel, Z, placeToast, othersOpen, scheduleInsets } from './ui.js';

/**
 * Is this page older than its source? (server/freshness.js)
 *
 * WHY: in a real round the agent fixed the source and resolved the notes while
 * the reviewer's tab still showed the document it loaded before the fix: a
 * static server with no live reload, unversioned scripts. The reviewer read the
 * old page as "you didn't do it". Now the page tells them.
 *
 * Every few seconds (while the tab is visible) the page sends the review server
 * the same-origin files it loaded and when it got each one; the server answers
 * which of them changed since. A file the server can't map to the source (a
 * bundler chunk) is left out rather than guessed at, so a dev server with hot
 * reload, which re-fetches what changed, stays quiet.
 *
 * When something is newer, a passive strip says so with Reload. Check the fix
 * (check.js) takes the news into its own strip and card instead while it has
 * changes to walk, so there is one strip, not two.
 *
 * Reload first re-fetches the changed files with `cache: 'reload'`: an ordinary
 * reload revalidates the document but can still take an unversioned script from
 * the cache (the second half of the same failure).
 */

const POLL_MS = 4000;
// The toolbar's own files, dev-server internals and HMR clients: never the page's source.
const SKIP = /^\/(__show-and-tell|__ag\/|@vite\/|@id\/|@react-refresh|@fs\/.*\/node_modules\/|node_modules\/|_next\/|__webpack|favicon\.ico$)/;
const CLOSED = 'feedback-toolbar-fresh-closed';
const RESUME = 'agentation-kit:check-after-reload';

/** What the page loaded, as [{path, at, doc?}], newest load per path, plus every URL per path. */
export function loadedFiles({ perf = performance, loc = location, doc = document, cachedAt = new Map(), entries = perf.getEntriesByType('resource') } = {}) {
  const origin = loc.origin, t0 = perf.timeOrigin;
  const byPath = new Map(), urls = new Map();
  const add = (url, at, isDoc = false) => {
    let u;
    try { u = new URL(url, loc.href); } catch { return; }
    if (u.origin !== origin) return;
    let path;
    try { path = decodeURIComponent(u.pathname); } catch { return; }
    if (!isDoc && SKIP.test(path)) return;
    const prev = byPath.get(path);
    if (!prev || at > prev.at) byPath.set(path, { path, at: Math.round(at), ...(isDoc ? { doc: true } : {}) });
    if (!isDoc) { if (!urls.has(path)) urls.set(path, new Set()); urls.get(path).add(u.href); }
  };
  // The document: its Last-Modified when the server sent one (exact), else when it loaded.
  const lm = Date.parse(doc.lastModified || '');
  add(loc.href, Number.isFinite(lm) && lm < t0 - 1500 ? lm : t0, true);
  for (const e of entries) {
    // From the cache (no bytes over the wire): the copy is as old as its
    // Last-Modified when known (cachedAt), else no newer than this page.
    const cached = e.transferSize === 0 && e.decodedBodySize > 0;
    add(e.name, cached ? (cachedAt.get(e.name) ?? t0) : t0 + e.startTime);
  }
  return { loaded: [...byPath.values()], urls };
}

/**
 * Which cached copies to ask the age of next: up to `max` not tried before.
 * Tried means tried, answered or not: a copy with no Last-Modified must not be
 * asked again every poll, or it holds the queue and the ones behind it (the
 * script that actually changed) are never asked at all.
 */
export function nextCacheProbes(entries, tried, max = 40) {
  return entries.filter((e) => e.transferSize === 0 && e.decodedBodySize > 0 && !tried.has(e.name)).slice(0, max);
}

/** "app.js", "app.js and index.html", "app.js and 3 more". */
export function staleText(stale) {
  const name = (s) => s.file.split('/').pop();
  if (!stale.length) return '';
  if (stale.length === 1) return name(stale[0]);
  if (stale.length === 2) return `${name(stale[0])} and ${name(stale[1])}`;
  return `${name(stale[0])} and ${stale.length - 1} more`;
}

/**
 * Why reloading now would lose something, or ''. Kept only in memory, so lost
 * on a reload: a recording in progress, audio not yet transcribed (stopping a
 * recording leaves the only copy in the tab until a transcript exists), Tweak
 * drafts, and text typed into the toolbar (a note, an answer, a reopen) until
 * it is sent. Edit text drafts survive: they are kept per page.
 */
export function reloadBlocker({ win = window, doc = document } = {}) {
  const voice = win.__AGENTATION_KIT_VOICE__;
  if (win.__AGENTATION_KIT_VOICE_RECORDING__ || voice?.recording) return 'Stop and save the recording first: reloading ends it.';
  if (voice && (['transcribing', 'requesting'].includes(voice.state) || (voice.hasAudio && !voice.draft?.passages?.length))) {
    return 'Wait for the transcript first: the recording is only kept in this tab until then.';
  }
  const tweaks = Number(win.__AGENTATION_KIT_TWEAK__?.count) || 0;
  if (tweaks) return `Save or discard your ${tweaks === 1 ? 'tweak' : `${tweaks} tweaks`} first: reloading loses ${tweaks === 1 ? 'it' : 'them'}.`;
  for (const host of doc.querySelectorAll('[data-feedback-toolbar]')) {
    for (const scope of [host, host.shadowRoot].filter(Boolean)) {
      for (const t of scope.querySelectorAll('textarea')) if (t.value.trim()) return 'Send or clear what you are typing first: reloading loses it.';
    }
  }
  return '';
}

export function createFresh({ endpoint }) {
  let stale = [], urls = new Map(), timer = 0, busy = false, off = false, blocked = '';
  const cachedAt = new Map(), probed = new Set();
  // Our own copy of the resource timeline. The browser's buffer holds 250
  // entries and then drops new ones, so on a long review a hot-reloaded file's
  // re-fetch would go unseen and read as stale. An observer sees every entry.
  const seenEntries = new Map();
  const keep = (e) => { if (!seenEntries.has(e.name) || seenEntries.get(e.name).startTime <= e.startTime) seenEntries.set(e.name, e); };
  try {
    for (const e of performance.getEntriesByType('resource')) keep(e);
    new PerformanceObserver((list) => { for (const e of list.getEntries()) keep(e); }).observe({ type: 'resource', buffered: true });
  } catch { /* no observer: the buffer alone */ }
  const ui = createHost(`
    [hidden]{display:none!important}
    .panel{position:fixed;z-index:${Z.panel};font:400 13px/1.45 var(--sk-font)}
    .strip{display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100vw - 24px);padding:6px 6px 6px 12px;white-space:nowrap}
    .strip .say{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:500}
    .strip .say span{overflow:hidden;text-overflow:ellipsis}
    .strip .say svg{flex:none;color:var(--sk-text-2)}
    button{font:inherit;cursor:pointer;border:0;border-radius:6px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
    button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    button.primary{padding:6px 12px;font-size:13px}
    .iconbtn{width:32px;height:32px;padding:0;display:grid;place-items:center;color:var(--sk-text-2);background:none}
    .iconbtn:hover{background:var(--sk-hover);color:var(--sk-text)}
    @media (max-width:600px),(pointer:coarse){button,.iconbtn{min-height:44px}.iconbtn{width:44px;height:44px}.strip{padding:4px 4px 4px 12px}}
  `);
  ui.host.dataset.freshUi = '';
  const strip = document.createElement('section');
  strip.className = 'panel strip'; strip.hidden = true;
  strip.setAttribute('aria-label', 'This page is out of date');
  ui.root.append(strip);
  const svg = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const RELOAD_ICON = svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>');
  const CLOSE = svg('<path d="M6 6l12 12M18 6L6 18"/>');

  const aside = () => othersOpen({ slots: ['fresh'], hosts: [ui.host] });
  const slot = slotPanel('fresh', (visible) => { strip.hidden = !visible || aside(); if (!strip.hidden) requestAnimationFrame(place); scheduleInsets(); });
  const place = () => { if (strip.hidden) return; strip.style.width = 'max-content'; placeToast(strip, Math.min(strip.getBoundingClientRect().width || 400, innerWidth - 24)); };
  // Steps aside while anything else is open (a popup, Settings, the Tweak sheet)
  // and comes back after, as Check's strip does: those announce nothing, so a
  // light timer while the strip holds the slot.
  function syncAside() {
    if (!slot.visible) return;
    const hide = aside();
    if (strip.hidden === hide) return;
    strip.hidden = hide; scheduleInsets();
    if (!hide) requestAnimationFrame(place);
  }
  setInterval(syncAside, 300);
  document.addEventListener('agentation-kit:insets', () => requestAnimationFrame(syncAside));
  addEventListener('pointerup', () => setTimeout(syncAside, 60), { passive: true });
  addEventListener('keyup', () => setTimeout(syncAside, 30), { passive: true });
  const newest = () => stale.reduce((m, s) => Math.max(m, s.changedAt), 0);
  const closedAt = () => { try { return Number(sessionStorage.getItem(CLOSED)) || 0; } catch { return 0; } };
  // Check the fix has changes to walk: it carries the news itself (check.js).
  const checkHasIt = () => (window.__AGENTATION_KIT_CHECK__?.count?.() || 0) > 0 || window.__AGENTATION_KIT_CHECK__?.state === 'card';

  function paint() {
    const show = stale.length > 0 && newest() > closedAt() && !checkHasIt();
    if (!show) { if (slot.wants) slot.want(false); return; }
    strip.replaceChildren();
    const say = document.createElement('span'); say.className = 'say'; say.setAttribute('role', 'status');
    say.innerHTML = RELOAD_ICON;
    const words = document.createElement('span');
    // The file first: on a phone the line is cut, and the name is the news.
    words.textContent = blocked || `${staleText(stale)} changed${innerWidth < 600 ? '' : ' since this page loaded'}`;
    say.title = stale.map((s) => s.file).join('\n');
    say.append(words);
    const go = document.createElement('button'); go.type = 'button'; go.className = 'primary'; go.textContent = 'Reload';
    go.dataset.freshReload = '';
    go.onclick = (e) => { e.stopPropagation(); reload(); };
    const x = document.createElement('button'); x.type = 'button'; x.className = 'iconbtn'; x.innerHTML = CLOSE;
    x.title = 'Hide until something else changes'; x.setAttribute('aria-label', 'Hide until something else changes');
    x.onclick = (e) => { e.stopPropagation(); try { sessionStorage.setItem(CLOSED, String(newest())); } catch {} blocked = ''; slot.want(false); };
    strip.append(say, go, x);
    if (!slot.wants) slot.want(true, { passive: true }); else requestAnimationFrame(place);
  }

  /** The Last-Modified of cached copies, once per URL: how old they really are. */
  async function learnCacheAges() {
    for (const e of nextCacheProbes([...seenEntries.values()], probed)) {
      probed.add(e.name);
      try {
        if (new URL(e.name).origin !== location.origin) continue;
        const r = await fetch(e.name, { cache: 'only-if-cached', mode: 'same-origin' });
        const lm = Date.parse(r.headers.get('last-modified') || '');
        if (Number.isFinite(lm)) cachedAt.set(e.name, lm);
      } catch { /* not in the cache after all */ }
    }
  }

  async function check() {
    if (off || busy || !endpoint || document.visibilityState !== 'visible') return;
    busy = true;
    try {
      await learnCacheAges();
      const found = loadedFiles({ cachedAt, entries: [...seenEntries.values()] });
      urls = found.urls;
      const r = await fetch(`${endpoint}/freshness`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ loaded: found.loaded }) });
      // An older review server has no such route: stop asking.
      if (r.status === 404 || r.status === 405) { off = true; return; }
      if (!r.ok) return;
      const next = (await r.json()).stale || [];
      const changed = next.length !== stale.length || next.some((s, i) => s.file !== stale[i]?.file || s.changedAt !== stale[i]?.changedAt);
      stale = next;
      if (changed) document.dispatchEvent(new CustomEvent('agentation-kit:fresh', { detail: { stale } }));
      paint();
    } catch { /* offline: connection.js says so */ } finally { busy = false; }
  }

  /**
   * Reload so the page shows the latest source. `then` is what to do after:
   * 'check' (and an optional note id) re-opens Check the fix where it was.
   * Returns false, and says why on the strip, when reloading would lose work.
   */
  async function reload({ then, id } = {}) {
    const why = reloadBlocker();
    if (why) { blocked = why; paint(); setTimeout(() => { if (blocked === why) { blocked = ''; paint(); } }, 5000); return why; }
    const fetches = [];
    for (const s of stale) for (const u of urls.get(s.path) || []) fetches.push(fetch(u, { cache: 'reload', credentials: 'same-origin' }).catch(() => {}));
    await Promise.race([Promise.allSettled(fetches), new Promise((done) => setTimeout(done, 3000))]);
    // Up to three seconds passed: a recording or a tweak may have started meanwhile.
    const late = reloadBlocker();
    if (late) { blocked = late; paint(); setTimeout(() => { if (blocked === late) { blocked = ''; paint(); } }, 5000); return late; }
    try { if (then) sessionStorage.setItem(RESUME, JSON.stringify({ then, id: id || null, at: Date.now() })); } catch {}
    location.reload();
    return '';
  }

  timer = setInterval(check, POLL_MS);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  addEventListener('focus', () => check());
  // Check the fix opening, closing or emptying changes who carries the news.
  for (const ev of ['agentation-kit:check', 'agentation-kit:slot']) document.addEventListener(ev, () => { if (stale.length) paint(); });
  addEventListener('resize', () => { if (!strip.hidden) place(); });
  setTimeout(check, 1500);

  return {
    /** Files newer than this page, newest first: [{file, path, at, changedAt}]. */
    get stale() { return stale; },
    /** Is the page older than a change made at `ms`? With no time: older than anything. */
    olderThan(ms) { return ms ? stale.some((s) => s.at < ms) : stale.length > 0; },
    check,
    reload,
    stop() { clearInterval(timer); off = true; slot.want(false); },
  };
}

/** After a Reload that asked for it: what to resume, once. */
export function takeResume() {
  try {
    const raw = sessionStorage.getItem(RESUME);
    if (!raw) return null;
    sessionStorage.removeItem(RESUME);
    const r = JSON.parse(raw);
    return r && Date.now() - (Number(r.at) || 0) < 60000 ? r : null;
  } catch { return null; }
}
