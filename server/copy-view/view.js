// "All text": every string on a page, laid out by the page's structure, editable
// in place. Served by the review server at /__ag/copy?id=…; the toolbar opens it
// (Edit text → All text, or Shift T) with a snapshot of the page (server/app.js).
// Layout follows the show-and-tell redesign (Pencil/show-and-tell.pen, 6.3–6.4):
// an outline, a reading column with each string's kind and place in a quiet
// gutter, data as tables and chips, Review as its own page, and on a phone one
// string at a time in a full-screen editor.
//
// Each field edits one source unit (server/copy-map.js). Save turns every changed
// field into a `kind: "copy"` note carrying that unit's exact span, so
// `feedback <name> apply` writes it without searching (server/copy-edit.js).
// Text that can't be placed in the source goes as an ordinary FROM → TO note.
//
// Nothing here trusts the snapshot's strings as markup: every value is set with
// textContent or built from text nodes.

const $ = (s) => document.querySelector(s);
const api = (path, init) => fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
const id = new URLSearchParams(location.search).get('id') || '';
const collapse = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const hasWords = (s) => /\p{L}/u.test(s);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
// A phone (narrow and touch) reads the list and edits one string at a time; a
// narrow desktop window or a tablet with a keyboard keeps editing in place.
const PHONE = '(max-width: 900px) and (pointer: coarse)';
const narrow = () => matchMedia(PHONE).matches;
const svgNS = 'http://www.w3.org/2000/svg';

const LANDMARK = {
  head: 'Page title and sharing', header: 'Header', banner: 'Header', nav: 'Navigation', navigation: 'Navigation',
  main: 'Main', section: 'Section', region: 'Section', article: 'Article', aside: 'Aside', complementary: 'Aside',
  footer: 'Footer', contentinfo: 'Footer', form: 'Form', search: 'Search', dialog: 'Dialog',
};
// Landmarks named for what they are; sections and articles for their heading.
const NAMED_BY_KIND = new Set(['head', 'header', 'banner', 'nav', 'navigation', 'main', 'footer', 'contentinfo']);
const KIND = {
  p: 'Paragraph', li: 'List item', a: 'Link', button: 'Button', span: 'Text', div: 'Text', strong: 'Text', em: 'Text', b: 'Text', i: 'Text',
  label: 'Label', figcaption: 'Caption', blockquote: 'Quote', td: 'Table cell', th: 'Table header', dt: 'Term', dd: 'Definition',
  summary: 'Summary', legend: 'Legend', title: 'Page title', small: 'Small print', time: 'Time', output: 'Output', caption: 'Caption',
  option: 'Option', q: 'Quote', cite: 'Citation', code: 'Code', nav: 'Navigation', header: 'Header', footer: 'Footer',
};
const ATTR = { alt: 'Alt text', title: 'Tooltip', 'aria-label': 'Accessible name', 'aria-description': 'Accessible description', placeholder: 'Placeholder', value: 'Button label', content: 'Meta' };
const CONTROL_TAGS = new Set(['a', 'button', 'label', 'summary', 'option']);

let snap, U;
const fields = new Map();   // key → [element]   key = unit id, or `dom:<n>` for text not found in source
const original = new Map(); // key → display text as loaded
const current = new Map();  // key → edited text (only when it differs)
const sent = new Map();     // key → {annotationId, to, status, kind}
const meta = new Map();     // key → {kind: 'unit' | 'free', unit?, item?, label}
const items = [];           // rendered items: {el, keys, place, maybe, sec}
const sections = [];        // {id, title, depth, place, el, keys: Set, link, items: []}
let order = [];             // keys in reading order (phone previous/next)
let mode = 'all', showCode = false;
const draftsKey = () => `agk-copy-drafts:${snap.url}`;

// ---------------------------------------------------------------------------
// Small builders

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
const mono = (t) => el('span', 'mono', t);
function icon(d) {
  const s = document.createElementNS(svgNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'i'); s.setAttribute('aria-hidden', 'true');
  for (const path of [].concat(d)) { const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', path); s.append(p); }
  return s;
}
const LOCK = ['M7 11V8a5 5 0 0 1 10 0v3', 'M6 11h12v9H6z'];
const UNDO = ['M9 14L4 9l5-5', 'M4 9h10a6 6 0 0 1 0 12h-3'];
const FILE = ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5'];
const WARN = ['M12 4l9 16H3z', 'M12 10v4', 'M12 17v.5'];
const EYE_OFF = ['M3 3l18 18', 'M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.8', 'M6.6 6.6C4.5 8 3.1 10 2.5 12c1 2.5 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'];
const INFO = ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M12 11v6', 'M12 7.5v.5'];

/** "BECOME NO ONE." → "Become no one". Labels shown in capitals by CSS read better in sentence case. */
function nice(label) {
  let s = collapse(label).replace(/[.:]+$/, '');
  if (/\p{Lu}/u.test(s) && s === s.toUpperCase()) s = s.charAt(0) + s.slice(1).toLowerCase();
  return s;
}

// ---------------------------------------------------------------------------
// Fields

const TOKEN = /\$\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

/** An editable field; `${…}` parts are locked chips you type around. */
function field(key, text, { editable = true } = {}) {
  const f = document.createElement('span');
  f.className = 'field';
  f.contentEditable = editable ? 'true' : 'false';
  f.spellcheck = true;
  f.dataset.key = key;
  f.setAttribute('role', 'textbox');
  f.tabIndex = 0;
  f.setAttribute('aria-label', meta.get(key)?.label || 'Text');
  fill(f, text);
  if (!fields.has(key)) fields.set(key, []);
  fields.get(key).push(f);
  // Escape undoes only what was typed since the field got focus, never an earlier edit.
  f.addEventListener('focus', () => { f.dataset.start = read(f); });
  f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !f.isContentEditable) { e.preventDefault(); openEditor(key); return; }
    // Enter commits and moves to the next string; Alt+↑/↓ steps without leaving the keyboard.
    if (e.key === 'Enter' || (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp'))) {
      e.preventDefault();
      const dir = e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey) ? -1 : 1;
      if (f.closest('#doc')) stepField(f, dir); else f.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (f.dataset.start != null && read(f) !== f.dataset.start) { fill(f, f.dataset.start); changed(key, f); } else f.blur();
    }
  });
  f.addEventListener('paste', (e) => {
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s*\n\s*/g, ' ');
    document.execCommand('insertText', false, t);
  });
  f.addEventListener('input', () => changed(key, f));
  // On a phone the list is for reading; a tap opens the string on its own.
  f.addEventListener('click', () => { if (!f.isContentEditable && f.closest('#doc')) openEditor(key); });
  return f;
}

function fill(f, text) {
  f.replaceChildren();
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) f.append(document.createTextNode(text.slice(last, m.index)));
    const tok = document.createElement('span');
    tok.className = 'tok';
    tok.contentEditable = 'false';
    tok.dataset.expr = m[1];
    tok.append(icon(LOCK), el('span', 'x', m[1]));
    tok.title = `Filled in by the code: \${${m[1]}}. It stays as it is.`;
    f.append(tok);
    last = m.index + m[0].length;
  }
  if (last < text.length || !f.childNodes.length) f.append(document.createTextNode(text.slice(last)));
}

/** A field's text, with chips written back as `${…}`. */
function read(f) {
  let out = '';
  const walk = (n) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) out += c.nodeValue;
      else if (c.nodeType === 1 && c.classList.contains('tok')) out += `\${${c.dataset.expr}}`;
      else if (c.nodeType === 1 && c.tagName === 'BR') out += ' ';
      else if (c.nodeType === 1 && c.tagName !== 'svg') walk(c);
    }
  };
  walk(f);
  return out.replace(/ /g, ' ');
}

/** The next visible editable field in reading order, from `f`. */
function stepField(f, dir) {
  const list = [...document.querySelectorAll('#doc .field')].filter((x) => x.offsetParent && !x.closest('[hidden]'));
  const next = list[list.indexOf(f) + dir];
  if (!next) { f.blur(); return; }
  next.focus();
  next.scrollIntoView({ block: 'nearest' });
  const r = document.createRange(); r.selectNodeContents(next); r.collapse(false);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
}

const exprsOf = (s) => [...String(s).matchAll(TOKEN)].map((m) => collapse(m[1]));

function changed(key, f) {
  const value = read(f);
  // Every other place showing the same source string follows along.
  for (const other of fields.get(key) || []) if (other !== f) fill(other, value);
  // Back to the original: no change, unless an open saved note asks for something
  // else, in which case "the original" is the change (Save withdraws that note).
  const open = sent.get(key) && ['pending', 'acknowledged'].includes(sent.get(key).status);
  if (normal(key, value) === normal(key, original.get(key)) && !open) current.delete(key); else current.set(key, value);
  validate(key, value);
  paint(key);
  saveDrafts();
  summary();
}

/** Whitespace the source collapses anyway is not a change. */
function normal(key, s) {
  const m = meta.get(key);
  return m?.kind === 'free' || /text|attr/.test(m?.unit?.kind || '') ? collapse(s) : s;
}

function validate(key, value) {
  const want = exprsOf(original.get(key));
  const got = exprsOf(value);
  const ok = want.length === got.length && want.every((e, i) => e === got[i]);
  for (const f of fields.get(key) || []) {
    f.classList.toggle('invalid', !ok);
    // Right under the field it is about: its cell, list row or chip group, not the end of a 200-row list.
    const host = f.closest('td, .li, .chips, .fields, .editor-body');
    if (!host || !f.closest('#doc, #editor')) continue;
    let line = host.querySelector(':scope > .error-line');
    if (!ok && !line) { line = el('div', 'error-line'); host.append(line); }
    if (line) { line.hidden = ok; line.textContent = ok ? '' : `Keep ${want.map((e) => `\${${e}}`).join(', ')} as it is: the code fills it in.`; }
  }
  return ok;
}

function revert(key) {
  current.delete(key);
  const back = sent.get(key)?.to ?? original.get(key);
  for (const f of fields.get(key) || []) fill(f, back);
  if (sent.has(key)) current.set(key, back);
  validate(key, back);
  paint(key);
  saveDrafts();
  summary();
}

const unsaved = (k) => current.has(k) && (!sent.get(k) || normal(k, sent.get(k).to) !== normal(k, current.get(k)));
const isOriginal = (k, v) => normal(k, v) === normal(k, original.get(k));
const savedNow = (k) => sent.has(k) && current.get(k) === sent.get(k).to;

/** Edited / saved state wherever this key shows. */
function paint(key) {
  for (const f of fields.get(key) || []) {
    f.classList.toggle('edited', unsaved(key));
    f.closest('tr')?.classList.toggle('changed', [...f.closest('tr').querySelectorAll('.field')].some((x) => unsaved(x.dataset.key)));
  }
  for (const it of items) if (it.keys.includes(key)) paintItem(it);
  if (editing === key) paintEditor();
}

function paintItem(it) {
  const any = it.keys.some(unsaved);
  const saved = !any && it.keys.some(savedNow);
  it.el.classList.toggle('changed', any);
  it.el.classList.toggle('saved', saved);
  it.edited = any || saved;
  const state = it.el.querySelector('.state');
  if (state) {
    const n = it.keys.filter(unsaved).length;
    state.textContent = any ? (it.keys.length > 2 ? `${n} edited` : it.keys.some((k) => sent.has(k)) ? 'Edited since saved' : 'Edited') : saved ? 'Saved' : '';
    state.className = `state${saved ? ' sent' : ''}`;
  }
  const undo = it.el.querySelector('.undo');
  if (undo) undo.hidden = !any;
}

function pending() {
  return [...current].filter(([k, v]) => unsaved(k) && validate(k, v));
}

const fileOf = (k) => meta.get(k)?.unit?.file || 'On the page, not found in the source';

function summary() {
  const list = pending();
  const invalid = [...current.keys()].filter((k) => unsaved(k) && !validate(k, current.get(k))).length;
  const n = list.length;
  const files = new Set(list.map(([k]) => fileOf(k))).size;
  $('#save').disabled = !n;
  $('#review-open').disabled = !n;
  $('#save').textContent = n ? `Save ${n}` : 'Save';
  $('#discard').disabled = ![...current.keys()].some(unsaved);
  const waiting = [...sent.values()].filter((s) => s.status === 'pending' || s.status === 'acknowledged').length;
  const s = $('#summary');
  s.replaceChildren();
  if (n) s.append(`${plural(n, 'edit')} in ${plural(files, 'file')}`); else s.append(el('span', 'sub', 'No edits yet'));
  if (invalid) s.append(el('span', 'sub', ` · ${invalid} need${invalid === 1 ? 's' : ''} a fix`));
  if (waiting) s.append(el('span', 'sub', ` · ${waiting} waiting for the agent`));
  outlineCounts();
  menuCounts();
  if (mode === 'edited') filter();
}

// ---------------------------------------------------------------------------
// Drafts survive a reload of this tab.
function saveDrafts() {
  try {
    const out = {};
    for (const [k, v] of current) if (unsaved(k)) out[k] = { to: v, from: original.get(k) };
    localStorage.setItem(draftsKey(), JSON.stringify(out));
  } catch { /* private mode */ }
}
function loadDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem(draftsKey()) || '{}');
    for (const [k, d] of Object.entries(saved)) {
      if (!original.has(k) || original.get(k) !== d.from) continue; // the source changed: the draft no longer applies
      current.set(k, d.to);
      for (const f of fields.get(k) || []) fill(f, d.to);
    }
  } catch { /* corrupt or blocked */ }
}

// ---------------------------------------------------------------------------
// Rendering

function unitKey(uid, label) {
  const u = U[uid];
  if (!meta.has(uid)) {
    meta.set(uid, { kind: 'unit', unit: u, label: label || (u.attr ? ATTR[u.attr] || u.attr : 'Text') });
    original.set(uid, u.display ?? u.text);
  } else if (label) meta.get(uid).label = label;
  return uid;
}

/** How a string that isn't on the page shows up, as far as the source says. */
function detailOf(u) {
  if (u.call === 'fillText' || u.call === 'strokeText') return 'Drawn on canvas';
  if (/\bpick\(\)|random|shuffle\(\)/i.test(u.path || '')) return 'Picked at random';
  if (/(textContent|innerHTML|innerText) =/.test(u.path || '')) return 'Set by script';
  if (/^markup/.test(u.kind)) return 'Built by script';
  if (/\.html?$/.test(u.file)) return 'Not shown right now';
  return 'Not on the page right now';
}

function gutter(parts, keys) {
  const g = el('div', 'gutter');
  for (const p of parts) if (p) g.append(typeof p === 'string' ? el('span', 'detail', p) : p);
  const line = el('div', 'state-line');
  line.append(el('span', 'state'));
  const undo = el('button', 'quiet undo');
  undo.type = 'button'; undo.hidden = true;
  undo.append(icon(UNDO), 'Undo');
  undo.addEventListener('click', () => { for (const k of keys) if (unsaved(k)) revert(k); });
  line.append(undo);
  g.append(line);
  return g;
}
const monoBlock = (t) => { const m = mono(t); m.classList.add('detail'); return m; };

/**
 * The role rail: what this string IS on the page, right beside it. A writer
 * reads a page as headline, body, button, list; the file and line it comes
 * from are for the agent and stay in the quiet gutter on the far side.
 */
function rail(role, { unseen = false, level = 0 } = {}) {
  const r = el('div', 'rail');
  const tag = el('span', `role${level ? ' is-heading' : ''}`, role || '');
  if (level) tag.title = `Heading ${level}`;
  if (unseen) { tag.prepend(icon(EYE_OFF)); tag.title = 'Not shown on the page: read by screen readers, search engines or on hover'; }
  r.append(tag);
  return r;
}

function addItem(sec, { node, keys, place, maybe = false, gutterParts, cls = '', role = '', unseen = false, level = 0 }) {
  const row = el('div', `item ${cls}`.trim());
  const main = el('div', 'main');
  main.append(node);
  row.append(rail(role, { unseen, level }), main, gutter(gutterParts, keys));
  sec.body.append(row);
  const it = { el: row, keys, place, maybe, sec, edited: false };
  items.push(it);
  sec.items.push(it);
  for (const k of keys) sec.keys.add(k);
  return it;
}

// The rail's word for a string: short, and in a writer's terms.
const ROLE = { Paragraph: 'Body', Text: 'Text', 'Accessible name': 'Screen reader label', 'Accessible description': 'Screen reader text', 'Table header': 'Column head' };
const META_ROLE = { description: 'Search description', 'og:title': 'Share title', 'og:description': 'Share description', 'og:site_name': 'Site name', 'twitter:title': 'Share title (X)', 'twitter:description': 'Share description (X)' };
function roleOf(item, kindName) {
  if (item.type === 'heading') return `H${item.level}`;
  if (item.type === 'attr' && item.attr === 'content') return META_ROLE[item.name] || kindName;
  return ROLE[kindName] || kindName;
}

let domSeq = 0;
function pageItem(sec, item) {
  const isHeading = item.type === 'heading';
  const kindName = item.type === 'attr' ? (item.attr === 'content' ? `Meta ${item.name || ''}`.trim() : ATTR[item.attr] || item.attr)
    : isHeading ? `Heading ${item.level}` : KIND[item.tag] || 'Text';
  const size = item.visibility === 'decorative' ? 'decorative' : isHeading ? 'heading' : item.visibility === 'meta' ? 'meta'
    : item.type === 'attr' ? 'attr' : CONTROL_TAGS.has(item.tag) ? 'control' : item.tag === 'small' ? 'small' : 'text';
  const fs = el('div', 'fields');
  const units = [...new Set(item.units || [])].filter((x) => U[x]);
  // Pieces only when each is a different part of the text (not the same string matched twice).
  const pieces = units.length > 1 && new Set(units.map((x) => collapse(U[x].display ?? U[x].text))).size === units.length
    && (item.pieces || units.every((x) => item.text.includes(collapse(U[x].display ?? U[x].text))));
  const shown = pieces ? units : units.slice(0, 1);
  const keys = [];
  if (shown.length) {
    shown.forEach((uid, i) => {
      if (i) {
        // Between two pieces sits markup (a line break, a link, emphasis): it stays as it is.
        const j = el('span', 'joint');
        j.append(icon(LOCK));
        j.title = 'Markup between these pieces stays as it is';
        fs.append(j);
      }
      keys.push(unitKey(uid, kindName));
      fs.append(field(uid, original.get(uid)));
    });
    if (shown.length > 1) fs.classList.add('pieces');
  } else {
    const key = `dom:${++domSeq}`;
    meta.set(key, { kind: 'free', item, label: kindName });
    original.set(key, item.text);
    keys.push(key);
    fs.append(field(key, item.text));
  }
  const parts = [item.visibility === 'decorative' ? 'Hidden from screen readers' : item.visibility === 'hidden' ? 'Not visible right now' : null];
  if (shown.length) {
    const u = U[shown[0]];
    parts.push(monoBlock(`${u.file}:${u.line}`));
    if (u.path) parts.push(monoBlock(u.path));
    if (shown.length > 1) parts.push(`${shown.length} pieces in the source`);
    if (units.length > shown.length) parts.push(`Same text in ${plural(units.length - shown.length, 'other place')}`);
  } else { const w = el('span', 'detail warn', 'Can’t place in the source; saves as a find-and-replace note'); parts.push(w); }
  if (item.count > 1) parts.push(`${item.count}× on the page`);
  const unseen = item.type === 'attr' || item.visibility === 'meta' || item.visibility === 'hidden';
  return addItem(sec, {
    node: fs, keys, place: 'page', gutterParts: parts, role: roleOf(item, kindName), unseen, level: isHeading ? item.level : 0,
    cls: `k-${size}${item.level ? ` lvl-${item.level}` : ''} t-${String(item.tag || 'x').replace(/[^a-z0-9]/g, '')}${unseen ? ' unseen' : ''}`,
  });
}

// --- Data: a list of strings shown as the shape it has in the code ---------

/** `[1][2]`, `.job`, `[3].audience` → segments; null when the path isn't plain data (a call in between). */
function segs(rel) {
  if (rel == null) return null;
  const out = [];
  const re = /\[(\d+)\]|\.([A-Za-z_$][\w$]*)|\[("(?:[^"\\]|\\.)*")\]/gy;
  let m;
  while (re.lastIndex < rel.length && (m = re.exec(rel))) out.push(m[1] != null ? { i: +m[1] } : { k: m[2] ?? JSON.parse(m[3]) });
  return re.lastIndex === rel.length || rel === '' ? out : null;
}
const segText = (s) => (s.i != null ? `[${s.i}]` : `.${s.k}`);
const isLabel = (t) => t.length <= 22 && /^[\p{Lu}\d\s&'’./·-]+$/u.test(t) && /\p{Lu}/u.test(t);

function dataBlock(uids, owner, place) {
  const rel = (uid) => { const p = U[uid].path || ''; return p.startsWith(owner) ? p.slice(owner.length) : null; };
  const parsed = uids.map((uid) => [uid, segs(rel(uid))]);
  const keys = uids.map((uid) => unitKey(uid));
  const ok = parsed.every(([, s]) => s && s.length);
  const short = uids.every((uid) => (U[uid].display ?? U[uid].text).length <= 48);
  // A plain list of short strings: chips.
  if (ok && short && parsed.every(([, s]) => s.length === 1 && s[0].i != null) && uids.length >= 3) return chips(uids);
  // An object of lists (`B.place[3]`, `B.city[8]`): chips per key.
  if (ok && parsed.every(([, s]) => s.length === 2 && s[0].k != null && s[1].i != null)) {
    const box = el('div');
    const groups = new Map();
    for (const [uid, s] of parsed) { if (!groups.has(s[0].k)) groups.set(s[0].k, []); groups.get(s[0].k).push(uid); }
    for (const [k, list] of groups) { const g = el('div', 'chip-group'); g.append(el('div', 'key', `.${k}`), chips(list)); box.append(g); }
    return box;
  }
  // Rows of records (`recordData[1][2]`, `E[2].job`): a table.
  if (ok && parsed.every(([, s]) => s.length >= 2)) return table(parsed);
  // Anything else: one per line, with its path.
  const list = el('div', 'list');
  for (const uid of uids) {
    const li = el('div', 'li');
    li.append(mono(rel(uid) || U[uid].path || ''), field(uid, original.get(uid)));
    list.append(li);
  }
  return limit(list, [...list.children], 8);
}

function chips(uids) {
  const box = el('div', 'chips');
  const LIMIT = 12;
  uids.forEach((uid) => box.append(field(unitKey(uid), original.get(uid))));
  if (uids.length > LIMIT) {
    const extra = [...box.children].slice(LIMIT);
    const more = el('button', 'chip-more', `+${extra.length}`);
    more.type = 'button';
    let open = false;
    const apply = () => { for (const x of extra) x.style.display = open ? '' : 'none'; more.textContent = open ? 'Fewer' : `+${extra.length}`; };
    more.addEventListener('click', () => { open = !open; apply(); });
    box.append(more);
    apply();
    box.dataset.collapsible = '1';
    box._apply = apply;
  }
  return box;
}

function table(parsed) {
  const rows = new Map(), cols = [];
  for (const [uid, s] of parsed) {
    const r = s.slice(0, -1).map(segText).join(''), c = segText(s[s.length - 1]);
    if (!rows.has(r)) rows.set(r, new Map());
    rows.get(r).set(c, uid);
    if (!cols.includes(c)) cols.push(c);
  }
  const named = cols.some((c) => c.startsWith('.'));
  const colText = (c) => [...rows.values()].map((m) => m.get(c)).filter(Boolean).map((uid) => U[uid].display ?? U[uid].text);
  const labelCols = new Set(cols.filter((c) => colText(c).every(isLabel)));
  const lead = cols.find((c) => !labelCols.has(c));
  const box = el('div', 'data');
  const t = el('table');
  if (named) {
    const head = el('thead'), tr = el('tr');
    tr.append(el('th'));
    for (const c of cols) tr.append(el('th', null, c.slice(1)));
    head.append(tr); t.append(head);
  }
  const body = el('tbody');
  for (const [r, cells] of rows) {
    const tr = el('tr');
    tr.append(el('td', 'idx', r));
    for (const c of cols) {
      const td = el('td', labelCols.has(c) ? 'label' : c === lead ? 'lead' : '');
      const uid = cells.get(c);
      if (uid) td.append(field(unitKey(uid), original.get(uid)));
      tr.append(td);
    }
    body.append(tr);
  }
  t.append(body);
  const scroll = el('div', 'scroll');
  scroll.append(t);
  box.append(scroll);
  return limit(box, [...body.children], 4);
}

/** Show the first `n`, with "Show all N" below. */
function limit(box, rows, n) {
  if (rows.length <= n) return box;
  const more = el('button', 'more');
  more.type = 'button';
  let open = false;
  const apply = () => { rows.slice(n).forEach((r) => { r.style.display = open ? '' : 'none'; }); more.textContent = open ? 'Show fewer' : `Show all ${rows.length}`; };
  more.addEventListener('click', () => { open = !open; apply(); });
  box.append(more);
  apply();
  box.dataset.collapsible = '1';
  box._apply = apply;
  return box;
}

function poolItem(sec, pool, place, extra) {
  const block = dataBlock(pool.units, pool.owner, place);
  const keys = pool.units.map((uid) => uid);
  const node = el('div');
  if (place !== 'page') {
    const c = el('div', 'crumbs');
    c.append(el('span', null, pool.file), el('span', null, '›'), el('b', null, pool.owner));
    node.append(c);
  }
  node.append(block);
  const first = U[pool.units[0]];
  const parts = place === 'page'
    ? [pool.renders > 1 ? `Shown ${pool.renders} times on the page` : 'Some of these show at a time', monoBlock(`${pool.file}:${pool.line}  ${pool.owner}`)]
    : [extra ?? detailOf(first), monoBlock(`${pool.file}:${pool.line}`), first.path && first.path.includes('›') ? monoBlock(first.path.replace(/\[\d+\].*$/, '')) : null];
  const maybe = pool.units.some((uid) => U[uid].copy === 'maybe');
  if (maybe && place !== 'code') parts.push(`Maybe text: ${U[pool.units.find((uid) => U[uid].copy === 'maybe')].why}`);
  if (place === 'code') parts.push(`Judged to be code: ${first.why}`);
  return addItem(sec, { node, keys, place, maybe, gutterParts: parts, role: place === 'page' ? 'Data' : '', cls: 'k-data' });
}

function newSection(title, depth, place, { kind, intro, path = [], level = 0, cont = null } = {}) {
  const s = el('section', `sec depth-${Math.min(depth, 3)}${cont ? ' cont' : ''}`);
  s.id = `s${sections.length + 1}`;
  const hd = el('div', 'sec-hd');
  // Where this part sits: "Main › Plans", then its own name.
  if (path.length) {
    const c = el('div', 'path');
    path.forEach((t, i) => { if (i) c.append(el('span', 'sep', '›')); c.append(el('span', null, t)); });
    hd.append(c);
  }
  const row = el('div', 'sec-row');
  row.append(el('h2', null, title));
  if (level) row.append(el('span', 'lv', `H${level}`));
  if (kind) row.append(el('span', 'kind', kind));
  row.append(el('span', 'n'));
  hd.append(row);
  s.append(hd);
  if (intro) s.append(el('p', 'sec-intro', intro));
  const body = el('div', 'sec-body');
  s.append(body);
  s.dataset.place = place;
  const sec = { id: s.id, title, depth, place, el: s, hd, body, keys: new Set(), items: [], parent: null, level, cont, path };
  sections.push(sec);
  return sec;
}

const sameWords = (a, b) => collapse(a).toLowerCase().replace(/[.:!?]+$/, '') === collapse(b).toLowerCase().replace(/[.:!?]+$/, '');

function render() {
  const doc = $('#doc');
  doc.replaceChildren();
  // The page's shape is two things woven together: its landmarks (header, nav,
  // main, sections, footer) and its headings. Each landmark and each heading
  // opens a part; a string goes into the innermost part that holds it. Every
  // item names its landmark (`lm`), so text that follows a closed section goes
  // back to the part above it instead of being filed under the section.
  const stack = [];
  const alias = new Map(); // a landmark that opens no part (a card's own <header>) → the one that holds it
  const lmOf = (x) => { while (alias.has(x)) x = alias.get(x); return x || 0; };
  const open = (title, opts = {}) => {
    const parent = stack[stack.length - 1] || null;
    const sec = newSection(title, stack.length, 'page', { ...opts, path: stack.map((x) => x.title) });
    sec.parent = parent;
    if (parent) parent.hadChild = true;
    stack.push(sec);
    doc.append(sec.el);
    return sec;
  };
  // Pop to the part that holds landmark `lm`: the landmark's own part, or a heading opened inside it.
  const settle = (lm) => {
    while (stack.length && !(stack[stack.length - 1].lm === lm || stack[stack.length - 1].owner === lm)) stack.pop();
    if (!stack.length) {
      // Text outside every landmark: the top of the page, or more of it further down.
      const sec = open(sections.some((x) => x.place === 'page' && !x.head) ? 'More on the page' : 'Top of the page');
      sec.lm = lm; sec.implicit = true;
    }
    return stack[stack.length - 1];
  };
  // A part that already holds sub-parts continues after them, in reading
  // order: same part, no second heading, one entry in the outline.
  const here = (lm) => {
    const sec = settle(lm);
    if (!sec.hadChild) return sec;
    const root = sec.cont || sec;
    const more = newSection(root.title, sec.depth, 'page', { cont: root, path: sec.path });
    Object.assign(more, { parent: sec.parent, lm: sec.lm, owner: sec.owner, hlevel: sec.hlevel });
    more.hd.hidden = true;
    stack[stack.length - 1] = more;
    doc.append(more.el);
    return more;
  };
  for (const item of snap.placed.items) {
    const lm = lmOf(item.type === 'landmark' ? item.parent : item.lm);
    if (item.type === 'landmark') {
      const inner = lm !== 0 && stack.length;
      // A <header> or <footer> inside a section is that section's furniture, not a part of the page.
      if (inner && (item.kind === 'header' || item.kind === 'footer')) { alias.set(item.id, lm); continue; }
      if (lm === 0) stack.length = 0; else settle(lm);
      const name = LANDMARK[item.kind] || nice(item.kind);
      const title = NAMED_BY_KIND.has(item.kind) || !item.label || item.label.startsWith('#') ? name : nice(item.label);
      const sec = open(title, { kind: NAMED_BY_KIND.has(item.kind) || title === name ? '' : name });
      sec.lm = item.id; sec.head = item.kind === 'head';
      continue;
    }
    // The head holds the title and sharing text only; the first words on the page start the page.
    if (stack.length && stack[stack.length - 1].head && item.visibility !== 'meta') stack.length = 0;
    if (item.type === 'pool') {
      // The string that first showed this data is in the table now: show it once.
      const sec = here(lm), last = sec.items[sec.items.length - 1];
      if (last && last.keys.every((k) => item.units.includes(k))) {
        last.el.remove(); sec.items.pop(); items.splice(items.indexOf(last), 1);
      }
      poolItem(sec, item, 'page');
      continue;
    }
    // A bare number nobody wrote in the source (a counter, a percentage) isn't text to edit.
    if (!item.units?.length && !hasWords(item.text)) continue;
    if (item.type === 'heading' && item.visibility !== 'hidden') {
      let top = settle(lm);
      // A heading closes the headings at its level or below that came before it here.
      while (top.owner === lm && top.hlevel >= item.level) { stack.pop(); top = settle(lm); }
      // A section named for this heading is already this part.
      if (top.lm === lm && !top.implicit && !top.named && !top.cont && sameWords(top.title, item.text)) {
        top.named = true; top.level = item.level;
        top.hd.querySelector('.sec-row').insertBefore(el('span', 'lv', `H${item.level}`), top.hd.querySelector('.sec-row .n'));
      } else {
        const sec = open(nice(item.text), { level: item.level });
        sec.owner = lm; sec.hlevel = item.level;
      }
    }
    pageItem(here(lm), item);
  }
  // Counts include nested parts, and a part's continuation counts as the part.
  for (const sec of [...sections].reverse()) {
    if (sec.cont) for (const k of sec.keys) sec.cont.keys.add(k);
    const up = sec.cont ? null : sec.parent && (sec.parent.cont || sec.parent);
    if (up) for (const k of sec.keys) up.keys.add(k);
  }
  // A part with no strings of its own (Main, holding the page's parts) shows in
  // the outline and in each inner part's path, not as a header over nothing.
  for (const sec of sections) if (!sec.cont) sec.hd.hidden = !sec.items.length;
  // Text that follows a part's inner parts (a line after the plan cards) needs
  // that part's name over it when the part had nothing before them: without
  // it the line reads as the end of the last inner part.
  for (const sec of sections) {
    if (!sec.cont || !sec.items.length || sec.cont.items.length || sec.cont.named2) continue;
    sec.cont.named2 = true; sec.hd.hidden = false; sec.hd.querySelector('.n').textContent = '';
  }

  const fileSections = (list, place, title, intro) => {
    if (!list.length) return;
    const top = newSection(title, 0, place, { intro });
    doc.append(top.el);
    for (const { file, groups } of list) {
      const sec = newSection(file, 1, place);
      sec.hd.hidden = true;
      sec.parent = top;
      top.body.append(sec.el);
      for (const g of groups) poolItem(sec, { ...g, file }, place);
      for (const k of sec.keys) top.keys.add(k);
    }
  };
  fileSections(snap.placed.elsewhere, 'elsewhere', 'Elsewhere in the code', snap.placed.scope === 'page'
    ? 'Not in the page’s text when it loaded: canvas labels, lines picked at random, words that appear after a click, from the files this page loads.'
    : 'Not in the page’s text when it loaded. The page’s scripts couldn’t be matched to files, so this covers the whole project.');
  fileSections(snap.placed.code || [], 'code', 'Strings judged to be code', 'Class names, selectors, keys and events, each with the reason. Here so a wrong call never hides text for good.');
  if (!items.length) doc.append(el('p', 'empty', 'No text found on this page.'));
  order = items.flatMap((it) => it.keys);
  setEditable();
  buildOutline();
}

/** Desktop edits in place; a phone opens one string at a time. */
function setEditable() {
  const inPlace = !narrow();
  for (const f of document.querySelectorAll('#doc .field')) f.contentEditable = inPlace ? 'true' : 'false';
}

// ---------------------------------------------------------------------------
// Outline and section picker

function buildOutline() {
  const nav = $('#outline');
  nav.replaceChildren(el('div', 'group', 'On this page'));
  const jump = $('#jump');
  jump.replaceChildren();
  let lastPlace = 'page';
  for (const sec of sections) {
    if (sec.cont) continue;
    if (sec.place !== lastPlace) { nav.append(el('hr')); lastPlace = sec.place; }
    const a = el('a', `${sec.depth === 0 ? 'top-level' : `d${Math.min(sec.depth, 4)}`}`);
    a.href = `#${sec.id}`;
    a.dataset.place = sec.place;
    a.append(el('span', 't', sec.title));
    if (sec.level) a.append(el('span', 'lv', `H${sec.level}`));
    a.append(el('span', 'e'), el('span', 'n'));
    a.title = sec.title;
    a.addEventListener('click', (e) => { e.preventDefault(); go(sec); });
    nav.append(a);
    sec.link = a;
    const o = new Option(`${'  '.repeat(Math.min(sec.depth, 3))}${sec.title}`, sec.id);
    o.dataset.place = sec.place;
    jump.append(o);
  }
  outlineCounts();
  // The outline follows the reading position.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) mark(sections.find((s) => s.el === e.target.closest('.sec')));
  }, { rootMargin: '-80px 0px -70% 0px' });
  for (const sec of sections) io.observe(sec.hd.hidden ? sec.el : sec.hd);
  // A scrollbar drag or a big jump can skip the band above: settle on the last section above the fold.
  let tick = 0;
  addEventListener('scroll', () => {
    if (tick) return;
    tick = requestAnimationFrame(() => {
      tick = 0;
      const line = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top')) + 100;
      let best = null;
      for (const sec of sections) if (!sec.el.hidden && sec.el.getBoundingClientRect().top <= line) best = sec;
      if (best) mark(best);
    });
  }, { passive: true });
}
function go(sec) {
  const target = sec.hd.hidden ? sec.items[0]?.el || sec.el.querySelector('.item') || sec.el : sec.hd;
  target.scrollIntoView({ block: 'start' });
  mark(sec);
}
function mark(sec) {
  if (!sec) return;
  sec = sec.cont || sec;
  for (const s of sections) s.link?.classList.toggle('on', s === sec);
  const listed = sections.filter((s) => s.place === sec.place && !s.cont && s.keys.size);
  const total = listed.length;
  const idx = listed.indexOf(sec);
  const j = $('#jump');
  if (j.value !== sec.id) j.value = sec.id;
  const opt = j.selectedOptions[0];
  if (opt) opt.textContent = `${sec.title}${idx >= 0 ? `  ·  ${idx + 1} of ${total}` : ''}`;
  for (const o of j.options) if (o !== opt) o.textContent = `${'  '.repeat(Math.min(sections.find((s) => s.id === o.value)?.depth || 0, 3))}${sections.find((s) => s.id === o.value)?.title}`;
}

function outlineCounts() {
  for (const sec of sections) {
    if (!sec.link) continue;
    const edited = [...sec.keys].filter(unsaved).length;
    sec.link.querySelector('.n').textContent = String(sec.keys.size || '');
    sec.link.querySelector('.e').textContent = edited ? `${edited} edited` : '';
    sec.hd.querySelector('.n').textContent = sec.keys.size ? plural(sec.keys.size, 'string') : '';
  }
}

// ---------------------------------------------------------------------------
// Find and filter

const MODES = [
  ['all', 'All text', (it) => it.place !== 'code'],
  ['edited', 'Edited', (it) => it.edited],
  ['page', 'On the page', (it) => it.place === 'page'],
  ['elsewhere', 'Elsewhere in the code', (it) => it.place === 'elsewhere'],
  ['maybe', 'Maybe text', (it) => it.maybe],
];
const keysWhere = (test) => new Set(items.filter(test).flatMap((it) => it.keys));
// Each count is the number of strings that filter shows, so the menu, outline and page agree.
function countFor(m) {
  if (m === 'all') return keysWhere((it) => it.place !== 'code' || showCode).size;
  return keysWhere(MODES.find((x) => x[0] === m)[2]).size;
}

function buildMenu() {
  const menu = $('#filter-menu');
  menu.replaceChildren();
  for (const [m, label] of MODES) {
    const b = el('button');
    b.type = 'button'; b.setAttribute('role', 'menuitemradio'); b.dataset.mode = m;
    b.append(el('span', null, label), el('span', 'count'));
    b.addEventListener('click', () => { mode = m; closeMenu(); filter(); $('#filter-btn').focus(); });
    menu.append(b);
  }
  const code = snap.placed.stats.code;
  if (code) {
    menu.append(el('hr'));
    const row = el('label', 'switch-row');
    const sw = el('input', 'switch');
    sw.type = 'checkbox'; sw.id = 'show-code'; sw.setAttribute('role', 'menuitemcheckbox');
    sw.addEventListener('change', () => { showCode = sw.checked; filter(); });
    row.append(el('span', null, 'Show strings judged to be code'), el('span', 'count', String(code)), sw);
    menu.append(row);
  }
  menuCounts();
}
function menuCounts() {
  for (const b of document.querySelectorAll('#filter-menu [data-mode]')) {
    b.setAttribute('aria-checked', String(b.dataset.mode === mode));
    b.querySelector('.count').textContent = String(countFor(b.dataset.mode));
  }
  $('#filter-label').textContent = MODES.find((x) => x[0] === mode)[1];
  $('#filter-count').textContent = String(countFor(mode));
}
function menuKeys(e) {
  const list = [...$('#filter-menu').querySelectorAll('button, input')];
  const i = list.indexOf(document.activeElement);
  const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
  if (to == null) return;
  e.preventDefault();
  list[(to + list.length) % list.length]?.focus();
}
function openMenu() { $('#filter-menu').hidden = false; $('#filter-btn').setAttribute('aria-expanded', 'true'); menuCounts(); $('#filter-menu button')?.focus(); }
function closeMenu() { $('#filter-menu').hidden = true; $('#filter-btn').setAttribute('aria-expanded', 'false'); }

function filter() {
  const q = collapse($('#search').value).toLowerCase();
  const test = MODES.find((x) => x[0] === mode)[2];
  for (const it of items) {
    let show = it.place === 'code' ? showCode && (mode === 'all' || test(it)) : test(it);
    if (show && q) {
      const text = `${it.keys.map((k) => current.get(k) ?? original.get(k)).join(' ')} ${it.el.querySelector('.gutter')?.textContent || ''}`.toLowerCase();
      show = text.includes(q);
    }
    it.el.hidden = !show;
    // Finding or filtering looks inside collapsed lists too; clearing it folds them back.
    for (const c of it.el.querySelectorAll('[data-collapsible]')) {
      const more = c.querySelector(':scope > .more, :scope > .chips > .chip-more, :scope > .chip-more');
      if (q || mode !== 'all') { for (const r of c.querySelectorAll('tr, .li, .field')) r.style.display = ''; if (more) more.hidden = true; } else { if (more) more.hidden = false; c._apply?.(); }
    }
  }
  // Children first, so a parent knows whether anything inside it is still showing.
  for (const sec of [...sections].reverse()) {
    sec.el.hidden = !(sec.items.some((it) => !it.el.hidden) || sections.some((s) => s.parent && (s.parent === sec || s.parent.cont === sec || (sec.cont && s.parent === sec.cont)) && !s.el.hidden));
    if (sec.link) sec.link.hidden = sec.place === 'code' ? !showCode : false;
  }
  for (const o of $('#jump').options) o.hidden = o.dataset.place === 'code' && !showCode;
  for (const hr of document.querySelectorAll('#outline hr')) hr.hidden = hr.nextElementSibling?.dataset.place === 'code' && !showCode;
  const shown = items.filter((it) => !it.el.hidden);
  let none = $('#doc > .no-match');
  if (!shown.length && !none) { none = el('p', 'empty no-match'); $('#doc').append(none); }
  if (none) { none.hidden = !!shown.length; none.textContent = q ? `No text matches “${$('#search').value.trim()}”.` : 'Nothing to show with this filter.'; }
  const count = $('#find-count');
  count.textContent = q ? plural(shown.reduce((n, it) => n + it.keys.length, 0), 'match', 'matches') : '';
  menuCounts();
}

// ---------------------------------------------------------------------------
// Review and save

const batch = `copy-${Date.now().toString(36)}`;
function unitPayload(u) {
  return {
    id: u.id, file: u.file, start: u.start, end: u.end, line: u.line, kind: u.kind, quote: u.quote,
    ...(u.htmlQuote !== undefined ? { htmlQuote: u.htmlQuote } : {}), ...(u.inScript ? { inScript: true } : {}), raw: u.raw, path: u.path || null, attr: u.attr || null,
    ...(u.parts ? { parts: u.parts.map((p) => ({ ...p, start: p.start - u.start, end: p.end - u.start })) } : {}),
  };
}

let checks = new Map(); // key → {status, reason}
async function check(list) {
  checks = new Map(list.filter(([k]) => meta.get(k).kind === 'free').map(([k]) => [k, { status: 'cant', reason: 'not found in the source' }]));
  const units = list.filter(([k]) => meta.get(k).kind === 'unit');
  if (!units.length) return;
  try {
    const r = await api('copy-map/check', { method: 'POST', body: JSON.stringify({ edits: units.map(([k, to]) => ({ unit: unitPayload(meta.get(k).unit), to })) }) });
    if (!r.ok) return;
    const { results } = await r.json();
    units.forEach(([k], i) => checks.set(k, results[i]));
  } catch { /* offline: save says so */ }
}

const STATUS = {
  ok: ['', ''], already: ['Already says this', ''], moved: ['Moved, found once', 'warn'],
  cant: ['Can’t place: saves as a find-and-replace note', 'bad'],
};

let reviewing = false, reviewScroll = 0;
async function openReview() {
  const list = pending();
  if (!list.length) return;
  await check(list);
  const body = $('#review-body');
  body.replaceChildren();
  const byFile = new Map();
  for (const [k, to] of list) { const f = fileOf(k); if (!byFile.has(f)) byFile.set(f, []); byFile.get(f).push([k, to]); }
  for (const [file, changes] of byFile) {
    const fh = el('div', 'file-hd');
    fh.append(icon(FILE), el('span', null, file), el('span', 'sub', plural(changes.length, 'edit')));
    body.append(fh);
    for (const [k, to] of changes) {
      const m = meta.get(k);
      const c = el('div', 'change');
      const w = el('div', 'where');
      const u = m.unit;
      w.append(el('span', null, u ? [u.path && /\[|\./.test(u.path) ? u.path : m.label, `line ${u.line}`].join(' · ') : m.label));
      const st = checks.get(k);
      if (st && STATUS[st.status]?.[0]) {
        const [label, tone] = STATUS[st.status];
        const s = el('span', `st ${tone}`);
        s.append(icon(tone === 'bad' || tone === 'warn' ? WARN : INFO), label);
        if (st.reason) s.title = st.reason;
        w.append(s);
      }
      const undo = el('button', 'quiet undo'); undo.type = 'button';
      undo.append(icon(UNDO), 'Undo');
      undo.addEventListener('click', () => {
        revert(k); c.remove();
        if (!pending().length) closeReview(); else reviewTitle();
      });
      w.append(undo);
      const before = el('div', 'line before'); before.append(el('span', 'sign', '−'), el('span', null, original.get(k)));
      const after = el('div', 'line after'); after.append(el('span', 'sign', '+'), el('span', null, to));
      c.append(w, before, after);
      body.append(c);
    }
  }
  const note = el('p', 'review-note');
  note.append(icon(INFO), el('span', null, 'Save adds one note per string to your round, sharing a batch. The agent writes each at its exact place, and searches for the ones that can’t be placed.'));
  body.append(note);
  const invalid = [...current.keys()].filter((k) => unsaved(k) && !validate(k, current.get(k)));
  if (invalid.length) {
    const fix = el('p', 'review-note warn');
    const go2 = el('button', 'quiet', 'Show it'); go2.type = 'button';
    go2.addEventListener('click', () => { closeReview(); const f = (fields.get(invalid[0]) || []).find((x) => x.closest('#doc')); f?.scrollIntoView({ block: 'center' }); f?.focus(); });
    fix.append(icon(WARN), el('span', null, `${plural(invalid.length, 'edit')} need${invalid.length === 1 ? 's' : ''} a fix first, so ${invalid.length === 1 ? 'it isn’t' : 'they aren’t'} listed here.`), go2);
    body.prepend(fix);
  }
  reviewing = true;
  reviewScroll = scrollY;
  document.body.classList.add('reviewing');
  $('#layout').hidden = true; $('#review').hidden = false;
  for (const x of ['#find', '#filter-wrap', '#find-phone', '#review-open', '#discard']) $(x).classList.add('off');
  reviewTitle();
  scrollTo(0, 0);
}
function reviewTitle() {
  const list = pending();
  const files = new Set(list.map(([k]) => fileOf(k))).size;
  $('#title').textContent = `Review ${plural(list.length, 'edit')}`;
  $('#crumb').textContent = plural(files, 'file');
  $('#back-label').textContent = 'Back to editing';
  $('#back-phone').setAttribute('aria-label', 'Back to editing');
}
function closeReview() {
  reviewing = false;
  document.body.classList.remove('reviewing');
  $('#layout').hidden = false; $('#review').hidden = true;
  for (const x of document.querySelectorAll('.off')) x.classList.remove('off');
  $('#title').textContent = 'All text';
  $('#crumb').textContent = crumbText;
  $('#back-label').textContent = 'Back to page';
  $('#back-phone').setAttribute('aria-label', 'Back to page');
  scrollTo(0, reviewScroll);
}

function hash(s, seed = 0x811c9dc5) {
  let h = seed;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
/**
 * A note's client id: whose it is and which string, hashed to a fixed length
 * (the API keeps 128 characters, and a long path must not cut off what makes it
 * unique), plus this view's batch, so a string whose earlier note was closed
 * gets a new note rather than reopening the old row. Revising an open note
 * goes by its server id (PATCH), not by this.
 */
function noteId(prefix, identity) {
  const who = snap.reviewer || '';
  return `${prefix}:${hash(`${who}|${identity}`)}${hash(`${who}|${identity}`, 0x01000193)}:${batch}`;
}

function noteFor(key, to) {
  const m = meta.get(key);
  const common = { url: snap.url, intent: 'edit', viewport: snap.viewport || undefined, ...(snap.reviewer ? { reviewer: snap.reviewer } : {}), comment: `Change to: "${collapse(to)}"` };
  // Text that can't be placed goes as an ordinary FROM → TO note: `apply` searches for it.
  if (m.kind === 'free' || checks.get(key)?.status === 'cant') {
    return { ...common, id: noteId('copyview', `${m.item?.selector || ''}|${original.get(key)}`), kind: 'edit', element: m.item?.tag || m.unit?.tag || '', elementPath: m.item?.selector || m.unit?.path || '', edit: { id: `copyview:${key}`, from: collapse(original.get(key)), to: collapse(to) } };
  }
  const u = m.unit;
  // Same unit and same old text → same note: saving again revises it instead of adding another.
  return { ...common, id: noteId('copy', `${u.file}|${u.start}|${u.raw}`), kind: 'copy', element: u.tag || u.kind, elementPath: u.path || '', copy: { batch, from: original.get(key), to, unit: unitPayload(u) } };
}

async function ensureSession() {
  if (snap.sessionId) return snap.sessionId;
  const r = await api('sessions', { method: 'POST', body: JSON.stringify({ url: snap.url }) });
  if (!r.ok) throw new Error(`could not start a session (${r.status})`);
  snap.sessionId = (await r.json()).id;
  return snap.sessionId;
}

async function save() {
  const list = pending();
  if (!list.length) return;
  if (!reviewing) await check(list);
  const button = $('#save');
  button.disabled = true; button.textContent = 'Saving…';
  let ok = 0, failed = 0;
  try {
    const sid = await ensureSession();
    await refreshSent(); // an agent may have closed some since they were saved
    for (const [key, to] of list) {
      try {
        const prior = sent.get(key);
        const live = prior && (prior.status === 'pending' || prior.status === 'acknowledged');
        if (isOriginal(key, to)) {
          // Back to how it was: withdraw the open note instead of asking for "no change".
          if (live) {
            const r = await api(`annotations/${prior.annotationId}${snap.reviewer ? `?reviewer=${encodeURIComponent(snap.reviewer)}` : ''}`, { method: 'DELETE' });
            if (!r.ok && r.status !== 409) throw new Error(String(r.status));
          }
          sent.delete(key); current.delete(key); paint(key); ok++;
          continue;
        }
        const note = noteFor(key, to);
        let r;
        if (live && prior.kind === note.kind) {
          r = await api(`annotations/${prior.annotationId}`, { method: 'PATCH', body: JSON.stringify(note.kind === 'copy' ? { copy: { to }, comment: note.comment } : { edit: { to: note.edit.to }, comment: note.comment }) });
        } else {
          r = await api(`sessions/${sid}/annotations`, { method: 'POST', body: JSON.stringify(note) });
        }
        if (!r.ok) throw new Error(String(r.status));
        const saved = await r.json();
        sent.set(key, { annotationId: saved.id, to, status: saved.status || 'pending', kind: note.kind });
        paint(key);
        ok++;
      } catch { failed++; }
    }
  } catch (e) { toast(`Couldn’t save: ${e.message}. Your edits are kept.`); }
  if (reviewing) closeReview();
  saveDrafts();
  summary();
  if (ok) toast(`Saved ${plural(ok, 'edit')}${failed ? `; ${failed} failed, try again` : ''}. They’re in the agent’s queue.`);
  else if (failed) toast('Nothing was saved. Is the review server still running? Your edits are kept.');
}

let toastTimer = 0;
function toast(text, action, ms = 5000) {
  const t = $('#toast');
  t.replaceChildren(el('span', null, text));
  if (action) {
    const b = el('button', 'toast-action', action[0]); b.type = 'button';
    b.addEventListener('click', () => { action[1](); t.hidden = true; });
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

/** Current status of every note saved from this view (an agent may have resolved or dismissed some). */
async function refreshSent() {
  if (!snap.sessionId || !sent.size) return;
  try {
    const r = await api(`sessions/${snap.sessionId}`);
    if (!r.ok) return;
    const byId = new Map(((await r.json()).annotations || []).map((a) => [a.id, a.status]));
    for (const s of sent.values()) if (byId.has(s.annotationId)) s.status = byId.get(s.annotationId);
  } catch { /* offline: save will say so */ }
}

/** Notes already saved for these strings (an earlier visit), so they show as saved. */
async function loadSent() {
  if (!snap.sessionId) return;
  try {
    const r = await api(`sessions/${snap.sessionId}`);
    if (!r.ok) return;
    const { annotations = [] } = await r.json();
    const byUnit = new Map();
    for (const [key, m] of meta) if (m.kind === 'unit') byUnit.set(`${m.unit.file}:${m.unit.start}:${m.unit.raw}`, key);
    for (const a of annotations) {
      if (a.kind !== 'copy' || !a.copy?.unit || !['pending', 'acknowledged'].includes(a.status)) continue;
      // Only my own notes: another reviewer's edit of the same string stays theirs.
      if ((a.reviewer || '').toLowerCase() !== (snap.reviewer || '').toLowerCase()) continue;
      const u = a.copy.unit;
      const key = byUnit.get(`${u.file}:${u.start}:${u.raw}`);
      if (!key) continue;
      sent.set(key, { annotationId: a.id, to: a.copy.to, status: a.status, kind: 'copy' });
      if (!current.has(key)) { current.set(key, a.copy.to); for (const f of fields.get(key) || []) fill(f, a.copy.to); }
    }
  } catch { /* offline: drafts still work */ }
}

// ---------------------------------------------------------------------------
// Phone: one string at a time, its details with it, arrows to the next.

let editing = null, editorField = null;
function openEditor(key) {
  editing = key;
  const m = meta.get(key);
  const body = $('#editor-body');
  if (editorField) fields.set(editorField.dataset.key, (fields.get(editorField.dataset.key) || []).filter((f) => f !== editorField));
  body.replaceChildren();
  editorField = field(key, current.get(key) ?? original.get(key));
  body.append(editorField);
  const where = el('div', 'editor-where');
  where.append(m.unit ? mono(`${m.unit.file}:${m.unit.line}`) : el('span', 'warn', 'Not found in the source'), el('span', 'state'));
  const was = el('div', 'was');
  was.append(el('b', null, 'Was'), el('span', null, original.get(key)));
  body.append(where, was);
  $('#editor-title').textContent = m.unit?.path && m.label === 'Text' ? m.unit.path : m.label || 'Text';
  $('#editor').hidden = false;
  paintEditor();
  validate(key, current.get(key) ?? original.get(key));
  const i = order.indexOf(key);
  $('#prev').disabled = i <= 0; $('#next').disabled = i === -1 || i >= order.length - 1;
  editorField.focus();
  const r = document.createRange(); r.selectNodeContents(editorField); r.collapse(false);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
function paintEditor() {
  if (!editing) return;
  const st = $('#editor-body .state');
  if (st) { st.textContent = unsaved(editing) ? '· Edited' : savedNow(editing) ? '· Saved' : ''; st.className = `state${savedNow(editing) && !unsaved(editing) ? ' sent' : ''}`; }
  const was = $('#editor-body .was');
  if (was) was.hidden = !current.has(editing);
  $('#editor-undo').disabled = !unsaved(editing);
}
function closeEditor() {
  if (editorField) fields.set(editing, (fields.get(editing) || []).filter((f) => f !== editorField));
  const key = editing;
  editing = null; editorField = null;
  $('#editor').hidden = true;
  const back = (fields.get(key) || []).find((f) => f.closest('#doc'));
  back?.scrollIntoView({ block: 'center' });
  back?.focus({ preventScroll: true });
}
function stepEditor(dir) {
  const visible = order.filter((k) => (fields.get(k) || []).some((f) => f.closest('#doc') && f.offsetParent));
  const i = visible.indexOf(editing);
  const next = visible[i + dir];
  if (next) openEditor(next);
}

// ---------------------------------------------------------------------------

let crumbText = '';
async function main() {
  if (!id) return fail('Open this from the page', 'Use Edit text → All text in the toolbar (Shift T). It opens this view with the page’s current text.');
  let r;
  try { r = await api(`copy-map/snapshot?id=${encodeURIComponent(id)}`); } catch { return fail('The review server isn’t answering', 'Start it again, then open All text from the page.'); }
  if (!r.ok) return fail('This view has expired', 'Open it again from the page: Edit text → All text (Shift T).');
  snap = await r.json();
  U = snap.placed.units;
  let path = snap.url;
  try { const u = new URL(snap.url); path = u.pathname + u.search; } catch {}
  // Which page this is, in words first: "Fieldnote pricing · /pricing".
  crumbText = [collapse(snap.title || snap.placed?.title || ''), path].filter(Boolean).join('  ·  ');
  $('#crumb').textContent = crumbText;
  if (/^https?:\/\//i.test(snap.url)) $('#crumb').href = snap.url;
  document.title = `All text · ${path}`;
  render();
  buildMenu();
  loadDrafts();
  await loadSent();
  for (const k of new Set([...current.keys(), ...sent.keys()])) { validate(k, current.get(k) ?? original.get(k)); paint(k); }
  summary();
  $('#layout').hidden = false; $('#bar').hidden = false;
  filter();
  mark(sections.find((s) => s.items.length));
  $('#search').addEventListener('input', filter);
  $('#search').addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.target.value = ''; filter(); e.target.blur(); $('#find').classList.remove('open'); } });
  $('#find-phone').addEventListener('click', () => { $('#find').classList.add('open'); $('#search').focus(); });
  $('#search').addEventListener('blur', () => { if (!$('#search').value) $('#find').classList.remove('open'); });
  $('#filter-btn').addEventListener('click', () => ($('#filter-menu').hidden ? openMenu() : closeMenu()));
  addEventListener('click', (e) => { if (!$('#filter-menu').hidden && !e.target.closest('#filter-wrap')) closeMenu(); });
  $('#jump').addEventListener('change', (e) => { const sec = sections.find((s) => s.id === e.target.value); if (sec) go(sec); });
  $('#save').addEventListener('click', save);
  $('#review-open').addEventListener('click', openReview);
  $('#discard').addEventListener('click', () => {
    const before = [...current].filter(([k]) => unsaved(k));
    for (const [k] of before) revert(k);
    toast(`Discarded ${plural(before.length, 'edit')}.`, ['Undo', () => {
      for (const [k, v] of before) { current.set(k, v); for (const f of fields.get(k) || []) fill(f, v); validate(k, v); paint(k); }
      saveDrafts(); summary();
    }], 10000);
  });
  $('#editor-close').addEventListener('click', closeEditor);
  $('#editor-done').addEventListener('click', closeEditor);
  $('#editor-undo').addEventListener('click', () => { if (editing) { revert(editing); paintEditor(); } });
  for (const b of ['#prev', '#next', '#editor-done']) $(b).addEventListener('mousedown', (e) => e.preventDefault());
  $('#prev').addEventListener('click', () => stepEditor(-1));
  $('#next').addEventListener('click', () => stepEditor(1));
  const back = () => {
    if (reviewing) return closeReview();
    // This tab was opened from the page: closing it returns there. Opened some other way, go to the page.
    window.close();
    setTimeout(() => { if (/^https?:\/\//i.test(snap.url)) location.href = snap.url; }, 150);
  };
  $('#back').addEventListener('click', back);
  $('#back-phone').addEventListener('click', back);
  matchMedia(PHONE).addEventListener('change', setEditable);
  $('#filter-menu').addEventListener('keydown', menuKeys);
  addEventListener('keydown', (e) => {
    const typing = e.target.closest?.('input, select, textarea, [contenteditable="true"]');
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !reviewing) { e.preventDefault(); $('#search').focus(); }
    if (e.key === 'Escape') {
      if (!$('#filter-menu').hidden) { closeMenu(); $('#filter-btn').focus(); } else if (editing) closeEditor(); else if (reviewing && !typing) closeReview();
    }
  });
  addEventListener('beforeunload', (e) => { if (pending().length) { e.preventDefault(); e.returnValue = ''; } });
  window.__COPY_VIEW__ = { ready: true, pending: () => pending().map(([k, v]) => ({ key: k, to: v })) };
}

function fail(title, text) {
  const n = $('#notice');
  n.replaceChildren(el('h1', null, title), el('p', null, text));
  n.hidden = false;
  window.__COPY_VIEW__ = { ready: true, error: title };
}

main();
