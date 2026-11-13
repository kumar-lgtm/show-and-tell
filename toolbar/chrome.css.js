/**
 * Light-DOM rules for the upstream toolbar's own chrome and our page markers.
 *
 * Most of what we draw lives in shadow roots (ui.js createHost). These rules
 * are for the nodes that cannot: the toolbar's React tree, which renders into
 * the page under [data-agentation-root], and the agent's markers, which sit in
 * the page next to what they point at. Every rule is scoped to those, so
 * nothing here reaches the page under review.
 *
 *   - **One accent.** The toolbar ships an iOS blue (display-p3 0 .53 1) for
 *     its markers, Add button and badge, and a 7-colour marker picker that can
 *     swap it; our bar had an indigo active state and focus ring. All of it is
 *     #FF5436 now, with tints of the same hue for fills, and a light tint for
 *     an active icon on the dark bar.
 *   - **12px floor** for upstream text that was 10 or 11px: the Layout
 *     palette's description, section titles and Learn more, the settings
 *     version and options, marker numbers and the collapsed count.
 *   - **44px hit area** for every 22px marker on a touch screen, the agent's
 *     and the reviewer's own, without making the marker look bigger.
 *   - **Settings is a sheet on touch** (UX review 2, N14). Stock, it is a
 *     253px card with 20 to 24px targets. Under a coarse pointer it spans the
 *     bar it opens from, sits above it as More does, scrolls inside at 55% of
 *     the height, and every row and control is 44px. It stays in the
 *     component's tree (React owns it), so it is positioned against the bar,
 *     not the window: that keeps it above the bar wherever the bar is dragged.
 *   - **The hover label** ("card", "html") was 11px, its React path 10px.
 *   - **No dot patterns** (UX review 4, N9): the Layout palette's "Wireframe
 *     a new page" icon was a 3x3 dot grid (now the plain frame it sits in),
 *     and Settings' Output detail level was four dots (now a segmented bar,
 *     filled up to the level).
 *   - **One phone sheet width** (N12): Settings and the Layout palette span
 *     the screen with the same 12px inset as Inbox, More, Send, Tweak and
 *     Talk. They are positioned against the bar, so trackSheetEdges() keeps
 *     the bar's distance from each screen edge in two custom properties.
 *
 * ⚠️ NO BACKTICKS in the CSS below: it is a template literal.
 * ⚠️ Specificity, not order: review-tools.js sets its active and focus colours
 * with !important, so the overrides here carry one more selector ("html").
 */
import { ACCENT, ACCENT_TINT, ACCENT_SOFT, ACCENT_INK, ON_ACCENT, FOCUS, INK, CHALK, PAPER, FONT, MONO, CHALK_RGB, INK_RGB } from "./brand.js";
import { MARK } from "./brand-art.js";
export { ACCENT, ACCENT_TINT };

/** The mark as a CSS image, its outline in `ink` (it is currentColor inline). */
const markImage = (ink) => 'url("data:image/svg+xml,' + encodeURIComponent(MARK.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/currentColor/g, ink)) + '")';

export function chromeCSS() {
  return `
    /* One accent: the toolbar's own tokens, whatever the marker colour setting says. */
    [data-agentation-root], [data-agentation-root][data-agentation-accent], [data-agentation-toolbar] {
      --agentation-color-accent: ${ACCENT} !important;
      --agentation-color-blue: ${ACCENT} !important;
    }
    html [data-agentation-toolbar] .sk-review-controls button[aria-pressed=true] {
      background: ${ACCENT_SOFT} !important; color: ${CHALK} !important;
    }
    /* Light theme: a pale tomato fill with ink text. */
    html [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] .sk-review-controls button[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme="light"] .sk-review-controls button[aria-pressed=true] { background: #FFDDD1 !important; color: ${INK} !important; }
    /* Send stays the solid primary while its sheet is open, in both themes. */
    html [data-agentation-root][data-agentation-theme] [data-agentation-toolbar] .sk-review-controls button.sk-send[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme] .sk-review-controls button.sk-send[aria-pressed=true],
    html [data-agentation-root] .sk-review-controls .sk-send[aria-pressed=true],
    html [data-agentation-toolbar] .sk-review-controls .sk-send[aria-pressed=true] { background: ${ACCENT} !important; color: ${ON_ACCENT} !important; }
    /* Nothing new to send, sheet open: the neutral pressed fill, not a dimmed
       accent. Its label was white at .75 on #FF5436, 3.67:1 (UX review 5, #7). */
    html [data-agentation-root][data-agentation-theme] [data-agentation-toolbar] .sk-review-controls button.sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme] .sk-review-controls button.sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-root] .sk-review-controls .sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-toolbar] .sk-review-controls .sk-send:not([data-state=ready])[aria-pressed=true] { background: rgba(128,128,128,.28) !important; color: inherit !important; opacity: 1 !important; }
    html [data-agentation-root] textarea:focus-visible,
    html [data-agentation-toolbar] button:focus-visible,
    html [data-agentation-root] button:focus-visible { outline: 2px solid ${FOCUS} !important; outline-offset: 1px; }
    /* Yellow is 1.5:1 on paper: the light theme's ring is ink. */
    html [data-agentation-root][data-agentation-theme="light"] textarea:focus-visible,
    html [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] button:focus-visible,
    html [data-agentation-root][data-agentation-theme="light"] button:focus-visible { outline-color: ${INK} !important; }
    [data-agentation-root] [class*="styles-module__autoSendLabel___"][class*="styles-module__active___"] { color: ${ACCENT_TINT} !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__autoSendLabel___"][class*="styles-module__active___"] { color: ${ACCENT_INK} !important; }

    /* The brand on the component's own chrome. Its surfaces are recoloured at
       build time (build.mjs); these are the parts a find-and-replace cannot
       reach. Text on tomato is ink: white is 3.1:1 there. */
    [data-agentation-root], [data-agentation-root] textarea, [data-agentation-root] button, [data-agentation-root] input { font-family: ${FONT}; }
    [data-agentation-root] [data-annotation-marker],
    [data-agentation-toolbar] [class*="styles-module__badge___"],
    [data-agentation-toolbar] [class*="styles-module__buttonBadge___"] { color: ${ON_ACCENT} !important; font-weight: 700 !important; }
    [data-agentation-root] [data-annotation-popup] [class*="styles-module__submit___"] { color: ${ON_ACCENT} !important; font-weight: 600 !important; border-radius: 10px !important; padding: 7px 14px !important; font-size: 13px !important; }
    [data-agentation-root] [data-annotation-popup] [class*="styles-module__cancel___"] { border-radius: 10px !important; padding: 7px 12px !important; font-size: 13px !important; }
    [data-agentation-root] [data-annotation-popup] { box-shadow: 0 8px 28px rgba(12,10,24,.36), 0 0 0 1px rgba(${CHALK_RGB},.16) !important; }
    [data-agentation-root] [data-annotation-popup][class*="styles-module__light___"] { background: ${PAPER} !important; box-shadow: 0 2px 8px rgba(${INK_RGB},.1), 0 8px 24px rgba(${INK_RGB},.12), 0 0 0 1px rgba(${INK_RGB},.1) !important; }
    [data-agentation-root] [data-annotation-popup] textarea { border-radius: 10px !important; }
    [data-agentation-root] [data-annotation-popup] textarea:focus { border-color: ${FOCUS} !important; }
    [data-agentation-root] [data-annotation-popup][class*="styles-module__light___"] textarea:focus { border-color: ${INK} !important; }
    [data-agentation-root] [class*="styles-module__stylesBlock___"],
    [data-agentation-root] [class*="styles-module__hoverReactPath___"] { font-family: ${MONO} !important; }
    /* Settings' header credits the library this toolbar builds on, in words:
       its wordmark alone read as if the tool were Agentation. */
    [data-agentation-root] [class*="styles-module__settingsBrand___"] svg { display: none; }
    [data-agentation-root] [class*="styles-module__settingsBrand___"]::before { content: "Built on Agentation"; font: 500 12px/1.4 ${FONT}; color: rgba(${CHALK_RGB},.74); text-decoration: underline; text-underline-offset: 2px; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsBrand___"]::before { color: rgba(${INK_RGB},.74); }
    /* The closed bar is the mark, not a generic list icon. */
    [data-agentation-toolbar] [class*="styles-module__toggleContent___"] svg { opacity: 0; }
    [data-agentation-toolbar] [class*="styles-module__toggleContent___"] { background: ${markImage(CHALK)} center / 24px 24px no-repeat; }
    [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] [class*="styles-module__toggleContent___"] { background-image: ${markImage(INK)}; }

    /* Upstream text under 12px. */
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"],
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a,
    [data-agentation-root] [class*="styles-module__learnMoreLink___"],
    [data-agentation-root] [class*="styles-module__settingsVersion___"],
    [data-agentation-root] [class*="styles-module__automationDescription___"],
    [data-agentation-root] [class*="styles-module__helpTooltip"],
    [data-agentation-root] [class*="styles-module__paletteSectionTitle___"],
    [data-agentation-root] [class*="styles-module__autoSendLabel___"],
    [data-agentation-root] [class*="styles-module__settingsOption___"],
    [data-agentation-root] [class*="styles-module__sliderLabel___"],
    [data-agentation-root] [class*="styles-module__hoverTooltip___"],
    [data-agentation-root] [class*="styles-module__hoverReactPath___"] { font-size: 12px !important; line-height: 1.4 !important; }
    /* Marker numbers and the collapsed toggle's count, which were 11 and 10px. */
    [data-agentation-root] [data-annotation-marker],
    [data-agentation-toolbar] [class*="styles-module__badge___"] { font-size: 12px !important; }

    /* The agent's markers: a 44px target on touch, drawn at 22px. */
    .sk-crit-dot::before { content: ""; position: absolute; inset: -11px; }
    @media (pointer: fine) { .sk-crit-dot::before { display: none; } }
    /* The marker sits just left of what it points at, so its target grows
       away from that text: 44px square, flush with the marker's right edge.
       Grown 11px on every side, it covered the paragraph's first word, and a
       tap there opened From the agent (UX review 4, N15). Its bottom edge is
       the marker's too: centred, it still reached 11px down into the first
       line (UX review 5, N15). */
    /* Placed, the marker says how far its target grows each way (ui.js
       layoutMarkers, --sk-hit): only into space with no line of text, its
       target's or a neighbour's. Under a heading, up and left took taps on
       the heading's last word (UX review 6, N2). */
    @media (pointer: coarse) { .sk-crit-dot::before { inset: var(--sk-hit, calc(100% - 44px) 0 0 calc(100% - 44px)); } }
    /* The reviewer's markers, the same way (N13). */
    @media (pointer: coarse) {
      [data-agentation-root] [data-annotation-marker]::before { content: ""; position: absolute; inset: var(--sk-hit, -11px); border-radius: 50%; }
    }

    /* Settings on touch: a sheet above the bar, 44px rows (N14). */
    @media (pointer: coarse) {
      html [data-agentation-root] [class*="styles-module__settingsPanel___"] {
        left: var(--sk-sheet-left, -8px) !important; right: var(--sk-sheet-right, -8px) !important; width: auto !important; min-width: 0 !important; max-width: none !important;
        box-sizing: border-box; max-height: 55vh; max-height: 55dvh; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
        border-radius: 12px; padding: 6px 0;
      }
      html [data-agentation-root] [class*="styles-module__settingsPanel___"]::before,
      html [data-agentation-root] [class*="styles-module__settingsPanel___"]::after { display: none; }
      [data-agentation-root] [class*="styles-module__settingsPanelContainer___"] { padding: 0 12px; }
      [data-agentation-root] [class*="styles-module__automationsPage___"] { padding: 0 12px 4px; }
      [data-agentation-root] [class*="styles-module__settingsHeader___"],
      [data-agentation-root] [class*="styles-module__settingsNavLink___"],
      [data-agentation-root] [class*="styles-module__settingsBackButton___"] { height: auto !important; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsRow___"] { min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__settingsRowMarginTop___"],
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] { margin-top: 0; }
      [data-agentation-root] [class*="styles-module__settingsBrand___"] { display: inline-flex; align-items: center; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__themeToggle___"] { width: 44px !important; height: 44px !important; }
      [data-agentation-root] [class*="styles-module__cycleButton___"] { min-height: 44px; }
      /* Switches and checkboxes keep their drawn size; the real input, which
         is transparent and on top, becomes the 44px target, and a
         checkbox's label is 44px tall. */
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__switchInput___"],
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxInput___"] {
        inset: auto; top: 50%; left: 50%; width: 44px; height: 44px; margin: 0; transform: translate(-50%, -50%);
      }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] .checkbox-field,
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] { height: auto; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] .checkbox-field label,
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] label { display: flex; align-items: center; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__autoSendLabel___"] { display: inline-flex; align-items: center; min-height: 44px; }
    }
    /* The popup's computed-styles block: machine text, but 12px and no purple. */
    [data-agentation-root] [class*="styles-module__stylesBlock___"],
    [data-agentation-root] [class*="styles-module__styleLine___"] { font-size: 12px !important; }
    [data-agentation-root] [class*="styles-module__styleProperty___"] { color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__styleProperty___"] { color: rgba(0,0,0,.62) !important; }
    /* Upstream Settings' secondary text clears 4.5:1 in both themes. */
    [data-agentation-root] [class*="styles-module__settingsVersion___"],
    [data-agentation-root] [class*="styles-module__settingsLabel___"] { opacity: 1 !important; }
    [data-agentation-root] [class*="styles-module__settingsVersion___"] { color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsVersion___"] { color: rgba(0,0,0,.62) !important; }
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] { font-weight: 400 !important; opacity: 1 !important; color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__paletteHeaderDesc___"] { color: rgba(0,0,0,.62) !important; }
    /* Light theme: the rest of upstream's secondary text at 4.5:1 (UX review 5,
       #5). Settings labels were .5 (3.98:1), its checkbox labels .5 on #1D1A2F's
       ink (3.34:1), the Layout palette's section heads .4 (2.85:1), "Wireframe
       a new page" and the comment popup's Cancel .5. The active wireframe
       toggle keeps its white. (Upstream's dimmer disabled-row label never
       applied: its own panel rule outranks it, so every row reads alike.)
       "MCP and webhooks" and its subpage's help were left at .5 (UX review 6,
       N7); the link keeps upstream's darker hover. */
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsNavLink___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__automationDescription___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsLabel___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsPanel___"] [class*="styles-module__label___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasToggle___"]:not([class*="styles-module__active___"]) [class*="styles-module__canvasToggleLabel___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cancel___"] { color: rgba(0,0,0,.62) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cancel___"]:hover,
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsNavLink___"]:hover { color: rgba(0,0,0,.85) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__paletteSectionTitle___"] { color: rgba(0,0,0,.6) !important; }
    /* The tooltip's key hint ("Esc"): opacity .5 left it at 4.47:1 dark and
       3.09:1 light (#6). A colour, not an opacity, as our own tooltip does. */
    [data-agentation-root] [class*="styles-module__buttonTooltip___"] [class*="styles-module__shortcut___"] { opacity: 1 !important; color: rgba(255,255,255,.65) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__buttonTooltip___"] [class*="styles-module__shortcut___"] { color: rgba(0,0,0,.6) !important; }
    /* The Layout palette's "?" help icons were .2 alpha, about 1.3:1. An icon
       needs 3:1, so .55 in both themes, and full strength on hover. */
    html [data-agentation-root] [class*="styles-module__canvasPurposeHelp___"] svg { color: rgba(255,255,255,.55) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasPurposeHelp___"] svg { color: rgba(0,0,0,.55) !important; }
    html [data-agentation-root] [class*="styles-module__canvasPurposeHelp___"]:hover svg { color: rgba(255,255,255,.85) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasPurposeHelp___"]:hover svg { color: rgba(0,0,0,.85) !important; }
    /* While the question notice is up, the bar's tooltips open above it, not
       over it (#3). replies.js sets the lift; our own tooltip reads the notice. */
    [data-agentation-toolbar] [class*="styles-module__buttonTooltip___"] { margin-bottom: var(--sk-tip-lift, 0px); }
    /* A solid underline: a dotted one is a dot pattern too (N9). */
    [data-agentation-root] [class*="styles-module__learnMoreLink___"],
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a { text-decoration-style: solid !important; }
    /* The Layout palette on touch: a sheet like Settings, 44px rows. */
    @media (pointer: coarse) {
      html [data-agentation-root] [class*="styles-module__palette___"] {
        left: var(--sk-sheet-left, -8px) !important; right: var(--sk-sheet-right, -8px) !important; width: auto !important; min-width: 0 !important; max-width: none !important;
        max-height: 55vh; max-height: 55dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box;
      }
      [data-agentation-root] [class*="styles-module__paletteItem___"] { min-height: 44px !important; }
      [data-agentation-root] [class*="styles-module__learnMoreLink___"] { display: inline-flex; align-items: center; min-height: 44px; }
      /* The palette's "Learn more." sits in a sentence: its 44px target is
         drawn around it, so the line keeps its height (R8). */
      [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a { position: relative; }
      [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a::after { content: ""; position: absolute; left: -6px; right: -6px; top: 50%; height: 44px; transform: translateY(-50%); }
    }
    /* No dot patterns (N9). The wireframe icon keeps its frame, not the 3x3
       grid of dots inside it. */
    [data-agentation-root] [class*="styles-module__canvasToggleIcon___"] svg circle { display: none; }
    /* Output detail: four short bars in a row, filled up to the chosen level. */
    html [data-agentation-root] [class*="styles-module__cycleDots___"] { flex-direction: row; align-items: center; gap: 2px; }
    html [data-agentation-root] [class*="styles-module__cycleDot___"] { width: 8px; height: 3px; border-radius: 1px; transform: none; }
    html [data-agentation-root] [class*="styles-module__cycleDot___"]:has(~ [class*="styles-module__active___"]) { background: rgba(255,255,255,.7); }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cycleDot___"]:has(~ [class*="styles-module__active___"]) { background: rgba(0,0,0,.55); }
    .sk-crit-dot[hidden] { display: none !important; }
    .sk-crit-dot:focus-visible { outline: 2px solid ${INK}; outline-offset: 2px; box-shadow: 0 0 0 4px ${FOCUS}; }
  `;
}

/** The inset every phone sheet keeps from the screen's edges. */
export const SHEET_INSET = 12;

/**
 * Settings and the Layout palette are positioned inside the bar (React owns
 * them), so "12px from the screen edge" is an offset from the bar: these are
 * the left and right values that put a sheet there, for the bar at `bar`
 * (a rect) on a screen `width` wide.
 */
export function sheetEdges(bar, width) {
  return { left: Math.round(SHEET_INSET - bar.left) + "px", right: Math.round(SHEET_INSET - (width - bar.right)) + "px" };
}
function trackSheetEdges() {
  const update = () => {
    const host = document.querySelector("[data-agentation-toolbar]");
    const bar = host?.querySelector('[class*="styles-module__toolbarContainer___"]')?.getBoundingClientRect();
    if (!bar?.width) return;
    const e = sheetEdges(bar, document.documentElement.clientWidth || innerWidth);
    if (host.style.getPropertyValue("--sk-sheet-left") !== e.left) host.style.setProperty("--sk-sheet-left", e.left);
    if (host.style.getPropertyValue("--sk-sheet-right") !== e.right) host.style.setProperty("--sk-sheet-right", e.right);
  };
  addEventListener("resize", update);
  document.addEventListener("agentation-kit:toolbar-position", () => requestAnimationFrame(update));
  // The bar's width follows its mode; a cheap read keeps up with it.
  if (typeof setInterval === "function") setInterval(update, 250);
  update();
}

let installed = null, tracking = false;
/** Add the stylesheet once. Safe to call from any layer. */
export function installChromeCSS() {
  if (typeof document === "undefined" || !document.head) return;
  if (!tracking && typeof addEventListener === "function") { tracking = true; trackSheetEdges(); }
  if (installed?.isConnected) return;
  installed = document.createElement("style");
  installed.dataset.agentationKitChrome = "";
  installed.textContent = chromeCSS();
  document.head.append(installed);
}
