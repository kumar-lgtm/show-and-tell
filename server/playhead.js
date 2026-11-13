/**
 * Playhead: where a page that plays over time was when a note was left.
 *
 * WHY: a film, a HyperFrames composition or any page with its own timeline is
 * one URL for its whole length, so a note's page, selector and viewport do not
 * say WHEN. Measured on a real round (novice-again, 2026-11-12): a note left at
 * 14.2 s on the third scene came back with no time and no scene, the film kept
 * playing under the open note, and the proof screenshot photographed frame 0.
 *
 * A page says it has a timeline in one of two ways:
 *
 *   1. The hook, for any page:
 *        window.__SHOW_AND_TELL__ = { ...window.__SHOW_AND_TELL__, timeline: {
 *          time: () => seconds,            // required
 *          duration: () => seconds,
 *          playing: () => boolean,
 *          pause() {}, play() {},
 *          seek(seconds) {},               // may return a promise
 *          fps: 30,                        // or () => 30; without it no frame number is claimed
 *          clips: (seconds) => [{ id, kind, start, end, src }],   // what is on screen and audible then
 *          within: (element) => [{ id, start, end, src }],        // the timed parts an element sits in, outermost first
 *          stage: () => ({ width, height }),                      // the fixed size the piece is made at
 *          settled: () => promise,         // resolves once a seek has painted
 *        } };
 *   2. A HyperFrames preview is recognised with nothing added: `window.__player`
 *      and the composition's `data-start` / `data-duration` attributes.
 *
 * This file is imported by the toolbar (toolbar/playhead.js) and by the server.
 * `resolveTimeline` is also run INSIDE the page by the proof screenshot
 * (shots.js), so it must stay self-contained: no references outside its body.
 */

/**
 * The page's timeline, or null. Self-contained on purpose (see above).
 * Every method is safe to call: a host hook that throws reads as "unknown".
 */
export function resolveTimeline(win) {
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
  const call = (o, k, ...a) => { try { return typeof o?.[k] === 'function' ? o[k](...a) : undefined; } catch { return undefined; } };
  let host;
  try { host = win.__SHOW_AND_TELL__?.timeline; } catch { host = null; }
  if (host && typeof host.time === 'function') {
    return {
      source: 'host',
      time: () => num(call(host, 'time')),
      duration: () => num(call(host, 'duration')),
      playing: () => !!call(host, 'playing'),
      fps: () => num(typeof host.fps === 'function' ? call(host, 'fps') : host.fps),
      pause: () => { call(host, 'pause'); },
      play: () => { call(host, 'play'); },
      seek: (t) => call(host, 'seek', t),
      settled: () => call(host, 'settled'),
      clips: (t) => call(host, 'clips', t),
      within: (el) => call(host, 'within', el),
      stage: () => call(host, 'stage'),
    };
  }
  let p;
  try { p = win.__player; } catch { p = null; }
  if (!p || typeof p.getTime !== 'function' || typeof p.seek !== 'function') return null;
  // A HyperFrames preview. Timing lives on the elements, by HyperFrames' own
  // rules (its docs: reference/html-schema, concepts/compositions):
  //   - `data-start` is seconds, or `clip-id`, `clip-id + s`, `clip-id - s`:
  //     when that clip of the same composition ends, give or take.
  //   - A start is local to its composition. Only the composition hosts above
  //     an element offset it, never a timed wrapper around it; a legacy
  //     `data-hf-media-start-basis="global"` start is already in film time.
  // A start that cannot be worked out is left out, never read as 0.
  const doc = win.document;
  const root = doc.querySelector('[data-composition-id]');
  const numeric = (v) => (v != null && /^\s*-?\d*\.?\d+\s*$/.test(v) ? parseFloat(v) : undefined);
  const attr = (el, k) => numeric(el.getAttribute(k));
  const hostOf = (el) => { for (let a = el.parentElement; a; a = a.parentElement) if (a.hasAttribute('data-composition-id')) return a; return null; };
  const localStart = (el, seen) => {
    const raw = el.getAttribute('data-start'), n = numeric(raw);
    if (n !== undefined) return n;
    const m = /^\s*(\S+?)(?:\s+([+-])\s*(\d*\.?\d+))?\s*$/.exec(raw || '');
    if (!m || (seen || []).indexOf(el) >= 0) return undefined;
    const ref = doc.getElementById(m[1]);
    if (!ref || ref === el || hostOf(ref) !== hostOf(el)) return undefined;
    const trail = (seen || []).concat([el]), start = localStart(ref, trail), length = lengthOf(ref, trail);
    return start === undefined || !(length > 0) ? undefined : start + length + (m[2] === '-' ? -1 : 1) * (m[3] ? parseFloat(m[3]) : 0);
  };
  // The source says data-duration and data-composition-src. The served preview
  // moves a scene's to data-hf-authored-duration and data-composition-file, and
  // gives media a data-end (measured on the novice-again preview, 2026-11-12).
  // Media may leave the length out: an image shows for 3 s, video and audio for their own length.
  function lengthOf(el, seen) {
    const stated = attr(el, 'data-duration') ?? attr(el, 'data-hf-authored-duration');
    if (stated !== undefined) return stated;
    const end = attr(el, 'data-end'), start = end === undefined ? undefined : localStart(el, seen);
    if (end !== undefined && start !== undefined) return end - start;
    const tag = el.tagName.toLowerCase();
    if (tag === 'img') return 3;
    return (tag === 'video' || tag === 'audio') && typeof el.duration === 'number' && Number.isFinite(el.duration) ? el.duration : undefined;
  }
  const startOf = (el) => {
    let s = localStart(el);
    if (s === undefined || el.getAttribute('data-hf-media-start-basis') === 'global') return s;
    for (let h = hostOf(el); h && h !== root; h = hostOf(h)) { const up = localStart(h); if (up === undefined) return undefined; s += up; }
    return s;
  };
  const timed = (el) => el.nodeType === 1 && el.hasAttribute('data-start') && startOf(el) !== undefined && lengthOf(el) > 0;
  const describe = (el) => {
    const tag = el.tagName.toLowerCase(), start = startOf(el);
    const src = el.getAttribute('data-composition-src') || el.getAttribute('data-composition-file') || (tag === 'audio' || tag === 'video' ? el.getAttribute('src') : '') || '';
    return {
      id: el.id || el.getAttribute('data-composition-id') || tag,
      kind: tag === 'audio' ? 'audio' : tag === 'video' ? 'video' : el.hasAttribute('data-composition-id') ? 'scene' : 'clip',
      start, end: start + lengthOf(el),
      ...(src ? { src } : {}),
    };
  };
  return {
    source: 'hyperframes',
    time: () => num(call(p, 'getTime')),
    duration: () => num(call(p, 'getDuration')),
    playing: () => !!call(p, 'isPlaying'),
    fps: () => undefined, // the preview does not say; a frame number would be a guess
    pause: () => { call(p, 'pause'); },
    play: () => { call(p, 'play'); },
    seek: (t) => call(p, 'seek', t),
    settled: () => call(win, '__hfWaitForSeekCompletion'),
    // A film that has ended rests on its last frame: what was showing then is what ends with it.
    clips: (t) => {
      if (!root) return [];
      const length = num(call(p, 'getDuration')), at = length !== undefined && t >= length ? length - 1e-6 : t;
      return [...root.children].filter(timed).map(describe).filter((c) => at >= c.start && at < c.end);
    },
    within: (el) => {
      const chain = [];
      for (let a = el; a && a !== root && a.nodeType === 1; a = a.parentElement) if (timed(a)) chain.unshift(describe(a));
      return chain;
    },
    stage: () => (root ? { width: attr(root, 'data-width'), height: attr(root, 'data-height') } : undefined),
  };
}

const MAX_SECONDS = 7 * 24 * 3600;
const seconds = (v) => { const n = Number(v); return v != null && v !== '' && Number.isFinite(n) && n >= 0 && n <= MAX_SECONDS ? Math.round(n * 1000) / 1000 : undefined; };
// Names are page text bound for a terminal: no control or invisible formatting characters (ESC, bidi overrides).
const short = (v, n) => (v == null || typeof v === 'object' ? '' : String(v).replace(/[\p{Cc}\p{Cf}\s]+/gu, ' ').trim().slice(0, n));
const KINDS = new Set(['scene', 'clip', 'video', 'audio', 'image', 'text', 'caption']);

function cleanClip(c) {
  if (!c || typeof c !== 'object') return null;
  const id = short(c.id, 80), start = seconds(c.start), end = seconds(c.end);
  if (!id) return null;
  const kind = short(c.kind, 16).toLowerCase(), src = short(c.src, 200);
  return { id, kind: KINDS.has(kind) ? kind : 'clip', ...(start !== undefined ? { start } : {}), ...(end !== undefined && end >= (start ?? 0) ? { end } : {}), ...(src ? { src } : {}) };
}
const cleanClips = (list, max) => (Array.isArray(list) ? list.slice(0, max * 4).map(cleanClip).filter(Boolean).slice(0, max) : []);

/**
 * A playhead as stored and printed: known fields only, numbers finite and
 * rounded, strings short. It is written by whoever holds the page and rendered
 * into an agent's transcript, so nothing free-form survives. Undefined when
 * there is no usable time.
 */
export function cleanPlayhead(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return undefined;
  const time = seconds(p.time);
  if (time === undefined) return undefined;
  const out = { time };
  const duration = seconds(p.duration);
  if (duration) out.duration = duration;
  const fps = Number(p.fps);
  if (Number.isFinite(fps) && fps > 0 && fps <= 1000) { out.fps = Math.round(fps * 1000) / 1000; out.frame = Math.floor(time * fps + 1e-6); }
  if (p.playing === true) out.playing = true;
  const w = Math.round(Number(p.stage?.width)), h = Math.round(Number(p.stage?.height));
  if (w >= 16 && h >= 16 && w <= 16384 && h <= 16384) out.stage = { width: w, height: h };
  const clips = cleanClips(p.clips, 24), within = cleanClips(p.within, 6);
  if (clips.length) out.clips = clips;
  if (within.length) out.within = within;
  const source = short(p.source, 24);
  if (source) out.source = source;
  return out;
}

/** The page's playhead now (or at `at` seconds), for the note about `target`. Undefined when the page has no timeline. */
export function readPlayhead(win, target, at) {
  const tl = resolveTimeline(win);
  if (!tl) return undefined;
  const time = at ?? tl.time();
  return cleanPlayhead({
    time, duration: tl.duration(), playing: at == null && tl.playing(), fps: tl.fps(), stage: tl.stage(),
    clips: time == null ? [] : tl.clips(time), within: target ? tl.within(target) : [], source: tl.source,
  });
}

/** 14.2 → "14.20 s". Seconds, as the composition's own timing is written. */
export const clock = (t) => `${Number(t).toFixed(2)} s`;
const span = (c) => (c.start === undefined ? '' : c.end === undefined ? `from ${clock(c.start)}` : `${c.start.toFixed(2)}–${clock(c.end)}`);
const clipText = (c) => [c.id, span(c), c.src].filter(Boolean).join(' · ');

/**
 * The label/value rows a note's playhead adds for the agent (format.js fences them).
 *   time       14.20 s of 50.80 s · frame 426 at 30 fps
 *   in         w3 · 11.80–17.00 s · compositions/w3.html › w3-vid · 11.80–17.00 s
 *   on screen  w3 · 11.80–17.00 s · compositions/w3.html; stamp · 0.00–40.00 s · compositions/stamp.html
 *   sound      music · 0.00–41.50 s · assets/audio/bed.mp3
 */
export function playheadRows(playhead) {
  const p = cleanPlayhead(playhead);
  if (!p) return [];
  const rows = [];
  let when = clock(p.time);
  if (p.duration) when += ` of ${clock(p.duration)}`;
  if (p.frame !== undefined) when += ` · frame ${p.frame} at ${p.fps} fps`;
  // A note left mid-playback is a reaction: the moment meant may be a beat earlier.
  if (p.playing) when += ' · noted while playing, so the moment may be slightly earlier';
  rows.push(['time', when]);
  if (p.within?.length) rows.push(['in', p.within.map(clipText).join(' › ')]);
  const seen = (p.clips || []).filter((c) => c.kind !== 'audio'), heard = (p.clips || []).filter((c) => c.kind === 'audio');
  if (seen.length) rows.push(['on screen', seen.map(clipText).join('; ')]);
  if (heard.length) rows.push(['sound', heard.map(clipText).join('; ')]);
  return rows;
}

/** One short phrase for a list line or a card: "at 14.20 s". */
export const playheadLabel = (playhead) => { const p = cleanPlayhead(playhead); return p ? `at ${clock(p.time)}` : ''; };
