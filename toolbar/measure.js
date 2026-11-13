/**
 * Measured checks (show-and-tell.pen 9.3 and chapter 10).
 *
 * Some problems are facts, and only the reviewer's browser has the geometry to
 * measure them: the agent sends selectors precisely because it has no viewport
 * (critique.js says so). So Run checks measures here, in this page, and three
 * kinds of fact come back:
 *
 *   - targets  interactive elements under 44 x 44px on a touch screen (a coarse
 *              pointer, or a width of 640 or less) or under 24 x 24px on a
 *              desktop (WCAG 2.5.8). Inline links inside a sentence are exempt.
 *   - overflow text cut off by its box: overflow hidden or clip with more
 *              content than room, text-overflow ellipsis, or a line clamp.
 *   - contrast text under 4.5:1, or 3:1 for large text (24px and up, or
 *              18.66px and up when bold), against the backgrounds walked up from it.
 *
 * What cannot be measured honestly is never guessed: text over an image, a
 * gradient, a filter or a colour this browser will not read back as sRGB is
 * listed as Couldn't measure.
 *
 * Other widths. The current width is measured in the page itself. 390, 820 and
 * 1440 are measured in a hidden same-origin frame of that size (the viewport
 * simulator's own approach, viewport.js), which costs one page load each. A
 * frame that cannot load in time is reported, and that width is skipped.
 *
 * Nothing here imports anything, so the maths runs in Node unit tests.
 */

/** Widths and heights the checks run at, as the viewport simulator's devices. */
export const SIZES = [[390, 844], [820, 1180], [1440, 900]];
export const CHECKS = ["target", "overflow", "contrast"];
/** The frame name entry.jsx looks for, so no toolbar mounts inside a measuring frame. */
export const FRAME_NAME = "show-and-tell-measure";

// ---- colour ----------------------------------------------------------------

/** "rgb(1, 2, 3)", "rgba(1,2,3,.5)", "rgb(1 2 3 / 50%)", "#abc", "#aabbcc" → {r,g,b,a}, else null. */
export function parseColor(str) {
  const s = String(str || "").trim().toLowerCase();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (!m) return null; // oklch(), color(display-p3 …): not sRGB we can trust
  const parts = m[1].replace(/\s*\/\s*/, " / ").split(/[\s,]+/).filter((p) => p && p !== "/");
  if (parts.length < 3) return null;
  const chan = (p) => (p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p));
  const alpha = parts[3] == null ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
  const out = { r: chan(parts[0]), g: chan(parts[1]), b: chan(parts[2]), a: alpha };
  return [out.r, out.g, out.b, out.a].every(Number.isFinite) ? out : null;
}

/** `top` painted over `bottom` (source-over). */
export function blend(top, bottom) {
  const a = top.a + bottom.a * (1 - top.a);
  if (!a) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (k) => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
  return { r: mix("r"), g: mix("g"), b: mix("b"), a };
}

/** WCAG relative luminance of an opaque sRGB colour. */
export function luminance({ r, g, b }) {
  const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two opaque colours, 1 to 21. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Large text in WCAG terms: 24px, or 18.66px (14pt) when bold. */
export const isLargeText = (px, weight) => px >= 24 || (px >= 18.66 && Number(weight) >= 700);
export const requiredRatio = (px, weight) => (isLargeText(px, weight) ? 3 : 4.5);

export function toHex({ r, g, b }) {
  const h = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Shown rounded DOWN, so a 4.497:1 never reads as a passing 4.5:1. */
export const ratioText = (r) => `${(Math.floor(r * 10) / 10).toFixed(1)}:1`;

/**
 * The nearest colour to `fg` that reaches `ratio` on `bg`: mixed toward black
 * or toward white, whichever passes with less change. Null when neither does.
 */
export function passingColor(fg, bg, ratio) {
  let best = null;
  for (const end of [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }]) {
    for (let t = 0.02; t <= 1.0001; t += 0.02) {
      const c = { r: fg.r + (end.r - fg.r) * t, g: fg.g + (end.g - fg.g) * t, b: fg.b + (end.b - fg.b) * t, a: 1 };
      if (contrastRatio(c, bg) >= ratio + 0.05) { if (!best || t < best.t) best = { t, c }; break; }
    }
  }
  return best ? toHex(best.c) : null;
}

/** Which target size applies, and how it is worded. */
export function targetRule({ coarse = false, width = 1440 } = {}) {
  return coarse || width <= 640
    ? { min: 44, rule: "Touch targets: 44 × 44px" }
    : { min: 24, rule: "Pointer targets (WCAG 2.5.8): 24 × 24px" };
}

// ---- the page --------------------------------------------------------------

const CHROME = "[data-feedback-toolbar], #agentation-root, [data-agentation-root], [data-agentation-toolbar], .sk-edit-ui, [data-sk-no-edit]";
const TARGETS = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem]';
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "PATH", "HEAD", "TITLE", "META", "LINK", "OPTION", "IFRAME"]);
const MEDIA = new Set(["IMG", "PICTURE", "VIDEO", "CANVAS", "SVG"]);
const MAX_ELEMENTS = 4000;
const MAX_PER_CHECK = 30;

const collapse = (s) => String(s || "").replace(/\s+/g, " ").trim();
/** What a person would call it: its accessible name, else its text. */
export function labelOf(el) {
  const raw = el.getAttribute?.("aria-label") || el.getAttribute?.("alt") || collapse(el.textContent) || el.getAttribute?.("title") || el.getAttribute?.("placeholder") || el.tagName?.toLowerCase() || "element";
  const t = collapse(raw);
  return t.length > 44 ? t.slice(0, 43) + "…" : t;
}

/** A selector that finds this element again, here or in a frame of the same page. */
export function selectorFor(el) {
  const doc = el.ownerDocument, win = doc.defaultView;
  const esc = (s) => (win.CSS?.escape ? win.CSS.escape(s) : String(s).replace(/[^\w-]/g, "\\$&"));
  const unique = (id) => { try { return doc.querySelectorAll("#" + esc(id)).length === 1; } catch { return false; } };
  const parts = [];
  for (let n = el; n && n.nodeType === 1 && n !== doc.body && n !== doc.documentElement; n = n.parentElement) {
    if (n.id && unique(n.id)) { parts.unshift("#" + esc(n.id)); return parts.join(" > "); }
    let part = n.tagName.toLowerCase();
    const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
    if (same.length > 1) part += `:nth-of-type(${same.indexOf(n) + 1})`;
    parts.unshift(part);
  }
  parts.unshift("body");
  return parts.join(" > ");
}

function shownRect(el, win) {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null;
  const cs = win.getComputedStyle(el);
  if (cs.visibility !== "visible") return null;
  return r;
}

const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

/** An inline link in running text: exempt from target size (WCAG 2.5.8). */
function inlineInText(el, cs) {
  if (el.tagName !== "A" || !cs.display.startsWith("inline") || cs.display === "inline-block" || cs.display === "inline-flex") return false;
  const p = el.parentElement;
  return !!p && [...p.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
}

/**
 * What is painted behind `el`, composited, or why it can't be known.
 * Walks up the ancestors' background colours; anything under the text that is
 * not one of them (an image, a positioned picture, a gradient) makes it unknown.
 */
function backdrop(el, win, doc, rect) {
  const cx = rect.left + Math.min(rect.width / 2, 24), cy = rect.top + Math.min(rect.height / 2, 12);
  if (cx >= 0 && cy >= 0 && cx < win.innerWidth && cy < win.innerHeight && doc.elementsFromPoint) {
    for (const n of doc.elementsFromPoint(cx, cy)) {
      if (n === el || el.contains(n) || n.closest(CHROME)) continue;
      if (n.contains(el)) break; // an ancestor: the walk below covers it
      if (MEDIA.has(n.tagName.toUpperCase())) return { unknown: "image" };
      const bi = win.getComputedStyle(n).backgroundImage;
      if (bi && bi !== "none") return { unknown: /gradient/.test(bi) ? "gradient" : "image" };
      if (parseColor(win.getComputedStyle(n).backgroundColor)?.a) return { unknown: "overlap" };
    }
  }
  const layers = [];
  let opacity = 1;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const cs = win.getComputedStyle(n);
    opacity *= Number(cs.opacity) || (cs.opacity === "0" ? 0 : 1);
    if (cs.backgroundImage && cs.backgroundImage !== "none") return { unknown: /gradient/.test(cs.backgroundImage) ? "gradient" : "image" };
    if ((cs.filter && cs.filter !== "none") || (cs.mixBlendMode && cs.mixBlendMode !== "normal") || (cs.backdropFilter && cs.backdropFilter !== "none")) return { unknown: "filter" };
    const c = parseColor(cs.backgroundColor);
    if (!c) return { unknown: "colour" };
    if (c.a > 0) { layers.push(c); if (c.a >= 1) break; }
  }
  let color = { r: 255, g: 255, b: 255, a: 1 }; // the canvas, when nothing is opaque
  for (let i = layers.length - 1; i >= 0; i--) color = blend(layers[i], color);
  return { color, opacity };
}

/**
 * Measure one document. `coarse` and `width` pick the target rule.
 * Returns {findings, unknown, checked}: findings carry
 * {check, selector, label, value, rule, detail, suggestion?}.
 */
export function measureDocument(doc, win, { coarse = false, width = win.innerWidth } = {}) {
  const findings = [], unknown = [], checked = { target: 0, overflow: 0, contrast: 0 };
  const counts = { target: 0, overflow: 0, contrast: 0 };
  const add = (f) => { if (counts[f.check]++ < MAX_PER_CHECK) findings.push(f); };
  const { min, rule } = targetRule({ coarse, width });

  for (const el of doc.querySelectorAll(TARGETS)) {
    if (el.closest(CHROME) || el.parentElement?.closest(TARGETS)) continue;
    const r = shownRect(el, win);
    if (!r) continue;
    const cs = win.getComputedStyle(el);
    if (inlineInText(el, cs)) continue;
    checked.target++;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w >= min && h >= min) continue;
    const short = h < min && w < min ? "both" : h < min ? "height" : "width";
    add({
      check: "target", selector: selectorFor(el), label: labelOf(el), rule,
      value: short === "both" ? `${w} × ${h}px` : short === "height" ? `${h}px tall` : `${w}px wide`,
      size: { width: w, height: h }, need: min,
      suggestion: { kind: "tweak", property: short === "width" ? "min-width" : "min-height", from: `${short === "width" ? w : h}px`, to: `${min}px` },
    });
  }

  let n = 0;
  for (const el of doc.body ? doc.body.querySelectorAll("*") : []) {
    if (++n > MAX_ELEMENTS) break;
    if (SKIP.has(el.tagName.toUpperCase()) || !ownText(el) || el.closest(CHROME)) continue;
    const r = shownRect(el, win);
    if (!r) continue;
    const cs = win.getComputedStyle(el);

    // Clipped or cut off.
    if (el.clientWidth > 0) {
      checked.overflow++;
      const hidden = (v) => v === "hidden" || v === "clip";
      const wide = el.scrollWidth > el.clientWidth + 1, tall = el.scrollHeight > el.clientHeight + 1;
      const how = cs.textOverflow === "ellipsis" && wide ? "truncated with an ellipsis"
        : cs.webkitLineClamp && cs.webkitLineClamp !== "none" && tall ? `clamped to ${cs.webkitLineClamp} lines`
        : hidden(cs.overflowX) && wide ? "clipped at the side"
        : hidden(cs.overflowY) && tall ? "clipped at the bottom" : "";
      if (how) add({
        check: "overflow", selector: selectorFor(el), label: labelOf(el), rule: "Text fits its box: nothing clipped or cut off", how,
        value: wide ? `${el.scrollWidth}px of text in ${el.clientWidth}px` : `${el.scrollHeight}px of text in ${el.clientHeight}px`,
      });
    }

    // Contrast.
    const fg = parseColor(cs.color);
    const px = parseFloat(cs.fontSize) || 16, weight = Number(cs.fontWeight) || 400;
    const back = fg ? backdrop(el, win, doc, r) : { unknown: "colour" };
    if (back.unknown) {
      if (unknown.length < MAX_PER_CHECK) unknown.push({ check: "contrast", selector: selectorFor(el), label: labelOf(el), reason: back.unknown });
      continue;
    }
    checked.contrast++;
    const text = blend({ ...fg, a: fg.a * back.opacity }, back.color);
    const ratio = contrastRatio(text, back.color);
    const need = requiredRatio(px, weight);
    if (ratio >= need) continue;
    const to = passingColor(text, back.color, need);
    add({
      check: "contrast", selector: selectorFor(el), label: labelOf(el), ratio, need,
      value: `${ratioText(ratio)} contrast`,
      rule: `Text contrast: ${need}:1${need === 3 ? " for large text" : ""}`,
      detail: `${toHex(text)} on ${toHex(back.color)}, ${Math.round(px * 10) / 10}px${weight >= 700 ? " bold" : ""} text`,
      ...(to ? { suggestion: { kind: "tweak", property: "color", from: toHex(fg), to } } : {}),
    });
  }
  return { findings, unknown, checked };
}

/**
 * One finding per element and check, with the widths it fails at; then one row
 * per identical failure, so two "Start free trial" buttons at 39px read as one
 * row with two targets rather than two rows saying the same thing.
 */
export function mergeRuns(runs) {
  const byKey = new Map(), unknown = new Map();
  for (const run of runs) {
    for (const f of run.findings || []) {
      // One row per element and check. Where the rule differs by width (24px
      // pointer targets on desktop, 44px touch targets on a phone), the row
      // carries the strictest one, so its number and its fix satisfy every width.
      const k = f.check + "|" + f.selector;
      const had = byKey.get(k);
      if (!had) byKey.set(k, { ...f, widths: [run.width] });
      else { if ((f.need || 0) > (had.need || 0)) Object.assign(had, { ...f, widths: had.widths }); had.widths.push(run.width); }
    }
    for (const u of run.unknown || []) {
      const k = u.check + "|" + u.selector;
      if (!unknown.has(k)) unknown.set(k, { ...u, widths: [] });
      unknown.get(k).widths.push(run.width);
    }
  }
  const rows = new Map();
  for (const f of byKey.values()) {
    f.widths.sort((a, b) => a - b);
    const k = [f.check, f.label, f.rule, f.value, f.widths.join(",")].join("|");
    if (!rows.has(k)) rows.set(k, { ...f, selectors: [] });
    rows.get(k).selectors.push(f.selector);
  }
  const order = { target: 0, overflow: 1, contrast: 2 };
  return {
    findings: [...rows.values()].sort((a, b) => order[a.check] - order[b.check]),
    unknown: [...unknown.values()],
  };
}

/** "390, 820 and 1440". */
export function listWidths(widths) {
  const w = [...new Set(widths)].sort((a, b) => a - b);
  return w.length < 2 ? String(w[0] ?? "") : `${w.slice(0, -1).join(", ")} and ${w.at(-1)}`;
}

/** The passed checks as one line, or "" when every check found something. */
export function passedLine(findings, unknown, checked) {
  const failed = new Set(findings.map((f) => f.check));
  const bits = [];
  if (!failed.has("contrast") && checked.contrast) bits.push(unknown.length ? "contrast on every text pair that could be measured" : "contrast on every text pair");
  if (!failed.has("overflow") && checked.overflow) bits.push("no overflow or clipped text");
  if (!failed.has("target") && checked.target) bits.push("every target is big enough");
  return bits.length ? `Passed: ${bits.join(", ")}` : "";
}

const nextFrame = (win) => new Promise((r) => win.requestAnimationFrame(() => win.requestAnimationFrame(r)));

/** Measure this page at `width` x `height` in a hidden frame. */
function measureInFrame(width, height, { timeout = 10000, mark = (el) => el } = {}) {
  return new Promise((resolve) => {
    const frame = mark(document.createElement("iframe"));
    frame.name = FRAME_NAME;
    frame.title = `Measuring at ${width}px`;
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    Object.assign(frame.style, { position: "fixed", left: "-30000px", top: "0", width: width + "px", height: height + "px", border: "0", opacity: "0", pointerEvents: "none" });
    let done = false;
    const finish = (out) => { if (done) return; done = true; clearTimeout(timer); frame.remove(); resolve({ width, ...out }); };
    const timer = setTimeout(() => finish({ ok: false, error: "did not load in time" }), timeout);
    frame.addEventListener("load", async () => {
      try {
        const win = frame.contentWindow, doc = frame.contentDocument;
        if (!doc?.body) return finish({ ok: false, error: "could not be read" });
        await nextFrame(win);
        await new Promise((r) => setTimeout(r, 300)); // web fonts and a client render settling
        finish({ ok: true, ...measureDocument(doc, win, { coarse: false, width }) });
      } catch { finish({ ok: false, error: "could not be read" }); }
    }, { once: true });
    frame.src = location.href;
    document.body.append(frame);
  });
}

/**
 * Run every check: here at the current width, and at 390, 820 and 1440 in
 * hidden frames (skipped with `frames: false`). Returns
 * {at, width, widths, skipped, findings, unknown, checked, passed}.
 */
export async function runChecks({ frames = true, sizes = SIZES, timeout, mark } = {}) {
  const width = innerWidth;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const here = { width, ok: true, ...measureDocument(document, window, { coarse, width }) };
  const others = frames ? await Promise.all(sizes.filter(([w]) => w !== width).map(([w, h]) => measureInFrame(w, h, { timeout, mark }))) : [];
  const runs = [here, ...others.filter((r) => r.ok)];
  const merged = mergeRuns(runs);
  const checked = { target: 0, overflow: 0, contrast: 0 };
  for (const r of runs) for (const k of CHECKS) checked[k] += r.checked?.[k] || 0;
  return {
    at: Date.now(), width,
    widths: runs.map((r) => r.width),
    skipped: others.filter((r) => !r.ok).map((r) => ({ width: r.width, error: r.error })),
    ...merged, checked,
    passed: passedLine(merged.findings, merged.unknown, checked),
  };
}
