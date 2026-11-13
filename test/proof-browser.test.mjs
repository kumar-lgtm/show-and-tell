import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, utimesSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

// The pollut.ai failure, end to end (2026-11-07): a static server with no live
// reload and unversioned scripts, a tab opened before the fix, and an agent that
// fixes the source and resolves. Before: the tab kept the old page, and a plain
// reload could still take the old script from the cache. Now: Check the fix says
// Reload and check, the reload re-fetches what changed, the card opens on the
// new page with the agent's screenshot, and a plan gets a Go ahead.
test('stale page, reload and check, the agent\'s screenshot, and a plan', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const playwright = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { chromium } = playwright;
  const { cleanup, uniqueName, tree } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  if (shots) mkdirSync(shots, { recursive: true });

  const src = tree({
    'index.html': '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><script src="/__review/loader.js"></script></head>'
      + '<body><main><h1 id="headline"></h1><p id="far">Footnote</p></main><script src="/app.js"></script></body></html>',
    'app.js': 'document.getElementById("headline").textContent = "Alex Morgan, designer";\n',
    'style.css': 'body{margin:0;font:16px system-ui}main{padding:40px}h1{font-size:40px}\n',
  });
  // Old files, as on a real project: Chrome then keeps them "fresh" for a while
  // by heuristic (10% of their age) and a plain reload need not ask again.
  const dayAgo = new Date(Date.now() - 86_400_000);
  for (const f of ['index.html', 'app.js', 'style.css']) utimesSync(join(src, f), dayAgo, dayAgo);

  let app;
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path.startsWith('/__review/')) return app.handler(req, res, path.slice(9));
    const file = join(src, path === '/' ? 'index.html' : path.slice(1));
    let st; try { st = statSync(file); } catch { res.writeHead(404); return res.end(); }
    // Like python -m http.server: Last-Modified, no Cache-Control.
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Last-Modified': st.mtime.toUTCString() });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`, name = uniqueName('proof-browser');
  app = createReviewApp({ name, base: '/__review', origins: [origin], src });
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(src); });

  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'BK'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__ && window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_FRESH__);
  assert.equal(await page.locator('#headline').innerText(), 'Alex Morgan, designer');
  const api = async (path, body) => (await fetch(`${origin}/__review/__ag/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })).json();
  const session = await api('sessions', { url: `${origin}/` });
  const note = await api(`sessions/${session.id}/annotations`, { id: crypto.randomUUID(), reviewer: 'BK', comment: 'Use the name I typed, not Alex Morgan.', element: 'h1', elementPath: '#headline', viewport: { name: 'desktop', width: 1280, height: 800 } });
  const idea = await api(`sessions/${session.id}/annotations`, { id: crypto.randomUUID(), reviewer: 'BK', comment: 'Make it feel procedurally generated.', element: 'p', elementPath: '#far' });

  // A plain reload now takes app.js from the cache: the setup is the real one.
  await page.reload(); await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__);
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').find((e) => e.name.endsWith('/app.js'))?.transferSize), 0, 'app.js came from the cache');

  // Send, the real button.
  await page.evaluate(async () => { await window.__AGENTATION_KIT_REVIEW__.refresh(); window.__AGENTATION_KIT_REVIEW__.open('done'); });
  await page.getByRole('button', { name: /^Send( \d+| to agent)$/ }).click();
  const project = openProject(name, { src });
  for (let i = 0; i < 40 && !project.round()?.ts; i++) await page.waitForTimeout(50);
  assert.ok(project.round()?.ts, 'the round was sent');
  await page.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open(null));

  // ---- the plan: Go ahead in one press ---------------------------------------
  // The notice shows with the bar open, as a reviewer has it mid-round.
  const bar = page.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first();
  if (!/expanded/.test(await bar.getAttribute('class'))) {
    await bar.click();
    await page.waitForFunction(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
  }
  await project.act('reply', idea.id, "Here's what I'll do: a different job, city and age on every platform, fresh on each load.", { plan: true });
  const notice = page.locator('[data-question-notice]');
  await notice.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await notice.innerText(), /The agent has a plan for your note/);
  await notice.getByRole('button', { name: /Answer/ }).click();
  const goAhead = page.getByRole('button', { name: 'Go ahead' });
  await goAhead.waitFor({ state: 'visible' });
  assert.equal(await page.getByText("The agent's plan").isVisible(), true);
  // Focus moves on the next frame, once the panel holds the slot.
  await page.waitForFunction(() => { let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return a?.textContent === 'Go ahead'; }, null, { timeout: 3000 });
  assert.equal(await page.getByRole('button', { name: 'Send changes' }).isDisabled(), true, 'Send changes waits for text');
  if (shots) await page.screenshot({ path: join(shots, 'plan-panel.png') });
  await goAhead.click();
  for (let i = 0; i < 40 && project.get(idea.id).replies.at(-1)?.from !== 'reviewer'; i++) await page.waitForTimeout(50);
  assert.equal(project.get(idea.id).replies.at(-1).message, 'Go ahead.');

  // An error page is not proof (Codex review P2): the note stays open.
  const lost = await api(`sessions/${(await api('sessions', { url: `${origin}/missing-page` })).id}/annotations`, { id: crypto.randomUUID(), reviewer: 'BK', comment: 'This page is gone', element: 'h1', elementPath: 'h1' });
  await assert.rejects(project.takeShot(lost.id, { kind: 'after' }), /answered HTTP 404/);
  assert.equal(project.get(lost.id).status, 'pending');

  // ---- the fix lands while the tab is open --------------------------------------
  await page.waitForTimeout(1100); // the resolution must be later than the Send
  writeFileSync(join(src, 'app.js'), 'document.getElementById("headline").textContent = "You, designer";\n');
  // The proof: a fresh load at the note's viewport, the target outlined.
  const shot = await project.takeShot(note.id, { kind: 'after' });
  assert.equal(shot.found, true, 'the target was found');
  assert.equal(shot.viewport.width, 1280);
  await project.act('resolve', note.id, 'The headline uses the typed name.', { shot });
  assert.equal(await page.locator('#headline').innerText(), 'Alex Morgan, designer', 'the open tab is the old page');

  // Check the fix carries the news: Reload and check, and no second strip.
  const checkStrip = page.locator('[data-check-ui] section.strip');
  const reloadCheck = checkStrip.getByRole('button', { name: 'Reload and check 1' });
  await reloadCheck.waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await page.locator('[data-fresh-ui] section.strip').isVisible(), false, 'one strip, not two');
  if (shots) await page.screenshot({ path: join(shots, 'reload-and-check.png') });
  await Promise.all([page.waitForEvent('load'), reloadCheck.click()]);
  await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__?.state === 'card', null, { timeout: 15000 });

  // After: the new page (the cached script was re-fetched), the card, the picture.
  assert.equal(await page.locator('#headline').innerText(), 'You, designer');
  const card = page.locator('[data-check-ui] section.card');
  assert.match(await card.innerText(), /The headline uses the typed name/);
  const img = card.locator('a.shot img');
  await img.waitFor({ state: 'visible' });
  await page.waitForFunction(() => { const i = document.querySelector('[data-check-ui]').shadowRoot.querySelector('a.shot img'); return i && i.complete && i.naturalWidth > 0; });
  assert.match(await card.innerText(), /After, as the agent saw it[\s\S]*A fresh load at 1280 × 800/);
  const shown = await img.boundingBox();
  assert.ok(shown.height >= 60, `the picture is big enough to read (${JSON.stringify(shown)})`);
  assert.equal(await card.locator('[data-check-stale]').count(), 0, 'the reloaded page is not stale');
  if (shots) await page.screenshot({ path: join(shots, 'check-card-with-shot.png') });
  await card.getByRole('button', { name: 'Looks right' }).click();
  await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__?.state !== 'card');

  // ---- nothing to check, a file changes: the page's own strip --------------------
  await page.waitForTimeout(1200);
  writeFileSync(join(src, 'style.css'), 'body{margin:0;font:16px system-ui}main{padding:40px}h1{font-size:48px;color:#0a6}\n');
  const fresh = page.locator('[data-fresh-ui] section.strip');
  await fresh.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await fresh.innerText(), /style\.css changed since this page loaded/);
  if (shots) await page.screenshot({ path: join(shots, 'fresh-strip.png') });

  // Typing a note: Reload says why it waits instead of losing the text.
  await page.evaluate(() => { const t = document.createElement('textarea'); t.value = 'half a note'; t.id = 'probe'; const h = document.querySelector('[data-fresh-ui]'); h.shadowRoot.append(t); });
  await fresh.getByRole('button', { name: 'Reload' }).click();
  await page.waitForTimeout(300);
  assert.match(await fresh.innerText(), /reloading loses it/);
  await page.evaluate(() => document.querySelector('[data-fresh-ui]').shadowRoot.getElementById('probe').remove());

  await Promise.all([page.waitForEvent('load'), fresh.getByRole('button', { name: 'Reload' }).click()]);
  await page.waitForFunction(() => window.__AGENTATION_KIT_FRESH__);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontSize), '48px', 'the new stylesheet is in');
  await page.waitForTimeout(5500); // a full poll
  assert.equal(await page.locator('[data-fresh-ui] section.strip').isVisible(), false, 'nothing stale after the reload');

  // ---- phone: the strip fits ------------------------------------------------------
  const phone = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  await phone.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'BK'));
  const p2 = await phone.newPage();
  p2.on('pageerror', (e) => errors.push(e.message));
  await p2.goto(origin);
  await p2.waitForFunction(() => window.__AGENTATION_KIT_FRESH__);
  await p2.waitForTimeout(2000); // past the 1s slack a load gets (freshness.js SLACK_MS)
  writeFileSync(join(src, 'app.js'), 'document.getElementById("headline").textContent = "You, again";\n');
  const f2 = p2.locator('[data-fresh-ui] section.strip');
  await f2.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await f2.innerText(), /app\.js changed/);
  const box = await f2.boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 360, `the strip fits a 360px phone (${JSON.stringify(box)})`);
  assert.ok((await f2.getByRole('button', { name: 'Reload' }).boundingBox()).height >= 44, 'a 44px target on touch');
  assert.equal(await p2.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways scroll');
  if (shots) await p2.screenshot({ path: join(shots, 'fresh-strip-phone.png') });

  assert.deepEqual(errors, []);
});
