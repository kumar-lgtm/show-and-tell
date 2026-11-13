// Opt in after build: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/host-widget-browser.test.mjs
// A host page's own fixed corner widget (Ghost's Portal button, a chat bubble)
// must not cover the toolbar's controls. Found on a Ghost site: Portal's
// iframe (z-index ~4M) sat over the right end of the bar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

test('the toolbar lifts clear of a host page corner widget, and stays where the reviewer puts it', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const base = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8');
  // Mounted late, like Ghost Portal, and above everything.
  const widget = `<script>setTimeout(()=>{const w=document.createElement('div');w.id='host-widget';w.style.cssText='position:fixed;right:0;bottom:0;width:105px;height:98px;z-index:3999998;background:#fc0';document.body.append(w)},800)</script>`;
  // A full-screen overlay is a modal, not a widget: the bar must not jump for it.
  const modal = `<script>setTimeout(()=>{const m=document.createElement('div');m.id='host-modal';m.style.cssText='position:fixed;inset:0;z-index:3999999;background:rgba(0,0,0,.1)';document.body.append(m)},800)</script>`;
  const beside = widget.replace('right:0;', 'right:100px;');
  const pages = { '/widget': widget, '/modal': modal, '/beside': beside };
  let app;
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice(9));
    const extra = pages[new URL(req.url, 'http://x').pathname] ?? '';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(base.replace('</head>', '<script src="/__review/loader.js"></script></head>').replace('</body>', `${extra}</body>`));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`, name = uniqueName('host-widget');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { voice: true }, voiceTranscriber: null, voiceBudget: null });
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });

  const bar = (p) => p.evaluate(() => { const r = document.querySelector('[data-agentation-toolbar]').getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, height: r.height }; });
  // Every sampled point along the bar must hit the bar itself.
  const covered = (p) => p.evaluate(() => {
    const bar = document.querySelector('[data-agentation-toolbar]'), r = bar.getBoundingClientRect(), out = [];
    for (let x = r.left + 6; x < r.right; x += 16) { const h = document.elementFromPoint(x, r.top + r.height / 2); if (h && !bar.contains(h) && h !== document.documentElement && h !== document.body) out.push(h.id || h.tagName); }
    return out;
  });

  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${origin}/widget`, { waitUntil: 'load' });
    await p.waitForSelector('[data-agentation-toolbar]');
    await p.waitForSelector('#host-widget', { state: 'attached' });
    await p.waitForFunction(() => { const b = document.querySelector('[data-agentation-toolbar]').getBoundingClientRect(), w = document.getElementById('host-widget').getBoundingClientRect(); return b.bottom <= w.top; }, null, { timeout: 10000 });
    assert.deepEqual(await covered(p), [], `${vp.width}px: nothing covers the bar after the widget mounts`);
    const w = await p.locator('#host-widget').boundingBox(), b = await bar(p);
    assert.ok(w.y - b.bottom <= 24, `${vp.width}px: lifted just clear (gap ${w.y - b.bottom}px), not thrown across the page`);

    await ctx.close();
  }

  const shell = (p) => p.evaluate(() => { const r = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
  const fresh = async (path, wait = 4500) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(origin + path, { waitUntil: 'load' }); await p.waitForSelector('[data-agentation-toolbar]'); if (wait) await p.waitForTimeout(wait);
    return { ctx, p };
  };

  {
    const { ctx, p } = await fresh('/', 1000); const plain = await bar(p); await ctx.close();
    const m = await fresh('/modal'); assert.equal((await bar(m.p)).top, plain.top, 'a full-screen overlay does not move the bar'); await m.ctx.close();
    // Only the visible button counts: a widget under the transparent wrapper beside it moves nothing.
    const b = await fresh('/beside'); assert.equal((await bar(b.p)).top, plain.top, 'a widget beside the collapsed button does not lift it'); await b.ctx.close();
  }

  {
    // An open panel is placed against the bar, so the bar must not move under it; it lifts once the panel closes.
    const { ctx, p } = await fresh('/widget', 0);
    await p.evaluate(() => window.__AGENTATION_KIT_VOICE__.open());
    await p.waitForSelector('#host-widget', { state: 'attached' }); await p.waitForTimeout(4500);
    const during = await shell(p), w = await p.locator('#host-widget').boundingBox();
    assert.ok(during.bottom > w.y, 'with the voice panel open the bar stays where the panel was placed');
    // The panel renders in an open shadow root; role locators reach into it.
    await p.getByRole('button', { name: 'Close voice panel', exact: true }).click();
    await p.waitForFunction((top) => document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect().bottom <= top, w.y, { timeout: 5000 });
    await ctx.close();
  }

  {
    // Dragging the collapsed button is hand placement too: a later check must not undo it.
    const { ctx, p } = await fresh('/widget', 2500);
    const c = await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().boundingBox();
    await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await p.mouse.down();
    await p.mouse.move(c.x - 400, c.y + c.height / 2 + 40, { steps: 12 }); await p.mouse.up();
    const placed = await bar(p);
    await p.setViewportSize({ width: 1430, height: 900 }); await p.waitForTimeout(6000);
    const after = await bar(p);
    assert.ok(Math.abs(after.top - placed.top) < 4, 'a dragged collapsed bar is not moved again (' + placed.top + ' → ' + after.top + ')');
    await ctx.close();
  }

  // Hand placement wins in this browser: drag the grip, reload, and it stays.
  for (const vp of [{ width: 1440, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${origin}/widget`, { waitUntil: 'load' });
    await p.waitForSelector('[data-agentation-toolbar]'); await p.waitForSelector('#host-widget', { state: 'attached' }); await p.waitForTimeout(2000);
    // The collapsed button is what a corner widget covers; it must be clickable.
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.waitForSelector('[data-review=grip]', { state: 'visible' });
    await p.waitForTimeout(700); // the shell animates open
    // Hand placement wins: drag the grip somewhere else, reload, and it stays.
    const grip = p.locator('[data-review=grip]');
    const g = await grip.boundingBox();
    await p.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await p.mouse.down();
    await p.mouse.move(g.x - 120, 200, { steps: 10 }); await p.mouse.up();
    const placed = await bar(p);
    assert.ok(placed.top < 260, `${vp.width}px: dragged up (top ${placed.top})`);
    await p.reload({ waitUntil: 'load' }); await p.waitForSelector('[data-agentation-toolbar]'); await p.waitForTimeout(4500);
    const again = await bar(p);
    assert.ok(Math.abs(again.top - placed.top) < 4, `${vp.width}px: a hand-placed bar is never moved (${placed.top} → ${again.top})`);
    await ctx.close();
    const other = await fresh('/widget');
    const ow = await other.p.locator('#host-widget').boundingBox();
    assert.ok((await shell(other.p)).bottom <= ow.y, 'another reviewer still gets a bar lifted clear of the widget');
    await other.ctx.close();
  }
});
