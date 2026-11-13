// The agent's proof: a screenshot of a note's target, taken where the reviewer
// left the note, attached to the note and shown in Check the fix.
//
// WHY: "Updated the copy" reads the same whether the change landed or not, and
// in a real round (pollut.ai, 2026-11-07) notes were closed on passing tests
// while the visible page still said the old thing. A picture of the target at
// the reviewer's viewport is checkable at a glance, by both sides.
//
// Files live beside the store, never in it (`~/.show-and-tell/<name>.shots/<note id>/`),
// one per kind (before, after): a newer one replaces the older. The note's
// payload records {kind, file, at, width, height, found, viewport, by}.
import { mkdirSync, writeFileSync, readFileSync, statSync, readdirSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { STORE } from '../bin/lib.mjs';
import { resolveTimeline, cleanPlayhead, clock } from './playhead.js';

export const SHOT_KINDS = ['before', 'after'];
export const MAX_SHOT_BYTES = 5 * 1024 * 1024;
const NOTE_ID = /^[A-Za-z0-9_-]{1,80}$/;
const FILE = /^(before|after)-\d{10,16}\.(png|jpg)$/;

export const shotDir = (name, id) => join(STORE, `${name}.shots`, id);

/** The path and type of a stored shot, or null. Every part is validated: this is served over HTTP. */
export function shotFile(name, id, file) {
  if (!/^[a-z0-9-]+$/.test(name || '') || !NOTE_ID.test(id || '') || !FILE.test(file || '')) return null;
  const path = join(shotDir(name, id), file);
  try {
    // Exactly where storeShot writes, with no link anywhere below the store: a
    // symlinked file or note folder must not serve some other file over HTTP.
    const real = realpathSync(path);
    if (real !== join(realpathSync(STORE), `${name}.shots`, id, file)) return null;
    if (!statSync(real).isFile()) return null;
    return { path: real, type: file.endsWith('.png') ? 'image/png' : 'image/jpeg' };
  } catch { return null; }
}

/** 'png' | 'jpg' from the bytes, never the file name. */
export function sniff(buf) {
  if (buf?.length > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) return 'png';
  if (buf?.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  return null;
}

/** Pixel size from the header: PNG's IHDR, JPEG's first frame marker. */
export function imageSize(buf, type = sniff(buf)) {
  if (type === 'png') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (type === 'jpg') {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return { width: 0, height: 0 };
}

/**
 * Save a screenshot for a note. Replaces the note's earlier shot of the same kind.
 * @returns {{kind, file, at, width, height}}
 */
export function storeShot(name, id, kind, buf) {
  if (!SHOT_KINDS.includes(kind)) throw new Error(`a shot is ${SHOT_KINDS.join(' or ')}, not "${kind}"`);
  if (!NOTE_ID.test(id || '')) throw new Error(`not a note id: ${id}`);
  const type = sniff(buf);
  if (!type) throw new Error('the screenshot must be a PNG or JPEG image');
  if (buf.length > MAX_SHOT_BYTES) throw new Error(`the screenshot is ${(buf.length / 1048576).toFixed(1)} MB; the limit is ${MAX_SHOT_BYTES / 1048576} MB`);
  const dir = shotDir(name, id);
  mkdirSync(dir, { recursive: true });
  // A new name every time, even twice in one millisecond: a cached image must never be a different picture.
  let at = Date.now();
  while (existsSync(join(dir, `${kind}-${at}.png`)) || existsSync(join(dir, `${kind}-${at}.jpg`))) at++;
  const file = `${kind}-${at}.${type}`;
  writeFileSync(join(dir, file), buf);
  for (const f of readdirSync(dir)) if (f !== file && f.startsWith(`${kind}-`)) { try { rmSync(join(dir, f)); } catch {} }
  return { kind, file, at, ...imageSize(buf, type) };
}

/** Read an image the agent took with its own tool (`--shot-file`). */
export function readShotFile(path) {
  const abs = resolve(path);
  let st;
  try { st = statSync(abs); } catch { throw new Error(`no file at ${abs}`); }
  if (!st.isFile()) throw new Error(`${abs} is not a file`);
  if (st.size > MAX_SHOT_BYTES) throw new Error(`${abs} is ${(st.size / 1048576).toFixed(1)} MB; the limit is ${MAX_SHOT_BYTES / 1048576} MB`);
  return readFileSync(abs);
}

export const NO_PLAYWRIGHT = 'Taking a screenshot needs Playwright with Chromium. Install it (`pnpm add -D playwright && pnpm exec playwright install chromium`), '
  + 'or set SHOW_AND_TELL_PLAYWRIGHT to an installed playwright module, or take the screenshot with your own browser tool and pass --shot-file <png|jpg>.';

/** Playwright from the env path, the kit, or the reviewed project. Null when none is installed. */
export function loadPlaywright(src) {
  const names = [process.env.AGENTATION_KIT_PLAYWRIGHT, 'playwright', 'playwright-core'].filter(Boolean);
  const bases = [import.meta.url, src ? join(resolve(src), 'package.json') : null].filter(Boolean);
  for (const base of bases) {
    for (const n of names) {
      try { const pw = createRequire(base)(n); if (pw?.chromium) return pw; } catch { /* try the next */ }
    }
  }
  return null;
}

/**
 * Runs in the page: stop its timeline at `time` and wait until that frame has
 * painted. `resolve` is resolveTimeline itself (it is self-contained), and so
 * must this be: it is sent to the page as source. Every wait is bounded: a
 * host's seek that never answers is a reason, never a hang.
 */
async function seekInPage({ resolve, time, waitMs, seekMs }) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const soon = (promise, ms) => {
    let timer;
    return Promise.race([
      Promise.resolve(promise).then(() => 'done', (e) => 'failed: ' + String((e && e.message) || e).slice(0, 120)),
      new Promise((r) => { timer = setTimeout(() => r('late'), ms); }),
    ]).finally(() => clearTimeout(timer));
  };
  let tl = null;
  for (const until = performance.now() + waitMs; performance.now() < until; await sleep(100)) {
    tl = resolve(window);
    // A player that exists but has not measured its length yet is not ready to seek.
    if (tl && tl.time() !== undefined && (tl.source !== 'hyperframes' || window.__playerReady !== false)) break;
    tl = null;
  }
  if (!tl) return { ok: false, why: 'has no timeline to move (no window.__SHOW_AND_TELL__.timeline and no HyperFrames player)' };
  const duration = tl.duration();
  if (duration !== undefined && time > duration + 0.05) return { ok: false, why: `is ${duration.toFixed(2)} s long now` };
  tl.pause();
  let seeking;
  try { seeking = tl.seek(time); } catch (e) { return { ok: false, why: `could not seek (${String((e && e.message) || e).slice(0, 120)})` }; }
  let how = await soon(seeking, seekMs);
  if (how === 'done') how = await soon(Promise.resolve().then(() => tl.settled()), seekMs);
  if (how === 'late') return { ok: false, why: `did not finish seeking within ${Math.round(seekMs / 1000)} s` };
  if (how !== 'done') return { ok: false, why: `could not seek (${how.slice(8)})` };
  // Videos on screen decode their frame after the seek returns.
  const busy = () => [...document.querySelectorAll('video')].some((v) => getComputedStyle(v).visibility !== 'hidden' && v.getClientRects().length && (v.seeking || v.readyState < 2) && !v.error);
  for (const until = performance.now() + 4000; busy() && performance.now() < until;) await sleep(60);
  const unsettled = busy();
  await soon(new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))), 1000);
  const at = tl.time();
  // A player snaps to its own frames, so arriving means within a frame (down to about 7 fps), not to the millisecond.
  if (at === undefined || Math.abs(at - time) > 0.15) return { ok: false, why: `stopped at ${at === undefined ? 'an unknown time' : at.toFixed(2) + ' s'} instead` };
  return { ok: true, unsettled };
}

/** The selectors a note can be found by, best first. */
export function noteSelectors(a) {
  return [...new Set([a?.elementPath, a?.selector, a?.voice?.target?.selector].filter((s) => typeof s === 'string' && s.trim()))];
}

/**
 * Load `url` at the note's viewport in headless Chromium and photograph its
 * target with some context, outlined. The toolbar stands down in a window named
 * `show-and-tell-measure` (toolbar/entry.jsx), so the picture is the page alone.
 * The whole viewport when no selector matches.
 *
 * A note with a `playhead` (a film, a HyperFrames preview: playhead.js) is
 * photographed at its moment: the page is stopped and moved to that time
 * first, at the size the piece is made at when it says one. A page that no
 * longer offers a timeline is an error, never a picture of frame 0.
 * A note with no playhead on a page that has a timeline is photographed where
 * the fresh load rests, and the result says so (`untimed`), so a picture of
 * frame 0 is never mistaken for the note's moment.
 * @returns {Promise<{buf: Buffer, found: boolean, viewport: {width, height}, time?: number, untimed?: boolean, unsettled?: boolean}>}
 */
export async function captureShot({ url, viewport, selectors = [], src, settleMs = 700, playwright, playhead, timelineWaitMs = 10000, seekTimeoutMs = 8000 }) {
  const moment = cleanPlayhead(playhead);
  // The film's own size shows the whole frame; the reviewer's window was only how they happened to be watching it.
  if (moment?.stage) viewport = moment.stage;
  const pw = playwright || loadPlaywright(src);
  if (!pw) throw new Error(NO_PLAYWRIGHT);
  let u;
  try { u = new URL(url); } catch { throw new Error(`the note has no page URL to load (${url || 'none'})`); }
  if (!/^https?:$/.test(u.protocol)) throw new Error(`can only load http(s) pages, not ${u.protocol}`);
  const clamp = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.min(hi, Math.max(lo, Math.round(n))) : d; };
  const width = clamp(viewport?.width, 280, 3840, 1440);
  // A small stage is a small film, not a phone.
  const phone = !moment?.stage && width < 600;
  const height = clamp(viewport?.height, 320, 2400, phone ? 844 : 900);
  let browser;
  try { browser = await pw.chromium.launch(); } catch (e) { throw new Error(`${NO_PLAYWRIGHT}\n(${String(e.message).split('\n')[0]})`); }
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
    await context.addInitScript(() => { window.name = 'show-and-tell-measure'; });
    const page = await context.newPage();
    const response = await page.goto(u.href, { waitUntil: 'load', timeout: 30000 });
    // An error page is not proof: a 404, a login wall or a crashed dev server
    // would otherwise be photographed and the note closed on it.
    const status = response?.status?.() ?? 0;
    if (status >= 400) throw new Error(`${u.href} answered HTTP ${status}, so there is nothing to photograph. Check the page loads, or pass --shot-file with your own picture.`);
    await page.waitForTimeout(settleMs);
    // Sent as one expression: evaluated by the browser's debugger, which a page's
    // Content-Security-Policy does not stop (an eval or new Function in the page would be).
    const inPage = (body) => `(${body})`;
    let unsettled = false, restsAt;
    if (moment) {
      const call = inPage(`(${seekInPage.toString()})({ resolve: ${resolveTimeline.toString()}, time: ${JSON.stringify(moment.time)}, waitMs: ${Number(timelineWaitMs) || 0}, seekMs: ${Number(seekTimeoutMs) || 0} })`);
      // The page bounds its own waits; this is the bound on the page itself answering.
      let timer;
      const moved = await Promise.race([
        page.evaluate(call),
        new Promise((r) => { timer = setTimeout(() => r({ ok: false, why: 'stopped answering while seeking' }), (Number(timelineWaitMs) || 0) + 2 * (Number(seekTimeoutMs) || 0) + 8000); }),
      ]).finally(() => clearTimeout(timer));
      if (!moved?.ok) throw new Error(`${u.href} ${moved?.why || 'could not be moved'}, so the note's moment (${clock(moment.time)}) cannot be photographed. Take the frame yourself and pass --shot-file.`);
      unsettled = !!moved.unsettled;
    } else {
      // No time on the note. If the page has a timeline, say where the picture was taken.
      const at = await page.evaluate(inPage(`(() => { try { const tl = (${resolveTimeline.toString()})(window); const t = tl ? tl.time() : undefined; return typeof t === 'number' ? t : null; } catch { return null; } })()`)).catch(() => null);
      if (typeof at === 'number' && Number.isFinite(at)) restsAt = at;
    }
    const scrolled = await page.evaluate(({ sels, still }) => {
      for (const s of sels) {
        let n = null;
        try { n = document.querySelector(s); } catch { continue; }
        const r = n?.getBoundingClientRect();
        if (!r || (!r.width && !r.height)) continue;
        // A film's stage is the frame: scrolling it into a nicer position would photograph something nobody saw.
        if (!still) n.scrollIntoView({ block: 'center', inline: 'nearest' });
        return s;
      }
      return null;
    }, { sels: selectors, still: !!moment?.stage });
    let box = null;
    if (scrolled) {
      await page.waitForTimeout(300); // scroll-linked motion settles
      box = await page.evaluate((s) => {
        const n = document.querySelector(s);
        if (!n) return null;
        // The ink, not the box: a heading is as wide as the page, its words are
        // not, and a picture of 1200px of mostly nothing shrinks the words away.
        let r = n.getBoundingClientRect();
        try {
          const range = document.createRange(); range.selectNodeContents(n);
          const rects = [...range.getClientRects()].filter((x) => x.width && x.height);
          if (rects.length) {
            const left = Math.min(...rects.map((x) => x.left)), top = Math.min(...rects.map((x) => x.top));
            const right = Math.max(...rects.map((x) => x.right)), bottom = Math.max(...rects.map((x) => x.bottom));
            if (right - left < r.width - 1 || bottom - top < r.height - 1) r = { left, top, width: right - left, height: bottom - top };
          }
        } catch { /* the box it is */ }
        // The ring the Check card draws on the live page, here in the picture.
        const ring = document.createElement('div');
        Object.assign(ring.style, { position: 'fixed', left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px`,
          border: '2px solid #FF5436', borderRadius: '6px', pointerEvents: 'none', zIndex: '2147483647', boxSizing: 'border-box' });
        document.documentElement.append(ring);
        return { x: r.left, y: r.top, width: r.width, height: r.height };
      }, scrolled);
    }
    let clip = { x: 0, y: 0, width, height };
    if (box) {
      const pad = 40, minW = Math.min(width, 360), minH = Math.min(height, 200);
      let x0 = Math.max(0, box.x - pad), y0 = Math.max(0, box.y - pad);
      let x1 = Math.min(width, box.x + box.width + pad), y1 = Math.min(height, box.y + box.height + pad);
      // Too small to read in context: grow round its centre, within the viewport.
      const grow = (a, b, min, max) => { if (b - a >= min) return [a, b]; const c = (a + b) / 2; let lo = Math.max(0, c - min / 2); const hi = Math.min(max, lo + min); lo = Math.max(0, hi - min); return [lo, hi]; };
      [x0, x1] = grow(x0, x1, minW, width); [y0, y1] = grow(y0, y1, minH, height);
      clip = { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) };
    }
    const buf = await page.screenshot({ type: 'jpeg', quality: 82, clip });
    return { buf, found: !!box, viewport: { width, height }, ...(moment ? { time: moment.time } : restsAt !== undefined ? { time: restsAt, untimed: true } : {}), ...(unsettled ? { unsettled: true } : {}) };
  } finally {
    await browser.close().catch(() => {});
  }
}
