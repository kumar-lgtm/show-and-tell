/**
 * The project's own scale, for Tweak (show-and-tell.pen 7.2, chapter 5).
 *
 * A tweak is only useful to an agent if it lands on something the codebase
 * already has: "padding 11px 16px -> 16px 24px" is a guess, "-> --space-4 and
 * --space-5" is a change it can make in the source. So values snap to the
 * project's scale:
 *
 *   1. CSS custom properties defined in the page's same-origin stylesheets
 *      (--space-4, --brand, --radius-md), grouped by what their value is: a
 *      length, a colour or a plain number. A name hint then picks which
 *      lengths belong to which property (spacing, type, corners).
 *   2. With no tokens for a property, the distinct values the page already
 *      uses for it, most used first.
 *
 * A value off the scale is still allowed. It is labelled Off scale, so the
 * agent knows it was on purpose.
 *
 * Pure functions only: nothing here touches the DOM, so the unit tests run in
 * Node. tweak.js does the reading and passes plain data in.
 */

/** The properties Tweak offers, in panel order. Nothing structural, no layout. */
export const PROPS = [
  { key: 'font-size', group: 'Type', label: 'Size', kind: 'length', scale: 'type', longhands: ['font-size'] },
  { key: 'font-weight', group: 'Type', label: 'Weight', kind: 'number', scale: 'weight', longhands: ['font-weight'] },
  { key: 'padding', group: 'Spacing', label: 'Padding', kind: 'length', scale: 'space', longhands: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] },
  { key: 'gap', group: 'Spacing', label: 'Gap', kind: 'length', scale: 'space', longhands: ['row-gap', 'column-gap'] },
  { key: 'background-color', group: 'Colour', label: 'Fill', kind: 'colour', scale: 'colour', longhands: ['background-color'] },
  { key: 'color', group: 'Colour', label: 'Text', kind: 'colour', scale: 'colour', longhands: ['color'] },
  { key: 'border-radius', group: 'Corners', label: 'Radius', kind: 'length', scale: 'radius', longhands: ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'] },
];
export const propOf = (key) => PROPS.find((p) => p.key === key);

// Custom properties that are ours or the toolbar's, never the project's.
const OWN_TOKEN = /^--(sk-|agentation|feedback-)/;
const COLOUR_FN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// The named colours people actually put in tokens. A full list buys nothing:
// a token named --brand: rebeccapurple is rare, and CSS.supports in the
// browser catches the rest (see `kindOf`'s `isColour` hook).
const NAMED = new Set(['black', 'white', 'red', 'green', 'blue', 'gray', 'grey', 'orange', 'yellow', 'purple', 'pink', 'navy', 'teal', 'silver', 'maroon', 'olive', 'lime', 'aqua', 'fuchsia', 'currentcolor']);
const LENGTH = /^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|dvh|lh|pt|pc|cm|mm|in|q|%)$/i;
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$/;
const MATH = /^(?:calc|clamp|min|max)\(/i;

/**
 * What a custom property's value is: 'colour', 'length', 'number' or null.
 * `lookup(name)` returns another token's raw value, so `var(--x)` chains are
 * followed (cycles stop after a few hops).
 */
export function kindOf(raw, lookup = () => null, { isColour } = {}, depth = 0) {
  const v = String(raw ?? '').trim();
  if (!v || depth > 8) return null;
  const ref = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
  if (ref) {
    const next = lookup(ref[1]);
    return next != null ? kindOf(next, lookup, { isColour }, depth + 1) : ref[2] ? kindOf(ref[2], lookup, { isColour }, depth + 1) : null;
  }
  if (HEX.test(v) || COLOUR_FN.test(v) || NAMED.has(v.toLowerCase())) return 'colour';
  if (v === '0' ) return 'length';
  if (LENGTH.test(v)) return 'length';
  if (NUMBER.test(v)) return 'number';
  if (MATH.test(v)) return /\d(px|rem|em|vw|vh|%)/i.test(v) || /var\(/.test(v) ? 'length' : null;
  if (isColour?.(v)) return 'colour';
  return null;
}

/**
 * Tokens from a flat list of style rules: [{ selector, props: [[name, value]] }].
 * The last definition of a name wins, as in the cascade for :root. Rules on
 * other selectors (a theme class, a component scope) only add names :root
 * does not have.
 */
export function collectTokens(rules, opts = {}) {
  const raw = new Map(); // name -> { value, selector, root }
  for (const r of rules || []) {
    const root = /(^|,)\s*(:root|html)\s*(,|$)/i.test(r.selector || '');
    for (const [name, value] of r.props || []) {
      if (!name.startsWith('--') || OWN_TOKEN.test(name)) continue;
      const have = raw.get(name);
      if (have && have.root && !root) continue;
      raw.set(name, { value: String(value).trim(), selector: r.selector, root });
    }
  }
  const lookup = (n) => raw.get(n)?.value ?? null;
  const out = [];
  for (const [name, t] of raw) {
    const kind = kindOf(t.value, lookup, opts);
    if (kind) out.push({ name, value: t.value, selector: t.selector, kind });
  }
  return out;
}

/** Tokens grouped by kind: { length: [], colour: [], number: [] }. */
export function groupTokens(tokens) {
  const g = { length: [], colour: [], number: [] };
  for (const t of tokens || []) g[t.kind]?.push(t);
  return g;
}

// Which lengths belong to which property, by name. Spacing is the loosest
// match, so it also excludes the names that clearly mean something else.
const HINTS = {
  type: { yes: /(^|-)(font|text|fs|type|size-text|heading|body)(-|$)|font-?size/i, no: /weight|line|leading|tracking|letter|family/i },
  space: { yes: /(^|-)(space|spacing|gap|pad|padding|gutter|inset|sp|size|s)(-|$)|spacing|space/i, no: /radius|round|corner|font|text|weight|line|leading|shadow|border|width|height|max|min|container|breakpoint|bp|screen|duration|delay|z-?index|blur|opacity|icon/i },
  radius: { yes: /radius|round|corner|rounded/i, no: /^$/ },
  weight: { yes: /weight|(^|-)fw(-|$)/i, no: /^$/ },
};

/**
 * The tokens that belong to one scale ('type', 'space', 'radius', 'weight',
 * 'colour'), sorted by resolved value. `resolve(token)` gives px for a length,
 * a number for a weight, or a normalised colour string; tokens it cannot
 * resolve are left out.
 */
export function tokensFor(scale, groups, resolve = () => null) {
  const pool = scale === 'colour' ? groups.colour : scale === 'weight' ? groups.number : groups.length;
  const h = HINTS[scale];
  const picked = (pool || []).filter((t) => !h || (h.yes.test(t.name.slice(2)) && !h.no.test(t.name.slice(2))));
  const out = [];
  for (const t of picked) {
    const v = resolve(t);
    if (v == null || (typeof v === 'number' && !Number.isFinite(v))) continue;
    if (scale === 'weight' && !(v >= 1 && v <= 1000)) continue;
    out.push({ token: t.name, value: scale === 'colour' ? String(v) : v, raw: t.value });
  }
  if (scale !== 'colour') out.sort((a, b) => a.value - b.value || a.token.localeCompare(b.token, undefined, { numeric: true }));
  else out.sort((a, b) => a.token.localeCompare(b.token, undefined, { numeric: true }));
  // One entry per value: a scale with --space-4 and --gap-md both 16px offers
  // 16px once, under the first name.
  const seen = new Set();
  return out.filter((e) => { const k = String(e.value); if (seen.has(k)) return false; seen.add(k); return true; });
}

/**
 * The fallback scale: distinct values the page already uses, most used first,
 * then sorted. `counts` is a Map(value -> uses). At most `max` entries.
 */
export function usedScale(counts, { max = 10, numeric = true } = {}) {
  const list = [...(counts || new Map())].filter(([v]) => v !== '' && v != null).sort((a, b) => b[1] - a[1]).slice(0, max).map(([v]) => v);
  if (numeric) return list.map(Number).filter(Number.isFinite).sort((a, b) => a - b).map((value) => ({ token: null, value }));
  return list.map((value) => ({ token: null, value: String(value) }));
}

/** Px of a CSS length, or NaN. `rem`/`em` use `rootPx`. */
export function parseLength(v, rootPx = 16) {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === '0' || s === 'none' || s === 'normal') return 0;
  const m = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em)?$/.exec(s);
  if (!m) return NaN;
  const n = parseFloat(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * rootPx : n;
}

const EPS = 0.5;
/** The scale entry a value sits on, or null (off scale). */
export function onScale(value, scale) {
  if (value == null) return null;
  if (typeof value === 'number') return (scale || []).find((e) => typeof e.value === 'number' && Math.abs(e.value - value) < EPS) || null;
  const v = normColour(value);
  return (scale || []).find((e) => normColour(e.value) === v) || null;
}
/** The nearest entry, for where the picker opens. */
export function nearest(value, scale) {
  let best = null;
  for (const e of scale || []) if (typeof e.value === 'number' && (!best || Math.abs(e.value - value) < Math.abs(best.value - value))) best = e;
  return best;
}

/** Colours compare as the browser prints them; spaces and case do not matter. */
export function normColour(c) {
  return String(c ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/^rgba\(([^,]+),([^,]+),([^,]+),1\)$/, 'rgb($1,$2,$3)');
}
export const transparent = (c) => { const v = normColour(c); return !v || v === 'transparent' || /^rgba\([^)]*,0\)$/.test(v); };

/**
 * How a colour swatch is drawn (UX review 5, #16): 'none' for no fill (a
 * diagonal slash, so it never reads as near-black), 'dark' for a colour that
 * all but vanishes on the dark panel (#1D1A2F) and gets a light ring, else ''.
 */
export function swatchKind(c) {
  if (transparent(c)) return 'none';
  let rgb = null, a = 1;
  const m = /^rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*([\d.]+))?\)$/i.exec(String(c ?? '').trim());
  if (m) { rgb = [m[1], m[2], m[3]].map(Number); if (m[4] != null) a = Number(m[4]); }
  const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c ?? '').trim());
  if (h) { const x = h[1].length === 3 ? [...h[1]].map((d) => d + d).join('') : h[1]; rgb = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); }
  if (!rgb) return '';
  // Over the dark panel, then its contrast with the panel.
  const over = rgb.map((v) => v * a + 26 * (1 - a));
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(over[0]) + 0.7152 * lin(over[1]) + 0.0722 * lin(over[2]);
  const panel = lin(26);
  return (Math.max(L, panel) + 0.05) / (Math.min(L, panel) + 0.05) < 1.8 ? 'dark' : '';
}

/** 'rgb(30, 99, 221)' -> '#1e63dd'. Anything else comes back as it was. */
export function hexOf(c) {
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(String(c ?? '').trim());
  if (!m) return String(c ?? '');
  const h = [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  return '#' + h + (m[4] != null && Number(m[4]) < 1 ? Math.round(Number(m[4]) * 255).toString(16).padStart(2, '0') : '');
}

/**
 * A colour as the panel names it (UX review 4, N7): "None" when it is fully
 * transparent, else the 6-digit hex, with the alpha as a percent when it is
 * not 1. '#00000000' read as an off-scale black and wrapped at 1280.
 */
export function colourName(c) {
  if (transparent(c)) return 'None';
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(String(c ?? '').trim());
  if (!m) return String(c ?? '');
  const hex = '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  const a = m[4] == null ? 1 : Number(m[4]);
  return a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex;
}

const px = (n) => `${Math.round(n * 100) / 100}px`;
/** Four sides (top, right, bottom, left) as the shortest shorthand. */
export function shorthand(sides) {
  const [t, r, b, l] = sides.map((s) => (typeof s === 'number' ? px(s) : String(s)));
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  if (r === l) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
}

const WEIGHTS = { 100: 'thin', 200: 'extra light', 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extra bold', 900: 'black' };
export const weightName = (n) => WEIGHTS[Math.round(Number(n) / 100) * 100] || String(n);

/** A token as the panel shows it: no leading dashes. */
export const tokenLabel = (t) => String(t || '').replace(/^--/, '');

/**
 * Specificity as [ids, classes, types], good enough to pick the rule that
 * wins among those matching one element. :is/:where/:not are counted crudely.
 */
export function specificity(sel) {
  const s = String(sel || '').replace(/:where\([^)]*\)/g, '').replace(/::?[\w-]+(\([^)]*\))?/g, (m) => (m.startsWith('::') ? ' t ' : /^:(not|is|has)\(/.test(m) ? m.slice(m.indexOf('(') + 1, -1) : ' .c '));
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]*\]/g) || []).length;
  const types = (s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]/g, ' ').match(/(^|[\s>+~(,])[a-z][\w-]*/gi) || []).length;
  return [ids, classes, types];
}
export const compareSpecificity = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** "styles.css .cta", or "" when no rule was found. */
export function ruleLabel(rs) {
  if (!rs) return '';
  return [rs.href, rs.selector].filter(Boolean).join(' ');
}

/**
 * One tweak as one line, for the strip, the review and the agent:
 *   a.cta padding 12px 20px → 16px 24px (--space-4 · --space-5), rule in styles.css .cta
 */
export function tweakLine(t = {}) {
  const scale = t.token ? ` (${t.token})` : t.onScale ? ' (a value the page already uses)' : t.to != null ? ' (off scale)' : '';
  const rule = ruleLabel(t.ruleSource);
  return `${t.selector || 'element'} ${t.property || '?'} ${t.from ?? ''} → ${t.to ?? ''}${scale}${rule ? `, rule in ${rule}` : ''}`;
}
