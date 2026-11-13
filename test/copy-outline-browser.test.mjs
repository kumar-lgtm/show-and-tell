// Opt in: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/copy-outline-browser.test.mjs
// (Playwright from SHOW_AND_TELL_PLAYWRIGHT or node_modules.) The page-side half
// of copy edit mode: toolbar/copy-outline.js reads the page's structure and copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const PAGE = `<!doctype html><html><head>
<title>Nobody, Everywhere</title>
<meta name="description" content="Personal misinformation as a service.">
<style>.row{display:flex;gap:8px} .gone{display:none} .stack i{display:block}</style>
</head><body>
<header aria-label="Site"><nav class="row"><a href="/">pollut.ai</a><span>Hallucination as a service</span><a href="#go">Pollute me</a></nav></header>
<main>
  <section id="top" data-smoggy-line="Ask me where you live. I’ll answer immediately." class="hero wide">
    <h1>BECOME<br>NO ONE.</h1>
    <p>Making you <em>impossible</em> to summarise.</p>
    <p class="stack"><b>GET <i>LOST.</i><i aria-hidden="true">LOST.</i></b></p>
    <img src="data:," alt="Smoggy waving">
    <p aria-hidden="true">THEY WANT YOUR DATA.</p>
    <p class="gone">Only after you click.</p>
  </section>
  <section aria-labelledby="t2"><h2 id="t2">Pollute yourself.</h2>
    <form><label>Your name <input placeholder="Any name"></label><input type="submit" value="Generate me"></form>
  </section>
</main>
<div id="agentation-root"><p>Toolbar text, never listed.</p></div>
<script type="module" src="/outline.js"></script>
</body></html>`;

test('collectOutline: landmarks, headings, text by reading order, attribute copy, visibility', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 60000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const collector = readFileSync(new URL('../toolbar/copy-outline.js', import.meta.url), 'utf8');
  const server = createServer((req, res) => {
    if (req.url === '/outline.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(collector); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(PAGE);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); });

  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(origin);
    const out = await page.evaluate(async () => (await import('/outline.js')).collectOutline(document));
    const items = out.items;
    const at = (text) => items.find((i) => i.text === text);

    assert.equal(out.title, 'Nobody, Everywhere');
    assert.ok(out.resources.some((r) => r.endsWith('/outline.js')));
    assert.deepEqual(items.filter((i) => i.type === 'landmark').map((i) => `${i.depth}:${i.kind}:${i.label}`),
      ['0:head:Page title and sharing', '0:header:Site', '1:nav:', '0:main:BECOME NO ONE.', '1:section:BECOME NO ONE.', '1:section:Pollute yourself.', '2:form:']);
    assert.equal(at('Personal misinformation as a service.').attr, 'content');
    // A flex row is three pieces of copy, not one glued string.
    assert.ok(at('pollut.ai') && at('Hallucination as a service') && at('Pollute me'));
    assert.equal(at('BECOME NO ONE.').type, 'heading');
    assert.deepEqual(at('BECOME NO ONE.').pieces, ['BECOME', 'NO ONE.']);
    assert.equal(at('Making you impossible to summarise.').type, 'text');
    assert.ok(at('GET LOST. LOST.'), items.map((i) => i.text).join(' | '));
    assert.equal(at('Ask me where you live. I’ll answer immediately.').attr, 'data-smoggy-line');
    assert.ok(!items.some((i) => i.text === 'hero wide'));
    assert.equal(at('Smoggy waving').attr, 'alt');
    assert.equal(at('THEY WANT YOUR DATA.').visibility, 'decorative');
    assert.equal(at('Only after you click.').visibility, 'hidden');
    assert.equal(at('Any name').attr, 'placeholder');
    assert.equal(at('Generate me').attr, 'value');
    assert.ok(!items.some((i) => /Toolbar text/.test(i.text)));
    // Reading order.
    const order = ['pollut.ai', 'BECOME NO ONE.', 'Making you impossible to summarise.', 'Pollute yourself.', 'Any name'].map((x) => items.indexOf(at(x)));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    await page.close();
  }
});
