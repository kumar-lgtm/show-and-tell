// Copy edit mode, step 1: the copy map (server/copy-map.js) finds every piece of
// copy in source with an exact span, and copy-place.js joins it with the page's
// outline. Fixtures mirror the shapes in the pollut.ai testbed: data arrays,
// canvas labels, a mascot's lines in data-* attributes, SVG built in templates.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// _seed first: it points the store at a temp folder before any server module reads it.
import { tree, cli, cleanup, uniqueName } from './_seed.mjs';
import { scanFile, classify, extractCopy, renderCopyMap } from '../server/copy-map.js';
import { placeCopy, renderPlaced, pageFiles } from '../server/copy-place.js';

const dirs = [];
after(() => cleanup(...dirs));
const src = (files) => { const d = tree(files); dirs.push(d); return d; };

const APP = `(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const recordData = [
    ['PROFILE', 'Beloved beekeeper.', 'Three hives. Very good with bees.'],
    ['INTERVIEW', '“I’ve never seen a bee.”', 'Not on purpose, anyway.'],
    ['FORUM', 'Allergic to cats.', 'Posting since 2011.'],
  ];
  const E = [
    { audience: 'Recruiter', short: 'Hiring', job: 'Chief executive', born: 1988 },
    { audience: 'Insurer', short: 'Risk', job: 'Safety instructor', born: 1995 },
  ];
  // Don't read this comment as a string: it's got apostrophes.
  const re = /it's "quoted"/g;
  if ('ResizeObserver' in window) $('.hero').classList.add('ready');
  if (mode === 'city') draw();
  function draw(ctx, name) {
    ctx.font = '12px "Fragment Mono", monospace';
    ctx.fillText('Nobody, everywhere', 10, 20);
    el.setAttribute('aria-label', 'The 24 sources and the city each one gives');
    el.setAttribute('aria-hidden', 'true');
    status.textContent = \`Reading \${count} records about \${name || 'you'}…\`;
    li.innerHTML = \`<span class="n">\${i}</span><span class="y">b. \${e.born}</span>\`;
  }
  const FIG = [\`<svg viewBox="0 0 240 120"><text x="0" y="12">fake bios</text><text x="172" y="40" class="t-strong">kept</text></svg>\`];
  addEventListener('pointermove', draw);
  const SRC = ['profile', 'wiki', 'forum'];
})();
`;

const HTML = `<!doctype html>
<html><head>
<meta name="description" content="Personal misinformation as a service.">
<title>pollut.ai &mdash; Nobody, Everywhere</title>
</head><body>
<header class="global-nav" aria-label="pollut.ai home"><a href="/">pollut.ai</a></header>
<main>
<section id="top" data-smoggy="hero" data-smoggy-line="Ask me where you live. I’ll answer immediately." class="hero wide">
  <h1>BECOME<br>NO ONE.</h1>
  <p>Making you impossible <em>to summarise.</em></p>
  <img src="a.png" alt="Smoggy waving">
  <p aria-hidden="true">THEY WANT YOUR DATA.</p>
  <ul id="record-field"></ul>
</section>
</main>
<script>document.title = 'Still here?';</script>
<script src="app.js"></script>
</body></html>
`;

const unit = (units, text) => units.find((u) => u.text === text);

test('every unit points at exactly its raw text in the file', () => {
  for (const [rel, text] of [['app.js', APP], ['index.html', HTML]]) {
    const units = scanFile(rel, text);
    assert.ok(units.length > 10, rel);
    for (const u of units) assert.equal(text.slice(u.start, u.end), u.raw, `${rel} ${u.id}`);
  }
});

test('JS: strings in data get paths; keys, comparisons, regexes and comments are not copy', () => {
  const units = scanFile('app.js', APP);
  const bee = unit(units, 'Beloved beekeeper.');
  assert.equal(bee.copy, 'yes');
  assert.equal(bee.path, 'recordData[0][1]');
  assert.equal(bee.owner, 'recordData');
  assert.equal(unit(units, 'Not on purpose, anyway.').path, 'recordData[1][2]');
  // A short label beside sentences in the same data is copy too.
  assert.equal(unit(units, 'PROFILE').copy, 'yes');
  assert.equal(unit(units, 'Safety instructor').path, 'E[1].job');
  assert.equal(unit(units, 'ResizeObserver').copy, 'no');
  assert.equal(unit(units, 'city').copy, 'no');
  assert.equal(unit(units, '.hero').copy, 'no');
  assert.equal(unit(units, 'ready').copy, 'no');
  assert.equal(unit(units, 'pointermove').copy, 'no');
  assert.equal(unit(units, 'use strict').copy, 'no');
  assert.equal(unit(units, '12px "Fragment Mono", monospace').copy, 'no');
  // Nothing from the comment or the regex literal.
  assert.ok(!units.some((u) => /apostrophes|quoted/.test(u.text)));
  // A list of lowercase words is offered, not asserted.
  assert.equal(unit(units, 'wiki').copy, 'maybe');
});

test('JS: canvas, attributes and assignments decide by where the string goes', () => {
  const units = scanFile('app.js', APP);
  const canvas = unit(units, 'Nobody, everywhere');
  assert.equal(canvas.copy, 'yes');
  assert.match(canvas.why, /fillText/);
  assert.equal(canvas.owner, 'draw()');
  assert.equal(unit(units, 'The 24 sources and the city each one gives').copy, 'yes');
  assert.equal(unit(units, 'aria-label').copy, 'no');
  assert.equal(unit(units, 'true').copy, 'no');
});

test('templates keep ${…} as locked parts; strings inside an expression are their own units', () => {
  const units = scanFile('app.js', APP);
  const t = unit(units, 'Reading ${count} records about ${name || \'you\'}…');
  assert.ok(t, units.filter((u) => u.kind === 'template').map((u) => u.text).join(' | '));
  assert.equal(t.copy, 'yes');
  assert.deepEqual(t.parts.filter((p) => p.expr).map((p) => p.expr), ['count', "name || 'you'"]);
  for (const p of t.parts) assert.ok(p.start >= t.start && p.end <= t.end);
  const inner = unit(units, 'you');
  assert.equal(inner.within, t.id);
});

test('markup built in strings is listed piece by piece, expressions locked', () => {
  const units = scanFile('app.js', APP);
  assert.equal(unit(units, 'fake bios').kind, 'markup-text');
  assert.equal(unit(units, 'fake bios').path, 'FIG[0]');
  assert.equal(unit(units, 'kept').copy, 'yes');
  const born = unit(units, 'b. ${e.born}');
  assert.ok(born, 'b. ${e.born} found');
  assert.equal(APP.slice(born.start, born.end), 'b. ${e.born}');
  // The containing template is not offered as one string.
  assert.equal(units.find((u) => u.kind === 'template' && u.raw.startsWith('<svg')).copy, 'no');
  // `${i}` alone is not copy.
  assert.ok(!units.some((u) => u.text === '${i}' && u.copy !== 'no'));
});

test('JSX: text children and copy attributes, not class names or handlers', () => {
  const jsx = `export function Hero({ name }) {
  const label = name ? \`Hi \${name}\` : 'Hi there';
  return (
    <section className="hero" aria-label="Welcome banner">
      <h1>Pricing for everyone</h1>
      <p>
        Start free and upgrade
        when your team's ready.
      </p>
      <Button onClick={() => go('/signup')} variant="primary" title="Create an account">Get started</Button>
      {items.map((i) => <li key={i.id}>{i.label}</li>)}
    </section>
  );
}
`;
  const units = scanFile('Hero.jsx', jsx);
  for (const u of units) assert.equal(jsx.slice(u.start, u.end), u.raw);
  assert.equal(unit(units, 'Pricing for everyone').kind, 'jsx-text');
  assert.equal(unit(units, "Start free and upgrade when your team's ready.").copy, 'yes');
  assert.equal(unit(units, 'Welcome banner').copy, 'yes');
  assert.equal(unit(units, 'Create an account').copy, 'yes');
  assert.equal(unit(units, 'Get started').copy, 'yes');
  assert.equal(unit(units, 'hero').copy, 'no');
  assert.equal(unit(units, 'primary').copy, 'no');
  assert.equal(unit(units, '/signup').copy, 'no');
  assert.equal(unit(units, 'Hi there').copy, 'yes');
});

test('HTML: text, copy attributes, meta, data-* lines; inline scripts at the right offsets', () => {
  const units = scanFile('index.html', HTML);
  assert.equal(unit(units, 'Personal misinformation as a service.').attr, 'content');
  const title = unit(units, 'pollut.ai — Nobody, Everywhere');
  assert.equal(title.raw, 'pollut.ai &mdash; Nobody, Everywhere');
  const line = unit(units, 'Ask me where you live. I’ll answer immediately.');
  assert.equal(line.attr, 'data-smoggy-line');
  assert.equal(line.copy, 'yes');
  assert.equal(line.section, 'section#top');
  assert.ok(!units.some((u) => u.text === 'hero wide' || u.text === 'hero'));
  assert.equal(unit(units, 'Smoggy waving').attr, 'alt');
  assert.equal(unit(units, 'pollut.ai home').attr, 'aria-label');
  assert.equal(unit(units, 'BECOME').block, unit(units, 'NO ONE.').block);
  assert.equal(unit(units, 'THEY WANT YOUR DATA.').copy, 'maybe');
  const script = unit(units, 'Still here?');
  assert.equal(HTML.slice(script.start, script.end), 'Still here?');
  assert.equal(script.path, 'document.title =');
});

test('classify: code shapes stay out, sentences and labels come in', () => {
  const c = (text, extra = {}) => classify({ kind: 'string', text, ...extra }).copy;
  for (const t of ['https://pollut.ai', './assets/smoggy.webp', 'is-active', 'fontSize', 'rgba(0,0,0,.4)', '#ff00aa', 'main h2, main p, .ed-tag',
    '--use-angle=swiftshader', '&amp;', 'M10 20L30 40Z', 'precision highp float; void main(){}', '0 0 240 120', '#a .b > p']) assert.equal(c(t), 'no', t);
  for (const t of ['Beloved beekeeper.', 'Hi! I’m Smoggy, your personal companion.', 'Spread out', 'run a small design studio',
    'A beloved beekeeper. Has never left Iceland.', '[1] source ${n}. The other 23 sources were not consulted.', 'Teetotal.']) assert.equal(c(t), 'yes', t);
});

test('extractCopy skips dependencies, build output, tests and minified files', () => {
  const dir = src({
    'index.html': HTML, 'app.js': APP,
    'node_modules/x/index.js': "export const msg = 'Do not list me, please.';",
    'dist/app.js': "const a = 'Built output, also skipped.';",
    'test/app.test.js': "it('renders the hero copy correctly', () => {});",
    'vendor/lib.js': "const v = 'Vendored sentence here.';",
    'app.min.js': `var a='${'x'.repeat(5000)}';`,
  });
  const map = extractCopy(dir);
  assert.deepEqual(map.files.sort(), ['app.js', 'index.html']);
  const out = renderCopyMap(map);
  assert.match(out, /recordData {2}\(line 5\)/);
  assert.match(out, /\[0\]\[1\] {2}"Beloved beekeeper\."/);
  assert.doesNotMatch(out, /skipped|Vendored|Do not list/);
});

// The outline toolbar/copy-outline.js sends, for the fixture page above after app.js ran.
const outline = (overrides = {}) => ({
  url: 'http://localhost:5173/',
  resources: ['http://localhost:5173/app.js'],
  items: [
    { type: 'landmark', depth: 0, kind: 'header', label: 'pollut.ai home' },
    { type: 'attr', depth: 1, tag: 'header', attr: 'aria-label', text: 'pollut.ai home', selector: 'header.global-nav' },
    { type: 'text', depth: 1, tag: 'a', text: 'pollut.ai', selector: 'header.global-nav > a' },
    { type: 'landmark', depth: 0, kind: 'main', label: '' },
    { type: 'landmark', depth: 1, kind: 'section', label: 'BECOME NO ONE.', selector: '#top' },
    { type: 'attr', depth: 2, tag: 'section', attr: 'data-smoggy-line', text: 'Ask me where you live. I’ll answer immediately.', selector: '#top' },
    { type: 'heading', depth: 2, level: 1, tag: 'h1', text: 'BECOME NO ONE.', pieces: ['BECOME', 'NO ONE.'], selector: '#top > h1' },
    { type: 'text', depth: 2, tag: 'p', text: 'Making you impossible to summarise.', pieces: ['Making you impossible', 'to summarise.'], selector: '#top > p' },
    // Cards rendered from recordData: three of them, the first twice (a flood copy).
    { type: 'text', depth: 2, tag: 'strong', text: 'Beloved beekeeper.', selector: '#record-field > div > strong' },
    { type: 'text', depth: 2, tag: 'p', text: 'Three hives. Very good with bees.', selector: '#record-field > div > p' },
    { type: 'text', depth: 2, tag: 'strong', text: 'Allergic to cats.', selector: '#record-field > div > strong' },
    { type: 'text', depth: 2, tag: 'strong', text: 'Beloved beekeeper.', selector: '#record-field > div > strong' },
    { type: 'text', depth: 2, tag: 'p', text: 'Reading 247 records about Alex Morgan…', selector: '#try' },
    { type: 'text', depth: 2, tag: 'span', text: 'b. 1988', selector: 'li > span.y' },
    { type: 'text', depth: 2, tag: 'p', text: 'Something the app made up at runtime', selector: '#x' },
  ],
  ...overrides,
});

test('placeCopy: DOM items traced to source; data shown whole where it first renders', () => {
  const dir = src({ 'index.html': HTML, 'app.js': APP, 'other.js': "export const unused = 'A sentence on another page entirely.';" });
  const map = extractCopy(dir);
  const placed = placeCopy(outline(), map);
  const U = placed.units;
  const find = (text) => placed.items.find((i) => i.text === text);
  assert.equal(placed.scope, 'page');
  assert.deepEqual(placed.files, ['app.js', 'index.html']);

  assert.equal(U[find('pollut.ai home').units[0]].attr, 'aria-label');
  assert.equal(U[find('Ask me where you live. I’ll answer immediately.').units[0]].attr, 'data-smoggy-line');
  // Pieces across a <br> and an <em>.
  assert.deepEqual(find('BECOME NO ONE.').units.map((id) => U[id].text), ['BECOME', 'NO ONE.']);
  assert.deepEqual(find('Making you impossible to summarise.').units.map((id) => U[id].text), ['Making you impossible', 'to summarise.']);
  // A template matched by its fixed words.
  assert.equal(U[find('Reading 247 records about Alex Morgan…').units[0]].kind, 'template');
  assert.equal(U[find('b. 1988').units[0]].kind, 'markup-text');
  assert.deepEqual(find('Something the app made up at runtime').units, []);

  // recordData: one pool, placed right after the first card; the other cards fold into it.
  const pools = placed.items.filter((i) => i.type === 'pool');
  assert.equal(pools.length, 1);
  const pool = pools[0];
  assert.equal(pool.owner, 'recordData');
  assert.equal(pool.units.length, 9);
  assert.equal(placed.items.indexOf(pool), placed.items.indexOf(find('Beloved beekeeper.')) + 1);
  assert.equal(pool.renders, 3);
  assert.ok(!placed.items.some((i) => i.text === 'Allergic to cats.'));

  // Elsewhere: this page's files only; data shown in the pool isn't repeated.
  const elsewhere = placed.elsewhere.flatMap((f) => f.groups.flatMap((g) => g.units.map((id) => U[id].text)));
  assert.ok(elsewhere.includes('Nobody, everywhere'), 'the canvas label');
  assert.ok(elsewhere.includes('Chief executive'), 'data never rendered');
  assert.ok(!elsewhere.includes('Beloved beekeeper.'));
  assert.ok(!elsewhere.includes('A sentence on another page entirely.'));
  assert.equal(placed.stats.pools, 1);

  const text = renderPlaced(placed);
  assert.match(text, /⟦recordData⟧ 9 strings from app\.js:5 · rendered 3×/);
  assert.match(text, /▸ Elsewhere in the code/);
});

test('placeCopy: without a usable script list, elsewhere covers the project', () => {
  const dir = src({ 'index.html': HTML, 'app.js': APP, 'other.js': "export const unused = 'A sentence on another page entirely.';" });
  const placed = placeCopy(outline({ resources: ['http://localhost:5173/assets/index-3f9a.js'] }), extractCopy(dir));
  assert.equal(placed.scope, 'project');
  assert.ok(placed.elsewhere.some((f) => f.file === 'other.js'));
});

test('pageFiles: maps served URLs (subfolders, Vite /@fs/) back to source files', () => {
  const map = { root: '/proj', files: ['index.html', 'src/main.tsx', 'explorations/x/app.js', 'explorations/x/index.html'] };
  assert.deepEqual([...pageFiles({ url: 'http://localhost:5173/', resources: ['http://localhost:5173/src/main.tsx?t=1', 'http://localhost:5173/@fs/proj/src/main.tsx'] }, map)].sort(), ['index.html', 'src/main.tsx']);
  assert.deepEqual([...pageFiles({ url: 'http://127.0.0.1:8000/explorations/x/', resources: ['http://127.0.0.1:8000/explorations/x/app.js'] }, map)].sort(), ['explorations/x/app.js', 'explorations/x/index.html']);
});

test('CLI: copy --src prints the outline; --json is the full map', () => {
  const dir = src({ 'index.html': HTML, 'app.js': APP });
  const r = cli(['copy', '--src', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^Copy under .*: \d+ pieces of copy/);
  assert.match(r.out, /\n {2}recordData {2}\(line 5\)\n/);
  assert.doesNotMatch(r.out, /"pointermove"/);
  assert.match(cli(['copy', '--src', dir, '--all']).out, /"pointermove" {3}\(an argument to addEventListener\(\)\)/);
  const json = JSON.parse(cli(['copy', '--src', dir, '--json']).out);
  assert.ok(json.units.every((u) => readFileSync(join(dir, u.file), 'utf8').slice(u.start, u.end) === u.raw));
  assert.equal(cli(['copy', '--src', join(dir, 'nope')]).code, 1);
});

test('review server: POST /__ag/copy-map joins the outline with --src; GET returns the source map', async () => {
  const { createReviewApp } = await import('../server/app.js');
  const dir = src({ 'index.html': HTML, 'app.js': APP });
  let app;
  const server = createServer((req, res) => app.handler(req, res));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  app = createReviewApp({ name: uniqueName('copy'), base, origins: ['http://localhost:5173'], src: dir });
  try {
    const post = await fetch(`${base}/__ag/copy-map`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, body: JSON.stringify(outline()) });
    assert.equal(post.status, 200);
    const placed = await post.json();
    assert.equal(placed.items.filter((i) => i.type === 'pool')[0].owner, 'recordData');
    const got = await (await fetch(`${base}/__ag/copy-map`)).json();
    assert.ok(got.units.some((u) => u.text === 'Beloved beekeeper.'));
    assert.equal((await fetch(`${base}/__ag/copy-map`, { method: 'POST', body: '{"items": 3}' })).status, 422);
    assert.equal((await fetch(`${base}/__ag/copy-map`, { method: 'POST', body: 'not json' })).status, 400);
    // Never leaks the source path into the loader the page runs.
    assert.ok(!app.loader.includes(dir));
  } finally {
    server.closeAllConnections(); await new Promise((r) => server.close(r));
  }
});
