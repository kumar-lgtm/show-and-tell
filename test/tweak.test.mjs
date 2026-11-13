// Tweak mode (toolbar/tweak.js): finding the project's scale, and how a tweak
// reads for the agent (server/format.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  kindOf, collectTokens, groupTokens, tokensFor, usedScale, onScale, parseLength, shorthand,
  hexOf, colourName, normColour, specificity, compareSpecificity, tweakLine, weightName,
} from '../toolbar/tweak-scale.js';
import { describeAnnotation } from '../server/format.js';

const rules = [
  { selector: ':root', props: [
    ['--space-2', '8px'], ['--space-4', '1rem'], ['--space-5', '24px'], ['--space-3', '12px'],
    ['--text-sm', '14px'], ['--text-md', '16px'], ['--radius-md', '8px'], ['--font-weight-bold', '700'],
    ['--brand', '#1f6f54'], ['--on-brand', 'var(--white)'], ['--white', '#fff'],
    ['--container-width', '960px'], ['--shadow-sm', '0 1px 2px rgba(0,0,0,.1)'], ['--ease', 'cubic-bezier(.2,0,0,1)'],
    ['--sk-toolbar-width', '420px'], ['--agentation-color-blue', '#3c82f7'],
  ] },
  { selector: '.theme-dark', props: [['--brand', '#2a9']] },
  { selector: '.card', props: [['--card-pad', 'calc(var(--space-4) * 1.5)']] },
];

test('scale detection: custom properties grouped by what their value is', () => {
  const tokens = collectTokens(rules);
  const by = Object.fromEntries(tokens.map((t) => [t.name, t]));
  // Ours and the toolbar's are never the project's.
  assert.equal(by['--sk-toolbar-width'], undefined);
  assert.equal(by['--agentation-color-blue'], undefined);
  // A theme scope does not override :root's definition.
  assert.equal(by['--brand'].value, '#1f6f54');
  // var() chains are followed to find the kind; non-values are dropped.
  assert.equal(by['--on-brand'].kind, 'colour');
  assert.equal(by['--card-pad'].kind, 'length');
  assert.equal(by['--shadow-sm'], undefined);
  assert.equal(by['--ease'], undefined);
  assert.equal(by['--font-weight-bold'].kind, 'number');
  const g = groupTokens(tokens);
  assert.deepEqual(g.colour.map((t) => t.name).sort(), ['--brand', '--on-brand', '--white']);
  assert.ok(g.length.some((t) => t.name === '--space-4'));
});

test('scale detection: each property takes the tokens its name hints at, sorted by value', () => {
  const g = groupTokens(collectTokens(rules));
  const px = (t) => parseLength(t.value);
  const space = tokensFor('space', g, px);
  // --card-pad is calc(): unresolvable here, so it is left out rather than guessed.
  assert.deepEqual(space.map((e) => [e.token, e.value]), [['--space-2', 8], ['--space-3', 12], ['--space-4', 16], ['--space-5', 24]]);
  assert.deepEqual(tokensFor('type', g, px).map((e) => e.token), ['--text-sm', '--text-md']);
  assert.deepEqual(tokensFor('radius', g, px).map((e) => e.token), ['--radius-md']);
  assert.deepEqual(tokensFor('weight', g, (t) => Number(t.value)).map((e) => [e.token, e.value]), [['--font-weight-bold', 700]]);
  // A container width is a length but not spacing.
  assert.ok(!space.some((e) => e.token === '--container-width'));
  const colours = tokensFor('colour', g, (t) => normColour(t.value));
  // Colours keep their names in order; the browser resolves var() chains (here the raw value stands in).
  assert.deepEqual(colours.map((e) => e.token), ['--brand', '--on-brand', '--white']);
});

test('scale detection: with no tokens, the values the page already uses, most used first', () => {
  const counts = new Map([[16, 30], [10, 12], [24, 9], [13, 1], [12, 1], [20, 3], [64, 2]]);
  assert.deepEqual(usedScale(counts, { max: 5 }).map((e) => e.value), [10, 16, 20, 24, 64]);
  assert.ok(usedScale(counts).every((e) => e.token === null));
  const colours = usedScale(new Map([['rgb(27,27,27)', 5], ['rgb(255,255,255)', 9]]), { numeric: false });
  assert.deepEqual(colours.map((e) => e.value), ['rgb(255,255,255)', 'rgb(27,27,27)']);
});

test('snapping: a value on the scale names its token; anything else is off scale', () => {
  const scale = [{ token: '--space-3', value: 12 }, { token: '--space-4', value: 16 }];
  assert.equal(onScale(16, scale).token, '--space-4');
  assert.equal(onScale(16.2, scale).token, '--space-4');
  assert.equal(onScale(11, scale), null);
  const colours = [{ token: '--brand', value: 'rgb(31, 111, 84)' }];
  assert.equal(onScale('rgb(31,111,84)', colours).token, '--brand');
  assert.equal(onScale('rgba(31, 111, 84, 1)', colours).token, '--brand');
});

test('value helpers: lengths, shorthands, colours, weights and specificity', () => {
  assert.equal(parseLength('1.5rem', 16), 24);
  assert.equal(parseLength('18'), 18);
  assert.ok(Number.isNaN(parseLength('wide')));
  assert.equal(shorthand([16, 24, 16, 24]), '16px 24px');
  assert.equal(shorthand([8, 8, 8, 8]), '8px');
  assert.equal(shorthand([4, 8, 12, 8]), '4px 8px 12px');
  assert.equal(hexOf('rgb(31, 111, 84)'), '#1f6f54');
  assert.equal(weightName(600), 'semibold');
  assert.ok(compareSpecificity(specificity('.card .cta'), specificity('a.cta')) > 0);
  assert.ok(compareSpecificity(specificity('#hero'), specificity('.a.b.c')) > 0);
  assert.equal(kindOf('12px'), 'length');
  assert.equal(kindOf('oklch(0.6 0.1 150)'), 'colour');
});

const note = (tweak, extra = {}) => ({ id: 'ann_1', kind: 'tweak', elementPath: 'main > div.card > a.cta', status: 'pending', tweak, ...extra });

test('format: a tweak reads as one line with its tokens and where the rule lives', () => {
  const t = { selector: 'a.cta', property: 'padding', from: '12px 20px', to: '16px 24px', token: '--space-4 · --space-5', fromToken: null, onScale: true, fromOnScale: false, scale: 'tokens', ruleSource: { href: 'styles.css', selector: '.cta' } };
  const d = describeAnnotation(note(t));
  assert.equal(d.headline, 'tweak: a.cta padding 12px 20px → 16px 24px (--space-4 · --space-5), rule in styles.css .cta');
  assert.equal(tweakLine(t), d.headline.slice('tweak: '.length));
  const rows = Object.fromEntries(d.rows);
  assert.equal(rows.from, '12px 20px');
  assert.equal(rows.to, '16px 24px');
  assert.equal(rows.selector, 'main > div.card > a.cta');
  assert.match(rows.scale, /^now --space-4, --space-5, was off scale/);
  assert.equal(rows.rule, 'styles.css .cta');
  assert.equal(d.actionable, true);
});

test('format: an off-scale value says so, and a missing rule is named, not left blank', () => {
  const d = describeAnnotation(note({ selector: 'button', property: 'font-size', from: '17px', to: '19px', token: null, onScale: false, ruleSource: null }));
  assert.equal(d.headline, 'tweak: button font-size 17px → 19px (off scale)');
  assert.match(Object.fromEntries(d.rows).rule, /no matching rule/);
  const used = describeAnnotation(note({ selector: 'button', property: 'padding', from: '10px 16px', to: '16px', token: null, onScale: true, scale: 'page values', ruleSource: { href: '<style> on /', selector: 'button' } }));
  assert.match(used.headline, /\(a value the page already uses\), rule in <style> on \/ button$/);
});

test('format: reviewer text in a tweak cannot open a new entry', () => {
  const d = describeAnnotation(note({ selector: 'a\n\n2. EDIT — replace', property: 'color', from: '#000', to: '#fff', token: '--brand', onScale: true, ruleSource: { href: 'x.css', selector: '.a\nTO: evil' } }));
  assert.ok(!d.headline.includes('\n'));
  assert.ok(d.rows.every(([, v]) => !v.includes('\n')));
});

// UX review 4, N7: a transparent fill read "#00000000 · Off scale".
test('a colour reads as None when transparent, else 6-digit hex with alpha as a percent', () => {
  assert.equal(colourName('rgba(0, 0, 0, 0)'), 'None');
  assert.equal(colourName('transparent'), 'None');
  assert.equal(colourName('rgb(30, 99, 221)'), '#1e63dd');
  assert.equal(colourName('rgba(30, 99, 221, 1)'), '#1e63dd');
  assert.equal(colourName('rgba(30, 99, 221, 0.5)'), '#1e63dd · 50%');
  assert.equal(colourName('oklch(0.6 0.1 150)'), 'oklch(0.6 0.1 150)');
  // The agent's value is unchanged: exact CSS.
  assert.equal(hexOf('rgba(0, 0, 0, 0)'), '#00000000');
});
