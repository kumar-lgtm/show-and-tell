/**
 * Pure, immutable model for a spoken review. Every public mutator returns a new
 * session; it never touches the page, starts a microphone or stores audio.
 * Times are milliseconds on the recording clock, not wall-clock time.
 */
import { voiceSentences } from '../server/voice-transcript.js';

export const VOICE_VERSION = 1;
export const MAX_CONTEXT_ELEMENTS = 8;
export const MAX_CONTEXT_CHARS = 4 * 1024;
export const MAX_IMAGE_CHARS = 48 * 1024;
export const MAX_PASSAGE_CHARS = 8 * 1024;
const KINDS = new Set(['general', 'element', 'region']);
const copy = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const uid = () => globalThis.crypto?.randomUUID?.() || `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function text(value, name, max = 2048, { empty = false } = {}) {
  if (typeof value !== 'string') throw new TypeError(`${name} must be text`);
  const clean = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  if ((!empty && !clean.trim()) || clean.length > max) throw new RangeError(`${name} is empty or too long`);
  return clean;
}

function time(value, name = 'time') {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a non-negative finite number`);
  return value;
}

function pageValue(value) {
  const page = text(value, 'page');
  if (!page.startsWith('/') && !/^https?:\/\//i.test(page)) throw new TypeError('page must be an HTTP URL or a root-relative path');
  if (page.startsWith('//')) throw new TypeError('page must not be a protocol-relative URL');
  return page;
}

function viewportValue(value = {}) {
  const viewport = {};
  for (const key of ['width', 'height']) {
    if (value[key] != null) {
      if (!Number.isFinite(value[key]) || value[key] <= 0 || value[key] > 32768) throw new RangeError(`viewport ${key} is invalid`);
      viewport[key] = value[key];
    }
  }
  if (value.name != null) viewport.name = text(value.name, 'viewport name', 80);
  for (const key of ['scrollX', 'scrollY', 'devicePixelRatio', 'scale']) {
    if (value[key] != null) {
      if (!Number.isFinite(value[key]) || ((key === 'devicePixelRatio' || key === 'scale') && value[key] <= 0)) throw new RangeError(`viewport ${key} is invalid`);
      viewport[key] = value[key];
    }
  }
  return viewport;
}

function rectValue(value) {
  if (!value || typeof value !== 'object') throw new TypeError('region needs a rectangle');
  const rect = {};
  for (const key of ['x', 'y', 'width', 'height']) {
    if (!Number.isFinite(value[key]) || value[key] < 0 || ((key === 'width' || key === 'height') && !value[key])) throw new RangeError(`rectangle ${key} is invalid`);
    rect[key] = value[key];
  }
  for (const key of ['scrollX', 'scrollY']) {
    if (value[key] != null) {
      if (!Number.isFinite(value[key])) throw new RangeError(`rectangle ${key} is invalid`);
      rect[key] = value[key];
    }
  }
  return rect;
}

function imageValue(value) {
  if (value == null) return undefined;
  const validUrl = (url) => {
    const clean = text(url, 'image', MAX_IMAGE_CHARS);
    if (!/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(clean) && !/^https:\/\//i.test(clean) && !/^\/(?!\/)/.test(clean)) throw new TypeError('image must be a JPEG, PNG or WebP data URL, HTTPS URL or local path');
    return clean;
  };
  if (typeof value === 'string') return validUrl(value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('image is invalid');
  const image = {};
  if (value.dataUrl != null) image.dataUrl = validUrl(value.dataUrl);
  else if (value.url != null) image.url = validUrl(value.url);
  else throw new TypeError('image needs dataUrl or url');
  for (const key of ['width', 'height']) {
    if (value[key] != null) {
      if (!Number.isFinite(value[key]) || value[key] <= 0 || value[key] > 32768) throw new RangeError(`image ${key} is invalid`);
      image[key] = value[key];
    }
  }
  if (value.mimeType != null) {
    if (!/^image\/(?:jpeg|png|webp)$/.test(value.mimeType)) throw new TypeError('image MIME type is invalid');
    image.mimeType = value.mimeType;
  }
  if (value.capturedAtMs != null) image.capturedAtMs = time(value.capturedAtMs, 'capture time');
  if (JSON.stringify(image).length > MAX_IMAGE_CHARS) throw new RangeError('image metadata is too large');
  return image;
}

// Page text is arbitrary: clip it instead of rejecting the anchor. Control
// characters go, whitespace collapses, and every string has a hard cap.
function clipText(value, max) {
  if (value == null) return undefined;
  const clean = String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}
const TAG = /^[a-z][a-z0-9-]{0,31}$/, ROLE = /^[a-z][a-z-]{0,31}$/;

function contextElement(value) {
  if (!value || typeof value !== 'object') return null;
  const el = {};
  const tag = String(value.tag || '').toLowerCase();
  if (TAG.test(tag)) el.tag = tag;
  const role = String(value.role || '').toLowerCase();
  if (ROLE.test(role)) el.role = role;
  const name = clipText(value.name, 80); if (name) el.name = name;
  const selector = clipText(value.selector, 300); if (selector) el.selector = selector;
  if (value.overlap === 'inside' || value.overlap === 'partly') el.overlap = value.overlap;
  return el.tag || el.name ? el : null;
}

/** Nearby names and text, so an agent can tell targets apart on a dense page
 * where geometry alone is ambiguous. Optional, bounded and plain data. */
function contextValue(value, kind) {
  if (value == null || kind === 'general') return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw new TypeError('anchor context is invalid');
  const context = {};
  const tag = String(value.tag || '').toLowerCase();
  if (kind === 'element' && TAG.test(tag)) context.tag = tag;
  const role = String(value.role || '').toLowerCase();
  if (kind === 'element' && ROLE.test(role)) context.role = role;
  for (const [key, max] of [['name', 120], ['text', 160], ['heading', 120], ['landmark', 80]]) {
    const v = clipText(value[key], max); if (v) context[key] = v;
  }
  if (kind === 'region' && Array.isArray(value.elements)) {
    const elements = value.elements.map(contextElement).filter(Boolean);
    context.elements = elements.slice(0, MAX_CONTEXT_ELEMENTS);
    const total = Number.isInteger(value.total) && value.total >= elements.length ? value.total : elements.length;
    if (total > context.elements.length) context.more = Math.min(total - context.elements.length, 9999);
  }
  while (JSON.stringify(context).length > MAX_CONTEXT_CHARS && context.elements?.length) { context.elements.pop(); context.more = (context.more || 0) + 1; }
  if (JSON.stringify(context).length > MAX_CONTEXT_CHARS) delete context.text;
  return Object.keys(context).length ? context : undefined;
}

function validSession(session) {
  if (!session || session.version !== VOICE_VERSION || !Array.isArray(session.anchors) || !Array.isArray(session.events) || !Array.isArray(session.passages) || !session.anchors.length || !session.events.length) throw new TypeError('invalid voice session');
  return session;
}

function snapshot(session) {
  validSession(session);
  // Whitelist top-level state. A capture layer may hold a Blob separately, but
  // audio must never leak into the serializable review model.
  return copy({ id: session.id, version: session.version, page: session.page, viewport: session.viewport, reviewer: session.reviewer,
    startedAt: session.startedAt, currentPage: session.currentPage, currentViewport: session.currentViewport,
    activeAnchorId: session.activeAnchorId, anchors: session.anchors, events: session.events,
    passages: session.passages, editSequence: session.editSequence || 0,
    ...(Array.isArray(session.playheads) && session.playheads.length ? { playheads: session.playheads } : {}) });
}

// ---- the page's own timeline during a recording ---------------------------
// A film can be played, paused and scrubbed while the reviewer talks. Samples
// of {tMs, time, playing} are enough to say where it was at any passage: a
// new one is kept only when the last one no longer predicts the playhead.
const MAX_PLAYHEADS = 600, PLAYHEAD_DRIFT = 0.12;
const predict = (s, tMs) => Math.max(0, s.playing ? s.time + (tMs - s.tMs) / 1000 : s.time);

/** Note where the page's timeline is, `tMs` into the recording. Returns the same session when nothing changed. */
export function addPlayhead(session, sample, tMs) {
  const at = Number(sample?.time);
  if (!session || !Number.isFinite(at) || at < 0 || !Number.isFinite(tMs) || tMs < 0) return session;
  const list = Array.isArray(session.playheads) ? session.playheads : [], last = list.at(-1), playing = !!sample.playing;
  if (last && (tMs < last.tMs || (last.playing === playing && Math.abs(predict(last, tMs) - at) < PLAYHEAD_DRIFT))) return session;
  if (list.length >= MAX_PLAYHEADS) return session;
  return { ...session, playheads: [...list, { tMs: Math.round(tMs), time: Math.round(at * 1000) / 1000, playing }] };
}

/** Where the page's timeline was `tMs` into the recording: {time, playing}, or undefined when it has none. */
export function playheadAt(session, tMs) {
  const list = session?.playheads;
  if (!Array.isArray(list) || !list.length) return undefined;
  let s = list[0];
  for (const x of list) { if (x.tMs <= tMs) s = x; else break; }
  return { time: Math.round(predict(s, Math.max(tMs, s.tMs)) * 1000) / 1000, playing: !!s.playing };
}

/** Create a serializable review with a General anchor and an event at t=0. */
export function createSession({ id = uid(), page = '/', viewport = {}, reviewer = '', startedAt = Date.now() } = {}) {
  id = text(id, 'session id', 128); page = pageValue(page); viewport = viewportValue(viewport);
  reviewer = text(reviewer, 'reviewer', 40, { empty: true }); time(startedAt, 'startedAt');
  const anchor = { id: `${id}:a0`, kind: 'general', label: 'General', page, viewport };
  return { id, version: VOICE_VERSION, page, viewport: copy(viewport), reviewer, startedAt, currentPage: page,
    currentViewport: copy(viewport), activeAnchorId: anchor.id, anchors: [anchor],
    events: [{ id: `${id}:e0`, type: 'anchor', tMs: 0, anchorId: anchor.id, page }], passages: [], editSequence: 0 };
}

/** Select a target until the next anchor event. Repeated element/General
 * selections reuse their ID; region selections keep their individual images. */
export function addAnchor(session, input, tMs) {
  const next = snapshot(session); time(tMs);
  if (tMs < next.events.at(-1).tMs) throw new RangeError('anchor events must be monotonic');
  if (!input || !KINDS.has(input.kind)) throw new TypeError('anchor kind must be general, element or region');
  const page = pageValue(input.page ?? next.currentPage);
  const viewport = viewportValue(input.viewport ?? next.currentViewport);
  const kind = input.kind;
  const anchor = { kind, label: kind === 'general' ? 'General' : text(input.label || (kind === 'region' ? 'Region' : ''), 'target label', 160), page, viewport };
  if (kind === 'element') anchor.selector = text(input.selector, 'selector');
  if (kind === 'region' || input.rect != null) anchor.rect = rectValue(input.rect);
  const image = imageValue(input.image);
  if (image != null && kind !== 'region') throw new TypeError('only region anchors carry an image');
  if (image != null) anchor.image = image;
  const context = contextValue(input.context, kind);
  if (context) anchor.context = context;
  const sameViewport = (a) => JSON.stringify(a.viewport) === JSON.stringify(viewport);
  const existing = kind === 'region' ? null : next.anchors.find((a) => a.kind === kind && a.page === page && sameViewport(a) && (kind === 'general' || a.selector === anchor.selector));
  if (existing) anchor.id = existing.id;
  else { anchor.id = `${next.id}:a${next.anchors.length}`; next.anchors.push(anchor); }
  next.events.push({ id: `${next.id}:e${next.events.length}`, type: 'anchor', tMs, anchorId: anchor.id, page });
  next.activeAnchorId = anchor.id; next.currentPage = page; next.currentViewport = viewport;
  return next;
}

/** A route change always begins page-level feedback, never keeps a stale target. */
export function changePage(session, page, viewport, tMs) {
  return addAnchor(session, { kind: 'general', page, viewport: viewport ?? session.currentViewport }, tMs);
}

function overlapFor(session, startMs, endMs) {
  const totals = new Map();
  for (let i = 0; i < session.events.length; i++) {
    const event = session.events[i], nextTime = session.events[i + 1]?.tMs ?? Infinity;
    const length = Math.max(0, Math.min(endMs, nextTime) - Math.max(startMs, event.tMs));
    if (length) totals.set(event.anchorId, (totals.get(event.anchorId) || 0) + length);
  }
  if (!totals.size) {
    const event = session.events.filter((e) => e.tMs <= startMs).at(-1) || session.events[0];
    totals.set(event.anchorId, 0);
  }
  // Stable sort chooses the earlier interval for an exact tie, with an explicit
  // review flag. No fabricated word boundary is used to break the tie.
  const ranked = [...totals].sort((a, b) => b[1] - a[1]);
  return { anchorId: ranked[0][0], candidateAnchorIds: ranked.map(([id]) => id), needsReview: ranked.length > 1 };
}

function joinWords(words) {
  if (words.some((w) => /^\s/.test(w.text))) return words.map((w) => w.text).join('').trim();
  return words.map((w) => w.text.trim()).join(' ').replace(/\s+([.,!?;:%…\)\]\}])/g, '$1').replace(/([\(\[\{])\s+/g, '$1').replace(/\s+(['’](?:s|re|ve|ll|d|m|t)\b)/gi, '$1').trim();
}

function sourceSegment(segment, index) {
  if (!segment || typeof segment !== 'object') throw new TypeError('transcript segment is invalid');
  const startMs = time(segment.startMs, 'segment start'), endMs = time(segment.endMs, 'segment end');
  if (endMs < startMs) throw new RangeError('segment ends before it starts');
  const result = { sourceSegmentId: String(segment.id ?? index).slice(0, 128), startMs, endMs,
    text: text(segment.text, 'transcript text', MAX_PASSAGE_CHARS, { empty: true }), timingUncertain: segment.timingUncertain === true };
  if (segment.words != null) {
    if (!Array.isArray(segment.words)) throw new TypeError('segment words must be an array');
    result.words = segment.words.map((word) => {
      const start = time(word.startMs, 'word start'), end = time(word.endMs, 'word end');
      if (end < start || start < startMs || end > endMs) throw new RangeError('word time falls outside its segment');
      return { text: text(word.text, 'word text', MAX_PASSAGE_CHARS), startMs: start, endMs: end };
    });
    for (let i = 1; i < result.words.length; i++) if (result.words[i].startMs < result.words[i - 1].startMs) throw new RangeError('word times must be ordered');
  }
  return result;
}

/** Replace the generated passages with a timestamp-grounded transcript. Word
 * times permit precise groups. A segment spanning a target change without
 * word timing remains intact and is marked for the reviewer to correct. */
export function transcriptToPassages(session, segments) {
  const next = snapshot(session);
  if (!Array.isArray(segments)) throw new TypeError('transcript segments must be an array');
  const passages = [];
  segments.map(sourceSegment).forEach((segment, index) => {
    if (!segment.text.trim()) return;
    const whole = overlapFor(next, segment.startMs, segment.endMs);
    const groups = [];
    const wordsCoverText = segment.words?.length && joinWords(segment.words).replace(/\s/g, '') === segment.text.replace(/\s/g, '');
    if (wordsCoverText && whole.needsReview) {
      for (const word of segment.words) {
        const match = overlapFor(next, word.startMs, word.endMs), previous = groups.at(-1);
        if (previous && previous.anchorId === match.anchorId) {
          previous.words.push(word); previous.endMs = word.endMs;
          previous.needsReview ||= match.needsReview;
          previous.candidateAnchorIds = [...new Set([...previous.candidateAnchorIds, ...match.candidateAnchorIds])];
        } else groups.push({ ...match, words: [word], startMs: word.startMs, endMs: word.endMs });
      }
    } else groups.push({ ...whole, text: segment.text, startMs: segment.startMs, endMs: segment.endMs });
    groups.forEach((group, groupIndex) => passages.push({ id: `${next.id}:p${index}.${groupIndex}`, sourceSegmentId: segment.sourceSegmentId,
      text: group.text ?? joinWords(group.words), startMs: group.startMs, endMs: group.endMs, anchorId: group.anchorId,
      needsReview: group.needsReview, candidateAnchorIds: group.candidateAnchorIds,
      ...(segment.timingUncertain || (segment.words?.length && !wordsCoverText && whole.needsReview) ? { timingApproximate: true } : {}) }));
  });
  next.passages = passages;
  return next;
}

function passageIndex(session, id) {
  const index = session.passages.findIndex((p) => p.id === id);
  if (index < 0) throw new RangeError('passage not found');
  return index;
}

export function updatePassage(session, id, value) {
  const next = snapshot(session), index = passageIndex(next, id);
  next.passages[index].text = text(value, 'passage text', MAX_PASSAGE_CHARS, { empty: true });
  next.passages[index].edited = true;
  return next;
}

export function reassignPassage(session, id, anchorId) {
  const next = snapshot(session), index = passageIndex(next, id);
  if (!next.anchors.some((a) => a.id === anchorId)) throw new RangeError('anchor not found');
  Object.assign(next.passages[index], { anchorId, needsReview: false, manuallyAssigned: true });
  return next;
}

/** Split only the edited text. Both halves retain the original audio interval
 * as provenance; a character offset is not evidence of a new audio timestamp. */
export function splitPassage(session, id, offset) {
  const next = snapshot(session), index = passageIndex(next, id), original = next.passages[index];
  if (!Number.isInteger(offset) || offset <= 0 || offset >= original.text.length) throw new RangeError('split must be inside the passage');
  const left = original.text.slice(0, offset).trim(), right = original.text.slice(offset).trim();
  if (!left || !right) throw new RangeError('split must leave text on both sides');
  next.editSequence++;
  const shared = { ...original, edited: true, timingApproximate: true };
  next.passages.splice(index, 1, { ...shared, text: left }, { ...shared, id: `${id}:split${next.editSequence}`, text: right, splitFrom: id });
  return next;
}

export function removePassage(session, id) {
  const next = snapshot(session), index = passageIndex(next, id);
  next.passages.splice(index, 1); return next;
}

/** Annotation IDs are deterministic, so retrying a save is idempotent. The
 * agent receives reviewed text + target context; raw audio is never included. */
export function exportNotes(session) {
  validSession(session);
  return session.passages.filter((p) => p.text.trim()).map((passage) => {
    text(passage.text, 'passage text', MAX_PASSAGE_CHARS);
    const anchor = session.anchors.find((a) => a.id === passage.anchorId);
    if (!anchor) throw new RangeError('passage anchor not found');
    const target = { id: anchor.id, kind: anchor.kind, label: anchor.label, page: anchor.page };
    if (anchor.selector) target.selector = anchor.selector;
    if (anchor.context) target.context = copy(anchor.context);
    const voice = { version: VOICE_VERSION, sessionId: session.id, passageId: passage.id,
      startMs: passage.startMs, endMs: passage.endMs, target,
      ...(anchor.rect ? { region: copy(anchor.rect) } : {}), ...(anchor.image ? { image: copy(anchor.image) } : {}),
      ...(passage.needsReview ? { needsReview: true, candidateAnchorIds: [...passage.candidateAnchorIds] } : {}),
      ...(passage.timingApproximate ? { timingApproximate: true } : {}) };
    const id = `voice:${passage.id}`;
    const note = { id, clientId: id, kind: 'voice', comment: passage.text, element: anchor.kind === 'general' ? 'Page feedback' : anchor.label,
      elementPath: anchor.selector || '', url: anchor.page, viewport: copy(anchor.viewport),
      ...(session.reviewer ? { reviewer: session.reviewer } : {}), timestamp: session.startedAt + passage.startMs, voice };
    // Where the film was when this passage began; the caller adds what was on screen then (playhead.js).
    const at = playheadAt(session, passage.startMs);
    if (at) note.playhead = at;
    if (JSON.stringify(note).length > 63 * 1024) throw new RangeError('voice note is too large; reduce its screenshot or split the text');
    return note;
  });
}

/** The reviewed transcript as whole sentences with inline target markers, in
 * speech order. Every word of every non-empty passage is kept; the per-passage
 * targets above remain the source of truth for each note. */
export function transcriptSentences(session) {
  validSession(session);
  return voiceSentences(session.passages.map((p) => {
    const a = session.anchors.find((x) => x.id === p.anchorId) || session.anchors[0];
    return { id: p.id, text: p.text, startMs: p.startMs, needsReview: !!p.needsReview, target: { id: a.id, label: a.label, kind: a.kind } };
  }));
}
