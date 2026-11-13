/**
 * Keyboard access to the toolbar's own chrome (UX review 2, N5 and N12).
 *
 * The bar's shell and its Settings panel are the component's React tree, in
 * the light DOM, so this works from outside: attributes React does not own,
 * and one capture-phase key listener that runs before the component's.
 *
 *   - **The collapsed toggle opens from the keyboard.** Collapsed, the shell is
 *     a div with role=button and tabindex=0 whose only handler is a click, so
 *     Enter and Space did nothing, and its accessible name was every hidden
 *     control's text run together ("3Comment12Send 1Pause animations…").
 *     While collapsed it is named "Open review toolbar" with the shortcut the
 *     component already honours (Cmd or Ctrl, Shift, F), and Enter or Space
 *     clicks it. Expanded, both attributes come off: it is no longer a button.
 *   - **Esc with Settings open closes Settings only.** The component's Esc
 *     handler never looks at Settings, so one press collapsed the whole bar
 *     with Settings still drawn above it. The first Esc now closes Settings
 *     and puts focus back on More, where Settings is opened from; the next
 *     Esc collapses the bar as before.
 *   - **Focus never falls to the page (UX review 4).** Adding a note (and,
 *     since review 6, Esc or Cancel) returns focus to the current mode once
 *     the popup has animated out (it used to go back before the exit
 *     animation removed the field, then fall to <body>). The Layout palette and Settings, opened from More, take focus
 *     as they open, and Esc puts it back on More.
 */
import { focusLost, holdFocus, modeButton } from "./ui.js";

const SHELL = '[data-agentation-toolbar] [class*="toolbarContainer"]';
const SETTINGS_OPEN = '[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]';
const PALETTE_OPEN = '[data-agentation-root] [class*="palette___"]:not([class*="exit"])';
const MORE = "[data-agentation-toolbar] [data-review=more]";
const OPEN_LABEL = "Open review toolbar";
// The component accepts Meta or Control with Shift and F on every platform.
const OPEN_KEYS = "Meta+Shift+F Control+Shift+F";

const collapsed = (shell) => !!shell && /collapsed/.test(shell.className);
const visible = (n) => !!n && !n.hidden && n.getClientRects().length > 0;

/** Name the collapsed shell; take the name off once it opens. Idempotent. */
export function syncToggle(shell = document.querySelector(SHELL)) {
  if (!shell) return;
  if (collapsed(shell)) {
    if (shell.getAttribute("aria-label") !== OPEN_LABEL) shell.setAttribute("aria-label", OPEN_LABEL);
    if (shell.getAttribute("aria-keyshortcuts") !== OPEN_KEYS) shell.setAttribute("aria-keyshortcuts", OPEN_KEYS);
  } else {
    if (shell.hasAttribute("aria-label")) shell.removeAttribute("aria-label");
    if (shell.hasAttribute("aria-keyshortcuts")) shell.removeAttribute("aria-keyshortcuts");
  }
}

/** Where focus goes once the bar opens from the keyboard: the current mode. */
function firstControl() {
  const bar = document.querySelector("[data-agentation-toolbar]");
  if (!bar) return null;
  return modeButton() || [...bar.querySelectorAll(".sk-review-controls button:not([data-review=grip])")].find(visible) || null;
}

/** Where focus goes when an upstream surface closes: More, else the current mode. */
function focusTargetAfterClose() {
  const more = document.querySelector(MORE);
  return visible(more) ? more : firstControl();
}

/**
 * Move focus into the Layout palette or Settings once it shows. Both are the
 * component's, opened from More (review-tools.js), which closes as they open:
 * focus on its menu item would fall to the page. The surface itself takes
 * focus (Tab goes on to its first control), named so a screen reader says
 * what opened.
 */
export function focusInto(kind) {
  const sel = kind === "settings" ? SETTINGS_OPEN : PALETTE_OPEN;
  const label = kind === "settings" ? "Settings" : "Layout moves";
  let tries = 0;
  const go = () => {
    const n = document.querySelector(sel);
    if (!n || !visible(n)) { if (++tries < 40) requestAnimationFrame(go); return; }
    if (!n.hasAttribute("tabindex")) n.tabIndex = -1;
    if (!n.getAttribute("role")) n.setAttribute("role", "dialog");
    if (!n.getAttribute("aria-label")) n.setAttribute("aria-label", label);
    if (!n.contains(document.activeElement)) n.focus({ preventScroll: true });
  };
  requestAnimationFrame(go);
}

function closeSettings() {
  const panel = document.querySelector(SETTINGS_OPEN);
  const gear = document.querySelector('[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="Settings"]');
  if (!panel || !gear) return false;
  const hadFocus = panel.contains(document.activeElement);
  gear.click();
  // Settings goes inert as it closes (review-tools.js syncInert), so focus
  // inside it would fall to <body>. More is where it was opened from.
  if (hadFocus || document.activeElement === document.body) {
    requestAnimationFrame(() => {
      const more = document.querySelector("[data-agentation-toolbar] [data-review=more]");
      (visible(more) ? more : visible(gear) ? gear : null)?.focus({ preventScroll: true });
    });
  }
  return true;
}

function onKeyDown(e) {
  if (e.defaultPrevented || e.isComposing) return;
  if (e.key === "Escape" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (document.querySelector(SETTINGS_OPEN) && closeSettings()) {
      e.preventDefault(); e.stopImmediatePropagation();
      return;
    }
    // The component's own Esc closes the Layout palette; focus inside it (or
    // already on the page) goes back to More, where the palette is opened from.
    const palette = document.querySelector(PALETTE_OPEN);
    if (palette && visible(palette)) {
      const inside = palette.contains(document.activeElement) || focusLost();
      if (inside) {
        // As soon as it starts to leave: it fades out for about 120ms still
        // holding focus, and its removal would drop focus to the page.
        const end = performance.now() + 600;
        const leaving = () => { const n = document.querySelector(PALETTE_OPEN); return !n || !visible(n); };
        const check = () => {
          if (performance.now() > end) return;
          if (!leaving()) { requestAnimationFrame(check); return; }
          if (focusLost() || palette.contains(document.activeElement)) focusTargetAfterClose()?.focus({ preventScroll: true });
        };
        requestAnimationFrame(check);
      }
    }
    return;
  }
  if ((e.key === "Enter" || e.key === " ") && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
    const shell = e.composedPath()[0];
    if (!(shell instanceof Element) || !shell.matches(SHELL) || !collapsed(shell)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    shell.click();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!collapsed(shell)) firstControl()?.focus({ preventScroll: true });
    }));
  }
}

let installed = false;
/** Install once. The shell can remount (hide until restart), so the observer rebinds. */
export function installToolbarKeys() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  // Window, capture: ahead of the component's document listener and our own.
  window.addEventListener("keydown", onKeyDown, true);
  let watched = null, obs = null;
  const bind = () => {
    const shell = document.querySelector(SHELL);
    if (shell !== watched) {
      obs?.disconnect(); watched = shell;
      if (shell) {
        let was = collapsed(shell);
        obs = new MutationObserver(() => {
          syncToggle(shell);
          // Collapsing removes the focused control from the bar: keep the
          // keyboard user on the toggle rather than dropping them to the page.
          const now = collapsed(shell);
          if (now && !was && (document.activeElement === document.body || shell.contains(document.activeElement))) shell.focus({ preventScroll: true });
          was = now;
        });
        obs.observe(shell, { attributes: true, attributeFilter: ["class"] });
      }
    }
    syncToggle(shell);
  };
  bind();
  setInterval(bind, 1000);
  document.addEventListener("agentation-kit:slot", bind);
  // A note just added closes the comment popup and focus falls to the page:
  // return it to the current mode, where the reviewer started. Not at once:
  // the popup animates out (about 150ms) with its field still focused, and
  // only its removal drops focus. So hold until the popup has gone. Only for
  // a note added here: one arriving on the stream changes nobody's focus.
  document.addEventListener("agentation-kit:note-added", () => {
    if (!document.querySelector("[data-annotation-popup]")) return;
    returnFromPopup();
  });
  // The popup's other two exits, Esc and Cancel, dropped focus the same way
  // (UX review 6, N4): back to the current mode, as Add does. Only the
  // reviewer's own Cancel: a bar button that clears an empty popup first
  // (review-tools.js popupYields) clicks it from script and takes focus itself.
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !e.isComposing && inPopup(e)) returnFromPopup();
  }, true);
  window.addEventListener("click", (e) => {
    if (e.isTrusted && e.composedPath().some((n) => n instanceof Element && n.matches('[data-annotation-popup] [class*="cancel___"]'))) returnFromPopup();
  }, true);
}

const inPopup = (e) => e.composedPath().some((n) => n instanceof Element && n.matches("[data-annotation-popup]"));
/** Once the comment popup has animated out, focus the current mode. */
function returnFromPopup() {
  holdFocus(() => firstControl(), { ms: 1500, when: () => !document.querySelector("[data-annotation-popup]") });
}
