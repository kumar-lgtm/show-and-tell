// Join the page's outline (toolbar/copy-outline.js) with the copy found in source
// (server/copy-map.js), so copy edit mode can show every string where it lives.
//
//   - A DOM item gets the source units that render it (`units`): an exact text
//     match, a template whose fixed words match, or pieces that cover it.
//   - Copy held in data (`const recordData = [...]`) is shown whole, as a pool,
//     right after the first place on the page one of its strings appears. The
//     other DOM items it renders (42 floating cards) fold into that pool.
//   - What never matched goes under "Elsewhere in the code", by file and owner:
//     canvas labels, lines that only appear after an interaction, dead copy.
//
// With the scripts the page loaded (`outline.resources`), "elsewhere" is limited
// to the files this page uses. Without a usable list (a bundle), it is the project.
import { relative, isAbsolute, sep } from 'node:path';
import { groupUnits } from './copy-map.js';
import { displayText, relativeParts } from './copy-edit.js';

const collapse = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const letters = (s) => (String(s).match(/\p{L}/gu) || []).length;

/** A regex for a template unit's rendered text: fixed parts literal, `${…}` anything. */
function templatePattern(u) {
  if (!u.parts || !u.parts.some((p) => p.expr != null)) return null;
  const fixed = u.parts.filter((p) => p.expr == null).map((p) => u.raw.slice(p.start - u.start, p.end - u.start)).join('');
  // `b. ${born}` is enough to recognise "b. 1988"; `${n}` alone matches anything.
  if (!letters(fixed) || fixed.replace(/\s/g, '').length < 2) return null;
  let src = '';
  for (const p of u.parts) {
    if (p.expr != null) src += '[\\s\\S]+?';
    else src += collapse(u.raw.slice(p.start - u.start, p.end - u.start)).split(' ').map(esc).join('\\s+');
  }
  try { return new RegExp(`^\\s*${src}\\s*$`, 'u'); } catch { return null; }
}

/** Map the page's script URLs to files in the copy map. */
export function pageFiles(outline, map) {
  const known = new Set(map.files);
  const out = new Set();
  const toRel = (url) => {
    let path;
    try { path = decodeURIComponent(new URL(url, outline.url || 'http://x/').pathname); } catch { return null; }
    if (path.startsWith('/@fs/')) {
      const abs = path.slice(4);
      const rel = relative(map.root, abs);
      return rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel.split(sep).join('/') : null;
    }
    const rel = path.replace(/^\/+/, '');
    // The page may be served from a subfolder of --src, or --src may be a subfolder of what is served.
    if (known.has(rel)) return rel;
    for (const f of known) if (rel.endsWith(`/${f}`) || f.endsWith(`/${rel}`)) return f;
    return null;
  };
  for (const r of outline.resources || []) { const f = toRel(r); if (f) out.add(f); }
  // The page's own HTML.
  try {
    const path = decodeURIComponent(new URL(outline.url).pathname).replace(/^\/+/, '');
    for (const c of [path, `${path}index.html`, `${path}.html`, `${path}/index.html`].map((p) => p.replace(/^\/+/, ''))) {
      const f = toRel(`/${c}`);
      if (f && /\.html?$/.test(f)) { out.add(f); break; }
    }
  } catch {}
  return out;
}

/**
 * @param {{url, items, resources}} outline   from toolbar/copy-outline.js
 * @param {{root, files, units}} map           from extractCopy()
 */
export function placeCopy(outline, map) {
  const copyUnits = map.units.filter((u) => u.copy !== 'no');
  const scoped = pageFiles(outline, map);
  const scripts = [...scoped].filter((f) => !/\.html?$/.test(f));
  const scope = scripts.length ? 'page' : 'project';
  const inScope = (u) => scope === 'project' || scoped.has(u.file);

  const byText = new Map();
  for (const u of copyUnits) {
    const k = collapse(u.text);
    if (!byText.has(k)) byText.set(k, []);
    byText.get(k).push(u);
  }
  const templates = copyUnits.filter((u) => u.kind === 'template' || (u.parts && u.parts.some((p) => p.expr != null))).map((u) => [u, templatePattern(u)]).filter(([, re]) => re);
  // Prefer units in this page's files, and HTML text over a JS string with the same words.
  const rank = (u) => (inScope(u) ? 0 : 2) + (u.kind === 'html-text' || u.kind === 'html-attr' ? 0 : 1);

  // Data already shown on the page wins a tie: the next "Halifax" on the map
  // comes from the same CITIES that the first city did, not from another list.
  const placedKeys = new Set();
  const best = (list) => [...list].sort((a, b) => (placedKeys.has(poolKey(b)) - placedKeys.has(poolKey(a))) || rank(a) - rank(b));

  // The same words written several times in the page's markup ("Start free
  // trial" in each plan): the nth one on the page is the nth one in the file.
  const nth = new Map();
  const shown = new Map(); // text → how many times the page shows it (text and headings)
  for (const raw of outline.items || []) if (raw.type === 'text' || raw.type === 'heading') { const k = collapse(raw.text); shown.set(k, (shown.get(k) || 0) + 1); }
  function match(item) {
    const text = collapse(item.text);
    if (!text) return [];
    const exact = byText.get(text);
    if (exact) {
      let sorted = best(exact);
      const twins = item.type === 'attr' ? [] : sorted.filter((u) => u.kind === 'html-text' && rank(u) === rank(sorted[0]) && u.file === sorted[0].file).sort((a, b) => a.line - b.line || (a.start ?? 0) - (b.start ?? 0));
      // Only when the counts agree: a copy the page doesn't render, or one it repeats, makes the order a guess.
      if (twins.length > 1 && sorted[0].kind === 'html-text' && shown.get(text) === twins.length) {
        const k = nth.get(text) || 0; nth.set(text, k + 1);
        const mine = twins[k % twins.length];
        sorted = [mine, ...sorted.filter((u) => u !== mine)];
      }
      // Several identical strings: all of them render this text somewhere; list the likeliest first.
      return item.type === 'attr' ? sorted.filter((u) => !u.attr || u.attr === item.attr || u.kind === 'string' || u.kind === 'template').slice(0, 3) : sorted.slice(0, 3);
    }
    for (const [u, re] of templates) if (re.test(text)) return [u];
    if (item.type === 'attr') return [];
    // Pieces: units whose text is a whole piece, or a long run inside the text.
    const pieces = new Set(item.pieces || []);
    const found = [];
    let covered = 0;
    for (const [k, list] of byText) {
      if (k.length < 2 || !(pieces.has(k) || (k.length >= 4 && text.includes(k)))) continue;
      // Every word-bounded occurrence counts ("myself" four times over in a stutter effect).
      const hits = (text.match(new RegExp(`(?:^|(?<=[^\\p{L}]))${esc(k)}(?=$|[^\\p{L}])`, 'gu')) || []).length;
      if (!hits) continue;
      found.push(best(list)[0]);
      covered += letters(k) * hits;
    }
    // A piece found but most of the text unexplained is a coincidence, not a source.
    return covered >= letters(text) * 0.6 ? found.sort((a, b) => text.indexOf(collapse(a.text)) - text.indexOf(collapse(b.text))) : [];
  }

  // Data pools: copy owned by a declaration (an array or object of strings).
  // Not a data list: copy assigned straight to the DOM (`el.textContent = [...][i]`).
  const DOM_PROP = /(^|\.)(textContent|innerText|innerHTML|outerHTML|title|alt|placeholder|value|label|ariaLabel)$/;
  const poolKey = (u) => (u.ownerAt != null && /^[A-Za-z_$][\w$.]*$/.test(u.owner || '') && !/\(\)$/.test(u.owner) && !DOM_PROP.test(u.owner) ? `${u.file}|${u.owner}|${u.ownerAt}` : null);
  const pools = new Map();
  for (const u of copyUnits) {
    const k = poolKey(u);
    if (!k) continue;
    if (!pools.has(k)) pools.set(k, []);
    pools.get(k).push(u);
  }

  const items = [];
  const used = new Set();
  const placedPools = new Map(); // key → pool item id
  const seen = new Map();         // type|text|selector → item (fold repeats)
  let poolSeq = 0;
  for (const raw of outline.items || []) {
    if (raw.type === 'landmark') { items.push({ ...raw }); continue; }
    // Repeats fold within one part of the page; the same button in the next card is that card's.
    const fold = `${raw.type}|${raw.attr || ''}|${collapse(raw.text)}|${raw.selector || ''}|${raw.lm ?? ''}`;
    if (seen.has(fold)) { seen.get(fold).count = (seen.get(fold).count || 1) + 1; continue; }
    const units = match(raw);
    const exact = byText.has(collapse(raw.text));
    const item = { ...raw, units: units.map((u) => u.id) };
    seen.set(fold, item);
    for (const u of units) used.add(u.id);
    // An exact match names one source (the likeliest); pieces each name their own.
    const keys = [...new Set((exact ? units.slice(0, 1) : units).map(poolKey).filter(Boolean))].filter((k) => pools.get(k).length > 1);
    // Every unit it matched sits in a pool already shown: one of many renders of that data.
    if (keys.length && keys.every((k) => placedPools.has(k))) {
      item.pool = placedPools.get(keys[0]);
      const pool = items.find((x) => x.id === item.pool);
      pool.renders = (pool.renders || 0) + 1;
      continue;
    }
    items.push(item);
    for (const k of keys) {
      if (placedPools.has(k)) { item.pool = placedPools.get(k); continue; }
      const list = pools.get(k);
      const id = `pool-${++poolSeq}`;
      placedPools.set(k, id); placedKeys.add(k);
      for (const u of list) used.add(u.id);
      items.push({ type: 'pool', id, depth: raw.depth, lm: raw.lm, owner: list[0].owner, file: list[0].file, line: list[0].line, units: list.map((u) => u.id), renders: 1 });
    }
  }

  const rest = copyUnits.filter((u) => !used.has(u.id) && inScope(u) && !(scope === 'page' && /\.html?$/.test(u.file) && !scoped.has(u.file)));
  // HTML text that never rendered on this page belongs to another page, or is hidden behind script.
  const elsewhere = groupUnits(rest).map(({ file, groups }) => ({ file, groups: groups.map((g) => ({ owner: g.owner, line: g.line, units: g.items.map((u) => u.id) })) }));

  // Strings judged to be code, in the same files: hidden by default, shown on request,
  // so a wrong verdict never hides copy for good. Markup containers are listed piece by piece already.
  const codeUnits = map.units.filter((u) => u.copy === 'no' && inScope(u) && !(scope === 'page' && /\.html?$/.test(u.file) && !scoped.has(u.file))
    && !/^markup /.test(u.why) && /\p{L}/u.test(u.text));
  const code = groupUnits(codeUnits, { include: ['no'] }).map(({ file, groups }) => ({ file, groups: groups.map((g) => ({ owner: g.owner, line: g.line, units: g.items.map((u) => u.id) })) }));
  const referenced = new Set([...items.flatMap((i) => i.units || []), ...rest.map((u) => u.id), ...codeUnits.map((u) => u.id)]);
  // `display` is the text the copy view edits: decoded by the same rules an edit is written back with.
  const units = Object.fromEntries(map.units.filter((u) => referenced.has(u.id)).map((u) => [u.id, { ...u, display: displayText({ ...u, parts: relativeParts(u) }) }]));
  const dom = items.filter((i) => i.type === 'text' || i.type === 'heading' || i.type === 'attr');
  return {
    url: outline.url, root: map.root, scope, files: scope === 'page' ? [...scoped].sort() : map.files,
    items, elsewhere, code, units,
    stats: {
      onPage: dom.length,
      matched: dom.filter((i) => i.units.length).length,
      pools: placedPools.size,
      elsewhere: rest.length,
      code: codeUnits.length,
    },
  };
}

/** Plain-text view of a placed outline (for the CLI and for checking by eye). */
export function renderPlaced(placed) {
  const out = [`Copy on ${placed.url}`, `${placed.stats.onPage} on the page (${placed.stats.matched} traced to source), ${placed.stats.pools} data pools, ${placed.stats.elsewhere} elsewhere in the code · scope: ${placed.scope}`];
  const U = placed.units;
  const src = (ids) => (ids?.length ? `   ← ${ids.slice(0, 2).map((id) => `${U[id].file}:${U[id].line}${U[id].path ? ` ${U[id].path}` : ''}`).join(', ')}${ids.length > 2 ? ', …' : ''}` : '   ← (not found in source)');
  const pad = (d) => '  '.repeat(Math.max(0, d));
  for (const it of placed.items) {
    if (it.type === 'landmark') { out.push('', `${pad(it.depth)}▸ ${it.kind}${it.label ? `: ${it.label}` : ''}`); continue; }
    if (it.type === 'pool') {
      out.push(`${pad(it.depth)}  ⟦${it.owner}⟧ ${it.units.length} strings from ${it.file}:${it.line}${it.renders > 1 ? ` · rendered ${it.renders}×` : ''}`);
      for (const id of it.units.slice(0, 6)) out.push(`${pad(it.depth)}      ${U[id].path ? `${U[id].path.replace(it.owner, '')}  ` : ''}${JSON.stringify(U[id].text)}`);
      if (it.units.length > 6) out.push(`${pad(it.depth)}      … ${it.units.length - 6} more`);
      continue;
    }
    const tag = it.type === 'heading' ? `h${it.level}` : it.type === 'attr' ? `[${it.attr}]` : it.tag;
    const vis = it.visibility === 'decorative' ? ' (aria-hidden)' : it.visibility === 'hidden' ? ' (hidden)' : '';
    const text = it.text.length > 90 ? `${it.text.slice(0, 87)}…` : it.text;
    out.push(`${pad(it.depth)}  ${tag}${vis}  ${JSON.stringify(text)}${it.count > 1 ? ` ×${it.count}` : ''}${src(it.units)}`);
  }
  if (placed.elsewhere.length) {
    out.push('', '▸ Elsewhere in the code (not on the page right now)');
    for (const { file, groups } of placed.elsewhere) {
      out.push(`  ${file}`);
      for (const g of groups) {
        out.push(`    ${g.owner}  (line ${g.line})`);
        for (const id of g.units.slice(0, 8)) out.push(`      ${U[id].copy === 'maybe' ? '?' : ' '} ${JSON.stringify(U[id].text.length > 90 ? `${U[id].text.slice(0, 87)}…` : U[id].text)}`);
        if (g.units.length > 8) out.push(`        … ${g.units.length - 8} more`);
      }
    }
  }
  return out.join('\n');
}

