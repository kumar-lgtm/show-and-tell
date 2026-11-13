// The brand (toolbar/brand.js, docs/brand.md): its pairs are readable, the old
// palette is gone, and the pieces that carry it are wired up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import * as brand from '../toolbar/brand.js';
import { MARK, BUB } from '../toolbar/brand-art.js';
import { baseCSS } from '../toolbar/ui.js';
import { chromeCSS } from '../toolbar/chrome.css.js';

const channel = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16));
const lum = (hex) => { const [r, g, b] = rgb(hex).map(channel); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

test('every brand pair that carries text is 4.5:1, and focus is 3:1 where it is drawn', () => {
  const text = [
    ['ink on tomato (Send, Add, badges, markers)', brand.ON_ACCENT, brand.ACCENT],
    ['chalk on ink', brand.CHALK, brand.INK],
    ['chalk on raised', brand.CHALK, brand.RAISED],
    ['chalk on the selected mode', brand.CHALK, brand.ACCENT_SOFT],
    ['tomato tint on ink', brand.ACCENT_TINT, brand.INK],
    ['tomato ink on paper', brand.ACCENT_INK, brand.PAPER],
    ['ink on paper', brand.INK, brand.PAPER],
    ['danger tint on ink', brand.DANGER_TINT, brand.INK],
    ['danger ink on paper', brand.DANGER_INK, brand.PAPER],
  ];
  for (const [what, fg, bg] of text) assert.ok(ratio(fg, bg) >= 4.5, `${what}: ${ratio(fg, bg).toFixed(2)}:1`);
  assert.ok(ratio(brand.FOCUS, brand.INK) >= 3, 'yellow focus ring on ink');
  assert.ok(ratio(brand.INK, brand.PAPER) >= 3, 'ink focus ring on paper');
  // The reason text on tomato is ink: white fails.
  assert.ok(ratio('#FFFFFF', brand.ACCENT) < 4.5);
});

test('the old palette is gone from the toolbar, and nothing puts white on the accent', () => {
  const dir = new URL('../toolbar/', import.meta.url);
  const files = readdirSync(dir).filter((n) => n.endsWith('.js')).map((n) => [n, readFileSync(new URL(n, dir), 'utf8')]);
  files.push(['copy-view/index.html', readFileSync(new URL('../server/copy-view/index.html', import.meta.url), 'utf8')]);
  assert.ok(files.length > 20, 'the scan found the toolbar sources');
  for (const [name, src] of files) {
    assert.doesNotMatch(src, /3e63dd|8ea4f5|2f4fb8|62,\s*99,\s*221|#1a1a1a/i, `${name} still has the old palette`);
    assert.doesNotMatch(src, /background:\s*(#FF5436|var\(--sk-accent\))[^;}]*;\s*color:\s*(#fff|white)\b/i, `${name} puts white on tomato`);
  }
});

test('shadow roots get the brand tokens and a focus ring of their own', () => {
  const css = baseCSS();
  assert.match(css, new RegExp(`--sk-surface: ${brand.INK};`));
  assert.match(css, new RegExp(`--sk-accent: ${brand.ACCENT};`));
  assert.match(css, new RegExp(`--sk-on-accent: ${brand.ON_ACCENT};`));
  assert.match(css, new RegExp(`--sk-focus: ${brand.FOCUS};`));
  assert.match(css, /:host\(\[data-sk-theme=light\]\)[^}]*--sk-focus: #1D1A2F;/);
  assert.match(css, /focus-visible \{ outline: 2px solid var\(--sk-focus\)/);
  assert.match(css, /ST Sans/);
  // The component's chrome: ink text on its tomato pieces, the mark on the closed bar.
  const chrome = chromeCSS();
  assert.match(chrome, /styles-module__submit___"\] \{ color: #1D1A2F !important/);
  assert.match(chrome, /toggleContent___"\] \{ background: url\("data:image\/svg\+xml,/);
});

test('brand art is self-contained: no ids to clash, no scripts, sized by its viewBox', () => {
  for (const [name, svg] of [['mark', MARK], ...Object.entries(BUB)]) {
    assert.match(svg, /^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*aria-hidden="true"/, name);
    assert.doesNotMatch(svg, /\sid=|<script|url\(#|`/, name);
    assert.ok(svg.length > 500, name);
  }
  assert.match(MARK, /currentColor/, 'the mark outline follows the text colour');
  assert.deepEqual(Object.keys(BUB), ['ready', 'working', 'asleep']);
});

test('the fonts the page asks for are the ones the server ships', () => {
  for (const f of brand.FONT_FILES) assert.ok(existsSync(new URL(`../server/fonts/${f.file}`, import.meta.url)), f.file);
  const app = readFileSync(new URL('../server/app.js', import.meta.url), 'utf8');
  for (const f of brand.FONT_FILES) assert.ok(app.includes(`'${f.file}'`), `server/app.js serves ${f.file}`);
  assert.equal(brand.installFonts('http://127.0.0.1:1/__ag'), null, 'no document: nothing to install, no throw');
});

test('the review server serves a listed font and refuses anything else', async () => {
  const { createReviewApp } = await import('../server/app.js');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const app = createReviewApp({ name: uniqueName('fonts'), base: '/__review', origins: ['http://127.0.0.1:1'] });
  const get = (path, method = 'GET') => new Promise((done) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, writeHead(status, h = {}) { this.status = status; Object.assign(this.headers, h); }, end(body) { done({ status: this.status, headers: this.headers, body }); } };
    app.handler({ method, url: path, headers: { host: '127.0.0.1:1' } }, res, path);
  });
  try {
    const ok = await get('/__ag/fonts/dm-sans.woff2');
    assert.equal(ok.status, 200); assert.equal(ok.headers['Content-Type'], 'font/woff2');
    assert.equal(ok.headers.Vary, 'Origin', 'a copy cached without an Origin is never reused for a cross-origin fetch');
    assert.equal(ok.body.subarray(0, 4).toString('latin1'), 'wOF2');
    assert.equal((await get('/__ag/fonts/..%2F..%2Fapp.js')).status, 404);
    assert.equal((await get('/__ag/fonts/nope.woff2')).status, 404);
    assert.equal((await get('/__ag/fonts/dm-sans.woff2', 'POST')).status, 405);
  } finally { cleanup(); }
});
