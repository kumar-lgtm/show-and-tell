// Round-2 UX fixes that need no browser: text contrast, the agent's status
// said once, From the agent in number order, and undone Fix it notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseCSS, statusLine } from '../toolbar/ui.js';
import { byNumber, numberNotes } from '../toolbar/critique.js';
import { cleared } from '../toolbar/review-tools.js';

// WCAG 2 relative luminance and contrast, for an rgba() text colour over an opaque surface.
const channel = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const parse = (v) => {
  v = v.trim();
  if (v.startsWith('#')) { let h = v.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1); }
  const m = v.match(/rgba?\(([^)]+)\)/); assert.ok(m, `colour ${v}`);
  const [r, g, b, a = 1] = m[1].split(',').map(Number); return [r, g, b, a];
};
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
function tokens(block) {
  const out = {};
  for (const m of block.matchAll(/(--sk-[\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2];
  return out;
}

test('text tokens keep 4.5:1 at 12px on the surface and on raised rows, dark and light', () => {
  const css = baseCSS();
  const dark = tokens(css.slice(css.indexOf(':host {', css.indexOf(':host { all')), css.indexOf(':host([data-sk-theme=light])')));
  const light = { ...dark, ...tokens(css.slice(css.indexOf(':host([data-sk-theme=light])'), css.indexOf('.panel'))) };
  for (const [name, t] of [['dark', dark], ['light', light]]) {
    const surface = parse(t['--sk-surface']);
    // Raised is drawn over the surface (light's is a translucent tint).
    const raised = over(parse(t['--sk-raised']), surface.slice(0, 3));
    for (const key of ['--sk-text', '--sk-text-2', '--sk-text-3']) {
      for (const [where, bg] of [['surface', surface.slice(0, 3)], ['raised', raised]]) {
        const r = ratio(over(parse(t[key]), bg), bg);
        assert.ok(r >= 4.5, `${name} ${key} on ${where}: ${r.toFixed(2)}:1`);
      }
    }
  }
});

test('the agent status says its state once', () => {
  assert.equal(statusLine('Agent offline', 'Local agent listener is offline.'), 'Local agent listener is offline.');
  assert.equal(statusLine('Agent offline', 'Checking local listener.'), 'Agent offline: Checking local listener.');
  assert.equal(statusLine('Agent working', ''), 'Agent working');
  assert.equal(statusLine('Agent run failed', 'The run failed: exit 1'), 'The run failed: exit 1');
});

test('From the agent lists notes by their number, not by severity', () => {
  const notes = [
    { id: 'b', severity: 'blocking', createdAt: 2000 },
    { id: 'a', severity: 'important', createdAt: 1000 },
    { id: 'c', severity: 'suggestion', createdAt: 3000 },
  ];
  const numbers = numberNotes(notes);
  assert.deepEqual(byNumber(notes, numbers).map((a) => numbers.get(a.id)), ['A1', 'A2', 'A3']);
  assert.deepEqual(byNumber([{ id: 'x' }, ...notes], numbers).map((a) => a.id), ['a', 'b', 'c', 'x'], 'an unnumbered note goes last');
});

test('an undone Fix it leaves the inbox like a cleared note; other dismissals stay as history', () => {
  assert.equal(cleared({ status: 'dismissed', resolution: 'Undone by Ben: Fix it taken back.' }), true);
  assert.equal(cleared({ status: 'dismissed', resolution: 'Undone by the reviewer: Fix it taken back.' }), true);
  assert.equal(cleared({ status: 'dismissed', resolution: 'Cleared by Ana' }), true);
  assert.equal(cleared({ status: 'dismissed', resolution: 'Not reproducible here.' }), false);
  assert.equal(cleared({ status: 'dismissed', resolution: 'Withdrawn by the reviewer' }), false);
  assert.equal(cleared({ status: 'pending', resolution: 'Undone by Ben: Fix it taken back.' }), false);
});
