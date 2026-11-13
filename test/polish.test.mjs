// UX review round 5, polish, the parts that need no browser: the question
// notice's line (#2), the Send sheet's wording (#8), Agent activity's body
// (#15), colour swatches (#16), the Talk review's target line (#17), where a
// marker goes at the page margin (N15), and the CSS behind #4 to #7 and #3.
// test/polish-browser.test.mjs measures the same on the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noticeText } from '../toolbar/replies.js';
import { sendSummary } from '../toolbar/review-tools.js';
import { bodyText } from '../toolbar/agent-work.js';
import { swatchKind } from '../toolbar/tweak-scale.js';
import { nearText } from '../toolbar/voice-context.js';
import { markerSpot, MARKER, baseCSS } from '../toolbar/ui.js';
import { chromeCSS } from '../toolbar/chrome.css.js';

const words = (lead) => lead.map((x) => (typeof x === 'string' ? x : x.b)).join('');

test('#2: the notice leads with the number, singular and plural', () => {
  assert.equal(noticeText(1), '1 question from the agent');
  assert.equal(noticeText(2), '2 questions from the agent');
  assert.equal(noticeText(12), '12 questions from the agent');
});

test('#8: nothing new is "went" whether or not this browser ever sent', () => {
  // Never sent here, open questions only: the bar says "Nothing to send yet".
  for (const sentAt of [0, 1000]) {
    const s = sendSummary({ fresh: 0, n: 3, has: 3, qs: 2, sentAt });
    assert.equal(s.went, true, `sentAt ${sentAt}`);
    assert.equal(words(s.lead), 'The agent has 3 notes. Nothing new to send.');
    assert.deepEqual(s.lead[1], { b: '3 notes' }, 'the count is bold');
    assert.deepEqual(s.send, { label: 'Send again', kind: 'ghost', disabled: false });
    assert.deepEqual(s.facts, ['2 questions are waiting on your answer.'], 'no "You can send now"');
  }
  assert.equal(words(sendSummary({ n: 1, has: 1 }).lead), 'The agent has 1 note. Nothing new to send.');
  assert.equal(words(sendSummary({ n: 4, has: 4, pages: 2 }).lead), 'The agent has 4 notes across 2 pages. Nothing new to send.');
});

test('#8: something new keeps the primary Send N and its wording', () => {
  const s = sendSummary({ fresh: 2, n: 5, has: 3, qs: 1, sentAt: 1000 });
  assert.equal(s.went, false);
  assert.equal(words(s.lead), '2 new notes. The agent reads them with the 3 it already has.');
  assert.deepEqual(s.send, { label: 'Send 2', kind: 'primary', disabled: false });
  assert.deepEqual(s.facts, ['1 question is waiting on your answer. You can send now and answer later.']);
  assert.equal(words(sendSummary({ fresh: 1, n: 1 }).lead), '1 new note for the agent.');
  const edits = sendSummary({ fresh: 3, n: 3, drafts: 2, tweaks: 1 });
  assert.deepEqual(edits.facts, ['2 text edits will be saved first.', '1 tweak will be saved first.']);
});

test('#8: nothing at all is a disabled Send to agent', () => {
  const s = sendSummary({});
  assert.equal(s.went, false);
  assert.equal(words(s.lead), 'No notes yet.');
  assert.deepEqual(s.send, { label: 'Send to agent', kind: 'primary', disabled: true });
});

test('#15: a body that repeats the heading is dropped, whatever its case or punctuation', () => {
  assert.equal(bodyText('Changes ready', 'Changes ready.', 'complete'), '');
  assert.equal(bodyText('Changes ready', 'changes ready!', 'complete'), '');
  assert.equal(bodyText('Changes ready', '  Changes ready…  ', 'complete'), '');
  assert.equal(bodyText('Changes ready', 'Changes ready. Reload the preview to review them.', 'complete'), 'Changes ready. Reload the preview to review them.');
  assert.equal(bodyText('Agent working', 'Updating the title.', 'working'), 'Updating the title.');
  assert.equal(bodyText('Agent working', '', 'working'), '');
  // Listening's own status line, as before.
  assert.equal(bodyText('Agent listening', 'Listening for Send to agent.', 'listening'), '');
});

test('#16: None is slashed, a near-black swatch is ringed, the rest are plain', () => {
  assert.equal(swatchKind('rgba(0, 0, 0, 0)'), 'none');
  assert.equal(swatchKind('transparent'), 'none');
  assert.equal(swatchKind('rgb(27, 27, 27)'), 'dark');
  assert.equal(swatchKind('#1b1b1b'), 'dark');
  assert.equal(swatchKind('#000'), 'dark');
  assert.equal(swatchKind('rgba(255, 255, 255, 0.05)'), 'dark', 'a faint tint is dark on the dark panel');
  assert.equal(swatchKind('rgb(62, 99, 221)'), '');
  assert.equal(swatchKind('#fafaf8'), '');
  assert.equal(swatchKind('var(--brand)'), '');
});

test('#17: the target line says Near:, never a bare role', () => {
  assert.equal(nearText({ kind: 'element', context: { role: 'heading' } }), 'Near: heading');
  assert.equal(nearText({ kind: 'element', context: { role: 'button', heading: 'Starter' } }), 'Near: button, under “Starter”');
  assert.equal(nearText({ kind: 'element', context: { tag: 'p' } }), 'Near: p');
  assert.equal(nearText({ kind: 'element', context: {} }), '');
  assert.equal(nearText({ kind: 'region', context: { elements: [{ name: 'Starter' }, { name: 'Pro' }], more: 2 } }), 'Contains “Starter”, “Pro” and 2 more');
  assert.equal(nearText({ kind: 'element' }), '');
});

test('N15: at the page margin a marker goes above its element, never onto its first letters', () => {
  // The h1 at the 16px margin with a 26px "A3": it was pushed right onto "Pr".
  const s = markerSpot({ left: 16, top: 64 }, 26);
  assert.equal(s.x - 13, 16, 'its left edge on the element’s');
  assert.ok(s.y + MARKER / 2 <= 64 - 2, `wholly above: bottom ${s.y + MARKER / 2}`);
  // On a touch screen the target below the marker clears the element too.
  const touch = markerSpot({ left: 16, top: 64 }, MARKER, [], 0, 22);
  assert.ok(touch.y + 22 <= 64, `touch target bottom ${touch.y + 22}`);
  // With room on the left, as before: 3px into the corner, no further.
  const roomy = markerSpot({ left: 300, top: 200 });
  assert.equal(roomy.x + MARKER / 2, 303);
  assert.equal(roomy.y + MARKER / 2, 203);
  // At the very top there is no room above: it stays on the page.
  const top = markerSpot({ left: 16, top: 4 }, 26);
  assert.ok(top.y - MARKER / 2 >= 0 && top.x - 13 >= 0, JSON.stringify(top));
  // Two at the margin on one corner still step apart.
  const a = markerSpot({ left: 16, top: 151 }, 22), b = markerSpot({ left: 16, top: 151 }, 26, [a]);
  assert.ok(b.x - a.x >= (22 + 26) / 2, `${a.x} ${b.x}`);
});

test('#4: every shadow root draws the one focus ring', () => {
  assert.match(baseCSS(), /button:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible,\s*summary:focus-visible, a:focus-visible \{ outline: 2px solid var\(--sk-focus\); outline-offset: 2px; \}/);
});

test('#5 to #7 and #3: upstream chrome rules', () => {
  const css = chromeCSS();
  const light = '[data-agentation-root][data-agentation-theme="light"]';
  for (const part of ['settingsLabel___', 'settingsPanel___"] [class*="styles-module__label___', 'canvasToggleLabel___', 'cancel___']) {
    assert.ok(css.includes(`${light} [class*="styles-module__${part}"]`) || css.includes(`${light} [class*="styles-module__canvasToggle___"]:not([class*="styles-module__active___"]) [class*="styles-module__${part}"]`), part);
  }
  assert.match(css, /cancel___"\] \{ color: rgba\(0,0,0,\.62\) !important; \}/);
  assert.match(css, /paletteSectionTitle___"\] \{ color: rgba\(0,0,0,\.6\) !important; \}/);
  assert.match(css, /buttonTooltip___"\] \[class\*="styles-module__shortcut___"\] \{ opacity: 1 !important; color: rgba\(255,255,255,\.65\) !important; \}/);
  assert.match(css, /theme="light"\] \[class\*="styles-module__buttonTooltip___"\] \[class\*="styles-module__shortcut___"\] \{ color: rgba\(0,0,0,\.6\) !important; \}/);
  assert.match(css, /\.sk-send:not\(\[data-state=ready\]\)\[aria-pressed=true\] \{ background: rgba\(128,128,128,\.28\) !important; color: inherit !important; opacity: 1 !important; \}/);
  assert.match(css, /buttonTooltip___"\] \{ margin-bottom: var\(--sk-tip-lift, 0px\); \}/);
});

test('Layout palette help icons reach 3:1 in both themes', () => {
  const css = chromeCSS();
  assert.match(css, /canvasPurposeHelp___"\] svg \{ color: rgba\(255,255,255,\.55\) !important; \}/);
  assert.match(css, /theme="light"\] \[class\*="styles-module__canvasPurposeHelp___"\] svg \{ color: rgba\(0,0,0,\.55\) !important; \}/);
});

test('side sheets go where they cover least of the working target', async () => {
  const { sheetSide } = await import('../toolbar/ui.js');
  const r = (left, right) => ({ left, right, width: right - left, top: 0, bottom: 10, height: 10 });
  assert.equal(sheetSide(384, null, 1280), 'right', 'nothing to avoid: the right');
  assert.equal(sheetSide(384, r(340, 460), 1280), 'right', 'words on the left: the right is clear');
  assert.equal(sheetSide(384, r(900, 1200), 1280), 'left', 'words under the right sheet: the left');
  assert.equal(sheetSide(384, r(320, 889), 1280), 'right', 'both sides overlap: the smaller overlap');
});
