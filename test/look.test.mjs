// UX review round 6, the "look" group, the parts that need no browser: where a
// marker goes when the gap above its element is too small (N2), whose
// questions the Send sheet counts (N6), and an inbox row's label (N10).
// test/look-browser.test.mjs measures the same on the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';

// reviewer.js reads the name from localStorage: this browser is Ana's.
const store = new Map([['feedback-toolbar-reviewer', 'Ana']]);
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) } });

const { markerSpot, hitArea, textRows, MARKER, TOUCH } = await import('../toolbar/ui.js');
const { questionsForMe, rowLabel, sendSummary } = await import('../toolbar/review-tools.js');

const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
const hits = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
const markBox = (s) => rect(s.x - s.width / 2, s.y - MARKER / 2, s.x + s.width / 2, s.y + MARKER / 2);
const hitBox = (s) => { const m = markBox(s), h = s.hit; return rect(m.left - h.left, m.top - h.top, m.right + h.right, m.bottom + h.bottom); };

// The example page's heading and subhead at the 16px phone margin, measured
// (Range.getClientRects) in Chromium. The gap between them is 16px.
const PHONE = {
  390: { h1: [rect(16, 62, 362, 100), rect(16, 97, 165, 135)], p: [rect(16, 154, 374, 174), rect(16, 181, 222, 201)] },
  360: { h1: [rect(16, 62, 290, 100), rect(16, 97, 237, 135)], p: [rect(16, 154, 300, 174), rect(16, 181, 296, 201)] },
};

test('N2: a subhead under a heading never puts its marker or its touch target on a line', () => {
  for (const [w, { h1, p }] of Object.entries(PHONE)) {
    const near = [...h1, ...p];
    const s = markerSpot({ left: 16, top: 151 }, 27, [], 0, 0, { own: p, near, right: Number(w), touch: TOUCH });
    const m = markBox(s);
    for (const l of near) assert.ok(!hits(m, l), `${w}: marker ${JSON.stringify(m)} on line ${JSON.stringify(l)}`);
    assert.ok(s.hit, `${w}: a touch target`);
    const t = hitBox(s);
    assert.ok(t.right - t.left >= TOUCH && t.bottom - t.top >= TOUCH, `${w}: 44px square, ${JSON.stringify(t)}`);
    for (const l of near) assert.ok(!hits(t, l), `${w}: touch target ${JSON.stringify(t)} on line ${JSON.stringify(l)}`);
    assert.ok(t.right <= Number(w) + 0.5, `${w}: on the page`);
    // It reads as the subhead's: just above its first line, its right edge on that line's end.
    assert.ok(Math.abs(m.right - p[0].right) <= 1, `${w}: right edge on the first line's end, ${m.right}`);
    assert.ok(m.bottom <= 151 && 151 - m.bottom <= 4, `${w}: just above the subhead, ${m.bottom}`);
  }
});

test('N2: with no text in the way, markers keep the corner rule; the heading still goes above itself', () => {
  // Room on the left: just outside the corner, 3px into it, as before.
  const roomy = markerSpot({ left: 300, top: 200 }, MARKER, [], 0, 0, { own: [rect(300, 203, 600, 223)], near: [rect(300, 203, 600, 223)], right: 1280, touch: 0 });
  assert.deepEqual([roomy.x + MARKER / 2, roomy.y + MARKER / 2], [303, 203]);
  // A desktop heading whose line box starts above its own box (48px type, 1.1 leading): the corner still holds.
  const tall = markerSpot({ left: 320, top: 64 }, 26, [], 0, 0, { own: [rect(320, 62, 941, 118)], near: [rect(320, 62, 941, 118)], right: 1280, touch: 0 });
  assert.equal(tall.x + 13, 323);
  // The heading at the phone margin: above it, left edges together, clear of its first line.
  const { h1 } = PHONE[390];
  const top = markerSpot({ left: 16, top: 64 }, 26, [], 0, 0, { own: h1, near: h1, right: 390, touch: TOUCH });
  assert.equal(top.x - 13, 16);
  assert.ok(markBox(top).bottom <= 62, JSON.stringify(top));
  for (const l of h1) assert.ok(!hits(hitBox(top), l), `touch target on ${JSON.stringify(l)}`);
});

test('N2: a marker stepped right by another never lands on text', () => {
  const { h1, p } = PHONE[390];
  const near = [...h1, ...p];
  const text = { own: p, near, right: 390, touch: TOUCH };
  const a = markerSpot({ left: 16, top: 151 }, 22, [], 0, 22, text);
  const b = markerSpot({ left: 16, top: 151 }, 27, [a], 0, 0, text);
  assert.ok(Math.abs(a.x - b.x) >= (22 + 27) / 2 || Math.abs(a.y - b.y) >= MARKER + 2, `apart: ${JSON.stringify([a, b])}`);
  for (const s of [a, b]) for (const l of near) {
    assert.ok(!hits(markBox(s), l), `${JSON.stringify(s)} on ${JSON.stringify(l)}`);
    assert.ok(!hits(hitBox(s), l), `target of ${JSON.stringify(s)} on ${JSON.stringify(l)}`);
  }
});

test('N2: a touch target grows away from text, and shrinks only when nothing else fits', () => {
  const mark = rect(100, 100, 122, 122);
  const clearOf = (lines) => (q) => lines.every((l) => !hits(q, l));
  // Text below and to the right: it grows up and left.
  const g = hitArea(mark, TOUCH, clearOf([rect(100, 122, 300, 144), rect(122, 60, 300, 122)])).grow;
  assert.deepEqual(g, { top: 22, right: 0, bottom: 0, left: 22 });
  // Free all round: centred.
  assert.deepEqual(hitArea(mark, TOUCH, clearOf([])).grow, { top: 11, right: 11, bottom: 11, left: 11 });
  // Boxed in: as large as it can be, still clear.
  const tight = hitArea(mark, TOUCH, clearOf([rect(0, 90, 400, 96), rect(0, 128, 400, 140)]));
  assert.equal(tight.whole, false);
  assert.ok(tight.grow.top <= 4 && tight.grow.bottom <= 6, JSON.stringify(tight));
  assert.equal(tight.grow.left + tight.grow.right, 22);
});

test('N2: text fragments group into lines', () => {
  const rows = textRows([rect(60, 154, 120, 174), rect(16, 154, 58, 174), rect(16, 181, 222, 201)]);
  assert.deepEqual(rows, [rect(16, 154, 120, 174), rect(16, 181, 222, 201)]);
});

test('N6: the Send sheet counts only the questions the inbox says are mine', () => {
  const ask = (id, reviewer) => ({ id, reviewer, status: 'acknowledged', replies: [{ from: 'agent', message: '?' }] });
  const rows = [ask('a', 'Ana'), ask('b', 'Ben'), ask('c', 'ana'), ask('d', undefined), { id: 'e', reviewer: 'Ana', status: 'pending' }];
  assert.deepEqual(questionsForMe(rows).map((a) => a.id), ['a', 'c', 'd'], 'mine, any case, and unsigned');
  const qs = questionsForMe(rows).length;
  assert.deepEqual(sendSummary({ n: 5, has: 5, qs }).facts, ['3 questions are waiting on your answer.']);
});

test('N10: a row says its kind and its viewport, never "Any viewport"', () => {
  assert.equal(rowLabel({ kind: 'comment' }), 'Comment');
  assert.equal(rowLabel({ kind: 'edit', viewport: { name: 'mobile' } }), 'Text edit · mobile');
  assert.equal(rowLabel({ kind: 'tweak' }), 'Tweak');
  assert.equal(rowLabel({ kind: 'edit', viewport: { name: 'desktop' } }, true), 'desktop');
  assert.equal(rowLabel({ kind: 'edit' }, true), '');
});
