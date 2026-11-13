// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/resize-browser.test.mjs
// A page narrowed while it runs (a browser's device mode) keeps the bar on
// screen. The collapsed bar's wrapper keeps the open bar's width with the 44px
// button at its right end, and clamping the wrapper left that button past the
// right edge of a 390px screen, out of reach. A bar nobody dragged stays in
// the bottom-right corner as the width changes, open or collapsed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

test('the bar stays reachable, in its corner, when the page is narrowed live', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  let app;
  const html = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8')
    .replace('</head>', '<script src="/__review/loader.js"></script></head>');
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  app = createReviewApp({ name: uniqueName('resize'), base: '/__review', origins: [origin], config: { critique: true, voice: true } });
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });
  const errors = [];
  const shell = (page) => page.evaluate(() => {
    const c = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]');
    const r = c.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), r.top + r.height / 2);
    return { left: r.left, right: r.right, open: /expanded/.test(c.className), width: innerWidth, hit: !!hit?.closest('[data-agentation-toolbar]') };
  });
  const settle = (page) => page.waitForTimeout(900);

  for (const open of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    if (open) { await page.click('[data-agentation-toolbar] [class*="toolbarContainer"]'); await settle(page); }
    const cdp = await context.newCDPSession(page);
    for (const width of [390, 360, 320]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 780, deviceScaleFactor: 2, mobile: true });
      await settle(page);
      const s = await shell(page);
      const label = `${open ? 'open' : 'collapsed'} at ${width}`;
      assert.equal(s.open, open, `${label}: state kept`);
      assert.ok(s.left >= 12 && s.right <= width - 12, `${label}: on screen (${Math.round(s.left)}–${Math.round(s.right)})`);
      assert.ok(Math.abs(s.right - (width - 20)) <= 2, `${label}: in the right corner (right edge ${Math.round(s.right)})`);
      assert.ok(s.hit, `${label}: the bar takes the tap`);
    }
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await settle(page);
    const back = await shell(page);
    assert.ok(Math.abs(back.right - 1420) <= 2, `${open ? 'open' : 'collapsed'}: back in the corner at 1440 (right edge ${Math.round(back.right)})`);
    if (!open) {
      // The collapsed button still opens the bar after the round trip.
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 2, mobile: true });
      await settle(page);
      const s = await shell(page);
      await page.mouse.click((s.left + s.right) / 2, 780 - 42);
      await settle(page);
      assert.equal((await shell(page)).open, true, 'the collapsed button opens the bar at 390');
    }
    await context.close();
  }

  // Narrowed while the bar is still collapsing: once the animation settles,
  // the button is back in the corner, not half past the right edge.
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    await page.click('[data-agentation-toolbar] [class*="toolbarContainer"]'); await settle(page);
    const cdp = await context.newCDPSession(page);
    await page.getByRole('button', { name: 'Exit', exact: true }).click();
    await page.waitForTimeout(40);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await page.waitForTimeout(1500);
    const s = await shell(page);
    assert.equal(s.open, false, 'collapsed');
    assert.ok(Math.abs(s.right - 370) <= 2 && s.left >= 12, `collapsed mid-resize: back in the corner (${Math.round(s.left)}–${Math.round(s.right)})`);
    await context.close();
  }

  // A bar the reviewer dragged keeps its place, clamped on screen.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => { localStorage.setItem('feedback-toolbar-placed', '1'); localStorage.setItem('feedback-toolbar-position', JSON.stringify({ x: 400, y: 300 })); });
  const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok);
  await settle(page);
  const before = await shell(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 2, mobile: true });
  await settle(page);
  const s = await shell(page);
  assert.ok(s.left >= 12 && s.right <= 378, `dragged bar on screen at 390 (${Math.round(s.left)}–${Math.round(s.right)})`);
  assert.ok(s.hit, 'dragged bar takes the tap at 390');
  assert.ok(Math.abs(before.right - 1420) > 40, 'the dragged bar was not in the corner to begin with');
  await context.close();
  assert.deepEqual(errors, []);
});
