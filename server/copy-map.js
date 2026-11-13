// The copy map: every piece of copy in a project's source, with its exact span.
//
// Copy edit mode shows a reviewer ALL the words on a page, laid out by the page's
// structure, and lets them rewrite any of it. The page alone can't show all of it:
// a lot of copy never sits in the DOM at once (a random line from an array, a
// rotating role, a canvas label, a mascot's dialogue in a data attribute, an SVG
// diagram built in a template string). So the server reads the source too, and
// every unit it finds carries `file`, `start`, `end`: the characters to replace,
// so an edit can be written back exactly rather than searched for.
//
// No parser dependency. A small tokenizer is enough to find string literals,
// template literals, JSX text and HTML text, and to remember where each sits
// (`recordData[1][1]`, `E[2].job`, the second argument of `fillText`). It never
// executes anything and never needs the code to be valid: an unbalanced file
// yields fewer units, not an error.
//
// Whether a string is copy is a judgement (class names, selectors, event names
// and keys are strings too), so each unit says `copy: 'yes' | 'maybe' | 'no'` and
// why. Callers show `yes`, offer `maybe` behind a filter, and hide `no`.
import { readFileSync, realpathSync, statSync, lstatSync, openSync, fstatSync, closeSync, constants as fsConstants } from 'node:fs';
import { join, extname } from 'node:path';
import { sourceFiles } from './apply.js';

const MAX_BYTES = 1024 * 1024;
export const JS_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts']);
export const JSX_EXT = new Set(['.js', '.jsx', '.tsx']);
export const HTML_EXT = new Set(['.html', '.htm']);

const collapse = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// Line/column for an offset, computed once per file.
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (offset) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return { line: lo + 1, col: offset - starts[lo] + 1 };
  };
}

// ---------------------------------------------------------------------------
// JS string decoding (for display; the span always points at the raw source).
function decodeJs(raw) {
  return raw.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r?\n|.)/g, (_, e) => {
    if (e[0] === 'u') return String.fromCodePoint(parseInt(e[1] === '{' ? e.slice(2, -1) : e.slice(1), 16));
    if (e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
    if (e === '\n' || e === '\r\n') return '';
    return { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' }[e] ?? e;
  });
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  mdash: '—', ndash: '–', hellip: '…', copy: '©', reg: '®', trade: '™', middot: '·', times: '×', rarr: '→', larr: '←', bull: '•',
};
export function decodeHtml(raw) {
  return raw.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return m; } }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// ---------------------------------------------------------------------------
// The JS tokenizer.
//
// Frames track where a string sits: each `(`, `[` and `{` pushes one, labelled by
// what opened it (`recordData =`, `job:`, `fillText(`, `function draw`). A unit's
// path is read off the frames, outermost declaration first.

const KEYWORDS_BEFORE_EXPR = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await', 'export', 'default', 'extends']);
const CONTROL = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'function']);
const PUNCT = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>'];
const isIdStart = (c) => /[\p{L}_$]/u.test(c);
const isIdPart = (c) => /[\p{L}\p{N}_$‌‍]/u.test(c);

/**
 * Every string, template and JSX text in `text`, with its span and where it sits.
 * @param {string} text
 * @param {object} [o]
 * @param {boolean} [o.jsx]   read `<Tag>` in expression position as JSX
 * @param {number}  [o.base]  offset added to every span (a <script> inside HTML)
 */
export function scanJs(text, { jsx = false, base = 0 } = {}) {
  const units = [];
  const frames = [];           // {open, kind:'array'|'object'|'call'|'block'|'paren', label, labelKind, index, key, calleeArgs}
  let prev = null;             // last significant token {type, value, unit?}
  let prev2 = null;
  let chain = [];              // identifiers of the member chain just read (`li.querySelector`)
  let lastClosed = null;       // the frame just closed (a `)` before a function body `{`)
  let pendingFn = null;        // `function name` waiting for its body
  let i = 0;

  const push = (tok) => { prev2 = prev; prev = tok; };
  const top = () => frames[frames.length - 1];
  const exprStart = () => {
    if (!prev) return true;
    if (prev.type === 'punct') return !([')', ']', '}'].includes(prev.value));
    if (prev.type === 'name') return KEYWORDS_BEFORE_EXPR.has(prev.value);
    return false;
  };

  function emit(u) {
    const f = top();
    u.start += base; u.end += base;
    u.frames = frames.map((fr) => ({ kind: fr.kind, label: fr.label, labelKind: fr.labelKind, at: fr.at, index: fr.index, key: fr.key, open: fr.open }));
    // Directly inside a call: which argument it is.
    if (f && f.kind === 'call') u.arg = f.index;
    // Right after `x.y =`: what it is assigned to.
    if (prev && prev.type === 'punct' && prev.value === '=' && prev.target) u.assign = prev.target;
    if (prev && prev.type === 'punct' && ['===', '!==', '==', '!='].includes(prev.value)) u.compared = true;
    if (prev && prev.type === 'name' && prev.value === 'case') u.compared = true;
    if (prev && prev.type === 'name' && (prev.value === 'from' || prev.value === 'import')) u.module = true;
    if (prev && prev.type === 'punct' && prev.value === '[' && prev2 && (prev2.type === 'name' || prev2.value === ')' || prev2.value === ']')) u.computedKey = true;
    units.push(u);
    return u;
  }

  function openFrame(open) {
    let kind, label = null, labelKind = null;
    if (open === '(') {
      if (prev && prev.type === 'name' && !CONTROL.has(prev.value) && !KEYWORDS_BEFORE_EXPR.has(prev.value)) {
        kind = 'call'; label = prev.value; labelKind = 'call';
        if (prev2 && prev2.type === 'name' && prev2.value === 'function') { kind = 'paren'; pendingFn = prev.value; }
      } else if (prev && prev.type === 'name' && prev.value === 'function') { kind = 'paren'; }
      else kind = 'paren';
    } else if (open === '[') {
      kind = (prev && (prev.type === 'name' && !KEYWORDS_BEFORE_EXPR.has(prev.value) || prev.type === 'string' || [')', ']'].includes(prev.value))) ? 'index' : 'array';
    } else {
      // `{`: an object literal in expression position, else a block.
      const objectAfter = !prev || (prev.type === 'punct' && ['=', '(', ',', ':', '[', '?', '&&', '||', '??', '...', '+', '-', '!', '{'].includes(prev.value) && !(prev.value === '{' && top()?.kind === 'block'))
        || (prev.type === 'name' && ['return', 'yield', 'await', 'case', 'in', 'of', 'typeof', 'export', 'default'].includes(prev.value) && prev.value !== 'export');
      kind = objectAfter ? 'object' : 'block';
      if (kind === 'block') {
        if (pendingFn && prev && prev.value === ')') { label = pendingFn; labelKind = 'fn'; pendingFn = null; }
        else if (prev && prev.value === ')' && lastClosed && lastClosed.kind === 'call' && lastClosed.label && !CONTROL.has(lastClosed.label)) { label = lastClosed.label; labelKind = 'fn'; }
        else if (prev && prev.value === '=>' && prev.target) { label = prev.target.split('.').pop(); labelKind = 'fn'; }
      }
    }
    // A value assigned to a name, or the value of an object key, is named by it.
    if (kind === 'array' || kind === 'object' || kind === 'call' && !label) {
      if (prev && prev.type === 'punct' && prev.value === '=' && prev.target) { label = prev.target; labelKind = 'decl'; }
      else if (prev && prev.type === 'punct' && prev.value === ':' && top()?.kind === 'object' && top().key != null) { label = top().key; labelKind = 'prop'; }
    }
    frames.push({ open, kind, label, labelKind, at: base + i - 1, index: 0, key: null, decl: prev?.type === 'punct' && prev.value === '=' ? prev.target : null });
  }

  function closeFrame(close) {
    const want = close === ')' ? '(' : close === ']' ? '[' : '{';
    // Tolerate imbalance: pop to the nearest matching opener, if any.
    for (let k = frames.length - 1; k >= 0; k--) {
      if (frames[k].open === want) { lastClosed = frames[k]; frames.length = k; return; }
    }
  }

  function readString(q) {
    const s = i + 1;
    let j = s;
    while (j < text.length && text[j] !== q) {
      if (text[j] === '\\') j += 2;
      else if (text[j] === '\n') break; // unterminated: stop at the line end
      else j++;
    }
    const raw = text.slice(s, j);
    const u = emit({ kind: 'string', quote: q, start: s, end: j, raw, text: decodeJs(raw) });
    i = Math.min(j + 1, text.length);
    push({ type: 'string', value: raw, unit: u });
  }

  function readTemplate() {
    const s = i + 1;
    let j = s;
    const parts = [];
    let chunk = s;
    const nested = [];
    while (j < text.length && text[j] !== '`') {
      if (text[j] === '\\') { j += 2; continue; }
      if (text[j] === '$' && text[j + 1] === '{') {
        if (j > chunk) parts.push({ start: chunk, end: j });
        const exprStart = j + 2;
        // Scan the expression as code (strings in it are units of their own).
        const savePrev = prev, savePrev2 = prev2, saveFrames = frames.length;
        i = exprStart; prev = null; prev2 = null;
        const before = units.length;
        code(true);
        const exprEnd = i; // at the closing `}`
        for (let k = before; k < units.length; k++) nested.push(units[k]);
        frames.length = saveFrames; prev = savePrev; prev2 = savePrev2;
        parts.push({ start: exprStart - 2, end: Math.min(exprEnd + 1, text.length), expr: text.slice(exprStart, exprEnd) });
        j = Math.min(exprEnd + 1, text.length);
        chunk = j;
        continue;
      }
      j++;
    }
    if (j > chunk) parts.push({ start: chunk, end: j });
    const raw = text.slice(s, j);
    const shown = parts.map((p) => (p.expr != null ? `\${${collapse(p.expr)}}` : decodeJs(text.slice(p.start, p.end)))).join('');
    const u = emit({
      kind: 'template', quote: '`', start: s, end: j, raw, text: shown,
      parts: parts.map((p) => ({ start: p.start + base, end: p.end + base, ...(p.expr != null ? { expr: collapse(p.expr) } : {}) })),
    });
    for (const n of nested) n.within = u;
    i = Math.min(j + 1, text.length);
    push({ type: 'string', value: raw, unit: u });
  }

  function readRegex() {
    let j = i + 1, inClass = false;
    while (j < text.length && text[j] !== '\n') {
      const c = text[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '[') inClass = true; else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) break;
      j++;
    }
    j++;
    while (j < text.length && isIdPart(text[j])) j++;
    i = j;
    push({ type: 'regex' });
  }

  // JSX: an element in expression position. Text children and string attribute
  // values are units; `{…}` children and attribute values are code.
  function readJsx() {
    // At `<`. Fragment or tag.
    let depth = 0;
    const tagStack = [];
    while (i < text.length) {
      if (text[i] === '<') {
        if (text[i + 1] === '/') { // closing tag
          const end = text.indexOf('>', i);
          i = end === -1 ? text.length : end + 1;
          tagStack.pop();
          if (--depth <= 0) break;
          continue;
        }
        // Opening tag
        let j = i + 1;
        while (j < text.length && /[\w.:$-]/.test(text[j])) j++;
        const tag = text.slice(i + 1, j);
        i = j;
        let selfClose = false;
        // Attributes
        while (i < text.length) {
          const c = text[i];
          if (/\s/.test(c)) { i++; continue; }
          if (c === '/' && text[i + 1] === '>') { selfClose = true; i += 2; break; }
          if (c === '>') { i++; break; }
          if (c === '{') { // spread or expression attribute
            i++; const sp = prev, sp2 = prev2, sf = frames.length; prev = null; prev2 = null;
            code(true); frames.length = sf; prev = sp; prev2 = sp2; i++; continue;
          }
          let k = i;
          while (k < text.length && /[\w:.$-]/.test(text[k])) k++;
          const attr = text.slice(i, k) || text[i];
          i = Math.max(k, i + 1);
          while (/\s/.test(text[i] || '')) i++;
          if (text[i] !== '=') continue;
          i++;
          while (/\s/.test(text[i] || '')) i++;
          const q = text[i];
          if (q === '"' || q === "'") {
            const end = text.indexOf(q, i + 1);
            const e = end === -1 ? text.length : end;
            const raw = text.slice(i + 1, e);
            emit({ kind: 'jsx-attr', quote: q, start: i + 1, end: e, raw, text: decodeHtml(raw), attr, tag });
            i = e + 1;
          } else if (q === '{') {
            i++; const sp = prev, sp2 = prev2, sf = frames.length; prev = { type: 'punct', value: '=', target: attr }; prev2 = null;
            code(true); frames.length = sf; prev = sp; prev2 = sp2; i++;
          }
        }
        if (!selfClose) { tagStack.push(tag); depth++; }
        else if (depth === 0) break;
        continue;
      }
      if (depth <= 0) break;
      if (text[i] === '{') {
        i++; const sp = prev, sp2 = prev2, sf = frames.length; prev = null; prev2 = null;
        code(true); frames.length = sf; prev = sp; prev2 = sp2; i++; continue;
      }
      // Text run
      let j = i;
      while (j < text.length && text[j] !== '<' && text[j] !== '{') j++;
      const run = text.slice(i, j);
      if (run.trim()) {
        const lead = run.length - run.trimStart().length, trail = run.length - run.trimEnd().length;
        const raw = run.slice(lead, run.length - trail);
        emit({ kind: 'jsx-text', quote: null, start: i + lead, end: j - trail, raw, text: collapse(decodeHtml(raw)), tag: tagStack[tagStack.length - 1] || '' });
      }
      i = j;
    }
    push({ type: 'punct', value: ')' }); // a JSX element ends an expression, like `)`
  }

  // The main loop. With `untilBrace`, returns at the `}` that closes a `${` or JSX `{`.
  function code(untilBrace = false) {
    let braces = 0;
    while (i < text.length) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v' || c === ' ' || c === '﻿') { i++; continue; }
      if (c === '/' && text[i + 1] === '/') { const e = text.indexOf('\n', i); i = e === -1 ? text.length : e; continue; }
      if (c === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e === -1 ? text.length : e + 2; continue; }
      if (c === '<' && text[i + 1] === '!' && text.startsWith('<!--', i)) { const e = text.indexOf('\n', i); i = e === -1 ? text.length : e; continue; }
      if (c === "'" || c === '"') { readString(c); continue; }
      if (c === '`') { readTemplate(); continue; }
      if (c === '/') { if (exprStart()) { readRegex(); continue; } }
      if (jsx && c === '<' && exprStart() && /[A-Za-z>]/.test(text[i + 1] || '')) {
        // `<T,>(…) =>` and `<T extends …>` are TypeScript generics, not JSX.
        const ahead = text.slice(i + 1, i + 40);
        if (!/^[A-Za-z_$][\w$]*\s*(,|extends\b)/.test(ahead)) { readJsx(); continue; }
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(text[i + 1] || ''))) {
        let j = i + 1;
        while (j < text.length && /[\w.]/.test(text[j])) j++;
        i = j; push({ type: 'num' }); chain = []; continue;
      }
      if (isIdStart(c) || c === '\\' || c === '#' && isIdStart(text[i + 1] || '')) {
        let j = i + 1;
        while (j < text.length && isIdPart(text[j])) j++;
        const name = text.slice(i, j);
        i = j;
        if (prev && prev.type === 'punct' && (prev.value === '.' || prev.value === '?.')) chain.push(name); else chain = [name];
        if (name === 'function') pendingFn = null;
        if ((name === 'in' || name === 'instanceof') && prev?.unit) prev.unit.isKey = true;
        push({ type: 'name', value: name });
        continue;
      }
      // Punctuation
      let p = c;
      for (const op of PUNCT) if (text.startsWith(op, i)) { p = op; break; }
      i += p.length;
      if (p === '(' || p === '[' || p === '{') {
        if (p === '{') braces++;
        openFrame(p);
        push({ type: 'punct', value: p });
        chain = [];
        continue;
      }
      if (p === ')' || p === ']' || p === '}') {
        if (p === '}') {
          if (untilBrace && braces === 0) { i--; return; }
          braces--;
        }
        closeFrame(p);
        push({ type: 'punct', value: p });
        continue;
      }
      const f = top();
      if (p === ',') {
        if (f) { f.index++; if (f.kind === 'object') f.key = null; }
        push({ type: 'punct', value: p });
        chain = [];
        continue;
      }
      if (p === ':' && f && f.kind === 'object' && prev && (prev2?.value === '{' || prev2?.value === ',') && prev2?.type === 'punct') {
        // `key:` in an object literal. A string key is a key, not copy.
        if (prev.type === 'name' || prev.type === 'num') f.key = prev.value ?? null;
        else if (prev.type === 'string') { f.key = prev.unit?.text ?? null; if (prev.unit) prev.unit.isKey = true; }
        push({ type: 'punct', value: ':' });
        continue;
      }
      if (['===', '!==', '==', '!='].includes(p) && prev && prev.type === 'string' && prev.unit) prev.unit.compared = true;
      const tok = { type: 'punct', value: p };
      if ((p === '=' || p === '+=' || p === '||=' || p === '??=') && chain.length && prev?.type === 'name') tok.target = chain.join('.');
      // `const draw = (…) =>` : remember the name for the body.
      if (p === '=>') tok.target = arrowName;
      if (p === '=' && tok.target) arrowName = tok.target;
      if (p === ';') arrowName = null;
      push(tok);
      if (p !== '.' && p !== '?.') chain = [];
    }
  }
  let arrowName = null;

  try { code(false); } catch { /* a pathological file: keep what was found */ }
  return units;
}

// ---------------------------------------------------------------------------
// HTML.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);
// Attributes whose value is read by people (or by assistive tech, which is people).
const COPY_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'aria-roledescription', 'aria-placeholder', 'aria-valuetext', 'placeholder', 'label']);
const META_COPY = /^(description|og:title|og:description|og:site_name|twitter:title|twitter:description|application-name|apple-mobile-web-app-title)$/i;
const BLOCK = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'td', 'th', 'caption', 'figcaption', 'blockquote', 'button', 'a', 'label', 'summary', 'legend', 'option', 'title', 'div', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'figure', 'ul', 'ol', 'dl', 'form', 'details', 'table', 'tr', 'text', 'tspan', 'textPath', 'svg', 'g', 'span']);
const LANDMARK = new Set(['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form', 'dialog', 'figure', 'details']);

/**
 * Text nodes and copy attributes in HTML (or in a markup string inside JS).
 * Inline `<script>` bodies are scanned as JS. `mask` marks characters that belong
 * to `${…}` expressions in a template: text containing them keeps those spans as
 * locked parts.
 */
export function scanHtml(text, { base = 0, mask = null, jsx = false } = {}) {
  const units = [];
  const stack = []; // {tag, start, id, cls, hidden, landmark}
  let blockSeq = 0;
  let i = 0;
  const attrsOf = (tagSrc, tagStart) => {
    const out = [];
    const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let m;
    while ((m = re.exec(tagSrc))) {
      const name = m[1].toLowerCase();
      const value = m[2] ?? m[3] ?? m[4];
      if (value == null) { out.push({ name, value: null }); continue; }
      const q = m[2] != null ? '"' : m[3] != null ? "'" : null;
      const vStart = tagStart + m.index + m[0].length - value.length - (q ? 1 : 0);
      out.push({ name, value, start: vStart, end: vStart + value.length, quote: q });
    }
    return out;
  };
  const context = () => {
    const landmark = [...stack].reverse().find((s) => s.landmark);
    return {
      section: landmark ? (landmark.id ? `${landmark.tag}#${landmark.id}` : landmark.cls ? `${landmark.tag}.${landmark.cls}` : landmark.tag) : null,
      tag: stack.length ? stack[stack.length - 1].tag : null,
      hidden: stack.some((s) => s.hidden),
    };
  };
  const blockOf = () => {
    for (let k = stack.length - 1; k >= 0; k--) if (BLOCK.has(stack[k].tag) && stack[k].tag !== 'span' || k === 0) return stack[k].block;
    return 0;
  };
  const textUnit = (s, e) => {
    const run = text.slice(s, e);
    if (!run.trim()) return;
    const lead = run.length - run.trimStart().length, trail = run.length - run.trimEnd().length;
    const start = s + lead, end = e - trail;
    const raw = text.slice(start, end);
    const ctx = context();
    units.push(withParts({ kind: 'html-text', quote: null, start: start + base, end: end + base, raw, text: collapse(decodeHtml(raw)), ...ctx, block: blockOf() }, start, end));
  };
  // Inside a template, `${…}` in this text or attribute value is a locked part.
  const withParts = (u, start, end) => {
    if (!mask) return u;
    const parts = [];
    let k = start;
    while (k < end) {
      const isMask = mask(k + base);
      let m = k;
      while (m < end && mask(m + base) === isMask) m++;
      parts.push(isMask ? { start: k + base, end: m + base, expr: isMask } : { start: k + base, end: m + base });
      k = m;
    }
    if (parts.some((p) => p.expr)) {
      u.parts = parts;
      u.text = collapse(parts.map((p) => (p.expr ? `\${${p.expr}}` : decodeHtml(text.slice(p.start - base, p.end - base)))).join(''));
    }
    return u;
  };

  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt === -1) { textUnit(i, text.length); break; }
    if (lt > i) textUnit(i, lt);
    i = lt;
    if (text.startsWith('<!--', i)) { const e = text.indexOf('-->', i + 4); i = e === -1 ? text.length : e + 3; continue; }
    if (text[i + 1] === '!' || text[i + 1] === '?') { const e = text.indexOf('>', i); i = e === -1 ? text.length : e + 1; continue; }
    if (text[i + 1] === '/') {
      const e = text.indexOf('>', i);
      const tag = text.slice(i + 2, e === -1 ? text.length : e).trim().toLowerCase();
      for (let k = stack.length - 1; k >= 0; k--) if (stack[k].tag === tag) { stack.length = k; break; }
      i = e === -1 ? text.length : e + 1;
      continue;
    }
    const m = /^<([a-zA-Z][\w:-]*)/.exec(text.slice(i, i + 64));
    if (!m) { textUnit(i, i + 1); i++; continue; }
    // Find the end of the tag, skipping quoted attribute values.
    let j = i + m[0].length, q = null;
    while (j < text.length) {
      const c = text[j];
      if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') break;
      j++;
    }
    const tagName = m[1].toLowerCase();
    const tagSrc = text.slice(i + m[0].length, j);
    const attrs = attrsOf(tagSrc, i + m[0].length);
    const get = (n) => attrs.find((a) => a.name === n);
    const hidden = get('aria-hidden')?.value === 'true' || !!get('hidden');
    const selfClose = /\/\s*$/.test(tagSrc) || VOID.has(tagName);
    const entry = { tag: tagName, id: get('id')?.value || null, cls: (get('class')?.value || '').trim().split(/\s+/)[0] || null, hidden, landmark: LANDMARK.has(tagName), block: ++blockSeq, start: i + base };
    if (!selfClose) stack.push(entry);
    const ctx = context();
    for (const a of attrs) {
      if (a.value == null || !a.value.trim()) continue;
      let copyAttr = COPY_ATTRS.has(a.name) || (a.name === 'content' && tagName === 'meta' && META_COPY.test(get('name')?.value || get('property')?.value || ''))
        || (a.name === 'value' && tagName === 'input' && /^(button|submit|reset)$/i.test(get('type')?.value || ''));
      const dataCopy = a.name.startsWith('data-') && /[\p{L}]{2,}[^\p{L}]+[\p{L}]{2,}/u.test(a.value) && /\s/.test(a.value.trim());
      if (!copyAttr && !dataCopy) continue;
      units.push(withParts({
        kind: 'html-attr', quote: a.quote, start: a.start + base, end: a.end + base, raw: a.value, text: collapse(decodeHtml(a.value)),
        attr: a.name, tag: tagName, section: ctx.section, hidden: ctx.hidden, dataAttr: dataCopy && !copyAttr,
      }, a.start, a.end));
    }
    i = j + 1;
    if (!selfClose && RAW_TEXT.has(tagName)) {
      const close = text.toLowerCase().indexOf(`</${tagName}`, i);
      const end = close === -1 ? text.length : close;
      if (tagName === 'script') {
        const type = (get('type')?.value || '').toLowerCase();
        if (!type || /javascript|module|babel|jsx/.test(type)) units.push(...scanJs(text.slice(i, end), { base: base + i, jsx: jsx || /babel|jsx/.test(type) }).map((u) => ({ ...u, inScript: true })));
      } else if (tagName === 'title' || tagName === 'textarea') {
        textUnit(i, end);
      }
      i = end;
    }
  }
  return units;
}

// ---------------------------------------------------------------------------
// Markup inside JS strings (`li.innerHTML = \`<span>…</span>\``, an SVG diagram
// in a template): the text in it is copy too. Expressions stay locked.
function looksLikeMarkup(s) { return /<([a-zA-Z][\w-]*)(\s[^<>]*)?>/.test(s) && /<\/[a-zA-Z]|\/>/.test(s); }

function expandMarkup(u, fileText) {
  if (u.kind !== 'string' && u.kind !== 'template') return null;
  if (!looksLikeMarkup(u.raw)) return null;
  const exprAt = new Map();
  for (const p of u.parts || []) if (p.expr != null) for (let k = p.start; k < p.end; k++) exprAt.set(k, p.expr);
  // Scan the raw source slice; masked offsets mark `${…}`.
  const inner = scanHtml(fileText.slice(u.start, u.end), { base: u.start, mask: exprAt.size ? (k) => exprAt.get(k) : null })
    .filter((x) => x.kind === 'html-text' || x.kind === 'html-attr');
  // Text that is only an expression (`${n}`) is not copy.
  return inner.filter((x) => !x.parts || x.parts.some((p) => !p.expr && /\p{L}/u.test(fileText.slice(p.start, p.end))))
    .map((x) => ({ ...x, kind: x.kind === 'html-text' ? 'markup-text' : 'markup-attr', in: u, quote: u.quote, htmlQuote: x.quote, frames: u.frames, arg: u.arg, assign: u.assign }));
}

// ---------------------------------------------------------------------------
// Is it copy?

// Calls whose string arguments are code: selectors, events, tags, keys, modules.
const CODE_CALLS = new Set([
  'querySelector', 'querySelectorAll', '$', '$$', 'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'closest', 'matches',
  'addEventListener', 'removeEventListener', 'createElement', 'createElementNS', 'createEvent', 'getAttribute', 'hasAttribute',
  'removeAttribute', 'toggleAttribute', 'getAttributeNS', 'matchMedia', 'require', 'import', 'fetch', 'getItem', 'setItem', 'removeItem',
  'getContext', 'getPropertyValue', 'setProperty', 'removeProperty', 'insertAdjacentHTML', 'insertAdjacentElement', 'Symbol', 'RegExp',
  'URL', 'URLSearchParams', 'split', 'join', 'replace', 'replaceAll', 'padStart', 'padEnd', 'startsWith', 'endsWith', 'includes', 'indexOf',
  'lastIndexOf', 'test', 'match', 'search', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString', 'NumberFormat', 'DateTimeFormat',
  'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'dispatchEvent', 'postMessage', 'log', 'warn', 'error', 'info', 'debug', 'assert',
  'trace', 'Error', 'TypeError', 'RangeError', 'contains', 'add', 'remove', 'toggle', 'animate', 'scrollIntoView', 'define', 'get', 'has',
  'delete', 'emit', 'on', 'off', 'once', 'requestAnimationFrame', 'setTimeout', 'Worker', 'importScripts', 'createLinearGradient',
  'createRadialGradient', 'addColorStop', 'setLineDash', 'getComputedStyle', 'from', 'to', 'fromTo', 'set', 'registerPlugin', 'useState',
  'useRef', 'clsx', 'cn', 'classNames', 'cva', 'styled', 'css', 'keyframes', 'attr', 'style', 'data', 'prop', 'is', 'isNaN', 'parseInt',
  'parseFloat', 'Number', 'Boolean', 'BigInt', 'Date', 'Intl', 'json', 'Blob', 'File', 'Audio', 'Image', 'decodeURIComponent', 'encodeURIComponent',
  'atob', 'btoa', 'track', 'gtag', 'plausible', 'sendBeacon', 'serialize', 'describe', 'it', 'test', 'expect', 'localeCompare',
]);
// Calls whose string arguments are copy (and which argument).
const COPY_CALLS = { fillText: 0, strokeText: 0, alert: 0, confirm: 0, prompt: 0, createTextNode: 0, t: 0, __: 0, i18n: 0, say: 0, speak: 0, announce: 0, toast: 0, notify: 0, Notification: 0 };
// Properties and keys whose value is read by people.
const COPY_PROPS = /^(textContent|innerText|innerHTML|outerHTML|title|alt|placeholder|label|ariaLabel|ariaDescription|ariaValueText|ariaRoleDescription|text|texts|line|lines|caption|captions|heading|headline|subheading|subtitle|title|description|desc|body|copy|message|messages|msg|lede|blurb|summary|quote|cta|button|tooltip|hint|note|notes|footnote|tagline|kicker|eyebrow|question|answer|content|name|value|say|says|speech|dialogue|dialog|reply|replies|greeting|intro|outro|empty|error|success|tail|tails|fact|facts|label[s]?|prompt|status|bio|role|roles|job|jobs|short|audience|src|source|kind|type|drink|flavour|flavor)$/i;
// Properties whose value is code.
const CODE_PROPS = /^(className|class|id|type|rel|href|src|srcset|font|fillStyle|strokeStyle|textAlign|textBaseline|direction|lineCap|lineJoin|globalCompositeOperation|filter|cursor|display|position|transform|transition|animation|easing|ease|mode|method|credentials|cache|mime|mimeType|accept|key|code|event|events|selector|sel|el|tag|tagName|name|ns|namespace|dataset|color|colour|background|fill|stroke|d|path|url|uri|endpoint|route|lang|locale|charset|crossOrigin|referrerPolicy|loading|decoding|behavior|block|inline|ref|for|htmlFor|role|slot|part|is|target|format|encoding|units|unit|align|justify|overflow|visibility|whiteSpace|wordBreak)$/i;

// Assertion and test helpers: their messages are for developers.
for (const n of ['ok', 'equal', 'notEqual', 'deepEqual', 'strictEqual', 'notStrictEqual', 'deepStrictEqual', 'throws', 'rejects', 'doesNotThrow', 'fail', 'skip', 'todo', 'beforeEach', 'afterEach', 'waitForSelector', 'locator', 'getByRole', 'getByText', 'press', 'goto', 'evaluate', 'launch', 'execFileSync', 'execSync', 'execFile', 'exec', 'spawn', 'spawnSync', 'readFileSync', 'writeFileSync', 'readFile', 'writeFile', 'existsSync', 'mkdirSync', 'join', 'resolve', 'relative', 'basename', 'dirname', 'extname', 'stringify', 'parse', 'screenshot', 'waitForFunction', 'click', 'fill', 'type', 'selectOption']) CODE_CALLS.add(n);

const TAGS = new Set('a abbr address area article aside audio b blockquote body br button canvas caption cite code col dd del details dfn dialog div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd label legend li main mark menu meta nav ol optgroup option output p picture pre progress q s samp section select small source span strong sub summary sup svg table tbody td textarea tfoot th thead time tr u ul var video g path rect circle line text tspan'.split(' '));
// Attribute names whose value people read.
const COPY_ATTR_NAME = /^(aria-label|aria-description|aria-roledescription|aria-valuetext|aria-placeholder|title|alt|placeholder|label|data-[\w-]*(?:line|lines|text|copy|label|title|caption|msg|message|quote|say|hint|tip|tooltip))$/i;

const CODE_SHAPES = [
  [/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|wss?:|\/\/)/i, 'a URL'],
  [/^(?:\.{0,2}\/)[\w./@-]*$/, 'a path'],
  [/^[\w./@-]+\.(?:m?js|cjs|ts|tsx|jsx|css|scss|json|html?|png|jpe?g|webp|avif|gif|svg|mp[34]|webm|wav|ogg|woff2?|ttf|otf|ico|pdf|glb|gltf|hdr|wasm)(?:[?#].*)?$/i, 'a file name'],
  [/^&(?:#\d+|#x[0-9a-f]+|[a-z]+);$/i, 'an HTML entity'],
  // Each token starts with its own character (a bare tag name only after a separator), so a long string can't backtrack exponentially.
  [/^(?:[#.][A-Za-z_-][\w-]*|\[[A-Za-z_][\w-]*(?:[~|^$*]?=[^\]]*)?\])(?:[\s>+~,]+[a-z][\w-]*|[\s>+~,]*(?:[#.][\w-]+|\[[^\]]+\]|::?[\w-]+(?:\([^)]*\))?))*$/, 'a CSS selector'],
  [/(?:^|\s)-?\d*\.?\d+(?:px|rem|em|vh|vw|vmin|vmax|ms|deg|turn|fr|ch|dvh|svh|lvh)\b/, 'a CSS value'],
  [/^(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix|var|calc|clamp|min|max|url|linear-gradient|radial-gradient|conic-gradient|cubic-bezier|steps|translate[3dXYZ]*|rotate[3dXYZ]*|scale[3dXYZ]*|matrix(?:3d)?|blur|drop-shadow|inset)\(/i, 'a CSS value'],
  [/\b(?:sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-monospace|cursive|-apple-system)\b/, 'a font stack'],
  [/^#[0-9a-f]{3,8}$/i, 'a colour'],
  [/^[a-z]+(?:[A-Z][a-z0-9]*)+$/, 'a camelCase name'],
  [/^[a-z0-9]+(?:[-_:][a-z0-9]+)+$/, 'a kebab/snake name'],
  [/^[A-Z0-9]+(?:_[A-Z0-9]+)+$/, 'a constant name'],
  [/^use (?:strict|client|server)$/, 'a directive'],
  [/^(?:[\w-]+\s*:\s*[^;\s][^;]*;\s*)+(?:[\w-]+\s*:[^;]*)?$/, 'inline CSS'],
  [/^[\w$]+(?:\.[\w$]+)+$/, 'a dotted name'],
  [/^\s*[{[][\s\S]*[}\]]\s*$/, 'JSON or code'],
  [/^(?=.*\d)[MmLlHhVvCcSsQqTtAaZz][\d\s.,+eE-]*(?:[MmLlHhVvCcSsQqTtAaZz][\d\s.,+eE-]*)*$/, 'SVG path data'],
  [/^\d[\d\s.,:x/-]*$/, 'a number'],
  [/^-{1,2}[a-z][\w-]*(?:=.*)?$/, 'a command-line flag'],
];

const COPY_HINT = /[’‘“”…—–·★✓]/;

/** A comma list of selectors made of tag names (`main h2, main p`). */
function selectorList(t) {
  const parts = t.split(',').map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return false;
  return parts.every((x) => x.split(/\s*[\s>+~]\s*/).every((piece) => {
    const m = /^([a-z][a-z0-9-]*|\*)?((?:[.#][\w-]+|\[[^\]]+\]|::?[\w-]+(?:\([^)]*\))?)*)$/i.exec(piece);
    return m && (m[2] || TAGS.has((m[1] || '').toLowerCase()) || m[1] === '*');
  })) && (parts.length > 1 || /[\s>.#[:]/.test(t));
}

/** Code-ish punctuation: two or more of ; { } ( ) = in a row of text. */
const codeish = (t) => (t.match(/[;{}()=]|=>|&&|\|\|/g) || []).length >= 2;

/**
 * Decide whether a unit is copy. Sets `copy` ('yes' | 'maybe' | 'no') and `why`.
 */
export function classify(u) {
  const set = (copy, why) => { u.copy = copy; u.why = why; return u; };
  // Expressions count as a word each (`I’m a ${job}.` is a sentence).
  const t = collapse(u.text.replace(/\$\{[^}]*\}/g, ' '));
  const words = collapse(u.text.replace(/\$\{[^}]*\}/g, ' x ')).split(' ').filter(Boolean);
  if (!/\p{L}/u.test(t)) return set('no', 'no words');
  if (u.isKey) return set('no', 'an object key');
  if (u.compared) return set('no', 'compared against');
  if (u.module) return set('no', 'a module name');
  if (u.computedKey) return set('no', 'an index or key');
  if (u.kind === 'html-text' || u.kind === 'markup-text') {
    if (u.hidden) return set('maybe', 'hidden from screen readers (decorative?)');
    return set('yes', u.kind === 'html-text' ? 'page text' : 'text in markup');
  }
  if (u.kind === 'html-attr' || u.kind === 'markup-attr') return set('yes', u.dataAttr ? `copy in ${u.attr}` : `${u.attr} text`);
  if (u.kind === 'jsx-text') return set('yes', 'JSX text');
  if (u.kind === 'jsx-attr') {
    if (COPY_ATTR_NAME.test(u.attr) || /^(children|heading|description|caption|tooltip|text|subtitle|message|cta)$/i.test(u.attr)) return set('yes', `${u.attr} text`);
    if (CODE_PROPS.test(u.attr) || /^on[A-Z]|^data-|^aria-|^xmlns|^(viewBox|d|fill|stroke|width|height|x|y|cx|cy|r)$/.test(u.attr)) return set('no', `${u.attr} attribute`);
  }

  const f = u.frames?.[u.frames.length - 1];
  const callee = f?.kind === 'call' ? f.label : null;
  const keyNow = f?.kind === 'object' ? f.key : null;
  const assign = u.assign ? u.assign.split('.').pop() : null;

  // Where it sits says the most.
  if (callee && callee in COPY_CALLS && u.arg === COPY_CALLS[callee]) return set('yes', `drawn or shown by ${callee}()`);
  if (callee === 'setAttribute' || callee === 'setAttributeNS') {
    if (u.arg === 0) return set('no', 'an attribute name');
    const name = f.firstArg;
    if (name && COPY_ATTR_NAME.test(name)) return set('yes', `the ${name} attribute`);
    if (name) return set('no', `the ${name} attribute`);
  }
  if (callee && CODE_CALLS.has(callee)) {
    // `Set#add('A whole sentence.')` is rare but real; anything else passed to these is code.
    if (['add', 'set', 'get', 'toggle', 'remove', 'has', 'delete'].includes(callee) && words.length >= 3 && /[.!?…]$/.test(t)) return set('maybe', `an argument to ${callee}()`);
    return set('no', `an argument to ${callee}()`);
  }
  // Shape before name: `label = 'round2-hero-ab'` is still an id.
  for (const [re, why] of CODE_SHAPES) if (re.test(t)) return set('no', `looks like ${why}`);
  if (selectorList(t)) return set('no', 'looks like a CSS selector');
  if (codeish(t)) return set('no', 'looks like code');
  if (assign && COPY_PROPS.test(assign) && !CODE_PROPS.test(assign)) return set('yes', `assigned to .${assign}`);
  if (assign && CODE_PROPS.test(assign)) return set('no', `assigned to .${assign}`);
  if (keyNow && CODE_PROPS.test(keyNow) && !COPY_PROPS.test(keyNow)) return set('no', `the value of ${keyNow}:`);

  const named = !!(keyNow && COPY_PROPS.test(keyNow));
  const data = inData(u);
  const ends = /[.!?…:]["”’)]?$/.test(t);
  const capital = /^["“‘(]?[\p{Lu}]/u.test(t);
  if (words.length >= 2 && /\p{L}{2,}/u.test(t)) {
    if (ends || capital || COPY_HINT.test(t) || named || words.length >= 4) return set('yes', named ? `the value of ${keyNow}:` : 'reads as a sentence');
    return set(data || words.length >= 3 ? 'yes' : 'maybe', 'several words');
  }
  // One word from here on.
  if (t.length === 1) return set('no', 'a single letter');
  if (ends || COPY_HINT.test(t)) return set('yes', 'a word with punctuation');
  if (/^[\p{Lu}][\p{Ll}\p{M}’'-]+$/u.test(t)) return set(named || data ? 'yes' : 'maybe', 'a capitalised word');
  if (/^[\p{Lu}\d&/·.'’-]+$/u.test(t)) return set(named || data ? 'maybe' : 'maybe', 'a short label in capitals');
  // A lowercase single word is usually a key, a mode or a name in code. In a
  // list of them (['profile', 'wiki', …]) it may be display text.
  if (named) return set('maybe', `the value of ${keyNow}:`);
  if (f?.kind === 'array' && f.label) return set('maybe', `a lowercase word in ${f.label}`);
  return set('no', 'a lowercase word (a key or mode?)');
}

// Inside a named data structure (`const JOBS = [...]`, `E = [{…}]`), not code.
function inData(u) {
  const fr = u.frames || [];
  for (let k = fr.length - 1; k >= 0; k--) {
    if (fr[k].kind === 'call' || fr[k].kind === 'block' || fr[k].kind === 'paren') return false;
    if (fr[k].labelKind === 'decl' && (fr[k].kind === 'array' || fr[k].kind === 'object')) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Owner and path: `recordData[1][1]`, `E[2].job`, `draw() › fillText()`.
function describe(u) {
  const fr = u.frames || [];
  let ownerAt = -1;
  for (let k = fr.length - 1; k >= 0; k--) if (fr[k].labelKind === 'decl') { ownerAt = k; break; }
  if (ownerAt === -1) for (let k = fr.length - 1; k >= 0; k--) if (fr[k].labelKind === 'fn') { ownerAt = k; break; }
  const own = fr[ownerAt];
  const owner = !own ? null : own.labelKind === 'fn' ? `${own.label}()` : own.label;
  let path = owner || '';
  for (let k = ownerAt === -1 ? 0 : own.labelKind === 'fn' ? ownerAt + 1 : ownerAt; k < fr.length; k++) {
    const f = fr[k];
    if (f.kind === 'array') path += `[${f.index}]`;
    else if (f.kind === 'object') { if (f.key != null) path += /^[A-Za-z_$][\w$]*$/.test(String(f.key)) ? `.${f.key}` : `[${JSON.stringify(f.key)}]`; }
    else if (f.kind === 'call') path += `${path ? ' › ' : ''}${f.label || '…'}()`;
  }
  if (u.assign && !path.endsWith(u.assign)) path += `${path ? ' › ' : ''}${u.assign} =`;
  return { owner, ownerAt: own ? own.at : null, path: path || null };
}

// setAttribute('aria-label', 'Copy'): record the first argument on the call frame.
function annotateCalls(units) {
  for (let k = 0; k < units.length; k++) {
    const u = units[k];
    const f = u.frames?.[u.frames.length - 1];
    if (f?.kind === 'call' && f.label === 'setAttribute' && u.arg === 0) {
      const next = units[k + 1];
      if (next && next.frames?.length === u.frames.length && next.arg === 1) next.frames[next.frames.length - 1] = { ...next.frames[next.frames.length - 1], firstArg: u.text };
    }
  }
}

// ---------------------------------------------------------------------------

/** Units for one file's text, classified and described. */
export function scanFile(rel, text) {
  const ext = extname(rel).toLowerCase();
  let raw;
  if (HTML_EXT.has(ext)) raw = scanHtml(text, {});
  else if (JS_EXT.has(ext)) raw = scanJs(text, { jsx: JSX_EXT.has(ext) || (/<\/[A-Za-z]|\/>/.test(text) && /\breturn\s*\(\s*</.test(text)) });
  else return [];
  const at = lineIndex(text);
  annotateCalls(raw);
  // Markup inside a string is listed piece by piece, in place of the string.
  const all = [];
  for (const u of raw) {
    const inner = expandMarkup(u, text);
    classify(u);
    if (inner) { u.copy = 'no'; u.why = 'markup (its text is listed piece by piece)'; }
    all.push(u);
    for (const x of inner || []) { classify(x); x.within = u; all.push(x); }
  }
  all.sort((a, b) => a.start - b.start || b.end - a.end);
  const idOf = new Map(all.map((x) => [x, `${rel}:${x.start}`]));
  const out = all.map((x) => {
    const { owner, ownerAt, path } = describe(x);
    const { line, col } = at(x.start);
    const f = x.frames?.[x.frames.length - 1];
    return {
      id: idOf.get(x),
      file: rel, start: x.start, end: x.end, line, col,
      kind: x.kind, quote: x.quote ?? null, ...(x.htmlQuote !== undefined ? { htmlQuote: x.htmlQuote } : {}), raw: x.raw, text: x.text,
      ...(x.parts ? { parts: x.parts } : {}),
      copy: x.copy, why: x.why,
      owner: owner ?? x.section ?? null, ...(ownerAt != null ? { ownerAt } : {}), path,
      ...(x.attr ? { attr: x.attr } : {}), ...(x.tag ? { tag: x.tag } : {}),
      ...(x.section ? { section: x.section } : {}), ...(x.hidden ? { hidden: true } : {}),
      ...(x.block != null && !x.frames ? { block: `${rel}#${x.block}` } : {}),
      ...(f?.kind === 'call' && x.arg != null ? { call: f.label, arg: x.arg } : {}),
      ...(x.within && idOf.has(x.within) ? { within: idOf.get(x.within) } : {}),
      ...(x.inScript ? { inScript: true } : {}),
    };
  });
  // A short label next to sentences in the same data (recordData's 'PROFILE'
  // beside 'Beloved beekeeper.') is copy like its neighbours.
  const byOwner = new Map();
  for (const u of out) {
    if (!u.owner || u.copy === 'no') continue;
    const key = `${u.owner}@${u.ownerAt ?? ''}`;
    (byOwner.get(key) || byOwner.set(key, []).get(key)).push(u);
  }
  for (const [, list] of byOwner) {
    const owner = list[0].owner;
    const yes = list.filter((u) => u.copy === 'yes').length;
    if (yes < 2 || yes < list.length / 3) continue;
    for (const u of list) if (u.copy === 'maybe' && /^(a capitalised word|a short label in capitals|several words)$/.test(u.why)) { u.copy = 'yes'; u.why = `alongside copy in ${owner}`; }
  }
  return out;
}

/** Opens without following a link (O_NOFOLLOW), then checks and reads that same file, so nothing can be swapped in between. */
function readPlainFile(abs) {
  let fd;
  try { fd = openSync(abs, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0)); } catch { return null; }
  try {
    const st = fstatSync(fd);
    if (!st.isFile() || st.size > MAX_BYTES) return null;
    return readFileSync(fd);
  } finally { closeSync(fd); }
}
function loadText(abs) {
  const buf = readPlainFile(abs);
  if (buf == null) return null;
  if (buf.includes(0)) return null;
  const text = buf.toString('utf8');
  const lines = text.split('\n').length;
  if (text.length > 4000 && text.length / lines > 400) return null; // minified
  return text;
}

/**
 * Every unit of copy under `root`.
 * @returns {{root: string, files: string[], units: object[]}}
 */
export function extractCopy(root, { files } = {}) {
  let rootReal;
  try { rootReal = realpathSync(root); } catch { throw new Error(`--src ${root} does not exist`); }
  if (!statSync(rootReal).isDirectory()) throw new Error(`--src ${root} is not a directory`);
  const list = (files || sourceFiles(rootReal)).filter((f) => JS_EXT.has(extname(f).toLowerCase()) || HTML_EXT.has(extname(f).toLowerCase()))
    .filter((f) => !/(^|\/)(vendor|vendors|third[-_]party|lib\/vendor|test|tests|__tests__|spec|e2e|fixtures?)\//i.test(f) && !/\.(test|spec|stories|config|d)\.[cm]?[jt]sx?$/i.test(f));
  const units = [];
  const scanned = [];
  for (const rel of list) {
    const text = loadText(join(rootReal, rel));
    if (text == null) continue;
    scanned.push(rel);
    units.push(...scanFile(rel, text));
  }
  return { root: rootReal, files: scanned, units };
}

/** Units grouped for reading: file → owner → units, copy first. */
export function groupUnits(units, { include = ['yes', 'maybe'] } = {}) {
  const files = new Map();
  for (const u of units) {
    if (!include.includes(u.copy)) continue;
    if (!files.has(u.file)) files.set(u.file, new Map());
    const owners = files.get(u.file);
    const key = `${u.owner || '(top level)'}@${u.ownerAt ?? ''}`;
    if (!owners.has(key)) owners.set(key, []);
    owners.get(key).push(u);
  }
  return [...files].map(([file, owners]) => ({ file, groups: [...owners].map(([, items]) => ({ owner: items[0].owner || '(top level)', line: items[0].line, items })) }));
}

/** Plain-text outline for the CLI. */
export function renderCopyMap({ root, files, units }, { all = false } = {}) {
  const include = all ? ['yes', 'maybe', 'no'] : ['yes', 'maybe'];
  const counts = { yes: 0, maybe: 0, no: 0 };
  for (const u of units) counts[u.copy]++;
  const out = [`Copy under ${root}: ${counts.yes} pieces of copy, ${counts.maybe} maybe, ${counts.no} code strings ${all ? 'shown' : 'hidden'} · ${files.length} file${files.length === 1 ? '' : 's'}`];
  for (const { file, groups } of groupUnits(units, { include })) {
    out.push('', `${file}`);
    for (const g of groups) {
      out.push(`  ${g.owner}  (line ${g.line})`);
      for (const u of g.items) {
        const where = u.path && u.path !== g.owner ? u.path.startsWith(g.owner) ? u.path.slice(g.owner.length) : ` ${u.path}` : u.attr ? ` [${u.attr}]` : '';
        const mark = u.copy === 'yes' ? ' ' : u.copy === 'maybe' ? '?' : '×';
        const text = u.text.length > 100 ? `${u.text.slice(0, 97)}…` : u.text;
        out.push(`   ${mark} ${String(u.line).padStart(4)}  ${where ? `${where.trim()}  ` : ''}${JSON.stringify(text)}${u.copy !== 'yes' ? `   (${u.why})` : ''}`);
      }
    }
  }
  return out.join('\n');
}
