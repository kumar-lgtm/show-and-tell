// Writing a copy edit back into the exact span it came from.
//
// A unit from the copy map (server/copy-map.js) knows its raw source (`raw`,
// between `start` and `end`) and how that source becomes the words a reviewer
// reads: JS escapes, HTML entities, collapsed whitespace, `${…}` expressions.
// An edit arrives as new display text. To write it:
//
//   1. Find the span again. The file may have changed since the map was made:
//      the raw text must still be at `start` (after earlier edits in this run
//      shifted it), or occur exactly once in the file. Otherwise refuse.
//   2. Map display characters back to raw offsets, so only the words that
//      changed are rewritten. An untouched `&mdash;`, `’` or line wrap in
//      the source stays exactly as it was.
//   3. Encode the new words for where they sit (a quote inside '…' is escaped,
//      `<` in HTML text becomes &lt;, `{` in JSX text becomes &#123;), so new
//      copy can never end a string or open a tag.
//
// `${…}` parts are locked: the new text must carry the same expressions in the
// same order, or the edit is refused.

import { readFileSync, realpathSync } from 'node:fs';
import { join, sep } from 'node:path';
import { sourceFiles } from './apply.js';
import { scanFile } from './copy-map.js';

const collapseWs = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// Display text with a raw offset per character. `map[i]` is the raw offset of
// display character i; `map[text.length]` is the raw end.

function identity(raw) {
  const map = [];
  for (let i = 0; i <= raw.length; i++) map.push(i);
  return { text: raw, map };
}

/** Run a decode step over {text, map}: `step(text)` yields [display, srcStart, srcEnd] pieces in order. */
function through({ text, map }, re, replace) {
  let out = '';
  const m2 = [];
  let last = 0;
  re.lastIndex = 0;
  for (let m; (m = re.exec(text));) {
    for (let k = last; k < m.index; k++) { out += text[k]; m2.push(map[k]); }
    const rep = replace(m);
    for (let k = 0; k < rep.length; k++) { out += rep[k]; m2.push(map[m.index]); }
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  for (let k = last; k < text.length; k++) { out += text[k]; m2.push(map[k]); }
  m2.push(map[text.length]);
  return { text: out, map: m2 };
}

const JS_ESC = /\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r\n|[\s\S])/g;
function jsDecode(t) {
  return through(t, JS_ESC, (m) => {
    const e = m[1];
    if (e[0] === 'u' && e.length > 1) return String.fromCodePoint(parseInt(e[1] === '{' ? e.slice(2, -1) : e.slice(1), 16));
    if (e[0] === 'x' && e.length === 3) return String.fromCharCode(parseInt(e.slice(1), 16));
    if (e === '\n' || e === '\r\n' || e === '\r') return '';
    return { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' }[e] ?? e;
  });
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  mdash: '—', ndash: '–', hellip: '…', copy: '©', reg: '®', trade: '™', middot: '·', times: '×', rarr: '→', larr: '←', bull: '•',
};
const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi;
function htmlDecode(t) {
  return through(t, ENTITY, (m) => {
    const e = m[1];
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(n); } catch { return m[0]; }
    }
    return ENTITIES[e.toLowerCase()] ?? m[0];
  });
}

/** Collapse whitespace runs to one space and trim, keeping the map. */
function collapseMap({ text, map }, trim = true) {
  let out = '';
  const m2 = [];
  let i = 0;
  let end = text.length;
  if (trim) {
    while (i < text.length && /\s/.test(text[i])) i++;
    while (end > i && /\s/.test(text[end - 1])) end--;
  }
  for (; i < end; i++) {
    if (/\s/.test(text[i])) {
      const at = i;
      while (i + 1 < end && /\s/.test(text[i + 1])) i++;
      out += ' '; m2.push(map[at]);
      continue;
    }
    out += text[i]; m2.push(map[i]);
  }
  // The end of the words, before any trailing whitespace: text added at the end goes there.
  m2.push(map[end]);
  return { text: out, map: m2 };
}

/** How the raw source of a static piece becomes display text, by unit kind. */
// `trim` is off for the text between two `${…}` parts: its edge spaces matter.
export function displayOf(kind, raw, trim = true) {
  const t = identity(raw);
  switch (kind) {
    case 'string': case 'template': return jsDecode(t);
    case 'html-text': case 'jsx-text': return collapseMap(htmlDecode(t), trim);
    case 'html-attr': case 'jsx-attr': return collapseMap(htmlDecode(t), trim);
    case 'markup-text': case 'markup-attr': return collapseMap(htmlDecode(jsDecode(t)), trim);
    default: return t;
  }
}

// ---------------------------------------------------------------------------
// Encoding new words for where they sit.

function jsEscape(s, quote) {
  let out = s.replace(/\\/g, '\\\\');
  if (quote === '`') out = out.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  else if (quote) out = out.split(quote).join(`\\${quote}`);
  if (quote !== '`') out = out.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  return out.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
const htmlText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const htmlAttr = (s, q) => htmlText(s).replace(q === "'" ? /'/g : /"/g, q === "'" ? '&#39;' : '&quot;');

/** New display text as raw source for a unit of this kind. */
export function encodeFor(unit, s) {
  const out = encodeRaw(unit, s);
  // A string inside an inline <script>: `</script` or `<!--` in it would end or
  // change the script for the HTML parser, whatever the JS quotes say. `<\/` and
  // `<\!--` read the same to JavaScript.
  return unit.inScript && /^(string|template)$/.test(unit.kind) ? out.replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--') : out;
}

function encodeRaw(unit, s) {
  if (/^(string|template|markup-text|markup-attr)$/.test(unit.kind) && !['\'', '"', '`'].includes(unit.quote)) throw new Error('unknown string quote');
  if (/attr$/.test(unit.kind) && !(unit.kind === 'markup-attr' ? unit.htmlQuote : unit.quote) && /[\s"'=<>`]/.test(s)) throw new Error('an unquoted attribute can\'t take spaces or quotes; edit by hand');
  switch (unit.kind) {
    case 'string': case 'template': return jsEscape(s, unit.quote);
    case 'html-text': return htmlText(s);
    case 'html-attr': return htmlAttr(s, unit.quote || '"');
    case 'jsx-text': return htmlText(s).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
    case 'jsx-attr': return htmlAttr(s, unit.quote || '"');
    case 'markup-text': return jsEscape(htmlText(s), unit.quote);
    case 'markup-attr': return jsEscape(htmlAttr(s, unit.htmlQuote || '"'), unit.quote);
    default: throw new Error(`can't write a ${unit.kind}`);
  }
}

// ---------------------------------------------------------------------------

/** The `${…}` tokens in display text, in order. */
/**
 * The text a reviewer edits for a unit: each static part decoded, `${…}` kept as
 * written in the copy map. Same pipeline the edit is planned with, so an
 * untouched field never reads as a change.
 * @param {object} unit  with `parts` RELATIVE to the unit start
 */
export function displayText(unit) {
  if (!unit.parts?.some((p) => p.expr != null)) return displayOf(unit.kind, unit.raw).text;
  let out = '', at = 0;
  for (const p of unit.parts) {
    if (p.expr == null) continue;
    out += displayOf(unit.kind, unit.raw.slice(at, p.start), false).text + `\${${p.expr}}`;
    at = p.end;
  }
  out += displayOf(unit.kind, unit.raw.slice(at), false).text;
  return /text|attr/.test(unit.kind) ? out.trim() : out;
}

/** Parts relative to the unit's start (the copy map stores file offsets). */
export const relativeParts = (unit) => unit.parts?.map((p) => ({ ...p, start: p.start - unit.start, end: p.end - unit.start }));

const TOKEN = /\$\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

/**
 * Split new display text into the unit's static pieces, holding `${…}` fixed.
 * @returns {string[] | {error}}  new text for each static part, in order
 */
export function splitByParts(unit, to) {
  const exprs = (unit.parts || []).filter((p) => p.expr != null).map((p) => p.expr);
  if (!exprs.length) return [to];
  const found = [...to.matchAll(TOKEN)];
  const same = found.length === exprs.length && found.every((m, i) => collapseWs(m[1]) === exprs[i]);
  if (!same) return { error: `the \${…} parts must stay as they are: ${exprs.map((e) => `\${${e}}`).join(', ')}` };
  const out = [];
  let last = 0;
  for (const m of found) { out.push(to.slice(last, m.index)); last = m.index + m[0].length; }
  out.push(to.slice(last));
  // Static parts may be empty in the source (`${a}${b}`): the split has one
  // piece per gap between expressions; map them onto the unit's static parts.
  return out;
}

/**
 * The splices that turn a unit's raw text into the edited text.
 * @param {object} unit  {kind, quote, raw, parts?: [{start, end, expr?}] relative to unit start}
 * @param {string} to    new display text
 * @returns {{splices: Array<{start, end, text}>} | {error}}  splices relative to unit start
 */
export function planUnitEdit(unit, to) {
  to = String(to ?? '');
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(to)) return { error: 'the new text has control characters' };
  const pieces = splitByParts(unit, to);
  if (pieces.error) return pieces;
  // Static gaps around expressions, in order (an empty gap is a zero-width part).
  const gaps = [];
  if (unit.parts?.some((p) => p.expr != null)) {
    let at = 0;
    for (const p of unit.parts) {
      if (p.expr != null) { gaps.push({ start: at, end: p.start }); at = p.end; }
    }
    gaps.push({ start: at, end: unit.raw.length });
  } else gaps.push({ start: 0, end: unit.raw.length });
  if (gaps.length !== pieces.length) return { error: 'the text no longer lines up with its ${…} parts' };

  const splices = [];
  for (let g = 0; g < gaps.length; g++) {
    const { start, end } = gaps[g];
    const raw = unit.raw.slice(start, end);
    const shown = displayOf(unit.kind, raw, gaps.length === 1);
    // Whitespace-collapsed kinds: compare collapsed new text.
    // Kinds whose whitespace collapses compare collapsed text; a gap between two
    // expressions keeps its edge spaces (`${a} and ${b}`).
    const ws = /text|attr/.test(unit.kind);
    const before = shown.text;
    let after = !ws ? pieces[g] : gaps.length > 1 ? pieces[g].replace(/\s+/g, ' ') : collapseWs(pieces[g]);
    // The display trims the whole text; the first and last gaps keep the source's outer whitespace.
    if (ws && gaps.length > 1) {
      if (g === 0) after = before.match(/^\s*/)[0] + after.trimStart();
      if (g === gaps.length - 1) after = after.trimEnd() + before.match(/\s*$/)[0];
    }
    if (before === after) continue;
    let p = 0;
    while (p < before.length && p < after.length && before[p] === after[p]) p++;
    let s = 0;
    while (s < before.length - p && s < after.length - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
    // Widen the change to whole source tokens: a surrogate pair, or an escape or
    // entity that decodes to several characters (`\u{1F600}`, `&#x1F600;`), is
    // rewritten whole or not at all. Inside one, neighbours share a raw offset.
    const inside = (i) => i > 0 && i < before.length && (shown.map[i] === shown.map[i - 1] || /[\uDC00-\uDFFF]/.test(before[i]));
    while (p > 0 && inside(p)) p--;
    while (s > 0 && inside(before.length - s)) s--;
    const rawStart = shown.map[p];
    const rawEnd = shown.map[before.length - s];
    const middle = after.slice(p, after.length - s);
    let text;
    try { text = encodeFor(unit, middle); } catch (e) { return { error: e.message }; }
    splices.push({ start: start + rawStart, end: start + rawEnd, text });
  }
  return { splices };
}

/** Apply splices (relative to `base`) to text. */
export function applySplices(text, base, splices) {
  let out = text;
  for (const sp of [...splices].sort((a, b) => b.start - a.start)) out = out.slice(0, base + sp.start) + sp.text + out.slice(base + sp.end);
  return out;
}

/**
 * Where the unit's raw text is now in `content`.
 * @param {number} expected  the start, shifted by earlier edits in this run
 * @returns {{at} | {error}}
 */
export function relocate(content, raw, expected) {
  if (content.slice(expected, expected + raw.length) === raw) return { at: expected };
  if (!raw) return { error: 'the source changed here since the copy view was opened' };
  const first = content.indexOf(raw);
  if (first === -1) return { error: 'the old text is no longer in the file (it changed since the copy view was opened)' };
  if (content.indexOf(raw, first + 1) !== -1) return { error: 'the file changed since the copy view was opened, and the old text now appears more than once' };
  return { at: first };
}

/**
 * Dry run for the copy view's Review step: for each {unit, to}, whether `apply`
 * would place it. `ok` at its span, `moved` (found once elsewhere), `already`
 * (the file says the new text), or `cant` with the reason. Writes nothing.
 * @param {string} root
 * @param {Array<{unit, to}>} edits  unit with `parts` relative to its start
 */
export function checkCopyEdits(root, edits) {
  let rootReal;
  try { rootReal = realpathSync(root); } catch { return edits.map(() => ({ status: 'cant', reason: 'the source folder is gone' })); }
  const known = new Set(sourceFiles(rootReal));
  const texts = new Map(), scans = new Map();
  const textOf = (rel) => {
    if (!texts.has(rel)) {
      let t = null;
      try { const abs = realpathSync(join(rootReal, rel)); if (abs.startsWith(rootReal + sep)) t = readFileSync(abs, 'utf8'); } catch { /* unreadable */ }
      texts.set(rel, t);
    }
    return texts.get(rel);
  };
  return edits.map(({ unit: u, to } = {}) => {
    if (!u || typeof to !== 'string') return { status: 'cant', reason: 'not a copy edit' };
    const rel = String(u.file || '');
    if (!known.has(rel)) return { status: 'cant', reason: `${rel || 'the file'} isn't a source file here` };
    const text = textOf(rel);
    if (text == null) return { status: 'cant', reason: `${rel} can't be read` };
    const plan = planUnitEdit(u, to);
    if (plan.error) return { status: 'cant', reason: plan.error };
    const loc = relocate(text, u.raw, u.start);
    if (loc.error) {
      const done = relocate(text, applySplices(u.raw, 0, plan.splices), u.start);
      return done.at != null ? { status: 'already' } : { status: 'cant', reason: loc.error };
    }
    const now = freshPlan(rel, text, u, to, loc.at, scans);
    if (now.error) return { status: 'cant', reason: now.error };
    return { status: loc.at === u.start ? 'ok' : 'moved' };
  });
}

/**
 * The unit as the file says it is now, at `at`, with the same raw text: its
 * quote, kind, `${…}` parts and context come from the current source, never from
 * the snapshot (the file may have switched "…" to '…' since the view opened).
 * @returns {object|null}  unit with parts relative to its start
 */
export function currentUnit(rel, text, at, raw, cache = new Map()) {
  if (!cache.has(rel)) cache.set(rel, scanFile(rel, text));
  const u = cache.get(rel).find((x) => x.start === at && x.raw === raw);
  return u ? { ...u, parts: relativeParts(u) } : null;
}

/** The note's unit replaced by what the source says now, or why it can't be. */
export function freshPlan(rel, text, note, to, at, cache) {
  const now = currentUnit(rel, text, at, note.raw, cache);
  if (!now) return { error: 'the text there is no longer a string the copy view can place' };
  if (now.kind !== note.kind) return { error: `the text there is now ${now.kind}, not ${note.kind}` };
  const plan = planUnitEdit(now, to);
  return plan.error ? plan : { ...plan, unit: now };
}
