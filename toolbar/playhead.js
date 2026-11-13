/**
 * The page's own timeline, in the toolbar (server/playhead.js has the contract
 * and the reasons). Three jobs:
 *
 *   1. Stamp a note with where the playhead was when the reviewer pointed.
 *   2. Hold the film still while they say what is wrong: an open note, Edit
 *      text and Tweak pause it and give it back when they finish; Talk pauses
 *      it and leaves the transport to the reviewer.
 *   3. Take the reviewer back to a note's moment (Check the fix).
 *
 * On a page with no timeline every function here does nothing.
 */
import { resolveTimeline, readPlayhead } from '../server/playhead.js';

export const timeline = () => { try { return resolveTimeline(window); } catch { return null; } };

/** The playhead now, or at `at` seconds, for a note about `target`. */
export function playhead(target, at) {
  try { return readPlayhead(window, target || null, at); } catch { return undefined; }
}

/** `promise`, or 'late' after `ms`: a host's seek or settle must never hang the toolbar. Never rejects. */
export function soon(promise, ms) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).then(() => 'done', () => 'failed'),
    new Promise((r) => { timer = setTimeout(() => r('late'), ms); }),
  ]).finally(() => clearTimeout(timer));
}

// ---- holding the film still ------------------------------------------------
// Several things can hold at once (a note opened inside Edit text). Playback
// resumes when the last one lets go, and only when a hold is what stopped it
// and the reviewer has not touched the transport since: if they played, paused
// or scrubbed, where it is now is their choice.
const holds = new Set();
let resume = false;      // a hold stopped a playing film
let heldAt;              // where the hold left it
let giveBack = 0;        // the timer about to start it again
const GIVE_BACK_MS = 60; // Edit text → Tweak lets go and takes hold in one breath: no flash of playback between
// A player snaps a seek to its own frames (14.493 s lands on 14.467 s at 30 fps, measured on the
// novice-again preview): "the same moment" has to allow a frame, down to about 7 fps.
const SAME_MOMENT = 0.15;

export function hold(key) {
  const tl = timeline();
  if (!tl) return;
  if (giveBack) { clearTimeout(giveBack); giveBack = 0; resume = true; }
  if (tl.playing()) { tl.pause(); resume = true; heldAt = tl.time(); }
  holds.add(key);
}

/** The hold moved the film itself (back to the moment of the press): that is where it was left. */
function heldNowAt(time) { if (resume) heldAt = time; }

export function release(key) {
  if (!holds.delete(key) || holds.size) return;
  if (!resume) return;
  resume = false;
  giveBack = setTimeout(() => {
    giveBack = 0;
    const tl = timeline();
    if (!tl || tl.playing()) return;
    const now = tl.time();
    if (heldAt !== undefined && now !== undefined && Math.abs(now - heldAt) > SAME_MOMENT) return;
    tl.play();
  }, GIVE_BACK_MS);
}

/** Stop, and stay stopped: the reviewer starts it again when they want it. */
export function pause() {
  resume = false;
  if (giveBack) { clearTimeout(giveBack); giveBack = 0; }
  const tl = timeline();
  if (tl?.playing()) tl.pause();
}

// ---- the moment a note was pointed at --------------------------------------
// The note popup opens a frame or two after the click, and the film has moved
// on by then. The click is the moment they meant: remember it, and when the
// popup appears put the film back there.
let lastPoint = null;   // { time, playing, at, target } at the last press on the page; one popup uses it
let pointed = null;     // { snap, target } when the open note popup appeared; one note uses it
const POINT_FRESH_MS = 1500;
const TOOL = '[data-feedback-toolbar],[data-agentation-root],[data-agentation-kit-chrome],#agentation-root';

function onPress(e) {
  const path = e.composedPath?.() || [];
  if (path.some((n) => n instanceof Element && n.matches(TOOL))) return;
  const tl = timeline();
  if (!tl) return;
  const time = tl.time();
  if (time !== undefined) lastPoint = { time, playing: tl.playing(), at: performance.now(), target: path.find((n) => n instanceof Element) || null };
}

const popupOpen = () => [...document.querySelectorAll('[data-annotation-popup]')].some((n) => n.isConnected && !n.hidden && !/exit___/.test(String(n.className)));

function watchPopup() {
  let open = false;
  const check = () => {
    // A page with no timeline: nothing to hold, nothing to look for.
    if (!open && !timeline()) return;
    const now = popupOpen();
    if (now === open) return;
    open = now;
    if (!now) { pointed = null; release('note'); return; }
    const tl = timeline();
    if (!tl) { pointed = null; return; }
    const point = lastPoint && performance.now() - lastPoint.at < POINT_FRESH_MS ? lastPoint : null;
    lastPoint = null;
    // Read before the hold stops it: a long press has no fresh point, and the note still says it was playing.
    const wasPlaying = point ? point.playing : tl.playing();
    hold('note');
    let at = point?.time;
    if (point?.playing && Math.abs((tl.time() ?? point.time) - point.time) > 0.001) {
      try { Promise.resolve(tl.seek(point.time)).catch(() => {}); } catch { /* the pause still holds */ }
      // The frame the player settled on is the one they are looking at: the note takes its time.
      const landed = tl.time();
      if (landed !== undefined && landed <= point.time && point.time - landed <= SAME_MOMENT) at = landed;
      heldNowAt(at);
    }
    const snap = playhead(null, at);
    pointed = snap ? { snap: wasPlaying ? { ...snap, playing: true } : snap, target: point?.target || null } : null;
  };
  // The popup is added to the page, then marked as leaving by class before it is removed.
  new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
}

/**
 * The element a note's selector means at `time`. A short tag-and-class path
 * can match one element per scene (`div.scene > h1`), and the first match is
 * then the first scene's. Prefer the one the reviewer pressed, then one whose
 * timed parts are all playing at that time.
 */
export function targetAt(selector, time, pressed) {
  let list = [];
  try { list = selector ? [...document.querySelectorAll(selector)].slice(0, 200) : []; } catch { /* not a selector this page can parse */ }
  if (!list.length) return null;
  if (pressed?.isConnected) { const hit = list.find((n) => n === pressed || n.contains(pressed) || pressed.contains(n)); if (hit) return hit; }
  if (list.length === 1 || time == null) return list[0];
  const tl = timeline();
  const playingThen = (n) => { const chain = tl?.within(n) || []; return chain.length > 0 && chain.every((c) => c.start <= time && time <= c.end); };
  return list.find(playingThen) || list[0];
}

/** The playhead for a note the reviewer just added through the note popup. */
export function pointedPlayhead(annotation) {
  if (!timeline()) return undefined;
  // Once: a second note without a newly opened popup reads the playhead as it is now.
  const recent = pointed;
  pointed = null;
  const time = recent?.snap.time;
  const snap = playhead(targetAt(annotation?.elementPath, time ?? timeline()?.time(), recent?.target), time);
  if (!snap) return undefined;
  return recent?.snap.playing ? { ...snap, playing: true } : snap;
}

// ---- going back to a note's moment -----------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const READY_MS = 4000, SEEK_MS = 4000;

/**
 * Stop the film at `time` and wait for the frame to paint. True only when it
 * is there: false when the page has no timeline (it is given `wait` ms to start
 * one: after a reload the player arrives late), or the seek did not arrive.
 */
export async function showMoment(time, { wait = READY_MS, seekMs = SEEK_MS } = {}) {
  time = Number(time);
  if (!Number.isFinite(time)) return false;
  let tl = timeline();
  // A player that is there but has not measured itself yet cannot seek.
  const ready = () => tl && tl.time() !== undefined && window.__playerReady !== false;
  for (const until = performance.now() + wait; !ready() && performance.now() < until; tl = timeline()) await sleep(80);
  if (!ready()) return false;
  pause();
  if (Math.abs(tl.time() - time) > 0.005) {
    let seeking;
    try { seeking = tl.seek(time); } catch { return false; }
    if (await soon(seeking, seekMs) !== 'done') return false;
    await soon(Promise.resolve().then(() => tl.settled()), seekMs);
  }
  const at = timeline()?.time();
  return at !== undefined && Math.abs(at - time) <= SAME_MOMENT;
}

let installed = false;
export function installPlayhead() {
  if (installed) return;
  installed = true;
  // Capture phase, before the note picker stops the event.
  addEventListener('pointerdown', onPress, true);
  watchPopup();
  // Talk: pointing at a moving picture means nothing, so it starts still.
  document.addEventListener('agentation-kit:voice-capture', (e) => { if (e.detail?.active && e.detail?.kind === 'session') pause(); });
  const mode = (key, on) => (on ? hold(key) : release(key));
  document.addEventListener('agentation-kit:edit-change', () => mode('edit', !!window.__AGENTATION_KIT_EDIT__?.active));
  document.addEventListener('agentation-kit:tweak-change', (e) => mode('tweak', !!(e.detail?.active ?? window.__AGENTATION_KIT_TWEAK__?.active)));
  // For the page, a test or the console: the playhead as a note would record it.
  window.__SHOW_AND_TELL__ = { ...(window.__SHOW_AND_TELL__ || {}), playhead: () => playhead() };
}
