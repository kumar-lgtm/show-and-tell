/**
 * The Show and tell brand, in one place.
 *
 * Every colour, font stack and radius the toolbar draws comes from here: the
 * shadow-root stylesheet (ui.js baseCSS), the light-DOM rules for the bar and
 * the component's own chrome (chrome.css.js, review-tools.js), the outlines we
 * draw on the page, and the build seam that recolours the pinned component
 * (build.mjs). The source is the Classroom board in Pencil/show-and-tell.pen.
 *
 *   - **Ink and chalk.** The tool surface is a deep ink (#1D1A2F), its text a
 *     warm chalk. The light theme is paper with ink text.
 *   - **One accent: tomato.** Primary actions, the reviewer's own markers and
 *     the selected mode. Text ON tomato is ink, never white (white is 3.1:1).
 *     Tomato as TEXT on ink uses the lighter tint; on paper, the darker one.
 *   - **Yellow is keyboard focus,** and only that, so focus and action never
 *     compete. Yellow is 1.5:1 on paper, so the light theme's ring is ink.
 *   - **Status is an icon and a word,** never colour alone.
 *
 * ⚠️ Keep the values literal strings: test/brand.test.mjs measures their
 * contrast, and build.mjs imports this file in Node.
 */
export const INK = "#1D1A2F";
export const RAISED = "#2A2640";
export const CHALK = "#FFF4E0";
export const PAPER = "#FFFCF5";

export const ACCENT = "#FF5436";
/** Text and icons drawn on the accent. */
export const ON_ACCENT = INK;
/** The accent as text or an icon on ink. */
export const ACCENT_TINT = "#FF9C87";
/** The accent as text on paper. */
export const ACCENT_INK = "#A92B15";
/** A selected control's fill on ink: tomato at low strength, opaque. */
export const ACCENT_SOFT = "#573227";
export const FOCUS = "#FFC72C";
export const DANGER_TINT = "#FF8FB3";
export const DANGER_INK = "#B0204A";

/** "r,g,b" of the accent, for rgba() tints. */
export const ACCENT_RGB = "255,84,54";
export const CHALK_RGB = "255,244,224";
export const INK_RGB = "29,26,47";

/**
 * Font stacks. The brand faces are served by the review server
 * (installFonts); wherever they cannot load (a hosted page, a strict CSP) the
 * system stack takes over, with the same metrics the toolbar always had.
 */
export const FONT = '"ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
export const DISPLAY = '"ST Display", "Bricolage Grotesque", ' + FONT;
export const MONO = '"ST Mono", "DM Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

export const RADIUS = { control: "10px", field: "10px", panel: "16px", pill: "999px" };

/** The files the review server serves under <endpoint>/fonts/. */
export const FONT_FILES = [
  { family: "ST Sans", file: "dm-sans.woff2", weight: "100 1000" },
  { family: "ST Display", file: "bricolage-grotesque.woff2", weight: "200 800" },
  { family: "ST Mono", file: "dm-mono.woff2", weight: "400" },
];

/**
 * Declare the brand faces in the page, once. @font-face inside a shadow root
 * is ignored, so the rule lives in the document; the family names are ours
 * alone, so nothing on the page under review can pick them up by accident.
 * `font-display: swap` keeps the system stack on screen until a face arrives,
 * and for good if it never does.
 */
export function installFonts(endpoint) {
  if (typeof document === "undefined" || !endpoint) return null;
  const had = document.head.querySelector("style[data-sk-fonts]");
  if (had) return had;
  const base = String(endpoint).replace(/\/$/, "") + "/fonts/";
  const style = document.createElement("style");
  style.setAttribute("data-sk-fonts", "");
  style.textContent = FONT_FILES.map((f) =>
    '@font-face{font-family:"' + f.family + '";src:url("' + base + f.file + '") format("woff2");font-weight:' + f.weight + ";font-style:normal;font-display:swap}").join("");
  document.head.append(style);
  return style;
}
