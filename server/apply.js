// `feedback <name> apply`: write the reviewer's text edits (FROM → TO) into the
// source, but only where that is unambiguous.
//
// The toolbar sends `edit.from` / `edit.to` as the element's rendered text with
// whitespace collapsed (toolbar/edit-mode.js `textOf`). So the source can differ
// from it in whitespace (line wraps, indentation, CRLF) and still be the same
// copy; anything else (markup inside the text, HTML entities, a JSX expression)
// is reported, never guessed at.
//
// Rules, in order of how much they matter:
//   - Exactly one occurrence across every searched file, or nothing is written.
//   - Only text source files under `root`: no dependencies, build output,
//     lockfiles, binaries or minified files (IGNORE_GLOBS from agent.js).
//   - Literal matching: every character of the reviewer's text is escaped.
//   - A file is written whole, through a temp file and a rename, or not at all.
//   - The default is a dry run. `yes` writes, then resolves each applied note.
import { execFileSync } from 'node:child_process';
import {
  readFileSync, writeFileSync, renameSync, statSync, lstatSync, readdirSync, realpathSync, chmodSync, rmSync,
} from 'node:fs';
import { join, relative, resolve, sep, basename, dirname, extname } from 'node:path';
import { IGNORE_GLOBS, isOpen } from './agent.js';
import { narrowCandidates } from './narrow-edit.js';
import { planUnitEdit, applySplices, relocate, freshPlan } from './copy-edit.js';

const MAX_BYTES = 1024 * 1024;
const LOCKFILES = new Set(['pnpm-lock.yaml', 'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'bun.lock', 'bun.lockb',
  'Cargo.lock', 'Gemfile.lock', 'poetry.lock', 'composer.lock', 'go.sum', 'Pipfile.lock', 'uv.lock']);
const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tiff', '.pdf', '.zip', '.gz', '.tgz',
  '.br', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp3', '.mp4', '.mov', '.webm', '.wav', '.ogg', '.sqlite', '.db', '.wasm',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.psd', '.sketch', '.fig', '.pen', '.lockb']);
// Script files, where copy sits in string literals or in JSX (which plain .js/.ts
// files carry too, in React projects).
const SCRIPT_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.vue', '.svelte', '.astro']);
// Files where `<`, `>`, `{` or `}` in new text would be read as markup or JSX.
const MARKUP_EXT = new Set([...SCRIPT_EXT, '.html', '.htm', '.hbs', '.handlebars', '.mdx', '.xml',
  '.svg', '.ejs', '.njk', '.liquid', '.erb', '.php']);
const QUOTES = ['\'', '"', '`'];
// Characters that end a run of copy when scanning out from a match. An apostrophe
// between letters (it's, Bob's) is part of the copy, not a delimiter.
const STOP = /[<>{}()=;'"`]/;

/** Is the match plain markup text (`>…<`, `}…{`), so a quote in it can't end a string? */
function inMarkupText(content, start, end) {
  const isStop = (i) => {
    const c = content[i];
    if (c === "'" && /\p{L}/u.test(content[i - 1] || '') && /\p{L}/u.test(content[i + 1] || '')) return false;
    return STOP.test(c);
  };
  let i = start - 1;
  while (i >= 0 && !isStop(i)) i--;
  let j = end;
  while (j < content.length && !isStop(j)) j++;
  return (content[i] === '>' || content[i] === '}') && (content[j] === '<' || content[j] === '{');
}
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.next', '.svelte-kit', '.astro', '.agentation-kit', '.git']);

const collapse = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const tokens = (s) => collapse(s).split(' ').filter(Boolean);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const WORD = /^[\p{L}\p{N}_]/u;
const WORD_END = /[\p{L}\p{N}_]$/u;
const W = '[\\p{L}\\p{N}_]';

/** A word at either end of the text must not continue into the source ("Save" ≠ "onSave"). */
const guards = (text) => [WORD.test(text) ? `(?<!${W})` : '', WORD_END.test(text) ? `(?!${W})` : ''];

/** The text, literally, with any run of whitespace (spaces, newlines, CRLF, tabs) between words. One group per word. */
export function exactPattern(text) {
  const t = collapse(text);
  const [pre, post] = guards(t);
  return new RegExp(pre + tokens(t).map((w) => `(${esc(w)})`).join('\\s+') + post, 'gud');
}

// Diagnosis only: these say why a FROM was not found; they never drive a write.
const GAP = '(?:<[^<>]*>|\\{[^{}]*\\})*';
function markupPattern(text) {
  const chars = Array.from(collapse(text));
  const [pre, post] = guards(collapse(text));
  return new RegExp(pre + chars.map((c, i) => (c === ' ' ? `(?:\\s|<[^<>]*>|\\{[^{}]*\\})+` : esc(c) + (i < chars.length - 1 ? GAP : ''))).join('') + post, 'gu');
}
const ENTITY = {
  '&': '(?:&amp;|&#0*38;|&#x0*26;|&)', '<': '(?:&lt;|&#0*60;|<)', '>': '(?:&gt;|&#0*62;|>)',
  '"': '(?:&quot;|&#0*34;|&ldquo;|&rdquo;|")', "'": "(?:&#0*39;|&apos;|&#x0*27;|&rsquo;|&lsquo;|')",
  '’': "(?:&rsquo;|&#0*8217;|’|')", '‘': "(?:&lsquo;|&#0*8216;|‘|')",
  '“': '(?:&ldquo;|&#0*8220;|“|")', '”': '(?:&rdquo;|&#0*8221;|”|")',
  '—': '(?:&mdash;|&#0*8212;|—)', '–': '(?:&ndash;|&#0*8211;|–)', '…': '(?:&hellip;|&#0*8230;|…|\\.\\.\\.)',
  '©': '(?:&copy;|&#0*169;|©)', '®': '(?:&reg;|&#0*174;|®)', '™': '(?:&trade;|&#0*8482;|™)',
};
function entityPattern(text) {
  const [pre, post] = guards(collapse(text));
  return new RegExp(pre + Array.from(collapse(text)).map((c) => (c === ' ' ? '(?:\\s|&nbsp;|&#0*160;)+' : ENTITY[c] || esc(c))).join('') + post, 'gu');
}

/** Text source files under root, gitignore-aware when ripgrep is there. Paths relative to root. */
export function sourceFiles(root) {
  let list;
  try {
    list = execFileSync('rg', ['--files', ...IGNORE_GLOBS.flatMap((g) => ['-g', `!${g}`]), root],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 })
      .split('\n').filter(Boolean).map((f) => relative(root, resolve(root, f)));
  } catch (e) {
    if (e.status === 1) return []; // rg ran: no files at all
    list = walk(root, root);
  }
  return list.filter((rel) => {
    const name = basename(rel);
    if (LOCKFILES.has(name) || BINARY_EXT.has(extname(name).toLowerCase())) return false;
    if (/\.min\.[a-z]+$/i.test(name) || name.endsWith('.map')) return false;
    return !rel.split(sep).some((part) => SKIP_DIRS.has(part));
  }).sort();
}

function walk(root, dir, out = []) {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isSymbolicLink()) continue; // never follow a link out of the tree
    if (d.isDirectory()) { if (!SKIP_DIRS.has(d.name) && !d.name.startsWith('.')) walk(root, join(dir, d.name), out); }
    else if (d.isFile()) out.push(relative(root, join(dir, d.name)));
  }
  return out;
}

/** Reads a candidate once; null for anything that isn't plain text we should touch. */
function loadText(abs) {
  let st;
  try { st = lstatSync(abs); } catch { return null; }
  if (!st.isFile() || st.size > MAX_BYTES) return null;
  const buf = readFileSync(abs);
  if (buf.includes(0)) return null; // binary
  const text = buf.toString('utf8');
  if (text.includes('\uFFFD') && !buf.includes(Buffer.from('\uFFFD'))) return null; // not UTF-8; a rewrite would corrupt it
  // Minified: long and almost no line breaks.
  const lines = text.split('\n').length;
  if (text.length > 4000 && text.length / lines > 400) return null;
  return text;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

function* matchesIn(re, text) {
  re.lastIndex = 0;
  for (let m; (m = re.exec(text));) {
    yield m;
    if (m[0].length === 0) re.lastIndex++;
  }
}

/**
 * The smallest change: words that FROM and TO share at either end stay as they
 * are in the source (with its own line breaks); only the middle is rewritten.
 * Returns {start, end, text}, a splice on the matched content.
 */
export function minimalSplice(m, F, T) {
  const tok = (i) => m.indices[i + 1];
  let k = 0;
  while (k < F.length && k < T.length && F[k] === T[k]) k++;
  let s = 0;
  while (s < F.length - k && s < T.length - k && F[F.length - 1 - s] === T[T.length - 1 - s]) s++;
  const fa = k, fb = F.length - s; // FROM words [fa, fb) change
  const mid = T.slice(k, T.length - s).join(' ');
  if (fa < fb) {
    let start = tok(fa)[0], end = tok(fb - 1)[1];
    if (!mid) { // a pure deletion takes the whitespace on one side with it
      if (fa > 0) start = tok(fa - 1)[1];
      else if (fb < F.length) end = tok(fb)[0];
    }
    return { start, end, text: mid };
  }
  if (fa > 0) { const at = tok(fa - 1)[1]; return { start: at, end: at, text: ' ' + mid }; }
  const at = tok(0)[0];
  return { start: at, end: at, text: mid + ' ' };
}

/** A unified diff of one splice, with `ctx` lines of context. Line endings shown without \r. */
export function unifiedDiff(rel, before, after, start, oldEnd, newEnd, ctx = 2) {
  const lineStart = before.lastIndexOf('\n', start - 1) + 1;
  const endOf = (text, at) => { const i = text.indexOf('\n', at); return i === -1 ? text.length : i; };
  const strip = (l) => l.replace(/\r$/, '');
  const oldLines = before.slice(lineStart, endOf(before, oldEnd)).split('\n').map(strip);
  const newLines = after.slice(lineStart, endOf(after, newEnd)).split('\n').map(strip);
  const all = before.split('\n').map(strip);
  const first = lineOf(before, lineStart) - 1; // 0-based
  const pre = all.slice(Math.max(0, first - ctx), first);
  const post = all.slice(first + oldLines.length, first + oldLines.length + ctx);
  const from = first - pre.length + 1;
  return [
    `--- a/${rel}`, `+++ b/${rel}`,
    `@@ -${from},${pre.length + oldLines.length + post.length} +${from},${pre.length + newLines.length + post.length} @@`,
    ...pre.map((l) => ` ${l}`), ...oldLines.map((l) => `-${l}`), ...newLines.map((l) => `+${l}`), ...post.map((l) => ` ${l}`),
  ].join('\n');
}

/**
 * Plan (and with `yes`, perform) every open text edit.
 * @param {object} p  openProject(...)
 * @param {object} o
 * @param {string[]} [o.ids]  only these notes (default: every open text edit)
 * @param {boolean} [o.yes]   write the files and resolve the notes
 * @returns {Promise<{root, results: Array<{id, status: 'apply'|'applied'|'already'|'skipped'|'failed', reason?, file?, line?, diff?, from?, to?}>}>}
 *   status `apply` is a dry-run plan; `applied` was written and resolved.
 */
export async function applyEdits(p, { ids = [], yes = false } = {}) {
  const root = p.root;
  let rootReal;
  try { rootReal = realpathSync(root); } catch { throw new Error(`--src ${root} does not exist`); }
  if (!statSync(rootReal).isDirectory()) throw new Error(`--src ${root} is not a directory`);

  const notes = ids.length
    ? ids.map((id) => p.get(id) || { id, missing: true })
    : p.items().filter((a) => (a.kind === 'edit' && a.edit) || isCopy(a));

  const files = sourceFiles(root);
  const cache = new Map(); // rel → {abs, original, content} (content changes as notes apply)
  const textOf = (rel) => {
    if (!cache.has(rel)) {
      const abs = join(root, rel);
      const t = loadText(abs);
      cache.set(rel, t == null ? null : { abs, original: t, content: t });
    }
    return cache.get(rel);
  };
  // Longest literal word first: a cheap includes() rules out most files before any regex runs.
  const findAll = (re, needle) => {
    const out = [];
    for (const rel of files) {
      const f = textOf(rel);
      if (!f || (needle && !f.content.includes(needle))) continue;
      for (const m of matchesIn(re, f.content)) out.push({ rel, m, line: lineOf(f.content, m.index) });
    }
    return out;
  };
  const longest = (text) => tokens(text).reduce((a, b) => (b.length > a.length ? b : a), '');
  const longestRun = (text) => (collapse(text).match(/[\p{L}\p{N}]+/gu) || []).reduce((a, b) => (b.length > a.length ? b : a), '');
  const where = (hits) => hits.slice(0, 3).map((h) => `${h.rel}:${h.line}`).join(', ') + (hits.length > 3 ? ', …' : '');

  // Copy edits (copy edit mode) carry the exact span they change: planned first,
  // all against the file as it was read, so two edits in one file can't shift
  // each other. Find-and-replace edits then run on the result.
  const copyResults = planCopyEdits(notes.filter((a) => !a.missing && isCopy(a) && isOpen(a)), { files, textOf });

  const results = [];
  for (const a of notes) {
    if (copyResults.has(a.id)) { results.push(copyResults.get(a.id)); continue; }
    const r = { id: a.id };
    results.push(r);
    if (a.missing) { Object.assign(r, { status: 'skipped', reason: `no note ${a.id} on "${p.name}"` }); continue; }
    if (isCopy(a) && !isOpen(a)) { Object.assign(r, { status: 'skipped', reason: `already ${a.status}` }); continue; }
    if (a.kind !== 'edit' || !a.edit) { Object.assign(r, { status: 'skipped', reason: `not a text edit (${a.kind || 'feedback'})` }); continue; }
    if (!isOpen(a)) { Object.assign(r, { status: 'skipped', reason: `already ${a.status}` }); continue; }
    let from = collapse(a.edit.from), to = collapse(a.edit.to);
    Object.assign(r, { from, to });
    if (!from) { Object.assign(r, { status: 'skipped', reason: 'FROM is empty: nothing to find' }); continue; }
    if (from === to) { Object.assign(r, { status: 'skipped', reason: 'FROM and TO are the same text' }); continue; }

    const locate = (f, t) => {
      const hits = findAll(exactPattern(f), longest(f));
      // Already applied: TO is there and FROM isn't, or FROM only shows up inside TO.
      const toHits = t ? findAll(exactPattern(t), longest(t)) : [];
      const inside = (h) => toHits.some((x) => x.rel === h.rel && x.m.index <= h.m.index && h.m.index + h.m[0].length <= x.m.index + x.m[0].length);
      return { hits, toHits, live: hits.filter((h) => !inside(h)) };
    };
    let { hits, toHits, live } = locate(from, to);
    // Not there whole: an edit captured on a container glues its children's
    // texts together. Try just the changed words, with as much context as is
    // still found exactly once (narrow-edit.js).
    if (!hits.length && !toHits.length) {
      // Only when FROM is provably glued source copy: the whole FROM must match
      // exactly one region with only tags between its pieces, and the changed
      // words must be found inside that region. "Hello Ana world" over
      // `Hello {name} world` + an unrelated "Ana" elsewhere fails this.
      const regions = findAll(markupPattern(from), ''); // no literal pre-filter: glued words are never literal
      const region = regions.length === 1 ? regions[0] : null;
      const within = (h) => region && h.rel === region.rel && h.m.index >= region.m.index && h.m.index + h.m[0].length <= region.m.index + region.m[0].length;
      for (const c of region ? narrowCandidates(from, to) : []) {
        const got = locate(c.from, c.to);
        if (got.live.length === 1 && within(got.live[0])) {
          ({ hits, toHits, live } = got);
          from = c.from; to = c.to;
          Object.assign(r, { from, to, narrowed: true });
          break;
        }
      }
    }
    // A short TO ("Go") matches unrelated text, so only a distinctive one counts as proof.
    if (!live.length && toHits.length === 1 && (hits.length || to.length >= 16)) {
      Object.assign(r, { status: 'already', file: toHits[0].rel, line: toHits[0].line }); continue;
    }
    if (!live.length && toHits.length === 1) {
      Object.assign(r, { status: 'skipped', reason: `old text not found; the new text appears once (${where(toHits)}) but is too short to be sure it's this one. Check, then resolve` }); continue;
    }
    if (!live.length && toHits.length > 1) {
      Object.assign(r, { status: 'skipped', reason: `old text not found; new text already appears ${toHits.length} times (${where(toHits)}). Check by hand, then resolve` }); continue;
    }
    if (live.length > 1) {
      Object.assign(r, { status: 'skipped', reason: `found ${live.length} times (${where(live)}). Ambiguous: edit by hand` }); continue;
    }
    if (!live.length) {
      Object.assign(r, { status: 'skipped', reason: diagnose(from, findAll, longestRun(from), where) }); continue;
    }

    const [{ rel, m, line }] = live;
    const f = cache.get(rel);
    const sp = minimalSplice(m, tokens(from), tokens(to));
    if (MARKUP_EXT.has(extname(rel).toLowerCase()) && /[<>{}]/.test(sp.text)) {
      Object.assign(r, { status: 'skipped', file: rel, line, reason: `new text has <, >, { or }, which ${extname(rel)} reads as markup. Edit by hand` }); continue;
    }
    // Inside a quoted string: the new text must not contain that quote.
    const before = f.content[m.index - 1], after = f.content[m.index + m[0].length];
    if (before && before === after && `"'\``.includes(before) && sp.text.includes(before)) {
      Object.assign(r, { status: 'skipped', file: rel, line, reason: `the text sits in a ${before}…${before} string and the new text contains ${before}. Edit by hand` }); continue;
    }
    // In script files the text may sit in a string literal that starts before the
    // match ('Fresh coffee, roasted daily…'). Unless it is clearly JSX/template
    // text, a quote the old text didn't have could end that string early.
    if (SCRIPT_EXT.has(extname(rel).toLowerCase())) {
      const added = QUOTES.filter((q) => sp.text.includes(q) && !from.includes(q));
      if (added.length && !inMarkupText(f.content, m.index, m.index + m[0].length)) {
        Object.assign(r, { status: 'skipped', file: rel, line, reason: `the new text adds ${added.join(' ')}, which could end the string this text sits in (${extname(rel)}). Edit by hand` }); continue;
      }
    }
    const next = f.content.slice(0, sp.start) + sp.text + f.content.slice(sp.end);
    r.diff = unifiedDiff(rel, f.content, next, sp.start, sp.end, sp.start + sp.text.length);
    f.content = next;
    Object.assign(r, { status: 'apply', file: rel, line });
  }

  if (!yes) return { root, results };

  // Write every changed file whole, then resolve. A file that fails (or changed
  // on disk since it was read) fails its notes and leaves the others alone.
  const failed = new Map();
  for (const [rel, f] of cache) {
    if (!f || f.content === f.original) continue;
    try {
      const real = realpathSync(f.abs);
      if (real !== rootReal && !real.startsWith(rootReal + sep)) throw new Error('outside --src');
      if (readFileSync(real, 'utf8') !== f.original) throw new Error('changed on disk while applying; re-run');
      const tmp = join(dirname(real), `.${basename(real)}.agentation-kit-${process.pid}.tmp`);
      try {
        rmSync(tmp, { force: true });
        writeFileSync(tmp, f.content, { flag: 'wx' });
        chmodSync(tmp, statSync(real).mode);
        renameSync(tmp, real);
      } catch (e) { rmSync(tmp, { force: true }); throw e; }
    } catch (e) { failed.set(rel, e.message); }
  }
  for (const r of results) {
    if (r.status === 'apply' && failed.has(r.file)) { Object.assign(r, { status: 'failed', reason: `not written: ${failed.get(r.file)}` }); continue; }
    if (r.status !== 'apply' && r.status !== 'already') continue;
    const resolution = `${r.status === 'apply' ? 'Applied' : 'Already in source'}: ${r.file}:${r.line}`;
    try {
      await p.act('resolve', r.id, resolution);
      if (r.status === 'apply') r.status = 'applied';
      r.resolution = resolution;
    } catch (e) { r.resolveError = e.message; if (r.status === 'apply') r.status = 'applied'; }
  }
  return { root, results };
}

const isCopy = (a) => a.kind === 'copy' && a.copy && typeof a.copy.unit === 'object' && a.copy.unit && typeof a.copy.to === 'string';

/**
 * Plan every copy edit: each one's span is checked against the file as read
 * (or found again, exactly once, if the file moved), and its splices are
 * computed by server/copy-edit.js. Splices that overlap another note's are
 * refused. Sets each file's new content.
 * @returns {Map<id, result>}
 */
function planCopyEdits(notes, { files, textOf }) {
  const out = new Map();
  const known = new Set(files);
  const byFile = new Map(); // rel → [{start, end, text, id}]
  const scans = new Map();
  for (const a of notes) {
    const u = a.copy.unit, to = a.copy.to;
    const rel = String(u.file || '');
    const r = { id: a.id, from: a.copy.from ?? u.display ?? u.text ?? '', to, copy: true };
    out.set(a.id, r);
    const skip = (reason, extra = {}) => Object.assign(r, { status: 'skipped', reason, ...extra });
    if (!known.has(rel)) { skip(`${rel || '(no file)'} is not a source file under --src`); continue; }
    const f = textOf(rel);
    if (!f) { skip(`${rel} can't be read as text`); continue; }
    if (typeof u.raw !== 'string' || !Number.isInteger(u.start)) { skip('the note has no source span'); continue; }
    const plan = planUnitEdit(u, to);
    if (plan.error) { skip(`${plan.error}. Edit by hand`, { file: rel, line: lineOf(f.original, Math.min(u.start, f.original.length)) }); continue; }
    if (!plan.splices.length) { skip('the new text is the same as the old', { file: rel }); continue; }
    const loc = relocate(f.original, u.raw, u.start);
    if (loc.error) {
      const done = relocate(f.original, applySplices(u.raw, 0, plan.splices), u.start);
      if (done.at != null) Object.assign(r, { status: 'already', file: rel, line: lineOf(f.original, done.at) });
      else skip(`${loc.error}. Re-open the copy view, or edit by hand`, { file: rel });
      continue;
    }
    // Encode for the string as it is now (its quote, parts, script context), not as the snapshot saw it.
    const now = freshPlan(rel, f.original, u, to, loc.at, scans);
    if (now.error) { skip(`${now.error}. Re-open the copy view, or edit by hand`, { file: rel, line: lineOf(f.original, loc.at) }); continue; }
    const abs = now.splices.map((sp) => ({ start: loc.at + sp.start, end: loc.at + sp.end, text: sp.text, id: a.id }));
    const taken = byFile.get(rel) || [];
    // Overlapping ranges, or two edits at one point where either inserts: the order would decide the result.
    const clash = taken.find((t) => abs.some((x) => (x.start < t.end && t.start < x.end) || (x.start === t.start && (x.start === x.end || t.start === t.end))));
    if (clash) { skip(`overlaps another copy edit in this round (${clash.id}). Apply that one first`, { file: rel }); continue; }
    byFile.set(rel, [...taken, ...abs]);
    const start = Math.min(...abs.map((x) => x.start)), end = Math.max(...abs.map((x) => x.end));
    const after = applySplices(f.original, 0, abs);
    const delta = after.length - f.original.length;
    Object.assign(r, { status: 'apply', file: rel, line: lineOf(f.original, loc.at), diff: unifiedDiff(rel, f.original, after, start, end, end + delta) });
  }
  for (const [rel, splices] of byFile) { const f = textOf(rel); f.content = applySplices(f.original, 0, splices); }
  return out;
}

function diagnose(from, findAll, needle, where) {
  const ent = findAll(entityPattern(from), needle);
  if (ent.length) return `HTML entities differ from the rendered text (${where(ent)}). Edit by hand`;
  const split = findAll(markupPattern(from), needle);
  if (split.length) return `looks split across JSX/markup (${where(split)}). Edit by hand`;
  const ci = findAll(new RegExp(exactPattern(from).source, 'gui'), '');
  if (ci.length) return `found only with different capitalisation (${where(ci)}); CSS may be changing the case. Edit by hand`;
  return 'not found in the source (it may be built from data, a CMS or several pieces)';
}

/** Plain-text report for the CLI. */
export function renderApply({ root, results }, { yes = false } = {}) {
  const out = [];
  const by = (s) => results.filter((r) => r.status === s);
  const writes = by(yes ? 'applied' : 'apply'), already = by('already'), skipped = by('skipped'), failed = by('failed');
  if (!results.length) return `No open text edits. Nothing to apply under ${root}.`;
  out.push(yes ? `Applied under ${root}.` : `Dry run under ${root}: nothing written. Re-run with --yes to write these and resolve the notes.`);
  for (const r of writes) {
    out.push('', `[${r.id}] ${r.file}:${r.line}${r.resolution ? ` · resolved` : ''}${r.resolveError ? ` · NOT resolved: ${r.resolveError}` : ''}`, r.diff);
  }
  if (already.length) {
    out.push('', `Already in source${yes ? ' (resolved, nothing written)' : ' (--yes resolves these without writing)'}:`);
    for (const r of already) out.push(`  [${r.id}] ${r.file}:${r.line}${r.resolveError ? ` · NOT resolved: ${r.resolveError}` : ''}`);
  }
  if (failed.length) {
    out.push('', 'Failed:');
    for (const r of failed) out.push(`  [${r.id}] ${r.file}: ${r.reason}`);
  }
  if (skipped.length) {
    out.push('', 'Skipped:');
    const short = (s) => (s.length > 60 ? `${s.slice(0, 57)}…` : s);
    for (const r of skipped) out.push(`  [${r.id}]${r.from ? ` "${short(r.from)}"` : ''}: ${r.reason}`);
  }
  out.push('', `${writes.length} ${yes ? 'applied' : 'to apply'}, ${already.length} already in source, ${failed.length ? `${failed.length} failed, ` : ''}${skipped.length} skipped.`);
  return out.join('\n');
}
