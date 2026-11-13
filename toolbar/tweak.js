/**
 * Tweak: the fourth mode (key D), show-and-tell.pen chapter 5 (7.2).
 *
 * Click an element and a small panel shows the few properties people actually
 * ask to change: type size and weight, padding and gap, fill and text colour,
 * corner radius. It is not a design tool: no layout, no arbitrary CSS,
 * nothing structural (moving things stays in Layout moves, under More).
 *
 *   - Values start from the element's computed styles and preview live, on
 *     this page only, as inline styles. Every inline value we touch is
 *     recorded first and put back exactly on reset or when Tweak turns off.
 *   - Values snap to the project's scale (tweak-scale.js): its CSS custom
 *     properties, else the values the page already uses. Off scale is allowed
 *     and labelled.
 *   - Changes collect as drafts in the bar's strip slot ("2 tweaks", undo,
 *     Review, Save), like Edit text's. Save posts one `kind: "tweak"` note per
 *     changed property, with { selector, property, from, to, token, ruleSource }.
 *
 * The panel sits in free space BESIDE the element, never over it: you judge a
 * tweak against its neighbours, so they stay in view. On a phone it is a
 * bottom sheet (at most 55%) and the element is scrolled into the space above.
 *
 * While Tweak is on, the toolbar's own comment picker is suspended exactly as
 * it is for Edit text (the isTextEditMode seam in build.mjs listens for
 * `agentation-kit:tweak-change` too). Edit text and Tweak are never both on.
 *
 * NO BACKTICKS in the CSS below (it is a template literal).
 */
import { createHost, markChrome, slotPanel, placeToast, placeNearToolbar, freeArea, revealRect, releaseSurface, scheduleInsets, Z, failMessage, focusLost, focusMode } from './ui.js';
import { viewport } from './viewport.js';
import { playhead } from './playhead.js';
import { ensureReviewer, rememberOwn } from './reviewer.js';
import {
  PROPS, propOf, collectTokens, groupTokens, tokensFor, usedScale, parseLength, onScale,
  normColour, transparent, swatchKind, hexOf, colourName, shorthand, weightName, tokenLabel, specificity, compareSpecificity, tweakLine,
} from './tweak-scale.js';

const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';
const ICON = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  reset: '<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1.6-7.3L4 10"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};
const icon = (k, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
const CHROME = '[data-feedback-toolbar],[data-agentation-root],[data-agentation-toolbar],#agentation-root,.sk-edit-ui';
const collapse = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const r2 = (n) => Math.round(n * 100) / 100;
const pxs = (n) => `${r2(n)}px`;
const num = (n) => String(r2(n));
// Phone: a bottom sheet. Same breakpoints as the bar's phone layout (review-tools.js).
const phone = () => innerWidth < 600 || (matchMedia('(pointer:coarse)').matches && innerWidth < 640);
// Properties that inherit: their rule may live on an ancestor.
const INHERITS = new Set(['font-size', 'font-weight', 'color']);
// The names a rule can set each property under, shorthands included.
const SET_BY = {
  'font-size': ['font-size', 'font'], 'font-weight': ['font-weight', 'font'],
  padding: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-block', 'padding-inline', 'padding-block-start', 'padding-block-end', 'padding-inline-start', 'padding-inline-end'],
  gap: ['gap', 'row-gap', 'column-gap', 'grid-gap'],
  'background-color': ['background-color', 'background'], color: ['color'],
  'border-radius': ['border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
};
// A rule that only applies while hovered or focused is not where the resting style lives.
const TRANSIENT_STATE = /:(hover|focus|focus-visible|focus-within|active)\b/;

/** "a.cta", "#hero", "button": short enough to read in a label. */
export function compactSelector(el) {
  if (!el || el.nodeType !== 1) return '';
  if (el.id) return '#' + el.id;
  const cls = [...el.classList].find((c) => c && !c.startsWith('sk-'));
  return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
}
/** Up to four levels, like the text edit selector: for finding it in the source. */
function pathOf(el) {
  const parts = [];
  for (let n = el, d = 0; n && n.nodeType === 1 && d < 4; d++, n = n.parentElement) {
    if (n.tagName === 'BODY' || n.tagName === 'HTML') break;
    parts.unshift(compactSelector(n));
    if (n.id) break;
  }
  return parts.join(' > ');
}
function wordsOf(el) {
  const t = collapse(el.getAttribute?.('aria-label') || el.innerText || el.textContent || el.getAttribute?.('alt') || '');
  return t.length > 44 ? t.slice(0, 43) + '…' : t;
}

// ---- reading the page's CSS ------------------------------------------------

/** Every style rule in same-origin sheets that applies now (media, supports), ours excluded. */
function pageRules() {
  const out = [];
  const walk = (rules, sheet) => {
    for (const rule of rules) {
      if (rule.selectorText != null && rule.style) out.push({ selector: rule.selectorText, style: rule.style, sheet });
      else if (rule.cssRules) {
        if (rule.media && rule.conditionText != null && rule.constructor?.name === 'CSSMediaRule' && !matchMedia(rule.conditionText).matches) continue;
        if (rule.constructor?.name === 'CSSSupportsRule' && !CSS.supports(rule.conditionText)) continue;
        walk(rule.cssRules, sheet);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    const node = sheet.ownerNode;
    if (node && ((node.id || '').startsWith('feedback-tool-styles') || node.hasAttribute?.('data-agentation-kit-insets') || node.closest?.(CHROME))) continue;
    let rules; try { rules = sheet.cssRules; } catch { continue; } // cross-origin: unreadable, skipped
    if (rules) walk(rules, sheet);
  }
  return out;
}
function customProps(style) {
  const list = [];
  for (let i = 0; i < style.length; i++) { const n = style[i]; if (n.startsWith('--')) list.push([n, style.getPropertyValue(n)]); }
  return list;
}
function sheetName(sheet) {
  if (sheet?.href) { try { const u = new URL(sheet.href); return (u.origin === location.origin ? u.pathname.replace(/^\//, '') : u.href) || u.href; } catch { return sheet.href; } }
  return `<style> on ${location.pathname}`;
}

/** Turns tokens into px, numbers and colours with one hidden probe element. */
function makeResolver() {
  const probe = markChrome(document.createElement('div'));
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;';
  document.body.append(probe);
  const root = getComputedStyle(document.documentElement);
  const raw = (t) => root.getPropertyValue(t.name).trim() || t.value;
  const length = (v) => {
    if (!CSS.supports('width', v)) return null;
    probe.style.width = v; const w = getComputedStyle(probe).width; probe.style.width = '';
    return w.endsWith('px') ? r2(parseFloat(w)) : null;
  };
  const colour = (v) => {
    if (!CSS.supports('color', v)) return null;
    probe.style.color = v; const c = getComputedStyle(probe).color; probe.style.color = '';
    return normColour(c);
  };
  return {
    length: (t) => length(raw(t)), colour: (t) => colour(raw(t)),
    number: (t) => { const n = parseFloat(raw(t)); return Number.isFinite(n) ? n : null; },
    freeLength: length, freeColour: colour,
    /** A declared value (maybe a shorthand like background) as the computed colour it gives. */
    colourVia: (name, value, longhand) => {
      if (!CSS.supports(name, value)) return null;
      probe.style.setProperty(name, value); const c = getComputedStyle(probe).getPropertyValue(longhand); probe.style.removeProperty(name);
      return c ? normColour(c) : null;
    },
    done: () => probe.remove(),
  };
}

/** How often the page uses each value, per scale: the fallback when it has no tokens. */
function usedCounts() {
  const c = { type: new Map(), space: new Map(), radius: new Map(), weight: new Map(), colour: new Map() };
  const add = (m, v) => m.set(v, (m.get(v) || 0) + 1);
  const half = (n) => Math.round(n * 2) / 2;
  let seen = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (++seen > 2500) break;
    if (el.closest(CHROME) || /^(SCRIPT|STYLE|LINK|META|TEMPLATE|NOSCRIPT)$/.test(el.tagName) || !el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    add(c.type, half(parseFloat(cs.fontSize)));
    add(c.weight, Number(cs.fontWeight));
    for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) { const v = half(parseFloat(cs[k])); if (v) add(c.space, v); }
    if (/flex|grid/.test(cs.display)) for (const k of ['rowGap', 'columnGap']) { const v = half(parseFloat(cs[k])); if (v) add(c.space, v); }
    const rad = half(parseFloat(cs.borderTopLeftRadius)); if (rad) add(c.radius, rad);
    add(c.colour, normColour(cs.color));
    if (!transparent(cs.backgroundColor)) add(c.colour, normColour(cs.backgroundColor));
  }
  return c;
}

function computeScales() {
  const rules = pageRules();
  const tokens = collectTokens(rules.map((r) => ({ selector: r.selector, props: customProps(r.style) })).filter((r) => r.props.length), { isColour: (v) => CSS.supports('color', v) });
  const groups = groupTokens(tokens);
  const res = makeResolver();
  let used = null;
  const out = { rules, res };
  for (const s of ['type', 'space', 'radius', 'weight', 'colour']) {
    let list = tokensFor(s, groups, s === 'colour' ? res.colour : s === 'weight' ? res.number : res.length), source = 'tokens';
    if (!list.length) { used ||= usedCounts(); list = usedScale(used[s], { numeric: s !== 'colour', max: s === 'colour' ? 12 : 10 }); source = 'page'; }
    if ((s === 'space' || s === 'radius') && !list.some((e) => e.value === 0)) list.unshift({ token: null, value: 0, label: 'none' });
    if (s === 'weight') for (const e of list) e.label ||= weightName(e.value);
    out[s] = { list, source };
  }
  return out;
}

// ---- values ----------------------------------------------------------------

function readValues(el, prop) {
  const cs = getComputedStyle(el);
  const f = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? r2(n) : 0; };
  switch (prop.key) {
    case 'font-size': return [f(cs.fontSize)];
    case 'font-weight': return [Number(cs.fontWeight) || 400];
    case 'padding': return [f(cs.paddingTop), f(cs.paddingRight), f(cs.paddingBottom), f(cs.paddingLeft)];
    case 'gap': return [f(cs.rowGap), f(cs.columnGap)];
    case 'background-color': return [normColour(cs.backgroundColor)];
    case 'color': return [normColour(cs.color)];
    case 'border-radius': return [f(cs.borderTopLeftRadius), f(cs.borderTopRightRadius), f(cs.borderBottomRightRadius), f(cs.borderBottomLeftRadius)];
  }
  return [];
}
/** The parts a reviewer edits on their own: padding has two, everything else one. */
function partsOf(prop, vals) {
  if (prop.key === 'padding') return [{ part: 'v', label: 'top and bottom', value: vals[0] }, { part: 'h', label: 'left and right', value: vals[1] }];
  return [{ part: 'all', label: '', value: vals[0] }];
}
function withPart(prop, vals, part, v) {
  if (prop.key === 'padding') return part === 'v' ? [v, vals[1], v, vals[3]] : [vals[0], v, vals[2], v];
  if (prop.key === 'gap') return [v, v];
  if (prop.key === 'border-radius') return [v, v, v, v];
  return [v];
}
/** The values as the shorthand an agent would write. */
function cssOf(prop, vals) {
  if (prop.kind === 'colour') return hexOf(vals[0]);
  if (prop.key === 'font-weight') return String(vals[0]);
  if (prop.key === 'font-size') return pxs(vals[0]);
  if (prop.key === 'gap') return vals[0] === vals[1] ? pxs(vals[0]) : `${pxs(vals[0])} ${pxs(vals[1])}`;
  return shorthand(vals);
}
/** The distinct components a shorthand shows, so tokens line up with values. */
function compsOf(prop, vals) {
  if (prop.key === 'gap') return vals[0] === vals[1] ? [vals[0]] : vals;
  if (vals.length === 4) {
    const [t, r, b, l] = vals;
    if (t === r && r === b && b === l) return [t];
    if (t === b && r === l) return [t, r];
    if (r === l) return [t, r, b];
    return vals;
  }
  return vals;
}
const sameVals = (a, b) => a.length === b.length && a.every((v, i) => (typeof v === 'number' ? Math.abs(v - b[i]) < 0.01 : normColour(v) === normColour(b[i])));

// ---- the mode -------------------------------------------------------------

export function createTweak({ endpoint, sessionId }) {
  let active = false, hoverEl = null, target = null, scales = null, picker = null, view = 'strip', saving = false, error = '', frame = 0;
  const ids = new WeakMap(); let nextId = 0;
  const idOf = (el) => { if (!ids.has(el)) ids.set(el, ++nextId); return ids.get(el); };
  const drafts = new Map();          // `${id}|${prop}` -> draft
  const undoStack = [];              // { key, prev: draft | null }
  const originals = new Map();       // el -> { attr: the author's style attribute, orig: a detached copy to read it, painted: Map(longhand -> preview value) }

  const ui = createHost(`
    [hidden]{display:none!important}
    .mono{font-family:${MONO};font-size:12px}
    .hl{position:fixed;z-index:${Z.marker};pointer-events:none;border-radius:4px;box-shadow:0 0 0 2px var(--sk-accent);transition:none}
    .hl.sel{box-shadow:0 0 0 2px var(--sk-accent),0 0 0 5px color-mix(in srgb,var(--sk-accent) 22%,transparent)}
    .lbl{position:fixed;z-index:${Z.marker};pointer-events:none;display:flex;gap:7px;align-items:baseline;max-width:min(360px,calc(100vw - 24px));padding:3px 8px;border-radius:4px;background:#1D1A2F;color:rgba(255,255,255,.88);font:500 12px/1.45 var(--sk-font);white-space:nowrap;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.25)}
    .lbl .mono{color:rgba(255,255,255,.55);flex:none}.lbl .w{overflow:hidden;text-overflow:ellipsis}
    .panel{font-size:12.5px}
    .tw{width:300px;display:flex;flex-direction:column}.tw.glide{transition:left .2s ease,top .2s ease}
    .tw .hd{gap:8px;padding:8px 6px 8px 12px;font-weight:500}.tw .hd .mono{color:var(--sk-text-2);flex:none}
    .tw .hd .w{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
    .iconbtn{display:grid;place-items:center;width:28px;height:28px;padding:0;flex:none}
    .tw .body{overflow:auto;padding:2px 10px 10px;scrollbar-width:thin;flex:1;min-height:0}
    .grp{margin:10px 0 4px;font-size:12px;font-weight:600;color:var(--sk-text-2)}
    .prop{display:grid;grid-template-columns:62px minmax(0,1fr) 28px;align-items:center;gap:6px;min-height:38px}
    .prop .name{font-size:12.5px;line-height:1.25}.prop .chg{display:block;font-size:12px;color:var(--sk-text-3)}
    .field{display:flex;align-items:center;gap:8px;min-width:0;min-height:32px;padding:4px 8px;border:0;border-radius:6px;background:var(--sk-raised);box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text);font:inherit;font-size:12.5px;text-align:left;cursor:pointer}
    .field:hover{background:var(--sk-hover)}.field[aria-expanded=true]{box-shadow:inset 0 0 0 1px var(--sk-accent)}
    .field:focus-visible,.opt:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--sk-focus);outline-offset:1px}
    .tok{flex:1;min-width:0;overflow:hidden;line-height:1.3;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
    .tok.on{font-family:${MONO};font-size:12px;color:#FF9C87}:host([data-sk-theme=light]) .tok.on{color:var(--sk-accent)}
    .tok.off{color:var(--sk-text-3)}
    .val{color:var(--sk-text-2);font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
    .field svg{flex:none;color:var(--sk-text-3)}
    .sw{width:14px;height:14px;border-radius:3px;flex:none;box-shadow:inset 0 0 0 1px rgba(128,128,128,.45)}
    /* No fill is a slash, not a dark square; a dark colour gets a light ring on the dark panel (UX review 5, #16). */
    .sw.none{background:linear-gradient(to top right,transparent calc(50% - .75px),var(--sk-text-2) calc(50% - .75px),var(--sk-text-2) calc(50% + .75px),transparent calc(50% + .75px))}
    :host(:not([data-sk-theme=light])) .sw.dark{box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
    .ft{display:flex;align-items:center;gap:6px;padding:8px 12px;border-top:1px solid var(--sk-hairline);font-size:12px;color:var(--sk-text-2)}
    .ft.acts{justify-content:flex-end;padding:8px}.ft.acts .n{margin-right:auto;padding-left:4px;color:var(--sk-text)}
    .ft svg{flex:none}
    button.ghost,button.primary{font-size:12.5px;min-height:32px;padding:5px 12px}
    button.ghost.ring{box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text)}
    .strip{display:flex;align-items:center;gap:4px;padding:5px 5px 5px 12px;width:max-content;white-space:nowrap}
    .strip .n{margin-right:6px;font-weight:500}.strip .hint{color:var(--sk-text-2);padding-right:7px}
    .err{padding:8px 12px;color:#df8989;font-size:12px;overflow-wrap:anywhere}
    .pick{position:fixed;z-index:${Z.panel};width:240px;display:flex;flex-direction:column;padding:6px;font-size:12.5px}
    .pick .ph{padding:2px 6px 6px;font-size:12px;font-weight:600;color:var(--sk-text-2)}.pick .ph.note{font-weight:400;padding-top:0}
    .pick .seg{display:flex;gap:2px;margin:0 0 6px;padding:2px;border-radius:6px;background:var(--sk-raised)}
    .pick .seg button{flex:1;border:0;border-radius:4px;background:none;color:var(--sk-text-2);font:inherit;font-size:12px;min-height:28px;cursor:pointer}
    .pick .seg button[aria-pressed=true]{background:var(--sk-hover);color:var(--sk-text)}
    .pick .opts{overflow:auto;min-height:0;scrollbar-width:thin}
    /* The list scrolls, so it clips: a ring drawn outside an option lost its
       top and sides and read as a bar down one side. Inset, it shows whole. */
    .pick .opt:focus-visible{outline-offset:-2px}
    .opt{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:5px 8px;border:0;border-radius:5px;background:none;color:var(--sk-text);font:inherit;text-align:left;cursor:pointer}
    .opt:hover,.opt.cur{background:var(--sk-hover)}.opt .ck{width:14px;flex:none;visibility:hidden}.opt[aria-selected=true] .ck{visibility:visible}
    .opt .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.opt .nm.mono{font-size:12px}
    .pick hr{border:0;border-top:1px solid var(--sk-hairline);margin:5px 2px}
    .was{display:flex;justify-content:space-between;gap:8px;color:var(--sk-text-2)}
    .free{display:flex;gap:6px;align-items:center;padding:4px 2px 0}
    .free input{flex:1;min-width:0;min-height:30px;padding:4px 8px;border:0;border-radius:5px;background:var(--sk-raised);box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text);font:12px/1.3 ${MONO}}
    .free .ghost{min-height:30px;padding:4px 9px}
    .rv{width:340px;display:flex;flex-direction:column}.rv .body{overflow:auto;padding:8px 10px;flex:1;min-height:0}
    .rv .el{display:flex;gap:8px;align-items:baseline;margin:6px 2px 6px;min-width:0}.rv .el:first-child{margin-top:0}
    .rv .el button{border:0;background:none;padding:0;color:var(--sk-text);font:inherit;font-weight:500;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
    .rv .el .mono{color:var(--sk-text-2);flex:none}
    .tk{display:grid;grid-template-columns:minmax(0,1fr) 28px;gap:2px 6px;align-items:center;margin:0 0 6px;padding:8px 6px 8px 10px;border-radius:6px;background:var(--sk-raised)}
    .tk .ln{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;min-width:0}
    .tk .ln .mono{color:var(--sk-text-2)}.tk .to{font-weight:600}.tk .from{color:var(--sk-text-2)}
    .tk .sub{grid-column:1/-1;font-size:12px;color:var(--sk-text-2);overflow-wrap:anywhere}
    .tk .sub .mono{font-size:12px}
    @media (pointer:coarse){
      .field,.opt,.pick .seg button,.free input,.free .ghost,button.ghost,button.primary{min-height:44px}
      .iconbtn{width:44px;height:44px}.prop{grid-template-columns:62px minmax(0,1fr) 44px;min-height:48px}
      .tk{grid-template-columns:minmax(0,1fr) 44px}
    }
  `);
  const { root } = ui;
  const hl = document.createElement('div'); hl.className = 'hl'; hl.hidden = true;
  const sel = document.createElement('div'); sel.className = 'hl sel'; sel.hidden = true;
  const lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.hidden = true;
  const panel = document.createElement('section'); panel.className = 'panel tw'; panel.hidden = true; panel.setAttribute('role', 'dialog');
  const bar = document.createElement('section'); bar.className = 'panel'; bar.hidden = true; bar.setAttribute('aria-label', 'Tweaks');
  const pick = document.createElement('div'); pick.className = 'panel pick'; pick.hidden = true; pick.setAttribute('role', 'dialog');
  root.append(hl, sel, lbl, panel, bar, pick);
  // Typing a custom value must not reach the toolbar's single-key shortcuts
  // (X clears, P pauses): its document listener sees our host, not an input.
  root.addEventListener('keydown', (e) => { if (e.composedPath()[0]?.matches?.('input')) e.stopPropagation(); });

  // ---- inline previews, restored exactly ----
  // Snapshot the whole style attribute, not longhands: a shorthand such as
  // padding:var(--space) has no longhand values to read back, so restoring
  // longhands deleted it. Restoring puts the author's attribute back exactly,
  // then re-applies whatever is still being previewed.
  function remember(el) {
    let o = originals.get(el);
    if (!o) { const orig = document.createElement('div'); const attr = el.getAttribute('style'); if (attr != null) orig.setAttribute('style', attr); o = { attr, orig, painted: new Map() }; originals.set(el, o); }
    return o;
  }
  function restore(el, longhands) {
    const o = originals.get(el); if (!o) return;
    for (const lh of longhands) o.painted.delete(lh);
    if (o.attr == null) el.removeAttribute('style'); else el.setAttribute('style', o.attr);
    for (const [lh, v] of o.painted) el.style.setProperty(lh, v, 'important');
    if (!o.painted.size) originals.delete(el);
  }
  function paint(d) {
    const prop = propOf(d.property);
    const vals = prop.kind === 'colour' ? d.toVals : d.toVals.map((v) => (prop.key === 'font-weight' ? String(v) : pxs(v)));
    const o = remember(d.el);
    prop.longhands.forEach((lh, i) => { const v = vals[Math.min(i, vals.length - 1)]; o.painted.set(lh, v); d.el.style.setProperty(lh, v, 'important'); });
  }
  function unpaint(el, prop) { restore(el, prop.longhands); }
  function restoreAll() { for (const el of [...originals.keys()]) restore(el, [...originals.get(el).painted.keys()]); }

  // ---- drafts ----
  const keyOf = (el, prop) => `${idOf(el)}|${prop}`;
  const scaleOf = (prop, sc = scales) => sc?.[prop.scale] || { list: [], source: 'page' };
  /** Token names and whether every component sits on the scale. */
  function tokenInfo(prop, vals, sc = scales) {
    const s = scaleOf(prop, sc);
    const hits = compsOf(prop, vals).map((v) => onScale(v, s.list));
    const names = hits.map((e) => e?.token || null);
    return {
      token: names.some(Boolean) ? names.map((n) => n || 'off scale').join(' · ') : null,
      onScale: hits.every(Boolean), source: s.source, hits,
    };
  }
  /**
   * The rule that wins for `names` on `node`, by specificity then order:
   * `any` over every rule, `rest` over those not tied to :hover or :focus.
   */
  function winningRule(rules, node, names) {
    let any = null, rest = null;
    for (const r of rules) {
      // A shorthand holding var() leaves its longhands empty in the CSSOM, so
      // ask under every name the property can be set by.
      const name = names.find((n) => r.style.getPropertyValue(n));
      if (!name) continue;
      const value = r.style.getPropertyValue(name);
      for (const part of r.selector.split(/,(?![^(]*\))/)) {
        const s = part.trim(); if (!s) continue;
        let ok = false; try { ok = node.matches(s); } catch { /* selector the engine rejects */ }
        if (!ok) continue;
        const hit = { sp: specificity(s), selector: s, sheet: r.sheet, name, value, transient: TRANSIENT_STATE.test(s) };
        if (!any || compareSpecificity(hit.sp, any.sp) >= 0) any = hit;
        if (!hit.transient && (!rest || compareSpecificity(hit.sp, rest.sp) >= 0)) rest = hit;
      }
    }
    return { any, rest };
  }
  /**
   * The values to start from. Computed styles, except a colour the reviewer
   * is only seeing because the element is hovered or focused (a tap leaves
   * :hover stuck on a phone): that starts from the resting rule instead.
   */
  function valuesOf(el, prop) {
    const vals = readValues(el, prop);
    if (prop.kind !== 'colour' || !scales) return vals;
    let state = false; try { state = el.matches(':hover,:active,:focus'); } catch { /* old engine */ }
    if (!state) return vals;
    const { any, rest } = winningRule(scales.rules, el, SET_BY[prop.key]);
    if (!any?.transient || !rest) return vals;
    const resting = scales.res.colourVia(rest.name, rest.value, prop.longhands[0]);
    return resting ? [resting] : vals;
  }
  function ruleSource(el, prop) {
    // Our own previews are inline too: only the page's own inline style counts.
    const o = originals.get(el);
    const ours = prop.longhands.some((lh) => o?.painted.has(lh));
    const inlineOf = (n) => (o ? o.orig.style.getPropertyValue(n) : el.style.getPropertyValue(n));
    if ((ours ? prop.longhands : SET_BY[prop.key]).some(inlineOf)) return { href: 'style attribute', selector: compactSelector(el) };
    const names = SET_BY[prop.key];
    const rules = scales?.rules || [];
    const find = (node) => winningRule(rules, node, names).rest;
    let hit = find(el), inherited = false;
    if (!hit && INHERITS.has(prop.key)) for (let n = el.parentElement; n && !hit; n = n.parentElement) { hit = find(n); inherited = !!hit; }
    return hit ? { href: sheetName(hit.sheet), selector: hit.selector, ...(inherited ? { inherited: true } : {}) } : null;
  }

  function setValue(el, prop, vals) {
    const key = keyOf(el, prop.key);
    const prev = drafts.get(key) || null;
    const fromVals = prev ? prev.fromVals : valuesOf(el, prop);
    undoStack.push({ key, prev: prev && { ...prev } });
    if (sameVals(vals, fromVals)) { drafts.delete(key); unpaint(el, prop); }
    else {
      const d = prev ? { ...prev, toVals: vals } : { key, el, playhead: playhead(el), property: prop.key, fromVals, toVals: vals, selector: compactSelector(el), path: pathOf(el), words: wordsOf(el), ruleSource: ruleSource(el, prop), scales };
      drafts.set(key, d); paint(d);
    }
    changed();
  }
  function resetProp(el, prop) {
    const key = keyOf(el, prop.key), prev = drafts.get(key);
    if (!prev) return;
    undoStack.push({ key, prev: { ...prev } });
    drafts.delete(key); unpaint(el, prop); changed();
  }
  function undo() {
    const step = undoStack.pop(); if (!step) return;
    const now = drafts.get(step.key);
    const el = step.prev?.el || now?.el; const prop = propOf((step.prev || now)?.property);
    if (!el || !prop) return changed();
    if (step.prev) { drafts.set(step.key, step.prev); paint(step.prev); } else { drafts.delete(step.key); unpaint(el, prop); }
    changed();
  }
  function undoAll() { for (const d of [...drafts.values()]) unpaint(d.el, propOf(d.property)); drafts.clear(); undoStack.length = 0; changed(); }
  /** The note's payload: what the agent acts on. */
  function payloadOf(d) {
    const prop = propOf(d.property);
    // The scale the draft was made against: Send can save it after Tweak is off.
    const to = tokenInfo(prop, d.toVals, d.scales), from = tokenInfo(prop, d.fromVals, d.scales);
    return {
      selector: d.selector, property: d.property, from: cssOf(prop, d.fromVals), to: cssOf(prop, d.toVals),
      token: to.token, fromToken: from.token, onScale: to.onScale, fromOnScale: from.onScale,
      scale: to.source === 'tokens' ? 'tokens' : 'page values', ruleSource: d.ruleSource,
    };
  }

  async function save() {
    if (saving) return { count: 0, failed: 0 };
    const list = [...drafts.values()];
    if (!list.length) return { count: 0, failed: 0 };
    if (!endpoint || !sessionId) { error = 'Not connected to the review server. Your tweaks are kept; try again when it is back.'; changed(); return { count: 0, failed: list.length }; }
    saving = true; error = ''; changed();
    const reviewer = await ensureReviewer();
    let count = 0, failed = 0, status = null;
    for (const d of list) {
      const t = payloadOf(d), id = crypto.randomUUID();
      try {
        const res = await fetch(`${endpoint}/sessions/${sessionId}/annotations`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id, kind: 'tweak', intent: 'change', viewport: viewport(), url: location.href, timestamp: Date.now(),
            comment: `Tweak: ${tweakLine(t)}`, element: d.el.tagName.toLowerCase(), elementPath: d.path,
            ...(d.words ? { selectedText: d.words } : {}), tweak: t, ...(d.playhead ? { playhead: d.playhead } : {}), ...(reviewer ? { reviewer } : {}),
          }),
        });
        if (res.ok) {
          const ann = await res.json().catch(() => ({}));
          rememberOwn(id, ann.id);
          drafts.delete(d.key); count++;
          // The saved value stays on screen until Tweak turns off; it is no longer undoable.
          for (let i = undoStack.length - 1; i >= 0; i--) if (undoStack[i].key === d.key) undoStack.splice(i, 1);
        } else { failed++; status = res.status; }
      } catch { failed++; status = 0; }
    }
    saving = false;
    if (failed) error = failMessage(status, 'save').replace('Your text is kept', 'Your tweaks are kept');
    if (count) document.dispatchEvent(new CustomEvent('agentation-kit:annotations-refresh'));
    if (!drafts.size && view === 'review') view = 'strip';
    changed();
    return { count, failed };
  }

  // ---- the strip and the review (one slot, above the bar) ----
  const stripSlot = slotPanel('tweak', (visible) => { bar.hidden = !visible; if (visible) renderBar(); else releaseSurface(bar); });
  const count = () => drafts.size;
  const plural = (n) => `${n} ${n === 1 ? 'tweak' : 'tweaks'}`;
  function btn(cls, text, action, label) {
    const b = document.createElement('button'); b.type = 'button'; b.className = cls;
    if (ICON[text]) { b.innerHTML = icon(text); b.setAttribute('aria-label', label); b.title = label; } else b.textContent = text;
    b.onclick = (e) => { e.stopPropagation(); action(); };
    return b;
  }
  function wantSlot() {
    if (!active) { stripSlot.want(false); return; }
    // On a phone the panel sheet carries the strip's controls in its footer.
    if (target && phone() && view !== 'review') { stripSlot.want(false); return; }
    // "Click anything to tweak" is done once something is picked: no hint while the panel is open.
    if (target && !count() && view !== 'review') { stripSlot.want(false); return; }
    stripSlot.want(true, { passive: view !== 'review', bump: view === 'review' });
  }
  function renderBar() {
    if (bar.hidden) return;
    bar.replaceChildren();
    if (view === 'review' && count()) return renderReview();
    view = 'strip';
    bar.className = 'panel strip'; bar.setAttribute('aria-label', 'Tweaks');
    const n = count();
    const label = document.createElement('span'); label.className = n ? 'n' : 'hint'; label.textContent = saving ? 'Saving…' : n ? plural(n) : 'Click anything to tweak';
    bar.append(label);
    if (n) {
      const u = btn('iconbtn', 'undo', undo, 'Undo last tweak'); u.disabled = !undoStack.length || saving;
      const review = btn('ghost ring', 'Review', () => { view = 'review'; if (target) close(); wantSlot(); renderBar(); });
      const s = btn('primary', `Save ${n}`, save); s.disabled = saving;
      bar.append(u, review, s);
    }
    bar.style.whiteSpace = error ? 'normal' : '';
    if (error) { const e = document.createElement('span'); e.className = 'err'; e.setAttribute('role', 'alert'); e.textContent = error; bar.append(e); }
    // As wide as its words, right edge on the bar's: placed once to measure, then at its own width.
    placeToast(bar, Math.min(520, innerWidth - 24)); bar.style.width = 'max-content'; bar.style.maxWidth = (innerWidth - 24) + 'px';
    placeToast(bar, Math.min(Math.ceil(bar.getBoundingClientRect().width), innerWidth - 24));
  }
  function renderReview() {
    bar.className = 'panel rv'; bar.setAttribute('aria-label', 'Review tweaks');
    const hd = document.createElement('div'); hd.className = 'hd';
    const t = document.createElement('span'); t.textContent = `Review ${plural(count())}`; t.style.flex = '1';
    hd.append(t, btn('iconbtn', 'close', () => { view = 'strip'; wantSlot(); renderBar(); }, 'Close review'));
    const body = document.createElement('div'); body.className = 'body';
    const byEl = new Map();
    for (const d of drafts.values()) { if (!byEl.has(d.el)) byEl.set(d.el, []); byEl.get(d.el).push(d); }
    for (const [el, list] of byEl) {
      const head = document.createElement('div'); head.className = 'el';
      const s = document.createElement('span'); s.className = 'mono'; s.textContent = list[0].selector;
      const w = btn('', list[0].words || 'Show element', () => { view = 'strip'; select(el); });
      w.title = 'Show this element';
      head.append(s, w); body.append(head);
      for (const d of list) {
        const p = payloadOf(d), prop = propOf(d.property);
        const row = document.createElement('div'); row.className = 'tk'; row.dataset.tweak = d.key;
        const ln = document.createElement('div'); ln.className = 'ln';
        const name = document.createElement('span'); name.className = 'mono'; name.textContent = p.property;
        const from = document.createElement('span'); from.className = 'from'; from.textContent = p.from;
        const arrow = document.createElement('span'); arrow.setAttribute('aria-label', 'to'); arrow.textContent = '→';
        const to = document.createElement('span'); to.className = 'to'; to.textContent = p.to;
        ln.append(name, from, arrow, to);
        const sub = document.createElement('div'); sub.className = 'sub';
        // What the new value is, in the reviewer's words. Where the rule lives
        // is the agent's business: it rides the note (ruleSource), not this line.
        sub.textContent = scaleWords(p);
        row.append(ln, btn('iconbtn', 'reset', () => resetProp(el, prop), `Reset ${prop.label.toLowerCase()}`), sub);
        body.append(row);
      }
    }
    const ft = document.createElement('div'); ft.className = 'ft acts';
    const s = btn('primary', saving ? 'Saving…' : `Save ${count()}`, save); s.disabled = saving;
    ft.append(btn('ghost', 'Undo all', undoAll), s);
    bar.append(hd, body);
    if (error) { const e = document.createElement('div'); e.className = 'err'; e.setAttribute('role', 'alert'); e.textContent = error; bar.append(e); }
    bar.append(ft);
    bar.style.whiteSpace = ''; placeNearToolbar(bar, 340);
  }
  /** "Uses space-4, space-5", "Uses a value the page already has", "Off scale": only what changed. */
  function scaleWords(p) {
    if (p.token && p.onScale) return `Uses ${p.token.split(' · ').map(tokenLabel).join(', ')}`;
    if (p.token) return 'Partly off scale';
    return p.onScale ? 'Uses a value the page already has' : 'Off scale';
  }

  // ---- hover ----
  function pageElementAt(e) {
    const path = e.composedPath ? e.composedPath() : [e.target];
    if (path.some((n) => n.nodeType === 1 && n.matches?.(CHROME))) return null;
    let el = path.find((n) => n.nodeType === 1);
    if (!el || el === document.documentElement || el === document.body) return null;
    const svg = el.closest?.('svg'); if (svg) el = svg.parentElement || svg;
    return el === document.body ? null : el;
  }
  function placeBox(box, r) { Object.assign(box.style, { left: r.left - 2 + 'px', top: r.top - 2 + 'px', width: r.width + 4 + 'px', height: r.height + 4 + 'px' }); }
  function showLabel(el, r) {
    lbl.replaceChildren();
    const s = document.createElement('span'); s.className = 'mono'; s.textContent = compactSelector(el);
    const w = document.createElement('span'); w.className = 'w'; w.textContent = wordsOf(el);
    lbl.append(s); if (w.textContent) lbl.append(w);
    lbl.hidden = false;
    const lr = lbl.getBoundingClientRect(), f = freeArea();
    const below = r.bottom + 8 + lr.height <= f.bottom;
    lbl.style.top = (below ? r.bottom + 8 : Math.max(f.top + 4, r.top - lr.height - 8)) + 'px';
    lbl.style.left = Math.max(8, Math.min(r.left, innerWidth - lr.width - 8)) + 'px';
  }
  function track() {
    frame = 0;
    if (!active) return;
    if (hoverEl && hoverEl.isConnected && hoverEl !== target) { const r = hoverEl.getBoundingClientRect(); placeBox(hl, r); hl.hidden = false; showLabel(hoverEl, r); }
    else { hl.hidden = true; lbl.hidden = true; }
    if (target?.isConnected) { placeBox(sel, target.getBoundingClientRect()); sel.hidden = false; } else sel.hidden = true;
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(track); };
  const onMove = (e) => { if (e.pointerType === 'touch') return; const el = pageElementAt(e); if (el !== hoverEl) { hoverEl = el; schedule(); } };
  const swallow = (e) => { if (!pageElementAt(e)) return; e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); };
  const onClick = (e) => {
    const el = pageElementAt(e);
    if (!el) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    if (picker) closePicker();
    select(el);
  };
  // The panel follows its element while it is in view, and stays put once it scrolls away.
  const onScroll = () => {
    schedule();
    if (!target || panel.hidden || phone()) return;
    const r = target.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) { placePanel(); if (picker) placePicker(); }
  };
  const onKey = (e) => {
    if (e.key !== 'Escape' || !active) return;
    if (picker) { closePicker(true); } else if (target) { close(); } else if (view === 'review') { view = 'strip'; wantSlot(); renderBar(); } else return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
  };
  const onInsets = () => { schedule(); if (target && !panel.hidden && !phone()) placePanel(); if (picker) placePicker(); };
  function listen(on) {
    const m = on ? 'addEventListener' : 'removeEventListener';
    document[m]('agentation-kit:insets', onInsets);
    document[m]('pointermove', onMove, true);
    for (const t of ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'dblclick', 'auxclick']) document[m](t, swallow, true);
    document[m]('click', onClick, true);
    window[m]('scroll', onScroll, true);
    window[m]('resize', onScroll);
    window[m]('keydown', onKey, true);
  }

  // ---- the panel beside the element ----
  function select(el) {
    if (!el?.isConnected) return;
    scales ||= computeScales();
    target = el; hoverEl = null; picker = null; pick.hidden = true; pin = null;
    renderPanel();
    wantSlot();
    // The sheet's inset lands a frame later; reveal again once the page has its room.
    if (phone()) { requestAnimationFrame(() => revealRect(el.getBoundingClientRect())); setTimeout(() => target === el && revealRect(el.getBoundingClientRect()), 160); }
    schedule();
    panel.querySelector('.field')?.focus({ preventScroll: true });
  }
  // The element panel sits outside the slot (it belongs beside the element),
  // but it still yields when the reviewer opens another panel (Send, the
  // inbox, More): hidden, not closed, and back when that one closes.
  let covered = false;
  document.addEventListener('agentation-kit:slot', (e) => {
    // Passive strips (Check's line, a waiting question) don't count: only a panel opened on purpose.
    const other = !!e.detail?.panel && !['tweak', 'check-strip', 'question'].includes(e.detail.panel);
    if (other === covered) return;
    covered = other;
    if (covered) { pick.hidden = true; picker = null; panel.hidden = true; releaseSurface(panel); }
    else if (target) renderPanel();
  });
  function close() {
    // Hiding the panel takes its focused field with it: focus goes to the
    // mode button, not the page (UX review 5, #12).
    const had = panel.contains(root.activeElement) || pick.contains(root.activeElement);
    target = null; picker = null; pick.hidden = true; panel.hidden = true; releaseSurface(panel);
    wantSlot(); if (!bar.hidden) renderBar(); schedule();
    if (had && focusLost()) focusMode();
  }
  function renderPanel() {
    if (!target) return;
    const el = target;
    panel.replaceChildren();
    panel.setAttribute('aria-label', `Tweak ${compactSelector(el)}`);
    const hd = document.createElement('div'); hd.className = 'hd';
    const s = document.createElement('span'); s.className = 'mono'; s.textContent = compactSelector(el);
    const w = document.createElement('span'); w.className = 'w'; w.textContent = wordsOf(el);
    hd.append(s, w, btn('iconbtn', 'close', close, 'Close tweak panel'));
    const body = document.createElement('div'); body.className = 'body';
    const cs = getComputedStyle(el);
    let group = '';
    for (const prop of PROPS) {
      // Gap only means something on a flex or grid container.
      if (prop.key === 'gap' && !/flex|grid/.test(cs.display)) continue;
      if (prop.group !== group) { group = prop.group; const g = document.createElement('div'); g.className = 'grp'; g.textContent = group; body.append(g); }
      body.append(propRow(el, prop));
    }
    panel.append(hd, body);
    if (phone()) {
      const ft = document.createElement('div'); ft.className = 'ft acts';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = count() ? plural(count()) : 'Live on this page only until you save.';
      ft.append(n);
      if (count()) { const sv = btn('primary', saving ? 'Saving…' : `Save ${count()}`, save); sv.disabled = saving; ft.append(btn('ghost ring', 'Review', () => { view = 'review'; close(); }), sv); }
      panel.append(ft);
    } else {
      const ft = document.createElement('div'); ft.className = 'ft'; ft.innerHTML = icon('info', 14);
      ft.append(document.createTextNode('Live on this page only until you save.'));
      panel.append(ft);
    }
    if (error) { const e = document.createElement('div'); e.className = 'err'; e.setAttribute('role', 'alert'); e.textContent = error; panel.append(e); }
    if (covered) return;
    panel.hidden = false;
    placePanel();
  }
  function display(prop, vals) {
    const info = tokenInfo(prop, vals);
    const comps = compsOf(prop, vals);
    if (prop.kind === 'colour') {
      // No fill is a choice, not an off-scale black (UX review 4, N7).
      if (transparent(vals[0])) return { tok: 'None', on: false, off: false, val: '', swatch: vals[0] };
      const name = colourName(vals[0]);
      return { tok: info.token ? tokenLabel(info.token) : name, on: !!info.token, off: !info.onScale, val: info.token ? name : info.onScale ? '' : 'Off scale', swatch: vals[0] };
    }
    // Partly on the scale (one side of padding) reads as Off scale: it is not a token pair.
    let tok;
    if (!info.onScale) tok = 'Off scale';
    else if (info.token) tok = info.token.split(' · ').map(tokenLabel).join(' · ');
    else if (prop.key === 'font-weight') tok = weightName(vals[0]);
    else tok = comps.every((v) => v === 0) ? 'none' : '';
    let val = prop.key === 'padding' && comps.length > 1 ? comps.map(num).join(' × ') : prop.key === 'font-weight' ? String(vals[0]) : comps.length > 1 ? comps.map(num).join(' ') : comps[0] === 0 ? '0' : pxs(comps[0]);
    // On the page's own values (no tokens): the value is the name.
    if (!tok) { tok = val; val = ''; }
    return { tok, on: !!info.token && info.onScale, off: !info.onScale, val };
  }
  function swatch(value) {
    const sw = document.createElement('span'), kind = swatchKind(value);
    sw.className = 'sw' + (kind ? ' ' + kind : '');
    if (kind !== 'none') sw.style.background = value;
    return sw;
  }
  function propRow(el, prop) {
    const d = drafts.get(keyOf(el, prop.key));
    const vals = d ? d.toVals : valuesOf(el, prop);
    const row = document.createElement('div'); row.className = 'prop'; row.dataset.prop = prop.key;
    const name = document.createElement('div'); name.className = 'name'; name.textContent = prop.label;
    if (d) { const c = document.createElement('span'); c.className = 'chg'; c.textContent = 'Changed'; name.append(c); }
    const f = document.createElement('button'); f.type = 'button'; f.className = 'field'; f.setAttribute('aria-haspopup', 'dialog'); f.setAttribute('aria-expanded', String(picker?.prop === prop.key));
    const v = display(prop, vals);
    if (v.swatch) f.append(swatch(v.swatch));
    const tok = document.createElement('span'); tok.className = 'tok' + (v.on ? ' on' : v.off ? ' off' : ''); tok.textContent = v.tok;
    const val = document.createElement('span'); val.className = 'val'; val.textContent = v.val;
    f.append(tok, val); f.insertAdjacentHTML('beforeend', icon('down', 14));
    f.setAttribute('aria-label', `${prop.label}: ${[v.tok, v.val].filter(Boolean).join(', ')}${d ? ', changed' : ''}. Change`);
    f.onclick = (e) => { e.stopPropagation(); picker?.prop === prop.key ? closePicker() : openPicker(prop, f); };
    const reset = btn('iconbtn', 'reset', () => { resetProp(el, prop); }, `Reset ${prop.label.toLowerCase()}`);
    reset.hidden = !d;
    row.append(name, f, reset);
    return row;
  }
  // Where the panel went for this element. A change re-renders the panel, and
  // re-placing it made it jump as the element grew; now it stays put. It moves
  // only when it must: the element grew under it (it steps aside, just enough),
  // or the element itself moved (a scroll, the page reflowing round a panel).
  let pin = null;
  function keepPin() {
    const r = target.getBoundingClientRect(), was = pin.rect, f = freeArea(), gap = 10;
    // Both edges shifting the same way is a move; one edge, or both apart, is growth.
    const moved = (a1, a2, b1, b2) => { const d1 = a1 - b1, d2 = a2 - b2; return d1 * d2 > 0 && Math.min(Math.abs(d1), Math.abs(d2)) > 1; };
    if (moved(r.left, r.right, was.left, was.right) || moved(r.top, r.bottom, was.top, was.bottom)) return false;
    Object.assign(panel.style, pin.style);
    // Above the element, it grows toward it: cap it there and let it scroll.
    if (pin.side === 'above') { const room = Math.floor(r.top - gap - parseFloat(pin.style.top)); if (room < 160) return false; panel.style.maxHeight = Math.min(parseFloat(pin.style.maxHeight), room) + 'px'; }
    // Room at the bottom can shrink (a strip reserved its band): stop short of it.
    const floor = Math.floor(f.bottom - 8 - parseFloat(pin.style.top));
    if (floor < 160) return false;
    if (floor < parseFloat(panel.style.maxHeight)) panel.style.maxHeight = floor + 'px';
    const p = panel.getBoundingClientRect();
    const clear = (q) => r.right <= q.left || r.left >= q.right || r.bottom <= q.top || r.top >= q.bottom;
    // The pin holds only while the whole panel is still on screen (a narrower
    // window can push its right side out): otherwise place it afresh.
    const inside = p.left >= f.left + 4 && p.right <= f.right - 4 && p.top >= f.top && p.bottom <= f.bottom;
    if (clear(p) && inside) return true;
    const step = { below: () => ({ top: r.bottom + gap }), right: () => ({ left: r.right + gap }), left: () => ({ left: r.left - gap - p.width }) }[pin.side]?.();
    if (!step) return false;
    const q = { left: step.left ?? p.left, top: step.top ?? p.top }; q.right = q.left + p.width; q.bottom = q.top + p.height;
    if (q.left < f.left + 8 || q.right > f.right - 8 || q.top < f.top + 8 || q.bottom > f.bottom - 8 || !clear(q)) return false;
    Object.assign(pin.style, { left: Math.round(q.left) + 'px', top: Math.round(q.top) + 'px' }); Object.assign(panel.style, pin.style);
    return true;
  }
  /** Beside the element, in free space: below, right, above, left. Never over it. */
  let glideTimer = 0;
  function placePanel() {
    if (!target || panel.hidden) return;
    if (pin?.el === target && !phone() && keepPin()) return;
    // Same element, but it grew into the panel or the window changed: glide
    // to the new spot instead of jumping, so the move reads as stepping aside.
    if (pin?.el === target && !phone() && !matchMedia('(prefers-reduced-motion: reduce)').matches) { panel.classList.add('glide'); clearTimeout(glideTimer); glideTimer = setTimeout(() => panel.classList.remove('glide'), 260); }
    pin = null;
    panel.style.maxHeight = '';
    if (phone()) {
      panel.style.width = '';
      placeNearToolbar(panel, 300); // a bottom sheet, <= 55%, reserved so the page scrolls above it
      requestAnimationFrame(() => target && revealRect(target.getBoundingClientRect()));
      return;
    }
    releaseSurface(panel);
    const W = Math.min(300, innerWidth - 24);
    Object.assign(panel.style, { position: 'fixed', width: W + 'px', right: 'auto', bottom: 'auto' });
    panel.dataset.sheet = '';
    const r = target.getBoundingClientRect(), f = freeArea(), gap = 10, H = panel.scrollHeight;
    const clampX = (x) => Math.max(f.left + 12, Math.min(x, f.right - W - 12));
    const clampY = (y, h) => Math.max(f.top + 8, Math.min(y, f.bottom - h - 8));
    const room = { below: f.bottom - r.bottom - gap - 8, above: r.top - f.top - gap - 8, right: f.right - r.right - gap - 12, left: r.left - f.left - gap - 12 };
    const tall = f.bottom - f.top - 16;
    const below = () => ({ left: clampX(r.left), top: r.bottom + gap, h: room.below });
    const above = () => ({ left: clampX(r.left), top: Math.max(f.top + 8, r.top - gap - Math.min(H, room.above)), h: room.above });
    // Below or above keeps the row the element sits in (its neighbours) in
    // view; beside it would cover the card next to it, so that comes after a
    // roomy below.
    const options = [
      ['below', room.below >= H, below],
      ['above', room.above >= H, above],
      ['below', room.below >= 300 && room.below >= room.above, below],
      ['right', room.right >= W, () => ({ left: r.right + gap, top: clampY(r.top, Math.min(H, tall)), h: tall })],
      ['left', room.left >= W, () => ({ left: r.left - gap - W, top: clampY(r.top, Math.min(H, tall)), h: tall })],
      ['above', room.above >= 220, above],
      ['below', room.below >= 220, below],
    ];
    const fit = options.find((o) => o[1]);
    if (!fit) {
      // A target that fills the view leaves no free side: dock as a side sheet,
      // which reserves its column, so the page reflows rather than being covered.
      placeNearToolbar(panel, 300);
      return;
    }
    const p = fit[2]();
    panel.dataset.side = fit[0];
    const style = { position: 'fixed', width: W + 'px', right: 'auto', bottom: 'auto', left: Math.round(p.left) + 'px', top: Math.round(p.top) + 'px', maxHeight: Math.max(160, Math.floor(Math.min(p.h, tall))) + 'px' };
    Object.assign(panel.style, style);
    const tr = target.getBoundingClientRect();
    pin = { el: target, side: fit[0], style, rect: { left: tr.left, right: tr.right, top: tr.top, bottom: tr.bottom } };
  }

  // ---- the scale picker ----
  function openPicker(prop, field) {
    picker = { prop: prop.key, part: partsOf(prop, [0, 0])[0].part, field };
    renderPicker(true);
    panel.querySelectorAll('.field').forEach((f) => f.setAttribute('aria-expanded', String(f === field)));
  }
  function closePicker(refocus = false) {
    const f = picker?.field; picker = null; pick.hidden = true;
    panel.querySelectorAll('.field').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    if (refocus && f?.isConnected) f.focus();
  }
  function renderPicker(focus = false) {
    if (!picker || !target) return;
    const el = target, prop = propOf(picker.prop);
    const d = drafts.get(keyOf(el, prop.key));
    const vals = d ? d.toVals : valuesOf(el, prop), fromVals = d ? d.fromVals : vals;
    const parts = partsOf(prop, vals), part = parts.find((p) => p.part === picker.part) || parts[0];
    const fromPart = partsOf(prop, fromVals).find((p) => p.part === part.part);
    const s = scaleOf(prop);
    pick.replaceChildren();
    pick.setAttribute('aria-label', `${prop.label}${part.label ? ', ' + part.label : ''}`);
    const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = `${prop.label}${part.label ? ', ' + part.label : ''}`;
    pick.append(ph);
    if (s.source !== 'tokens') { const note = document.createElement('div'); note.className = 'ph note'; note.textContent = 'No scale in the stylesheets, so these are values the page already uses.'; pick.append(note); }
    if (parts.length > 1) {
      const seg = document.createElement('div'); seg.className = 'seg'; seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Sides');
      for (const p of parts) { const b = btn('', p.label[0].toUpperCase() + p.label.slice(1), () => { picker.part = p.part; renderPicker(); }); b.setAttribute('aria-pressed', String(p === part)); seg.append(b); }
      pick.append(seg);
    }
    const opts = document.createElement('div'); opts.className = 'opts'; opts.setAttribute('role', 'listbox'); opts.setAttribute('aria-label', s.source === 'tokens' ? 'The project’s scale' : 'Values this page uses');
    const cur = onScale(part.value, s.list);
    for (const e of s.list) {
      const o = document.createElement('button'); o.type = 'button'; o.className = 'opt'; o.setAttribute('role', 'option');
      o.setAttribute('aria-selected', String(e === cur)); o.dataset.value = String(e.value);
      o.innerHTML = `<span class="ck">${icon('check', 14)}</span>`;
      if (prop.kind === 'colour') o.append(swatch(e.value));
      const nm = document.createElement('span'); nm.className = 'nm' + (e.token ? ' mono' : '');
      nm.textContent = e.token ? tokenLabel(e.token) : e.label || (prop.kind === 'colour' ? colourName(e.value) : pxs(e.value));
      const v = document.createElement('span'); v.className = 'val'; v.textContent = prop.kind === 'colour' ? (e.token ? colourName(e.value) : '') : prop.key === 'font-weight' ? String(e.value) : e.token ? pxs(e.value) : '';
      o.append(nm, v);
      o.onclick = (ev) => { ev.stopPropagation(); choose(prop, part.part, e.value); };
      opts.append(o);
    }
    opts.onkeydown = (ev) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key)) return;
      ev.preventDefault(); ev.stopPropagation();
      const list = [...opts.querySelectorAll('.opt')], i = list.indexOf(root.activeElement);
      const next = ev.key === 'Home' ? 0 : ev.key === 'End' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, i + (ev.key === 'ArrowDown' ? 1 : -1)));
      list[next]?.focus();
    };
    pick.append(opts, document.createElement('hr'));
    // Back to where it started, named by its token when it had one.
    const fromHit = onScale(fromPart.value, s.list);
    const was = document.createElement('button'); was.type = 'button'; was.className = 'opt was';
    const wl = document.createElement('span'); wl.textContent = `Reset to ${prop.kind === 'colour' ? colourName(fromPart.value) : prop.key === 'font-weight' ? fromPart.value : pxs(fromPart.value)}`;
    const ws = document.createElement('span'); ws.textContent = fromHit ? (fromHit.token ? tokenLabel(fromHit.token) : '') : prop.kind === 'colour' && transparent(fromPart.value) ? '' : 'Off scale';
    was.append(wl, ws);
    was.onclick = (ev) => { ev.stopPropagation(); choose(prop, part.part, fromPart.value); };
    pick.append(was);
    // A free value is allowed; it says Off scale unless it lands on one.
    const free = document.createElement('form'); free.className = 'free';
    const input = document.createElement('input'); input.setAttribute('aria-label', 'Custom value');
    input.placeholder = prop.kind === 'colour' ? '#1e63dd' : prop.key === 'font-weight' ? '550' : '18px';
    const apply = document.createElement('button'); apply.type = 'submit'; apply.className = 'ghost ring'; apply.textContent = 'Use';
    free.append(input, apply);
    free.onsubmit = (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      const v = parseFree(prop, input.value);
      if (v == null) { input.setCustomValidity('Not a value this property takes'); input.reportValidity(); return; }
      choose(prop, part.part, v);
    };
    input.oninput = () => input.setCustomValidity('');
    pick.append(free);
    pick.hidden = false;
    placePicker();
    if (focus) (opts.querySelector('[aria-selected=true]') || opts.querySelector('.opt') || input).focus({ preventScroll: true });
  }
  function parseFree(prop, text) {
    const t = String(text || '').trim(); if (!t) return null;
    if (prop.kind === 'colour') return scales.res.freeColour(t);
    if (prop.key === 'font-weight') { const n = Number(t); return n >= 1 && n <= 1000 ? n : null; }
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let n = parseLength(t, rootPx);
    if (!Number.isFinite(n)) n = scales.res.freeLength(t) ?? NaN;
    return Number.isFinite(n) && n >= 0 && n <= 2000 ? r2(n) : null;
  }
  function choose(prop, part, value) {
    if (!target) return;
    const d = drafts.get(keyOf(target, prop.key));
    const vals = d ? d.toVals : valuesOf(target, prop);
    setValue(target, prop, withPart(prop, vals, part, value));
    // One value is one choice: the picker closes. Padding has two sides to
    // set, so it stays open for the other one (Esc or the field closes it).
    if (partsOf(prop, vals).length < 2) closePicker(true);
  }
  /** Beside the panel, away from the element; else over the panel's own rows. */
  function placePicker() {
    if (!picker || pick.hidden || !picker.field?.isConnected) return;
    const p = panel.getBoundingClientRect(), fr = picker.field.getBoundingClientRect(), t = target.getBoundingClientRect(), f = freeArea();
    const W = Math.min(240, p.width - 16);
    pick.style.width = W + 'px'; pick.style.maxHeight = '';
    const H = Math.min(pick.scrollHeight, 360);
    const top = Math.max(f.top + 8, Math.min(fr.top - 8, f.bottom - H - 8));
    const hits = (x) => !(x + W < t.left || x > t.right || top + H < t.top || top > t.bottom);
    const right = p.right + 8, left = p.left - 8 - W;
    let x = null;
    if (!phone() && right + W <= f.right - 8 && !hits(right)) x = right;
    else if (!phone() && left >= f.left + 8 && !hits(left)) x = left;
    if (x != null) { Object.assign(pick.style, { left: x + 'px', top: top + 'px', maxHeight: Math.min(360, f.bottom - top - 8) + 'px' }); return; }
    // No side is free: cover the panel itself, under the field, never the page.
    const y = Math.max(p.top + 40, Math.min(fr.bottom + 4, p.bottom - Math.min(H, p.height - 48) - 8));
    Object.assign(pick.style, { left: p.left + (p.width - W) / 2 + 'px', top: y + 'px', maxHeight: Math.max(140, p.bottom - y - 8) + 'px' });
  }

  // ---- state out ----
  function changed() {
    if (target && !panel.hidden) { const focusProp = root.activeElement?.closest?.('.prop')?.dataset.prop; renderPanel(); if (picker) { picker.field = panel.querySelector(`.prop[data-prop="${picker.prop}"] .field`); renderPicker(); } else if (focusProp) panel.querySelector(`.prop[data-prop="${focusProp}"] .field`)?.focus({ preventScroll: true }); }
    if (!count() && view === 'review') view = 'strip';
    wantSlot(); if (!bar.hidden) renderBar();
    schedule();
    document.dispatchEvent(new CustomEvent('agentation-kit:tweak-change', { detail: { active, count: count() } }));
  }
  function toggle(on) {
    const next = on === undefined ? !active : !!on;
    if (next === active) return;
    active = next;
    if (active) {
      if (window.__AGENTATION_KIT_EDIT__?.active) window.__AGENTATION_KIT_EDIT__.toggle(false);
      scales = null; error = '';
      for (const d of drafts.values()) if (d.el.isConnected) paint(d);
      listen(true);
    } else {
      listen(false);
      target = null; hoverEl = null; picker = null; view = 'strip';
      for (const n of [panel, pick, hl, sel, lbl]) n.hidden = true;
      releaseSurface(panel); releaseSurface(bar);
      // Exit restores the page exactly; unsaved drafts are kept for next time.
      restoreAll(); scales?.res.done(); scales = null;
    }
    changed(); scheduleInsets();
  }
  // The bar's width animates as its labels change: the strip meets its final right edge.
  document.addEventListener('transitionend', (e) => { if (e.propertyName === 'width' && !bar.hidden && view === 'strip' && e.target?.matches?.('[data-agentation-toolbar] [class*="toolbarContainer"]')) renderBar(); }, true);
  // Only one of Edit text and Tweak is ever on.
  document.addEventListener('agentation-kit:edit-change', () => { if (active && window.__AGENTATION_KIT_EDIT__?.active) toggle(false); });
  // A new page: drop what is no longer on it.
  document.addEventListener('agentation-kit:route', () => {
    if (target && !target.isConnected) close();
    for (const [k, d] of drafts) if (!d.el.isConnected) drafts.delete(k);
    changed();
  });
  const api = {
    get active() { return active; },
    get count() { return count(); },
    toggle, save, undo, select, close,
    drafts: () => [...drafts.values()].map(payloadOf),
    // From a critique suggestion (critique.js Use this change): one property
    // to one value, as a draft the reviewer can still adjust. Px lengths and
    // colours only; anything else returns null and stays a note.
    draft({ element, property, to }) {
      const prop = propOf(property);
      if (!prop || !element?.isConnected || to == null) return null;
      scales ||= computeScales();
      let vals;
      if (prop.kind === 'colour') { if (!CSS.supports('color', String(to))) return null; vals = [String(to)]; }
      else { const parts = String(to).trim().split(/\s+/); if (!parts.every((x) => /^-?\d*\.?\d+(px)?$/.test(x) || (prop.key === 'font-weight' && /^\d{3}$/.test(x)))) return null; vals = parts.map(Number.parseFloat); }
      // CSS shorthand order (padding: v h → top right bottom left), one value per longhand.
      if (prop.longhands.length === 4 && vals.length < 4) { const [a, b = a, c = a, d = b] = vals; vals = [a, b, c, d]; }
      else if (prop.longhands.length === 2 && vals.length === 1) vals = [vals[0], vals[0]];
      setValue(element, prop, vals);
      return keyOf(element, prop.key);
    },
    undraft(key) { const d = drafts.get(key); if (d) resetProp(d.el, propOf(d.property)); },
    review() { view = 'review'; close(); },
    setSession(id) { if (id) sessionId = id; },
  };
  window.__AGENTATION_KIT_TWEAK__ = api;
  document.dispatchEvent(new CustomEvent('agentation-kit:tweak-change', { detail: { active, count: 0 } }));
  return api;
}
