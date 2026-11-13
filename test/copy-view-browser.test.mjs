// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/copy-view-browser.test.mjs
// Copy edit mode end to end: the real toolbar opens the copy view; edits there
// become copy notes; `feedback apply` writes them at their exact spans.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const APP = `const recordData = [
  ['PROFILE', 'Beloved beekeeper.', 'Three hives. Very good with bees.'],
  ['FORUM', 'Allergic to cats.', 'Posting since 2011.'],
  ['WIKI', 'Never learned to drive.', 'Cites: a friend.'],
];
const field = document.querySelector('#records');
for (const [src, title, copy] of recordData.slice(0, 2)) {
  const li = document.createElement('li');
  li.append(Object.assign(document.createElement('strong'), { textContent: title }), Object.assign(document.createElement('p'), { textContent: copy }));
  field.append(li);
}
const count = 247;
document.querySelector('#status').textContent = \`Reading \${count} records about you…\`;
document.querySelector('#made').textContent = atob('TWFkZSB1cCBhdCBydW50aW1l'); // text no source string holds
const ctx = document.querySelector('canvas').getContext('2d');
ctx.fillText('Nobody, everywhere', 10, 20);
`;
const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nobody, Everywhere</title>
<meta name="description" content="Personal misinformation as a service.">
<script src="/__review/loader.js"></script>
</head><body>
<header><nav><a href="/">pollut.ai</a></nav></header>
<main>
  <section id="top" data-smoggy-line="Ask me where you live. I’ll answer immediately.">
    <h1>BECOME<br>NO ONE.</h1>
    <p>Making you impossible <em>to summarise.</em></p>
    <ul id="records"></ul>
    <p id="status"></p>
    <p id="made"></p>
    <canvas width="200" height="40"></canvas>
  </section>
  <section id="faq"><h2>Questions? Answers.</h2><p>Fish &amp; chips, every Friday.</p></section>
</main>
<script src="/app.js"></script>
</body></html>
`;

test('All text: Shift T opens it; edits reviewed and saved as copy notes, applied at their spans; phone layout holds', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { tree, cli, cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const dir = tree({ 'index.html': HTML, 'app.js': APP });
  const name = uniqueName('copyview');
  let app;
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path.startsWith('/__review/')) return app.handler(req, res, path.slice('/__review'.length));
    const file = path === '/' ? 'index.html' : path.slice(1);
    try {
      const body = readFileSync(join(dir, file));
      res.writeHead(200, { 'Content-Type': extname(file) === '.js' ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  app = createReviewApp({ name, base: '/__review', origins: [origin], src: dir });
  const browser = await chromium.launch();
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  if (shots) mkdirSync(shots, { recursive: true });
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(dir); });
  const errors = [];

  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await context.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'Ana'));
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_COPY__ && window.__AGENTATION_KIT_AGENTATION_SESSION__);
  // Shift T opens it from anywhere on the page (Edit text → All text does the same).
  await page.locator('h1').click();
  const [view] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('Shift+T')]);
  view.on('pageerror', (e) => errors.push(`view: ${e.message}`));
  await view.waitForFunction(() => window.__COPY_VIEW__?.ready);
  assert.equal(await view.evaluate(() => window.__COPY_VIEW__.error || null), null);
  assert.match(view.url(), /\/__review\/__ag\/copy\?id=/);

  // Structure: landmarks, headings, the data list where it renders, canvas copy elsewhere.
  const text = await view.locator('#doc').innerText();
  for (const s of ['Page title and sharing', 'Nobody, Everywhere', 'Navigation', 'BECOME', 'NO ONE.', 'Questions? Answers.', 'Fish & chips, every Friday.',
    'Ask me where you live. I’ll answer immediately.', 'recordData', 'Never learned to drive.', 'Elsewhere in the code', 'Nobody, everywhere',
    'Drawn on canvas', 'H1', 'Search description', 'Page title']) {
    assert.ok(text.includes(s), `view shows "${s}"`);
  }
  // recordData is a table where it renders: index, then each record's strings in a row.
  assert.match(text, /\[1\]\s+FORUM\s+Allergic to cats\.\s+Posting since 2011\./);
  assert.match(text, /Shown \d+ times on the page\s+app\.js:\d+\s+recordData/);
  assert.ok(text.indexOf('Making you impossible') < text.indexOf('recordData') && text.indexOf('recordData') < text.indexOf('Questions? Answers.'), 'the data list sits where it renders');
  assert.ok(text.indexOf('Questions? Answers.') < text.indexOf('Elsewhere in the code'));
  // The filter menu counts each view; strings judged to be code stay hidden until asked for, with the reason.
  assert.ok(!text.includes('Judged to be code'));
  await view.locator('#filter-btn').click();
  assert.match(await view.locator('#filter-menu').innerText(), /All text\s+\d+\s+Edited\s+0\s+On the page\s+\d+\s+Elsewhere in the code\s+1\s+Maybe text\s+\d+\s+Show strings judged to be code\s+\d+/);
  await view.locator('#show-code').check();
  await view.keyboard.press('Escape');
  assert.match(await view.locator('#doc').innerText(), /Judged to be code: an argument to querySelector\(\)/);
  await view.locator('#filter-btn').click(); await view.locator('#show-code').uncheck(); await view.keyboard.press('Escape');
  // The outline: the page's sections, then Elsewhere in the code by file.
  assert.match(await view.locator('#outline').innerText(), /On this page[\s\S]*Become no one[\s\S]*Elsewhere in the code[\s\S]*app\.js/);
  if (shots) await view.screenshot({ path: join(shots, 'copy-view-desktop.png'), fullPage: true });

  // Edit: a string in an array, a template (its ${count} stays), text the source doesn't have, and HTML with an entity.
  const fieldFor = (s) => view.locator('.field', { hasText: s }).first();
  const caretAtEnd = (loc) => loc.evaluate((el) => { el.focus(); const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await fieldFor('Never learned to drive.').fill('Never learned to parallel park.');
  const tpl = fieldFor('records about you');
  assert.equal(await tpl.locator('.tok').innerText(), 'count');
  await caretAtEnd(tpl);
  await view.keyboard.type(' Still going.');
  await fieldFor('Made up at runtime').fill('Invented at runtime');
  await fieldFor('Fish & chips').fill('Fish & peas, every Friday.');
  // Every place showing the same source string follows an edit.
  assert.match(await view.locator('#summary').innerText(), /4 edits in 3 files/);
  assert.ok(await view.locator('.item.changed, .row.changed').count() >= 4);
  // Breaking a locked part is caught before sending.
  await tpl.focus();
  await tpl.evaluate((el) => { el.querySelector('.tok').remove(); el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.match(await view.locator('.error-line:not([hidden])').first().innerText(), /Keep \$\{count\} as it is/);
  assert.match(await view.locator('#summary').innerText(), /3 edits in 3 files · 1 needs a fix/);
  // Escape undoes only what changed since the field got focus: the chip is back, the earlier edit stays.
  await view.keyboard.press('Escape');
  assert.equal(await tpl.evaluate((el) => el.textContent), 'Reading count records about you… Still going.');
  assert.match(await view.locator('#summary').innerText(), /^4 edits in 3 files$/);
  // The Edited filter and the outline's edited counts.
  await view.locator('#filter-btn').click(); await view.locator('[data-mode=edited]').click();
  assert.equal(await view.locator('#doc .item:visible').count(), 4);
  await view.locator('#filter-btn').click(); await view.locator('[data-mode=all]').click();
  assert.match(await view.locator('#outline').innerText(), /edited/);
  if (shots) await view.screenshot({ path: join(shots, 'copy-view-edited.png') });
  // Review: before and after by file, each with whether it can be placed.
  await view.locator('#review-open').click();
  await view.locator('#review:not([hidden])').waitFor();
  const review = await view.locator('#review-body').innerText();
  assert.equal(await view.locator('#title').innerText(), 'Review 4 edits');
  assert.equal(await view.locator('#crumb').innerText(), '3 files');
  assert.match(review, /app\.js\s+2 edits[\s\S]*recordData\[2\]\[1\] · line 4[\s\S]*−\s*Never learned to drive\.[\s\S]*\+\s*Never learned to parallel park\./);
  assert.match(review, /Can’t place: saves as a find-and-replace note[\s\S]*Made up at runtime/);
  if (shots) await view.screenshot({ path: join(shots, 'copy-view-review.png') });
  await view.locator('#save').click();
  await view.waitForFunction(() => /Saved 4 edits/.test(document.querySelector('#toast').textContent));
  assert.match(await view.locator('#summary').innerText(), /No edits yet · 4 waiting for the agent/);

  // In the page's inbox, the save is one row, with each edit inside it.
  await page.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open('inbox'));
  const batchRow = page.locator('article[data-batch]');
  await batchRow.waitFor();
  const batchText = await batchRow.innerText();
  assert.match(batchText, /All text · 3 edits/);
  assert.match(batchText, /app\.js:4[\s\S]*Never learned to drive\.[\s\S]*Never learned to parallel park\./);
  const project = openProject(name, { src: dir });
  const notes = project.items().filter((a) => a.status === 'pending');
  assert.equal(notes.filter((a) => a.kind === 'copy').length, 3);
  assert.equal(notes.filter((a) => a.kind === 'edit').length, 1);
  assert.ok(notes.every((a) => a.reviewer === 'Ana'));

  // Revising a sent change updates its note rather than adding one.
  await fieldFor('Never learned to parallel park.').fill('Never learned to reverse.');
  await view.locator('#save').click();
  await view.waitForFunction(() => /Saved 1 edit\b/.test(document.querySelector('#toast').textContent));
  assert.equal(openProject(name, { src: dir }).items().filter((a) => a.status === 'pending').length, 4);

  // Typing a saved string back to how it was withdraws its note.
  await fieldFor('Invented at runtime').fill('Made up at runtime');
  assert.match(await view.locator('#summary').innerText(), /1 edit in 1 file/);
  await view.locator('#save').click();
  await view.waitForFunction(() => /Saved 1 edit\b/.test(document.querySelector('#toast').textContent) && !/Saving/.test(document.querySelector('#save').textContent));
  const after = openProject(name, { src: dir }).items();
  assert.equal(after.filter((a) => a.status === 'pending').length, 3);
  assert.equal(after.filter((a) => a.kind === 'edit' && a.status === 'pending').length, 0); // withdrawn (dismissed, so no longer listed as open)

  // Apply: copy notes write at their spans; the untraced one is a find-and-replace and is reported.
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  const app2 = readFileSync(join(dir, 'app.js'), 'utf8');
  assert.match(app2, /\['WIKI', 'Never learned to reverse\.', 'Cites: a friend\.'\]/);
  assert.match(app2, /`Reading \$\{count\} records about you… Still going\.`/);
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /<p>Fish &amp; peas, every Friday\.<\/p>/);
  assert.match(r.out, /3 applied/);

  // Phone: one column, no sideways scroll, the send bar on screen.
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await phone.goto(view.url());
  await phone.waitForFunction(() => window.__COPY_VIEW__?.ready);
  const fit = await phone.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, bar: document.querySelector('#bar').getBoundingClientRect().bottom <= innerHeight + 1, toc: getComputedStyle(document.querySelector('#outline')).display, jump: getComputedStyle(document.querySelector('.section-pick')).display }));
  assert.ok(fit.sw <= fit.w, `no horizontal scroll (${fit.sw} > ${fit.w})`);
  assert.ok(fit.bar);
  assert.equal(fit.toc, 'none');
  assert.equal(fit.jump, 'block');
  // Tapping a string opens it on its own: what it is, where it lives, and arrows to the next one. Targets are 44px.
  const first = phone.locator('#doc .field', { hasText: 'Nobody, Everywhere' }).first();
  await first.tap();
  await phone.locator('#editor').waitFor({ state: 'visible' });
  assert.equal(await phone.locator('#editor-title').innerText(), 'Page title');
  assert.match(await phone.locator('.editor-where').innerText(), /index\.html:2/);
  await phone.locator('#next').tap();
  assert.equal(await phone.locator('#editor-title').innerText(), 'Meta description');
  await phone.keyboard.type(' Really.');
  assert.match(await phone.locator('.was').innerText(), /Was\s+Personal misinformation as a service\./);
  if (shots) await phone.screenshot({ path: join(shots, 'copy-view-phone-editor.png') });
  await phone.locator('#editor-done').tap();
  assert.match(await phone.locator('#summary').innerText(), /1 edit in 1 file/);
  const small = await phone.evaluate(() => [...document.querySelectorAll('button, select, input:not([type=checkbox]), label:has(> input[type=checkbox])')].filter((b) => b.offsetParent && b.getBoundingClientRect().height < 44).map((b) => b.id || b.textContent));
  assert.deepEqual(small, []);
  if (shots) await phone.screenshot({ path: join(shots, 'copy-view-phone.png'), fullPage: false });
  assert.deepEqual(errors, []);
});
