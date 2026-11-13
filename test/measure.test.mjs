// The maths behind Run checks (toolbar/measure.js): colour parsing, compositing,
// WCAG contrast, the large-text and target-size rules, and merging runs at
// several widths into rows. The DOM half is covered by critique-browser.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const m = await import('../toolbar/measure.js');

test('colours parse from what getComputedStyle returns, and refuse what is not sRGB', () => {
  assert.deepEqual(m.parseColor('rgb(255, 255, 255)'), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(m.parseColor('rgba(0, 0, 0, 0.5)'), { r: 0, g: 0, b: 0, a: 0.5 });
  assert.deepEqual(m.parseColor('rgb(10 20 30 / 25%)'), { r: 10, g: 20, b: 30, a: 0.25 });
  assert.deepEqual(m.parseColor('#abc'), { r: 170, g: 187, b: 204, a: 1 });
  assert.deepEqual(m.parseColor('transparent'), { r: 0, g: 0, b: 0, a: 0 });
  assert.equal(m.parseColor('oklch(0.7 0.1 200)'), null);
  assert.equal(m.parseColor('color(display-p3 1 0 0)'), null);
});

test('contrast ratios match WCAG reference values', () => {
  const black = { r: 0, g: 0, b: 0 }, white = { r: 255, g: 255, b: 255 };
  assert.equal(Math.round(m.contrastRatio(black, white) * 100) / 100, 21);
  assert.equal(m.contrastRatio(white, white), 1);
  // #777 on white is the classic near miss: 4.48:1.
  assert.equal(Math.round(m.contrastRatio(m.parseColor('#777777'), white) * 100) / 100, 4.48);
  // #767676 is the lightest grey that passes on white.
  assert.ok(m.contrastRatio(m.parseColor('#767676'), white) >= 4.5);
  assert.equal(m.ratioText(4.4999), '4.4:1', 'rounded down, so a fail never reads as 4.5');
});

test('semi-transparent layers composite before measuring', () => {
  const half = m.blend({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual([Math.round(half.r), half.a], [128, 1]);
  assert.deepEqual(m.blend({ r: 9, g: 9, b: 9, a: 0 }, { r: 1, g: 2, b: 3, a: 1 }), { r: 1, g: 2, b: 3, a: 1 });
});

test('large text needs 3:1, everything else 4.5:1', () => {
  assert.equal(m.requiredRatio(16, 400), 4.5);
  assert.equal(m.requiredRatio(24, 400), 3);
  assert.equal(m.requiredRatio(18.66, 700), 3);
  assert.equal(m.requiredRatio(18.66, 400), 4.5);
  assert.equal(m.requiredRatio(18, 700), 4.5);
});

test('a passing colour is the nearest one that clears the ratio', () => {
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const to = m.passingColor(m.parseColor('#999999'), white, 4.5);
  assert.ok(m.contrastRatio(m.parseColor(to), white) >= 4.5, to);
  assert.ok(m.luminance(m.parseColor(to)) > m.luminance({ r: 60, g: 60, b: 60 }), 'darkened only as far as needed');
  // On black, it lightens instead.
  const light = m.passingColor(m.parseColor('#333333'), { r: 0, g: 0, b: 0, a: 1 }, 4.5);
  assert.ok(m.luminance(m.parseColor(light)) > m.luminance(m.parseColor('#333333')));
});

test('target size: 44px on touch or at 640 and under, 24px on a desktop', () => {
  assert.equal(m.targetRule({ coarse: true, width: 1440 }).min, 44);
  assert.equal(m.targetRule({ coarse: false, width: 390 }).min, 44);
  assert.equal(m.targetRule({ coarse: false, width: 640 }).min, 44);
  assert.equal(m.targetRule({ coarse: false, width: 820 }).min, 24);
  assert.match(m.targetRule({ width: 1440 }).rule, /WCAG 2\.5\.8/);
});

test('runs at several widths merge into one row per failure, with the widths it fails at', () => {
  const f = (selector, width) => ({ width, findings: [{ check: 'target', selector, label: 'Start free trial', value: '39px tall', rule: 'Touch targets: 44 × 44px' }], unknown: [] });
  const { findings } = m.mergeRuns([
    { width: 390, findings: [...f('.a', 390).findings, ...f('.b', 390).findings], unknown: [{ check: 'contrast', selector: '.hero h1', reason: 'image' }] },
    { width: 820, findings: [...f('.a', 820).findings, ...f('.b', 820).findings], unknown: [] },
  ]);
  assert.equal(findings.length, 1);
  assert.deepEqual(findings[0].selectors, ['.a', '.b']);
  assert.deepEqual(findings[0].widths, [390, 820]);
  assert.equal(m.listWidths([1440, 390, 820]), '390, 820 and 1440');
  assert.equal(m.passedLine(findings, [{}], { target: 2, overflow: 3, contrast: 4 }),
    'Passed: contrast on every text pair that could be measured, no overflow or clipped text');
});
