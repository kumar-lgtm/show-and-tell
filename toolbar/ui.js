/**
 * The look of everything sharekit adds to the toolbar.
 *
 * Our three panels — agent replies, agent critique, layout intent — are not
 * agentation's. They are ours, filling gaps the component does not have (it has
 * no thread UI, no critique surface, and no way to ask what a drag meant). But a
 * reviewer does not know that and should not be able to tell: from their side it
 * is one tool, and three panels in three slightly different design languages
 * read as three bolted-on things rather than one product.
 *
 * So this is the one place the design lives. Values below are not "close to"
 * agentation — they were read out of `agentation@3.0.2`'s compiled stylesheet:
 *
 *   - **Dark is the BASE, light is the override.** `.toolbarContainer` is
 *     `#1D1A2F` on `#fff` text, and every light rule is scoped under
 *     `[data-agentation-theme=light]`. Panels defaulting to light — as ours did,
 *     via `prefers-color-scheme` — sat bright white next to a dark toolbar for
 *     every reviewer who had not changed the OS setting.
 *   - **Text is an opacity scale, not a palette**: .85 primary, .62 secondary,
 *     .55 tertiary, .2 disabled, over the surface colour. (Agentation's own
 *     tertiary is .4; ours is higher so 12px text keeps 4.5:1, dark and light.)
 *   - **The "border" is a shadow ring** (`0 0 0 1px`), so panels have no border
 *     box of their own — that is why the toolbar looks like it floats.
 *   - **Radii are small**: 4 / 6 / 8px. Ours were 9 and 14, which read as a
 *     different toolkit at a glance.
 *   - **Markers are 22px, `translate(-50%,-50%)`, `0.6875rem/600`,** with
 *     `0 2px 6px rgba(0,0,0,.2), inset 0 0 0 1px rgba(0,0,0,.04)` — and NO white
 *     border. Ours had a 2px white ring and positioned from the top-left corner,
 *     so agent markers were both a different shape and half a marker off from
 *     where the toolbar's own would sit.
 *
 * ⚠️ NO BACKTICKS anywhere in this file's CSS or its comments. The stylesheet is
 * a JS template literal, and one backtick ends the string — a trap this
 * repository has now hit four times.
 */

import { isMine } from "./reviewer.js";
import { installChromeCSS } from "./chrome.css.js";

import { FONT, DISPLAY, MONO, INK, RAISED, PAPER, ACCENT, ON_ACCENT, ACCENT_TINT, ACCENT_INK, FOCUS, CHALK_RGB, INK_RGB, RADIUS } from "./brand.js";

/**
 * Why a save failed, in words the reviewer can act on. Their text is always
 * kept where it was typed, so every message ends in "try again".
 * `status` 0 means the request never got an answer.
 */
export function failMessage(status, what = "save") {
  if (status === 413) return `Too long to ${what}. Shorten it and try again.`;
  if (status === 409) return `The review server could not ${what} this (its stored copy of this note is out of step). Your text is kept; try again, or tell the agent.`;
  if (status === 403) return `The review server refused this. Your text is kept.`;
  if (!status) return `Could not ${what}: the review server did not answer. Your text is kept; try again when it is back.`;
  return `Could not ${what} (${status}). Your text is kept; try again.`;
}
/** The HTTP status in an upstream "Failed to … : 413" error, or 0. */
export const statusOf = (err) => Number(String(err?.message || "").match(/: (\d{3})$/)?.[1] || 0);

/**
 * One z-order for everything we add. Panels share a single level because only
 * one is ever visible (see `slotPanel`); toasts and the offline notice sit just
 * above them, markers below.
 */
export const Z = { marker: 2147483640, panel: 2147483644, notice: 2147483645, toast: 2147483646 };

/**
 * The panel slot: the space above the toolbar holds one panel at a time.
 *
 * The inbox, the Send panel, an agent's question, the name prompt and (on a
 * narrow screen) the More tray all used to open independently, so a question
 * arriving after Send opened UNDER the still-open Send panel, and More opened
 * under the inbox on a phone. Each panel now says whether it wants the slot:
 *
 *   - an `active` want is the reviewer opening something; the newest wins;
 *   - a `passive` want (a question that arrived, the text-edit strip) only
 *     shows when nothing active wants the slot, and waits otherwise.
 *
 * A panel that loses the slot is hidden, not closed, so it comes back when the
 * one in front of it closes. A waiting question still shows as the inbox badge.
 */
const slot = new Map();
let slotSeq = 0, settling = false, again = false;
function settle() {
  if (settling) { again = true; return; }
  settling = true;
  try {
    do {
      again = false;
      const wanting = [...slot.values()].filter((e) => e.wants);
      const newest = (list) => list.sort((a, b) => b.ts - a.ts)[0];
      const front = newest(wanting.filter((e) => !e.passive)) || newest(wanting.filter((e) => e.passive)) || null;
      for (const e of slot.values()) {
        const vis = e === front;
        if (e.visible !== vis) { e.visible = vis; try { e.show(vis); } catch { /* one panel must not break the rest */ } }
      }
    } while (again);
  } finally { settling = false; }
  document.dispatchEvent(new CustomEvent("agentation-kit:slot", { detail: { panel: slotFront() } }));
}
/** Which panel holds the slot, or null. */
export function slotFront() {
  for (const [name, e] of slot) if (e.visible) return name;
  return null;
}
/**
 * Register a panel. `show(visible)` puts it on or off screen. Returns
 * `want(on, { passive, bump })`: `bump` moves an already-open panel to the
 * front (the reviewer clicked it again); a re-render leaves the order alone.
 */
export function slotPanel(name, show) {
  const e = { wants: false, passive: false, ts: 0, visible: false, show };
  slot.set(name, e);
  return {
    want(on, { passive = false, bump = false } = {}) {
      if (on && (!e.wants || bump)) e.ts = ++slotSeq;
      e.wants = !!on; e.passive = passive;
      settle();
    },
    get visible() { return e.visible; },
    get wants() { return e.wants; },
  };
}

/**
 * A status and its message, said once. The agent's offline message is
 * "Local agent listener is offline.", and "Agent offline: Local agent
 * listener is offline." said it twice. When the message already carries the
 * status's own word (offline, working, failed…), the message alone is enough.
 */
export function statusLine(title, message) {
  const m = String(message || "").trim();
  if (!m) return title;
  const word = String(title).trim().split(/\s+/).pop().toLowerCase();
  return word && m.toLowerCase().includes(word) ? m : `${title}: ${m}`;
}

/**
 * Surfaces a passive line (the question notice, the Check strip) steps aside
 * for, beyond the panel slot: the toolbar's own comment popup, its Settings
 * panel and the Layout palette. Settings stays mounted when closed (opacity
 * 0), so visibility is read, not presence.
 */
const UPSTREAM_SURFACES = '[data-annotation-popup],[class*="settingsPanel___"],[class*="palette___"]';

/** On screen: laid out, not hidden, and not faded out. */
export function onScreen(n) {
  if (!n?.isConnected || n.hidden) return false;
  const r = n.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  const cs = getComputedStyle(n);
  return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.05;
}

/**
 * Is anything else open? Any other panel holding the slot, the toolbar's
 * popup, Settings or Layout palette, or a dialog or recording dock in one of
 * our shadow hosts (the Tweak panel and its picker, Talk's dock).
 *
 * A passive line asks this and steps aside while it is true, at every width:
 * on a phone the Check strip sat on the Tweak sheet's footer and on Settings.
 * `slots` names the slot panels that are the caller's own, `hosts` its own
 * shadow hosts, so it never steps aside for itself.
 */
export function othersOpen({ slots = [], hosts = [] } = {}) {
  const front = slotFront();
  if (front && !slots.includes(front)) return true;
  for (const n of document.querySelectorAll(UPSTREAM_SURFACES)) if (onScreen(n)) return true;
  for (const h of document.querySelectorAll(".sk-edit-ui")) {
    if (hosts.includes(h) || !h.shadowRoot || h.style.display === "none") continue;
    for (const n of h.shadowRoot.querySelectorAll("[role=dialog], .dock")) if (onScreen(n)) return true;
  }
  return false;
}

/**
 * Review surfaces never cover the page being reviewed.
 *
 * Instead of floating over content, every visible surface reserves its side
 * of the viewport, and the page reflows into what is left. One injected
 * stylesheet adds padding to the root (plus scroll-padding, so focus and
 * scrollIntoView land in the free area); host inline styles are never
 * touched, and removing the stylesheet restores the page exactly.
 *
 *   - Wide (>= 900px): panels dock as a right side sheet; the page is inset by
 *     their column. The toolbar, recording dock and toasts reserve a bottom
 *     band, so the last content can always scroll above them.
 *   - Narrow: panels become bottom sheets (at most 55% of the height, scrolling
 *     inside), and the bottom band grows to match.
 *
 * Surfaces register an ELEMENT and a side. Sizes are measured from the element
 * each time, and a hidden or detached element reserves nothing, so a surface
 * that forgets to release cannot leave the page inset.
 */
export const WIDE = 900;
const surfaces = new Map(); // element -> 'right' | 'bottom'
let insetStyle = null, insetKey = '', insetFrame = 0, insetTimer = 0;
const TOOLTIP_ROOM = 36; // the toolbar's own button tooltips open above it

function shown(n) {
  if (!n?.isConnected) return null;
  const r = n.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? r : null;
}
export function toolbarShell() {
  return document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']");
}
/** The band the toolbar occupies, measured from the nearest viewport edge. */
function toolbarBand() {
  const r = shown(toolbarShell());
  if (!r) return { top: 0, bottom: 0 };
  return (r.top + r.bottom) / 2 > innerHeight / 2
    ? { top: 0, bottom: Math.max(0, innerHeight - r.top + TOOLTIP_ROOM) }
    : { top: Math.max(0, r.bottom + 12), bottom: 0 };
}
export function reserveSurface(el, side) { if (el) { surfaces.set(el, side); scheduleInsets(); } }
export function releaseSurface(el) { if (surfaces.delete(el)) scheduleInsets(); }
/**
 * The host page's own pinned chrome, declared with data-show-and-tell-reserve="top|bottom" (data-agentation-reserve, the name before the rename, still works)
 * (a sticky header, a fixed footer). It already takes its own space, so it adds no
 * padding; it only narrows the free area that pointed targets are revealed into.
 */
export function hostChrome() {
  let top = 0, bottom = 0;
  for (const el of document.querySelectorAll('[data-show-and-tell-reserve], [data-agentation-reserve]')) {
    const r = shown(el);
    if (!r) continue;
    const side = el.getAttribute('data-show-and-tell-reserve') || el.getAttribute('data-agentation-reserve');
    if (side === 'top' && r.top <= 1) top = Math.max(top, r.bottom);
    else if (side === 'bottom' && r.bottom >= innerHeight - 1) bottom = Math.max(bottom, innerHeight - r.top);
  }
  return { top: Math.round(top), bottom: Math.round(bottom) };
}
/** Current insets: {top, right, bottom} in px. */
export function currentInsets() {
  const band = toolbarBand();
  let right = 0, bottom = band.bottom;
  for (const [el, side] of surfaces) {
    const r = shown(el);
    if (!r) { if (!el.isConnected) surfaces.delete(el); continue; }
    if (side === 'right') right = Math.max(right, innerWidth - r.left + 12);
    else bottom = Math.max(bottom, innerHeight - r.top + 8);
  }
  return { top: Math.round(band.top), right: Math.round(right), bottom: Math.round(Math.min(bottom, innerHeight * 0.8)) };
}
export function scheduleInsets() {
  if (insetFrame) return;
  insetFrame = requestAnimationFrame(() => { insetFrame = 0; applyInsets(); });
}
function applyInsets() {
  // Never reflow under an in-flight drag: its start point is in the old layout.
  if (window.__AGENTATION_KIT_POINTER_DRAG__) { setTimeout(scheduleInsets, 120); return; }
  const inset = currentInsets();
  const key = JSON.stringify(inset);
  if (key === insetKey) return;
  insetKey = key;
  if (!inset.top && !inset.right && !inset.bottom) { insetStyle?.remove(); insetStyle = null; announceInsets(inset); return; }
  // Add to the page's own root padding rather than replacing it.
  insetStyle?.remove();
  const chrome = hostChrome();
  const cs = getComputedStyle(document.documentElement);
  const base = (k) => parseFloat(cs[k]) || 0;
  const pad = { top: base('paddingTop'), right: base('paddingRight'), bottom: base('paddingBottom') };
  insetStyle = document.createElement('style');
  insetStyle.dataset.agentationKitInsets = '';
  insetStyle.textContent = 'html{' +
    (inset.top ? 'padding-top:' + (pad.top + inset.top) + 'px!important;' : '') +
    (inset.right ? 'padding-right:' + (pad.right + inset.right) + 'px!important;' : '') +
    (inset.bottom ? 'padding-bottom:' + (pad.bottom + inset.bottom) + 'px!important;' : '') +
    'scroll-padding:' + Math.max(inset.top, chrome.top) + 'px ' + inset.right + 'px ' + Math.max(inset.bottom, chrome.bottom) + 'px 0!important}';
  document.head.append(insetStyle);
  announceInsets(inset);
}
function announceInsets(inset) {
  window.__AGENTATION_KIT_INSETS__ = inset;
  document.dispatchEvent(new CustomEvent('agentation-kit:insets', { detail: inset }));
}
/** Remove every reservation and the stylesheet (teardown). */
export function destroyInsets() { surfaces.clear(); clearInterval(insetTimer); insetTimer = 0; insetStyle?.remove(); insetStyle = null; insetKey = ''; }
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && typeof document?.addEventListener === 'function' && typeof requestAnimationFrame === 'function') {
  window.addEventListener('resize', scheduleInsets);
  document.addEventListener('agentation-kit:toolbar-position', scheduleInsets);
  // The toolbar animates open and closed, and can be dragged: a cheap re-measure.
  insetTimer = setInterval(scheduleInsets, 500);
}

/** Viewport rect that no review surface covers. */
export function freeArea() {
  const i = currentInsets(), c = hostChrome();
  return { left: 0, top: Math.max(i.top, c.top), right: innerWidth - i.right, bottom: innerHeight - Math.max(i.bottom, c.bottom) };
}

/**
 * Bring a page rectangle into the free area when a surface would cover it.
 * Returns the scroll applied. Respects reduced motion.
 */
export function revealRect(rect) {
  const f = freeArea();
  let dy = 0;
  if (rect.bottom > f.bottom) dy = rect.bottom - f.bottom + 8;
  if (rect.top + -dy < f.top) dy = rect.top - f.top - 8;
  if (!dy) return 0;
  scrollBy({ top: dy, behavior: 'instant' });
  return dy;
}

/**
 * What the reviewer is working on: the element a panel is about (the target
 * being reassigned in Talk, the note an agent's question or decision is on).
 * A side sheet never covers it. `what` is an element, or a function returning
 * a rect (or null). Setting it re-places every open side sheet.
 */
let working = null;
const sideSheets = new Map(); // panel -> width
export function setWorking(what) {
  working = what || null;
  for (const [panel, width] of sideSheets) if (panel.isConnected && shown(panel)) placeNearToolbar(panel, width);
}
/**
 * Where an element's content actually is: a heading's block runs the full
 * column, but its words may fill a third of it. The union of its contents'
 * boxes (a Range over them), else its own box.
 */
export function inkRect(el) {
  try {
    const range = document.createRange(); range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    if (r.width && r.height) return r;
  } catch {}
  return el.getBoundingClientRect();
}
function workingRect() {
  try {
    if (typeof working === 'function') return working() || null;
    if (working?.isConnected) return inkRect(working);
  } catch {}
  return null;
}
/** Forget the working target, if it is still `what` (another surface may have set its own since). */
export function clearWorking(what) { if (working === what) setWorking(null); }
/**
 * Which side a side sheet of `w` px goes on: the right, unless it covers more
 * of the working target there than it would on the left.
 */
export function sheetSide(w, rect = workingRect(), width = innerWidth) {
  if (!rect || !rect.width) return 'right';
  const over = (a, b) => Math.max(0, Math.min(rect.right, b) - Math.max(rect.left, a));
  const right = over(width - 16 - w - 8, width), left = over(0, 16 + w + 8);
  return right > left ? 'left' : 'right';
}

/**
 * Dock a panel as a sheet: a side sheet on a wide screen, floating over the
 * page, and a bottom sheet (<= 55% of the height, scrolling inside) on a
 * narrow one. Both sit clear of the toolbar band.
 *
 * A side sheet does not reserve its width. Reserving it reflowed the page on
 * every open: a 1280 page reviewed at about 870, past the site's own
 * breakpoints, with notes tagged at a width the reviewer never chose. It
 * floats instead, and moves to the left edge when it would cover what the
 * reviewer is working on (`setWorking`). A bottom sheet still reserves its
 * height: that only adds room to scroll past it, and nothing rewraps.
 */
export function placeNearToolbar(panel, width = 320) {
  if (!panel) return;
  const band = toolbarBand();
  panel.style.position = 'fixed';
  if (innerWidth >= WIDE) {
    let w = Math.min(width, innerWidth - 24);
    const side = sheetSide(w), ink = workingRect();
    // Still over the working target on the better side: narrow the sheet to
    // the room beside it, down to 300px, rather than cover its words.
    if (ink?.width) {
      const room = side === 'left' ? ink.left - 16 - 8 : innerWidth - 16 - 8 - ink.right;
      if (room < w && room >= 300) w = Math.floor(room);
    }
    Object.assign(panel.style, { width: w + 'px', left: side === 'left' ? '16px' : 'auto', right: side === 'left' ? 'auto' : '16px', top: 'auto', bottom: Math.max(16, band.bottom) + 'px', maxHeight: Math.max(160, innerHeight - Math.max(16, band.bottom) - Math.max(16, band.top)) + 'px' });
    panel.dataset.sheet = 'side'; panel.dataset.side = side;
    sideSheets.set(panel, width);
    releaseSurface(panel);
  } else {
    Object.assign(panel.style, { width: 'auto', left: '12px', right: '12px', top: 'auto', bottom: Math.max(12, band.bottom - TOOLTIP_ROOM + 8) + 'px', maxHeight: Math.round(innerHeight * 0.55) + 'px' });
    panel.dataset.sheet = 'bottom'; delete panel.dataset.side;
    sideSheets.delete(panel);
    reserveSurface(panel, 'bottom');
  }
  scheduleInsets();
}

/** A small toast or strip: right-aligned just above the toolbar, in the reserved band. */
export function placeToast(el, width = 320) {
  if (!el) return;
  const band = toolbarBand();
  const w = Math.min(width, innerWidth - 24);
  const bar = shown(toolbarShell());
  Object.assign(el.style, { position: 'fixed', width: w + 'px', top: 'auto', bottom: Math.max(16, band.bottom - TOOLTIP_ROOM + 10) + 'px',
    left: Math.max(12, Math.min((bar ? bar.right : innerWidth - 16) - w, innerWidth - w - 12)) + 'px', right: 'auto' });
  reserveSurface(el, 'bottom');
}

/**
 * Mark a node as CHROME, so the toolbar never treats it as the page.
 *
 * ⚠️ Every sharekit element in the light DOM must call this. It is the single
 * attribute `agentation@3.0.2` uses to tell its own UI from the site's, and it
 * is checked in every path that matters: hover (`handleMouseMove`), click
 * (`handleClick`), section detection for layout mode (`collectDOMCandidates`,
 * `collectSections`), the screenshot target picker (`pickTarget`), the content
 * -area heuristic, and animation freezing.
 *
 * Nothing we set means anything to it. `data-sk-no-edit` and `.sk-edit-ui` are
 * OUR conventions — edit mode reads them, the toolbar has never heard of them —
 * so for four months the "Edit text" pill, the reply/critique/layout panels and
 * the agent's own markers were all annotatable page content. Turning agentation
 * on made the reviewer's crosshair land on sharekit's UI: hovering the pill
 * highlighted `<button id=commit>`, clicking it opened a comment popup about our
 * own chrome, and layout mode listed the panels as draggable sections of the
 * site. It is worse than it sounds because the guard `closestCrossingShadow`
 * uses walks UP through shadow hosts while `deepElementFromPoint` reaches DOWN
 * into them — our roots are `open`, so the picker descends inside and names
 * elements the page does not contain.
 *
 * One attribute on the HOST covers everything beneath it, in the shadow or not.
 */
export function markChrome(el) {
  el.setAttribute("data-feedback-toolbar", "");
  return el;
}

/**
 * Focus never falls to the page (UX review 4, F-Add, F-Answer, F-Return).
 *
 * Our panels re-render, animate out and close, and every one of those removes
 * or hides the focused node: the browser then puts focus on <body>, and a
 * keyboard reviewer has to Tab from the top of the page back to the bar.
 */
/** The focused element, through our open shadow roots. */
export function deepActive() {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}
/**
 * Focus is nowhere useful: on the page body, or on a node that has left the
 * screen (removed, or hidden with its panel, which the browser only notices
 * at its next style pass).
 */
export function focusLost() {
  const a = deepActive();
  return !a || a === document.body || a === document.documentElement || !a.isConnected || !a.getClientRects().length;
}
const focusable = (n) => !!n && n.isConnected && !n.disabled && !n.hidden && n.getClientRects().length > 0 && !n.closest?.("[inert]");
/** Focus the first candidate (a node or a selector) that is on screen. Returns it, or null. */
export function focusFirst(...candidates) {
  for (const c of candidates.flat()) {
    const n = typeof c === "string" ? document.querySelector(c) : typeof c === "function" ? c() : c;
    if (focusable(n)) { n.focus({ preventScroll: true }); return n; }
  }
  return null;
}
/**
 * The bar's current mode button: the pressed one of the four, or on a phone
 * the one mode button. Where focus goes when a mode's own surface closes
 * (the Tweak panel, Talk's review, Edit text) and nothing else should have it.
 */
export function modeButton() {
  const bar = document.querySelector("[data-agentation-toolbar]");
  if (!bar) return null;
  return [...bar.querySelectorAll('.sk-modes button[aria-pressed="true"], [data-review=mode]')].find(focusable) || null;
}
/** Focus the current mode button. Returns it, or null. */
export const focusMode = () => focusFirst(modeButton);

/**
 * Focus by key, not by node (UX review 5, F-Answer). A panel that rebuilds
 * its list on every save and stream frame replaces the focused node each time,
 * so a hold on the node, or a timer, loses the keyboard user whenever a
 * re-render comes later than the timer allowed. This remembers WHERE focus is
 * as two words, the row (`rows` matches it, `rowKey` names it) and the control
 * in it, and `restore()` puts focus back on the same row and control in the
 * new nodes after any render, then scrolls the row into the panel's view.
 *
 * It forgets as soon as the reviewer leaves on purpose: a pointer press
 * outside `root`, or focus moving to anything outside it.
 */
export function focusKeeper(root, { rows, rowKey, when = () => true, fallback = () => null } = {}) {
  let key = null;
  const controlKey = (n) => n.dataset?.focus || n.getAttribute?.("aria-label") || n.id || (n.textContent || "").trim().slice(0, 60);
  const keyOf = (n) => {
    if (!(n instanceof Element) || !root.contains(n)) return null;
    const row = rows ? n.closest(rows) : null;
    return { row: row ? rowKey(row) : null, control: row === n ? "" : controlKey(n) };
  };
  const forget = () => { key = null; };
  root.addEventListener("focusin", (e) => { key = keyOf(e.composedPath()[0]); });
  document.addEventListener("focusin", () => { const a = deepActive(); if (a && a !== document.body && !root.contains(a)) forget(); }, true);
  addEventListener("pointerdown", (e) => { if (!e.composedPath().includes(root)) forget(); }, true);
  /** The node the key names in the current render, or null. */
  function target() {
    if (!key) return null;
    let scope = root, row = null;
    if (key.row !== null) {
      row = [...root.querySelectorAll(rows)].find((r) => rowKey(r) === key.row && focusable(r)) || null;
      if (!row) return null;
      scope = row;
      if (!key.control) { row.tabIndex = -1; return row; }
    }
    const control = [...scope.querySelectorAll("button,textarea,input,select,a[href],[tabindex]")].find((n) => controlKey(n) === key.control && focusable(n));
    if (control) return control;
    // The control went with the render (Answer is gone once answered): the row.
    if (row) { row.tabIndex = -1; return row; }
    return null;
  }
  return {
    get key() { return key; },
    forget,
    set(next) { key = next; },
    target,
    /** After a render: put focus back if the render took it. Returns the node focused, or null. */
    restore() {
      if (!key || !when() || !focusLost()) return null;
      const n = focusFirst(target, fallback);
      if (n) (n.closest?.(rows || "*") || n).scrollIntoView?.({ block: "nearest" });
      return n;
    },
  };
}

let holding = null;
/**
 * For `ms`, whenever focus falls to the page, put it on `target()` (a node, or
 * null to wait). For the gap between an action and the re-render or exit
 * animation that follows it, which can come several hundred ms later.
 * `when()` gates it (e.g. "the popup has gone"). It lets go as soon as the
 * reviewer acts: a pointer press anywhere, or focus moving somewhere it did
 * not put it. One hold at a time; a new one replaces the last.
 */
export function holdFocus(target, { ms = 1500, when = () => true } = {}) {
  holding?.stop();
  const end = performance.now() + ms;
  let placed = null, placing = false, frame = 0;
  let live = true;
  const h = {
    stop() {
      live = false;
      cancelAnimationFrame(frame);
      removeEventListener("pointerdown", h.stop, true);
      document.removeEventListener("focusin", moved, true);
      if (holding === h) holding = null;
    },
    /** Restore now, not on the next frame: call it right after a re-render. */
    check() {
      if (!live) return;
      if (performance.now() > end) { h.stop(); return; }
      if (focusLost() && when()) { placing = true; try { placed = focusFirst(target) || placed; } finally { placing = false; } }
    },
  };
  const moved = () => { if (placing) return; const a = deepActive(); if (a && a !== placed && a !== document.body) h.stop(); };
  const tick = () => { h.check(); if (live) frame = requestAnimationFrame(tick); };
  addEventListener("pointerdown", h.stop, true);
  document.addEventListener("focusin", moved, true);
  holding = h;
  frame = requestAnimationFrame(tick);
  return h;
}

/** The one close icon every panel header draws (N13). */
export const CLOSE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

/**
 * Where the reviewer's theme choice actually lives.
 *
 * The toolbar renders through a portal wrapper carrying
 * `data-agentation-root` and `data-agentation-theme="dark|light"`, driven by its
 * settings panel and persisted to the localStorage key below. Reading the
 * attribute means we follow the toggle the reviewer already has, rather than
 * offering a second one that disagrees with it.
 */
const THEME_KEY = "feedback-toolbar-theme";

export function currentTheme() {
  const root = document.querySelector("[data-agentation-root]");
  const live = root?.getAttribute("data-agentation-theme");
  if (live === "dark" || live === "light") return live;
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* private mode */ }
  // Dark, because that is agentation's default — not the OS preference, which
  // is what we used to follow and which disagreed with the toolbar constantly.
  return "dark";
}

/**
 * Keep a shadow host's theme in step with the toolbar's, including live changes.
 *
 * The reviewer can flip the theme in the toolbar's settings at any time. Reading
 * it once at build time meant our panels stayed on whatever was set when they
 * first opened, so toggling produced a half-dark, half-light screen.
 *
 * Returns a stop function; harmless to ignore, since the observer dies with the
 * page anyway.
 */
export function mirrorTheme(host) {
  const apply = () => { host.dataset.skTheme = currentTheme(); };
  apply();
  const root = document.querySelector("[data-agentation-root]");
  if (!root || typeof MutationObserver === "undefined") return () => {};
  const obs = new MutationObserver(apply);
  obs.observe(root, { attributes: true, attributeFilter: ["data-agentation-theme"] });
  return () => obs.disconnect();
}

/**
 * The shared stylesheet. Concatenate into a shadow root's <style> before any
 * panel-specific rules.
 *
 * Colours are exposed as custom properties so a panel can accent itself (the
 * critique panel is amber, the layout prompt green) without restating the
 * surface, text and radius scale and drifting from it.
 */
export function baseCSS() {
  return `
    :host { all: initial; }
    /* "all: initial" resets box-sizing to CONTENT-BOX, so any "width: 100%"
       with padding overflows its panel. This one line is why the reply
       textarea used to sit past its own border. */
    *, *::before, *::after { box-sizing: border-box; }

    :host {
      --sk-font: ${FONT};
      --sk-display: ${DISPLAY};
      --sk-mono: ${MONO};
      /* Dark is the base, matching the toolbar: ink, with chalk text. */
      --sk-surface: ${INK};
      --sk-raised: ${RAISED};
      --sk-text: rgba(${CHALK_RGB},0.94);
      /* Every text step reads at 4.5:1 or more at 12px, on the surface and
         on raised rows (test/brand.test.mjs measures it). */
      --sk-text-2: rgba(${CHALK_RGB},0.74);
      --sk-text-3: rgba(${CHALK_RGB},0.64);
      --sk-hairline: rgba(${CHALK_RGB},0.12);
      --sk-hover: rgba(${CHALK_RGB},0.1);
      --sk-ring: 0 8px 28px rgba(12,10,24,0.36), 0 0 0 1px rgba(${CHALK_RGB},0.14);
      --sk-accent: ${ACCENT};
      /* Ink on tomato is 5.6:1; white is 3.1:1. */
      --sk-on-accent: ${ON_ACCENT};
      /* Accent as TEXT on the dark surface. */
      --sk-accent-text: ${ACCENT_TINT};
      /* Keyboard focus is yellow and nothing else is, so it never competes
         with the accent. */
      --sk-focus: ${FOCUS};
      --sk-r-control: ${RADIUS.control};
      --sk-r-panel: ${RADIUS.panel};
    }
    :host([data-sk-theme=light]) {
      --sk-surface: ${PAPER};
      --sk-raised: rgba(${INK_RGB},0.045);
      --sk-text: rgba(${INK_RGB},0.94);
      --sk-text-2: rgba(${INK_RGB},0.74);
      --sk-text-3: rgba(${INK_RGB},0.66);
      --sk-hairline: rgba(${INK_RGB},0.12);
      --sk-hover: rgba(${INK_RGB},0.07);
      --sk-ring: 0 2px 8px rgba(${INK_RGB},0.1), 0 8px 24px rgba(${INK_RGB},0.1), 0 0 0 1px rgba(${INK_RGB},0.1);
      --sk-accent-text: ${ACCENT_INK};
      /* Yellow is 1.5:1 on paper: the ring is ink there. */
      --sk-focus: ${INK};
    }

    .panel {
      position: fixed; z-index: ${Z.panel};
      font: 400 13px/1.5 var(--sk-font);
      background: var(--sk-surface); color: var(--sk-text);
      /* Ring, not border — the toolbar has no border box, which is what makes
         it read as floating rather than as a card. */
      border: none; border-radius: var(--sk-r-panel); box-shadow: var(--sk-ring);
      overflow: hidden;
      transition: opacity .12s ease, transform .12s ease;
    }

    .hd {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 12px 10px 14px; border-bottom: 1px solid var(--sk-hairline);
      font-size: 12px; font-weight: 600; color: var(--sk-text);
    }
    .hd .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sk-accent); flex: none; }
    .hd .grow { margin-left: auto; font-size: 12px; font-weight: 400; color: var(--sk-text-3); }
    .iconbtn {
      border: 0; background: none; cursor: pointer; padding: 3px 5px; border-radius: 4px;
      font: inherit; font-size: 13px; line-height: 1; color: var(--sk-text-3);
    }
    .iconbtn:hover { background: var(--sk-hover); color: var(--sk-text); }
    /* One panel header (UX review 4, N13): the inbox and Send panel, From the
       agent and Agent activity all title at 13px/600 and close with the same
       drawn X, 28px square, 44px on a phone or touch screen. */
    .hd .sk-title { font: 700 15px/1.25 var(--sk-display); letter-spacing: -0.01em; color: var(--sk-text); }
    .sk-x {
      flex: none; margin-left: auto; display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; min-width: 28px; min-height: 28px; padding: 0;
      border: 0; border-radius: 8px; background: none; color: var(--sk-text-3); cursor: pointer;
    }
    .sk-x:hover { background: var(--sk-hover); color: var(--sk-text); }
    .sk-x svg { width: 16px; height: 16px; flex: none; }
    @media (pointer: coarse), (max-width: 640px) { .sk-x { width: 44px; height: 44px; min-width: 44px; min-height: 44px; } }

    .body { padding: 12px 14px 14px; }

    textarea {
      width: 100%; min-height: 56px; resize: vertical;
      font: inherit; font-size: 13px; color: var(--sk-text);
      background: var(--sk-raised); border: 1px solid var(--sk-hairline);
      border-radius: var(--sk-r-control); padding: 8px 10px; outline: none;
    }
    textarea::placeholder { color: var(--sk-text-3); }
    textarea:focus { border-color: var(--sk-focus); background: var(--sk-hover); }

    button.primary {
      font: inherit; font-size: 13px; font-weight: 600;
      background: var(--sk-accent); color: var(--sk-on-accent);
      border: 0; border-radius: var(--sk-r-control); padding: 8px 14px; cursor: pointer;
    }
    button.primary:hover { filter: brightness(1.06); }
    button.primary[disabled] { opacity: .4; cursor: default; filter: none; }
    button.ghost {
      font: inherit; font-size: 12px; color: var(--sk-text-3);
      border: 0; background: none; cursor: pointer; padding: 6px 8px; border-radius: 8px;
    }
    button.ghost:hover { background: var(--sk-hover); color: var(--sk-text); }

    .chip {
      font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 999px;
      border: 1px solid var(--sk-hairline); background: transparent;
      color: var(--sk-text-2); cursor: pointer;
    }
    .chip:hover { background: var(--sk-hover); color: var(--sk-text); }
    .chip[aria-pressed=true] {
      background: color-mix(in srgb, var(--sk-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--sk-accent) 45%, transparent);
      color: var(--sk-text); font-weight: 600;
    }

    .status { font-size: 12px; color: var(--sk-text-3); font-variant-numeric: tabular-nums; }

    /* One focus ring in every shadow root (UX review 5, #4): From the agent
       showed the browser's own, blue on a desktop and orange on a phone. A
       panel can still restyle its own (the menus fill the row instead). */
    button:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible,
    summary:focus-visible, a:focus-visible { outline: 2px solid var(--sk-focus); outline-offset: 2px; }
  `;
}

/**
 * The message thread, in the one place both panels read it from.
 *
 * Two surfaces show the same exchange from opposite ends: the reply panel, when
 * the agent asks a question about the reviewer's note, and the critique panel,
 * when the reviewer pushes back on the agent's. It is one conversation either
 * way, and having each panel render it its own way is how "who said what" ends
 * up meaning different things two inches apart.
 *
 * ⚠️ The critique panel previously showed only a "1 in thread" count. Someone
 * who replied could not see their own message, let alone an answer to it, so
 * the honest reading of the UI was that the reply had gone nowhere.
 */
export function threadCSS() {
  return `
    .thread { max-height: min(240px, 34vh); overflow-y: auto;
      display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin; }
    .m { border-radius: 6px; padding: 7px 9px; font-size: 12.5px; }
    /* The agent speaks in the accent tint, the reviewer on the raised surface —
       the asymmetry every messaging UI uses, so who-said-what survives being
       skimmed without reading the labels. */
    .m.agent { background: color-mix(in srgb, var(--sk-accent) 16%, transparent);
      border: 1px solid color-mix(in srgb, var(--sk-accent) 32%, transparent); }
    .m.reviewer { background: var(--sk-raised); border: 1px solid var(--sk-hairline); }
    /* Sentence case, as written: a name is a name, not a label. */
    .who { font-size: 11px; font-weight: 500; color: var(--sk-text-2); margin-bottom: 2px; }
  `;
}

/**
 * Paint a thread, oldest first, scrolled to the newest.
 *
 * Built from DOM nodes rather than innerHTML because every message is
 * attacker-adjacent text — an agent's reply and a reviewer's answer both arrive
 * as strings, and `textContent` is what keeps them strings.
 *
 * `mine` names the side reading it, so the same exchange reads correctly from
 * both ends: "You" is the reviewer in both panels, but the panel that exists to
 * show an agent's question and the one that shows an agent's critique disagree
 * about which side is the interesting one.
 */
export function paintThread(box, messages, mine = "reviewer") {
  box.textContent = "";
  for (const m of messages || []) {
    const from = m.from === "agent" ? "agent" : "reviewer";
    const row = document.createElement("div");
    row.className = `m ${from}`;
    const who = document.createElement("div");
    who.className = "who";
    // With several reviewers, "You" is only right for your own answers; someone
    // else's answer on the same thread carries their name.
    const other = from === "reviewer" && m.name && !isMine(m.name);
    who.textContent = other ? m.name : from === mine ? "You" : (from === "agent" ? "Agent" : (m.name || "Reviewer"));
    const body = document.createElement("div");
    body.textContent = m.message ?? "";
    row.append(who, body);
    box.append(row);
  }
  // Pin to the newest: the message needing a response is the last one, and a
  // thread that opens scrolled to the top hides exactly that.
  box.scrollTop = box.scrollHeight;
}

/**
 * One marker system for both layers: the reviewer's notes (the toolbar's own
 * markers) and the agent's (critique.js).
 *
 *   - **Shape and prefix tell them apart, not colour.** Reviewer markers are
 *     the toolbar's accent circles ("1"); the agent's are one quiet rounded
 *     square ("A1"). Severity is an icon and a word in the panel, never a
 *     marker colour: four marker styles on one page read as four systems.
 *   - **Markers sit just outside the element's top-left corner**, so they
 *     never cover the text they point at. Two markers on one corner step
 *     right along the top edge instead of stacking.
 *   - **They follow the page.** A docked panel reflows the page (the insets
 *     above), and so does an edit or a late font. Positions are measured from
 *     the live element on every reflow, never kept from when the note was made:
 *     the toolbar stores a note's x as a percentage of the window, which is
 *     wrong the moment a side sheet takes 488px of it.
 *
 * Both layers register here, and one pass places every marker, so the
 * collision check sees all of them. Spots are document coordinates of the
 * marker's centre (both layers draw with translate(-50%,-50%)).
 */
export const MARKER = 22;
/** How far the corner of a marker reaches into its element: inside the line's leading, clear of the glyphs. */
const MARKER_REACH = 3;

/** Side of a phone touch target, px. */
export const TOUCH = 44;
/** Two boxes share more than `e` px both ways. */
const overlaps = (a, b, e = 0.5) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > e && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > e;

/**
 * Rects of text, grouped into lines (fragments that share a row) in reading
 * order, each the union of its fragments.
 */
export function textRows(rects = []) {
  const rows = [];
  for (const r of [...rects].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const mid = (r.top + r.bottom) / 2;
    const row = rows.find((w) => mid > w.top && mid < w.bottom);
    if (row) Object.assign(row, { left: Math.min(row.left, r.left), right: Math.max(row.right, r.right), top: Math.min(row.top, r.top), bottom: Math.max(row.bottom, r.bottom) });
    else rows.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  }
  return rows;
}

/**
 * Where a marker goes for an element at `box` (document coordinates), given the
 * spots already taken. Pure, so it can be tested without a page.
 *
 * Without `text` this is the corner rule alone. With it (`{ own, near, right,
 * touch }`: the target's text-line rects, every text-line rect near it, its
 * own included, the page's right edge, and the touch target's side on a touch
 * screen, 0 otherwise), the rule is that a marker never touches a line of
 * text, its target's or a neighbour's, and its touch target only grows into
 * space with no text line. UX review 6, N2: the subhead under a heading at
 * the 16px margin went above itself into a 16px gap, so it sat 8px into the
 * heading's last line, and its target took taps on "team". In order:
 *
 *   1. just outside the top-left corner, as always, when the margin has room;
 *   2. above the element, its left edge on the element's (UX review 5, N15);
 *   3. above the element's first line, its right edge on that line's end: the
 *      mirror of 2, by the same edge of the same text (a second one steps
 *      back along the line, not off its end);
 *   4. just after the end of the element's first line, then of its last.
 *
 * The first spot that is clean and has a whole touch target wins; else the
 * first clean one, with the largest clean target it has; else the corner rule.
 * The result's `hit` is how far the touch target grows past the marker on each
 * side ({ top, right, bottom, left }), only with `text.touch`.
 */
export function markerSpot(box, width = MARKER, taken = [], minLeft = 0, reach = 0, text = null) {
  const corner = cornerSpot(box, width, taken, minLeft, reach);
  if (!text) return corner;
  const half = width / 2, H = MARKER / 2, size = text.touch || 0;
  const right = Number.isFinite(text.right) ? text.right : Infinity;
  const rows = textRows(text.own || []);
  const first = rows[0], last = rows[rows.length - 1];
  // The corner rule reaches MARKER_REACH px into its element's corner, inside
  // the leading: a line box there is not ink (measured, round 5 and 6).
  const nook = { right: box.left + MARKER_REACH + 0.5, bottom: box.top + MARKER_REACH + 0.5 };
  const key = (l) => [l.left, l.top, l.right, l.bottom].join();
  const own = new Set((text.own || []).map(key));
  const clear = (r) => (text.near || []).every((l) => {
    if (!overlaps(r, l)) return true;
    if (!own.has(key(l))) return false;
    return Math.min(r.right, l.right) <= nook.right && Math.min(r.bottom, l.bottom) <= nook.bottom;
  });
  const bounds = { left: minLeft, right, top: 0 };
  const above = Math.min(box.top, first ? first.top : box.top) - 2 - H;
  const tries = [];
  // [x, y, step]: markers that share a spot step right, except at a line's
  // end above it, where they step back along the line, towards its text.
  if (box.left + MARKER_REACH - width >= minLeft + 2) tries.push([box.left + MARKER_REACH - half, box.top + MARKER_REACH - H, 1]);
  tries.push([Math.max(box.left, minLeft + 2) + half, above, 1]);
  if (first) {
    if (first.right - width > box.left + 1) tries.push([first.right - half, above, -1]);
    tries.push([first.right + 4 + half, (first.top + first.bottom) / 2, 1]);
    if (last !== first) tries.push([last.right + 4 + half, (last.top + last.bottom) / 2, 1]);
  }
  let fallback = null;
  for (const [x0, y, step] of tries) {
    let x = x0;
    for (let moved = true, guard = 0; moved && guard < 40; guard++) {
      moved = false;
      for (const t of taken) {
        const room = (width + t.width) / 2 + 4;
        if (Math.abs(x - t.x) < room && Math.abs(y - t.y) < MARKER + 2) { x = t.x + step * room; moved = true; }
      }
    }
    const spot = { x: Math.round(x), y: Math.round(y), width };
    const mark = { left: spot.x - half, right: spot.x + half, top: spot.y - H, bottom: spot.y + H };
    if (mark.top < 2 || mark.left < minLeft + 1 || mark.right > right - 1 || !clear(mark)) continue;
    if (!size) return spot;
    const hit = hitArea(mark, size, clear, bounds);
    if (hit.whole) return { ...spot, hit: hit.grow };
    if (!fallback || hit.area > fallback.area) fallback = { spot: { ...spot, hit: hit.grow }, area: hit.area };
  }
  if (fallback) return fallback.spot;
  if (!size) return corner;
  const mark = { left: corner.x - half, right: corner.x + half, top: corner.y - H, bottom: corner.y + H };
  return { ...corner, hit: hitArea(mark, size, clear, bounds).grow };
}

/**
 * How far a marker's touch target grows past it on each side: `size` px
 * square, as centred as the text around it allows, never onto a line
 * (`clear(rect)`), never off the page. When no whole square fits, each side
 * grows as far as it can.
 */
export function hitArea(mark, size, clear, bounds = {}) {
  const w = mark.right - mark.left, h = mark.bottom - mark.top;
  const needH = Math.max(0, size - w), needV = Math.max(0, size - h);
  const { left: minX = -Infinity, right: maxX = Infinity, top: minY = -Infinity } = bounds;
  const box = (t, r, b, l) => ({ left: mark.left - l, right: mark.right + r, top: mark.top - t, bottom: mark.bottom + b });
  const inside = (q) => q.left >= minX - 0.5 && q.right <= maxX + 0.5 && q.top >= minY - 0.5;
  let best = null;
  for (let t = 0; t <= needV; t++) {
    for (let l = 0; l <= needH; l++) {
      const q = box(t, needH - l, needV - t, l);
      if (!inside(q) || !clear(q)) continue;
      const score = Math.abs(2 * t - needV) + Math.abs(2 * l - needH);
      if (!best || score < best.score) best = { score, grow: { top: t, right: needH - l, bottom: needV - t, left: l } };
    }
  }
  if (best) return { whole: true, grow: best.grow, area: size * size };
  // Each side on its own, as far as it can go, then together while they stay clear.
  const reach = (side, max) => { let n = 0; while (n < max) { const g = { top: 0, right: 0, bottom: 0, left: 0, [side]: n + 1 }; const q = box(g.top, g.right, g.bottom, g.left); if (!inside(q) || !clear(q)) break; n++; } return n; };
  const grow = { top: reach('top', needV), right: reach('right', needH), bottom: reach('bottom', needV), left: reach('left', needH) };
  // Centre what fits: no more than the square needs on either axis.
  const fit = (a, b, need) => { if (a + b <= need) return [a, b]; const half = need / 2; const x = Math.min(a, Math.max(half, need - b)); return [Math.round(x), Math.round(need - x)]; };
  [grow.top, grow.bottom] = fit(grow.top, grow.bottom, needV);
  [grow.left, grow.right] = fit(grow.left, grow.right, needH);
  while (!clear(box(grow.top, grow.right, grow.bottom, grow.left)) && (grow.top || grow.right || grow.bottom || grow.left)) {
    for (const k of ['top', 'right', 'bottom', 'left']) if (grow[k]) grow[k]--;
  }
  return { whole: false, grow, area: (w + grow.left + grow.right) * (h + grow.top + grow.bottom) };
}

function cornerSpot(box, width = MARKER, taken = [], minLeft = 0, reach = 0) {
  const half = width / 2;
  let x = box.left + MARKER_REACH - half;
  let y = box.top + MARKER_REACH - MARKER / 2;
  // No room on the left (the element starts at the page margin): pushed right,
  // the marker sat on the first letters it pointed at (UX review 5, N15). It
  // goes wholly above the element instead, its left edge on the element's,
  // and so does its touch target (`reach`: how far that grows below the
  // marker's centre, 22 on a touch screen). At the very top of the page there
  // is no room above either, and it stays where it was.
  if (x - half < minLeft + 2) {
    x = Math.max(box.left, minLeft + 2) + half;
    const above = box.top - Math.max(MARKER / 2, reach) - 2;
    if (above >= MARKER / 2 + 2) y = above;
  }
  y = Math.max(y, MARKER / 2 + 2);
  for (let moved = true, guard = 0; moved && guard < 40; guard++) {
    moved = false;
    for (const t of taken) {
      const room = (width + t.width) / 2 + 4;
      if (Math.abs(x - t.x) < room && Math.abs(y - t.y) < MARKER + 2) { x = t.x + room; moved = true; }
    }
  }
  return { x: Math.round(x), y: Math.round(y), width };
}

/**
 * The text-line rects around `target` (document coordinates): `own`, its own
 * lines, and `near`, every line within `pad` px of it, its own included. Its
 * neighbours are its siblings and its ancestors' (two each way, four levels
 * up), so the heading above a subhead is in. Our own layers are not text.
 */
const NOT_TEXT = 'script,style,noscript,template,svg,[data-feedback-toolbar],[data-agentation-root],.sk-edit-ui,.sk-crit-dot';
export function textAround(target, pad = 64, limit = 400) {
  const t = target.getBoundingClientRect();
  const zone = { left: t.left - pad, top: t.top - pad, right: t.right + pad, bottom: t.bottom + pad };
  const range = document.createRange();
  const doc = (r) => ({ left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY });
  let budget = limit;
  const lines = (root, out, deep = true) => {
    const visit = (el) => {
      for (const n of el.childNodes) {
        if (budget <= 0) return;
        if (n.nodeType === 3) {
          if (!n.data.trim()) continue;
          budget--;
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) if (r.width && r.height && overlaps(r, zone, 0)) out.push(doc(r));
        } else if (deep && n.nodeType === 1 && !n.matches(NOT_TEXT)) {
          const b = n.getBoundingClientRect();
          // A box clear of the zone holds no line in it (a display: contents box has none, so look inside).
          if ((b.width || b.height) && !overlaps(b, zone, 0)) continue;
          visit(n);
        }
      }
    };
    visit(root);
  };
  const own = [];
  lines(target, own);
  const near = [...own];
  for (let el = target, level = 0; el && el !== document.body && el.parentElement && level < 4; el = el.parentElement, level++) {
    const sib = [];
    for (let s = el.previousElementSibling, i = 0; s && i < 2; s = s.previousElementSibling, i++) sib.push(s);
    for (let s = el.nextElementSibling, i = 0; s && i < 2; s = s.nextElementSibling, i++) sib.push(s);
    for (const s of sib) if (!s.matches(NOT_TEXT)) { const b = s.getBoundingClientRect(); if (!(b.width || b.height) || overlaps(b, zone, 0)) lines(s, near); }
    // The parent's own words (text beside the element, not in a sibling).
    lines(el.parentElement, near, false);
  }
  return { own, near };
}

const markerLayers = [];
const markerSpots = new Map(); // key -> {x, y, width}
let markerFrame = 0;
/**
 * Register a marker layer. `entries()` returns, in numbering order,
 * `{ key, target, el, width }`: the element pointed at and the marker node to
 * place. Layers are placed in registration order.
 */
export function markerLayer(name, entries) {
  const i = markerLayers.findIndex((l) => l.name === name);
  if (i >= 0) markerLayers.splice(i, 1, { name, entries }); else markerLayers.push({ name, entries });
  scheduleMarkers();
}
export function scheduleMarkers() {
  if (markerFrame || typeof requestAnimationFrame !== 'function') return;
  markerFrame = requestAnimationFrame(() => { markerFrame = 0; layoutMarkers(); });
}
/** Place every registered marker now. */
export function layoutMarkers() {
  const taken = [];
  const seen = new Set();
  // On a touch screen a marker's target is 44px square (chrome.css.js draws
  // it with ::before), and it grows only into space with no text line: the
  // spot says how far each way, and the marker carries it as --sk-hit.
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const right = scrollX + (document.documentElement.clientWidth || innerWidth);
  for (const layer of markerLayers) {
    let entries = [];
    try { entries = layer.entries() || []; } catch { /* one layer must not break the other */ }
    for (const e of entries) {
      const r = e.target?.isConnected ? e.target.getBoundingClientRect() : null;
      if (!r || (!r.width && !r.height)) { e.missing?.(); continue; }
      let text = null;
      try { text = { ...textAround(e.target), right, touch: coarse ? TOUCH : 0 }; } catch { /* the corner rule alone */ }
      const spot = markerSpot({ left: r.left + scrollX, top: r.top + scrollY }, e.width || e.el?.offsetWidth || MARKER, taken, scrollX, coarse ? e.touchReach || 0 : 0, text);
      taken.push(spot);
      seen.add(e.key);
      markerSpots.set(e.key, spot);
      if (e.el) {
        e.el.style.left = spot.x + 'px'; e.el.style.top = spot.y + 'px';
        const h = spot.hit;
        if (h) e.el.style.setProperty('--sk-hit', `${-h.top}px ${-h.right}px ${-h.bottom}px ${-h.left}px`);
        else e.el.style.removeProperty('--sk-hit');
      }
    }
  }
  for (const k of markerSpots.keys()) if (!seen.has(k)) markerSpots.delete(k);
}
/** The last placed spot for a key, or null. */
export const markerSpotOf = (key) => markerSpots.get(key) || null;

/**
 * Reviewer markers: the toolbar renders them (build.mjs asks
 * __AGENTATION_KIT_MARKER_AT__ for each one's left/top and tags it with
 * data-kit-note); this finds the element each note is about, once, and
 * keeps it, so a reflow moves the marker with that element.
 */
const notes = new Map(); // id -> annotation, as the toolbar last rendered it
const bound = new Map(); // id -> the element it is about
export function noteElement(a) {
  if (!a) return null;
  const kept = bound.get(a.id);
  if (kept?.isConnected) return kept;
  // A fixed, multi-element or area note has no single element to follow.
  if (a.isFixed || a.isMultiSelect || a.elementBoundingBoxes?.length) return null;
  const path = a.selector || a.fullPath || a.elementPath;
  if (!path || /⟨shadow⟩|^region |^\[/.test(path)) return null;
  let list;
  try { list = [...document.querySelectorAll(path)].filter((n) => !n.closest('[data-feedback-toolbar]')); } catch { return null; }
  if (!list.length) return null;
  // Several elements share a path (every p in a section): the one whose box
  // is closest to the box recorded when the note was made, or, for a note
  // made elsewhere (Fix it on an agent note sends only a point), the one
  // nearest that point.
  const bb = a.boundingBox;
  const px = ((Number(a.x) || 0) / 100) * (a.viewport?.width || innerWidth), py = Number(a.y) || 0;
  let best = null, score = Infinity;
  for (const n of list) {
    const r = n.getBoundingClientRect();
    const s = bb
      ? Math.abs(r.width - bb.width) + Math.abs(r.height - bb.height) + Math.abs(r.left - bb.x) + Math.abs(r.top + scrollY - bb.y)
      : Math.max(0, r.left - px, px - r.right) + Math.max(0, r.top + scrollY - py, py - r.bottom - scrollY);
    if (s < score) { score = s; best = n; }
  }
  if (best) bound.set(a.id, best);
  return best;
}
function noteEntries() {
  const out = [];
  for (const el of document.querySelectorAll('[data-agentation-root] [data-kit-note]')) {
    const a = notes.get(el.getAttribute('data-kit-note'));
    if (!a || a.isFixed) continue;
    out.push({ key: 'note:' + a.id, target: noteElement(a), el, width: MARKER, touchReach: 22,
      // Nothing to follow: back to where the toolbar would have drawn it.
      missing: () => { el.style.left = a.x + '%'; el.style.top = a.y + 'px'; } });
  }
  return out;
}

/** Whether the toolbar is showing markers (Hide markers, collapsed, layout mode). Unknown counts as shown. */
export const markersShown = () => typeof window === 'undefined' || window.__AGENTATION_KIT_MARKERS_SHOWN__ !== false;

if (typeof window !== 'undefined' && typeof document?.addEventListener === 'function' && typeof requestAnimationFrame === 'function') {
  installChromeCSS();
  markerLayer('notes', noteEntries);
  window.__AGENTATION_KIT_MARKER_AT__ = (a) => {
    if (!a?.id || a.isFixed) return null;
    notes.set(a.id, a);
    scheduleMarkers();
    const s = markerSpots.get('note:' + a.id);
    return s ? { left: s.x + 'px', top: s.y } : null;
  };
  // Everything that can move an element under a marker.
  for (const name of ['agentation-kit:insets', 'agentation-kit:slot', 'agentation-kit:markers', 'agentation-kit:edit-change', 'agentation-kit:tweak-change']) document.addEventListener(name, scheduleMarkers);
  window.addEventListener('resize', scheduleMarkers);
  window.addEventListener('load', scheduleMarkers);
  document.fonts?.ready?.then(scheduleMarkers);
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(scheduleMarkers);
    ro.observe(document.documentElement);
    const watchBody = () => document.body && ro.observe(document.body);
    if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });
  }
}

/**
 * The agent's marker: one quiet treatment for every severity. Same size, type
 * and shadow as the toolbar's own; a rounded square in place of a circle, and
 * the number carries an "A" (critique.js), so it never reads as the
 * reviewer's. The width grows with the label ("A12").
 */
export function markerStyle() {
  return {
    position: "absolute",
    minWidth: MARKER + "px",
    height: MARKER + "px",
    borderRadius: "6px",
    border: "none",
    padding: "0 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "translate(-50%, -50%)",
    background: "#1D1A2F",
    color: "#fff",
    font: `600 12px/1 ${FONT}`,
    boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.12)",
    cursor: "pointer",
    userSelect: "none",
    // Under the component's comment popup (z 100001), level with its own
    // marker layer: a marker must never sit on the field being typed in.
    zIndex: "99998",
  };
}

/**
 * Create a shadow host wired into the page the way our layers expect.
 *
 * `data-sk-no-edit` keeps edit mode out of it, `sk-edit-ui` marks it as ours
 * rather than content, and the root is `open` for the same reason the reply
 * panel's always was: nothing here is secret, and a closed root cannot be
 * driven by a test or a QA script.
 *
 * ⚠️ `data-feedback-toolbar` is what keeps the TOOLBAR out of it, and it is not
 * optional — see `markChrome`. Our own attributes mean nothing to agentation.
 */
export function createHost(css) {
  const host = document.createElement("div");
  host.setAttribute("data-sk-no-edit", "");
  host.className = "sk-edit-ui";
  markChrome(host);
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = baseCSS() + css;
  root.append(style);
  document.body.appendChild(host);
  mirrorTheme(host);
  return { host, root, el: (id) => root.getElementById(id) };
}
