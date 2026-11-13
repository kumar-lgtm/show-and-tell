/**
 * Our corrections to the toolbar's own comment popup, in the light DOM.
 *
 * The popup is agentation's React component, so it is restyled here rather
 * than patched: one stylesheet in <head>, keyed on the popup's
 * `data-annotation-popup` attribute and on attributes we add ourselves. The
 * module class names carry a build hash, so they are matched by prefix
 * (class*="actions___"), never in full.
 *
 *   - Phones: Cancel and Add were 68x31 and 51x31 (UX review finding 14). Every
 *     phone target is 44px.
 *   - Phones: the popup is the desktop's 312px, narrower only where the
 *     bar's 20px side margins need it (UX review 5, N16): at 390 it was 350,
 *     wider than on a desktop. clampPopup keeps it inside those margins.
 *   - Dictate (voice.js) sits BESIDE the textarea, as in the Check card,
 *     instead of on a row of its own under it (finding 4). voice.js places the
 *     button against the field; this narrows the field to make room.
 *
 * ⚠️ NO BACKTICKS in the CSS below: it is a JS template literal.
 */
import { markChrome } from "./ui.js";

export const popupCSS = `
[data-annotation-popup] textarea[data-voice-dictated] { width: calc(100% - 50px) !important; }
[data-annotation-popup] [data-voice-dictate] { position: absolute; }
@media (pointer: coarse) {
  [data-annotation-popup] [class*="actions___"] button { min-height: 44px; min-width: 44px; }
}
@media (pointer: coarse) and (max-width: 639px) {
  html [data-annotation-popup] { width: min(312px, calc(100vw - 40px)) !important; max-width: calc(100vw - 40px) !important; box-sizing: border-box; }
}
`;

/**
 * Phones: the component places its popup as close as 4px to the screen edge.
 * Keep it inside the bar's 20px side margins with a CSS translate (separate
 * from the component's own transform and inline position, which React owns).
 */
const EDGE = 20;
export function clampPopup(el, width = innerWidth) {
  const cur = parseFloat(String(el.style.translate || "0").split(" ")[0]) || 0;
  if (width >= 640) { if (cur) el.style.translate = ""; return 0; }
  const r = el.getBoundingClientRect();
  if (!r.width) return cur;
  const left = r.left - cur, right = r.right - cur;
  let dx = 0;
  if (left < EDGE) dx = EDGE - left;
  else if (right > width - EDGE) dx = Math.max(EDGE - left, width - EDGE - right);
  if (Math.abs(dx - cur) > 0.5) el.style.translate = dx ? dx + "px 0" : "";
  return dx;
}
let clampTimer = 0;
function watchPopups() {
  if (clampTimer || typeof setInterval !== "function") return;
  clampTimer = setInterval(() => { for (const el of document.querySelectorAll("[data-annotation-popup]")) clampPopup(el); }, 120);
}

let installed = null;
export function installPopupStyle() {
  watchPopups();
  if (installed?.isConnected || typeof document === "undefined") return installed;
  installed = markChrome(document.createElement("style"));
  installed.dataset.agentationKitPopup = "";
  installed.textContent = popupCSS;
  document.head.append(installed);
  return installed;
}
