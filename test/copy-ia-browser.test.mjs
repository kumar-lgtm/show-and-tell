// Opt in: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/copy-ia-browser.test.mjs
// All text shows the page's shape: landmarks and headings nest into parts, text
// after a closed section goes back to the part above it, an icon beside words
// does not hide them, and a repeated button shows in each part it sits in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('All text files every string under the part of the page it belongs to', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 60000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  let app;
  const html = readFileSync(new URL('../example/fieldnote.html', import.meta.url), 'utf8')
    .replace('</head>', '<script src="/__review/loader.js"></script></head>');
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  app = createReviewApp({ name: uniqueName('ia'), base: '/__review', origins: [origin], src: fileURLToPath(new URL('../example', import.meta.url)) });
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_COPY__);
  const [view] = await Promise.all([ctx.waitForEvent('page'), page.evaluate(() => { window.__AGENTATION_KIT_COPY__.open(); })]);
  view.on('pageerror', (e) => errors.push(e.message));
  await view.waitForFunction(() => window.__COPY_VIEW__?.ready);

  // The outline is the page's hierarchy: landmarks, then its headings nested by level.
  const outline = await view.evaluate(() => [...document.querySelectorAll('#outline a')].filter((a) => a.dataset.place === 'page')
    .map((a) => `${a.className.replace(/\s*on\b/, '').trim()}|${a.querySelector('.t').textContent}|${a.querySelector('.lv')?.textContent || ''}`));
  assert.deepEqual(outline, [
    'top-level|Page title and sharing|',
    'top-level|Top of the page|',
    'top-level|Navigation|',
    'top-level|Main|',
    'd1|Pricing that scales with your team|H1',
    'd2|Starter|H2',
    'd2|Team|H2',
    'd2|A few things you might be wondering|H2',
    'top-level|Footer|',
  ]);

  // Each part holds what a reader finds there, in reading order, with its role beside it.
  const parts = await view.evaluate(() => {
    const out = {};
    for (const sec of document.querySelectorAll('#doc > .sec[data-place=page]')) {
      const title = sec.querySelector('.sec-hd h2').textContent;
      const rows = [...sec.querySelectorAll(':scope > .sec-body > .item')].map((it) => `${it.querySelector('.rail .role').textContent}: ${it.querySelector('.main').innerText.replace(/\s+/g, ' ').trim()}`);
      (out[title] ||= []).push(...rows);
    }
    return out;
  });
  assert.deepEqual(parts['Top of the page'], ['Link: Fieldnote'], 'the brand link is the top of the page, not part of the page title');
  assert.deepEqual(parts.Starter.slice(0, 4), ['H2: Starter', 'Body: For small teams finding their rhythm.', 'Text: per seat per month', 'Button: Start free trial']);
  assert.ok(parts.Starter.includes('List item: Email support'), 'text beside an icon is kept');
  assert.ok(parts.Team.includes('Button: Start free trial'), 'the same button in the next card shows in that card');
  assert.ok(!parts.Team.some((r) => /14 days free|Can I change plans/.test(r)), 'text after the section is not filed under it');
  assert.ok(parts['Pricing that scales with your team'].some((r) => /^Body: 14 days free/.test(r)), 'it goes back to the part above');
  assert.deepEqual(parts['A few things you might be wondering'].slice(0, 3), ['H2: A few things you might be wondering.', 'Term: Can I change plans later?', 'Definition: Absolutely. Upgrade or switch plans from your workspace settings whenever you need to.']);

  // The two buttons are two places in the source: the nth on the page is the nth in the file.
  const lines = await view.evaluate(() => [...document.querySelectorAll('#doc .item.t-button')].map((it) => it.querySelector('.gutter .mono').textContent));
  assert.equal(lines.length, 2);
  assert.notEqual(lines[0], lines[1], `each button names its own line (${lines.join(', ')})`);

  // Text nobody sees on the page is marked, and says so.
  const unseen = await view.locator('#doc .item.unseen .rail .role').first().getAttribute('title');
  assert.match(unseen, /Not shown on the page/);
  // A part's path says where it sits.
  assert.equal(await view.locator('#doc .sec', { has: view.locator('.sec-hd h2', { hasText: /^Team$/ }) }).locator('.path').innerText().then((s) => s.replace(/\s+/g, ' ')), 'Main › Pricing that scales with your team');
  assert.match(await view.locator('#crumb').innerText(), /^Fieldnote pricing/);
  assert.deepEqual(errors, []);
});
