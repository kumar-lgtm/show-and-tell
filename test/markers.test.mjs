// The one marker system (toolbar/ui.js, critique.js, chrome.css.js): where a
// marker goes, how the agent's notes are numbered, and the light-DOM rules
// that pin the toolbar to one accent.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const { markerSpot, MARKER } = await import('../toolbar/ui.js');
const { numberNotes } = await import('../toolbar/critique.js');
const { chromeCSS, ACCENT, sheetEdges, SHEET_INSET } = await import('../toolbar/chrome.css.js');
const { popupCSS } = await import('../toolbar/popup-style.js');

test('a marker sits just outside its element’s top-left corner', () => {
  const s = markerSpot({ left: 300, top: 200 });
  // Centre coordinates: the 22px box ends 3px into the element, inside the line's leading.
  assert.equal(s.x + MARKER / 2, 303);
  assert.equal(s.y + MARKER / 2, 203);
});

test('markers that share a corner step right instead of stacking', () => {
  const a = markerSpot({ left: 300, top: 200 });
  const b = markerSpot({ left: 300, top: 200 }, 26, [a]);
  assert.ok(b.x - a.x >= (MARKER + 26) / 2, `apart: ${a.x} ${b.x}`);
  assert.equal(b.y, a.y);
  const c = markerSpot({ left: 300, top: 200 }, MARKER, [a, b]);
  assert.ok(c.x > b.x, 'a third one steps past both');
  // A different row does not collide.
  assert.equal(markerSpot({ left: 300, top: 400 }, MARKER, [a, b]).x, a.x);
});

test('a marker never leaves the page on the left or the top', () => {
  const s = markerSpot({ left: 0, top: 0 });
  assert.ok(s.x - MARKER / 2 >= 0 && s.y - MARKER / 2 >= 0, JSON.stringify(s));
  const scrolled = markerSpot({ left: 500, top: 900 }, MARKER, [], 495);
  assert.ok(scrolled.x - MARKER / 2 >= 495, 'clamped to the visible left edge');
});

test('the agent’s notes are numbered A1, A2… by creation, decided ones included', () => {
  const notes = [
    { id: 'c', createdAt: 3000, severity: 'blocking', status: 'pending' },
    { id: 'a', createdAt: 1000, severity: 'suggestion', status: 'resolved' },
    { id: 'b', createdAt: 1000, severity: 'important', status: 'dismissed' },
  ];
  const n = numberNotes(notes);
  // Same second: the server's order stands (a stable sort), so a reload never renumbers.
  assert.deepEqual([...n], [['a', 'A1'], ['b', 'A2'], ['c', 'A3']]);
  assert.deepEqual([...numberNotes([...notes].reverse().reverse())], [...n]);
  // Severity has no say in the number: the blocking note is still A3.
  assert.equal(n.get('c'), 'A3');
});

test('one accent: the toolbar’s own colour tokens and our bar’s active and focus colours', () => {
  const css = chromeCSS();
  assert.equal(ACCENT, '#FF5436');
  assert.match(css, /--agentation-color-accent: #FF5436 !important/);
  assert.match(css, /--agentation-color-blue: #FF5436 !important/);
  assert.match(css, /button\[aria-pressed=true\][^}]*background: #573227 !important; color: #FFF4E0 !important/);
  // Keyboard focus is yellow, never the accent (docs/brand.md).
  assert.match(css, /focus-visible[^}]*outline: 2px solid #FFC72C !important/);
  assert.doesNotMatch(css, /818cf8|9a9eff|6366f1/i);
  // Scoped: every rule names the toolbar root, the toolbar, or our markers.
  for (const rule of css.split('}').map((r) => r.trim()).filter((r) => r.includes('{'))) {
    const sel = rule.slice(0, rule.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (sel.startsWith('@media')) continue;
    assert.match(sel, /data-agentation-root|data-agentation-toolbar|sk-crit-dot/, sel);
  }
});

test('the agent markers get a 44px hit area on touch only', () => {
  const css = chromeCSS();
  assert.match(css, /\.sk-crit-dot::before \{ content: ""; position: absolute; inset: -11px; \}/);
  assert.match(css, /@media \(pointer: fine\) \{ \.sk-crit-dot::before \{ display: none; \} \}/);
});

// UX review 2: N13, N14 and R13.
test('the reviewer markers get the same 44px hit area, on touch only', () => {
  const css = chromeCSS();
  const coarse = css.slice(css.indexOf('/* The reviewer\'s markers'));
  assert.match(coarse, /@media \(pointer: coarse\) \{\s*\[data-agentation-root\] \[data-annotation-marker\]::before \{ content: ""; position: absolute; inset: var\(--sk-hit, -11px\);/);
});

test('upstream Settings is a 44px sheet on touch, and the hover label is 12px', () => {
  const css = chromeCSS();
  const at = css.indexOf('/* Settings on touch');
  assert.ok(at > 0);
  const sheet = css.slice(at, css.indexOf('\n    }\n', css.indexOf('autoSendLabel', at)));
  assert.match(sheet, /^\/\* Settings on touch[^\n]*\n\s*@media \(pointer: coarse\) \{/);
  assert.match(sheet, /settingsPanel___"\] \{[^}]*left: var\(--sk-sheet-left, -8px\) !important; right: var\(--sk-sheet-right, -8px\) !important;[^}]*max-height: 55vh;/);
  for (const part of ['settingsHeader___', 'settingsNavLink___', 'settingsBackButton___', 'settingsRow___', 'settingsBrand___', 'cycleButton___', 'checkboxField___', 'autoSendLabel___']) {
    assert.ok(sheet.includes(part), part);
  }
  assert.match(sheet, /switchInput___"\],[\s\S]*?checkboxInput___"\] \{[^}]*width: 44px; height: 44px;/);
  assert.match(css, /hoverTooltip___"\],\s*\[data-agentation-root\] \[class\*="styles-module__hoverReactPath___"\] \{ font-size: 12px !important;/);
});

// UX review 4: N9, N12, N15, N16 and R8.
test('no dot patterns in upstream chrome: a plain frame icon and a segmented level bar', () => {
  const css = chromeCSS();
  assert.match(css, /canvasToggleIcon___"\] svg circle \{ display: none; \}/);
  assert.match(css, /cycleDots___"\] \{ flex-direction: row;/);
  assert.match(css, /cycleDot___"\] \{ width: 8px; height: 3px; border-radius: 1px; transform: none; \}/);
  // Filled up to the chosen level, in both themes.
  assert.match(css, /cycleDot___"\]:has\(~ \[class\*="styles-module__active___"\]\) \{ background: rgba\(255,255,255,\.7\); \}/);
  assert.match(css, /theme="light"\] \[class\*="styles-module__cycleDot___"\]:has\(~/);
});

test('Settings and the Layout palette are full-width phone sheets with the 12px inset', () => {
  const css = chromeCSS();
  const palette = css.slice(css.indexOf('/* The Layout palette on touch'));
  assert.match(palette, /palette___"\] \{\s*left: var\(--sk-sheet-left, -8px\) !important; right: var\(--sk-sheet-right, -8px\) !important;/);
  assert.equal(SHEET_INSET, 12);
  // The bar at x20 on a 390 screen, 350 wide: the sheet reaches 12px from each edge.
  assert.deepEqual(sheetEdges({ left: 20, right: 370 }, 390), { left: '-8px', right: '-8px' });
  // A bar drawn narrower and further right still gets a full-width sheet.
  assert.deepEqual(sheetEdges({ left: 56, right: 370 }, 390), { left: '-44px', right: '-8px' });
  // "Learn more." keeps its line and gets a 44px target drawn around it.
  assert.match(palette, /paletteHeaderDesc___"\] a::after \{ content: ""; position: absolute;[^}]*height: 44px;/);
});

test('on touch the agent marker’s 44px target grows away from the text it points at', () => {
  const css = chromeCSS();
  // Placed, it grows where layoutMarkers measured room (--sk-hit, UX review 6,
  // N2); unplaced, up and left from the marker's bottom-right corner: centred,
  // it still reached 11px down into the first line (UX review 5, N15).
  assert.match(css, /@media \(pointer: coarse\) \{ \.sk-crit-dot::before \{ inset: var\(--sk-hit, calc\(100% - 44px\) 0 0 calc\(100% - 44px\)\); \} \}/);
  assert.match(css, /\[data-annotation-marker\]::before \{ content: ""; position: absolute; inset: var\(--sk-hit, -11px\); border-radius: 50%; \}/);
});

test('the comment popup is the desktop’s 312px on a phone, inside the bar’s 20px margins', () => {
  // UX review 5, N16: 350 at 390 was wider than on a desktop.
  assert.match(popupCSS, /@media \(pointer: coarse\) and \(max-width: 639px\) \{\s*html \[data-annotation-popup\] \{ width: min\(312px, calc\(100vw - 40px\)\) !important; max-width: calc\(100vw - 40px\) !important;/);
  assert.doesNotMatch(chromeCSS(), /popup___/, 'one place for the popup width');
});

// UX review 4, N8: Edit text's outlines and fill were indigo (#6366F1).
test('no indigo left in our layers: Edit text uses the one accent', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const dir = new URL('../toolbar/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    assert.doesNotMatch(readFileSync(new URL(f, dir), 'utf8'), /99,\s*102,\s*241|6366f1|818cf8/i, f);
  }
  assert.match(readFileSync(new URL('edit-mode.js', dir), 'utf8'), /box-shadow: 0 0 0 2px rgba\(255,84,54,\.9\)/);
});
