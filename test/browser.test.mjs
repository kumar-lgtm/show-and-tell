// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/browser.test.mjs
// Install Playwright locally, or set SHOW_AND_TELL_PLAYWRIGHT to its module path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('real toolbar: saves, ownership, panel slots, connection failures and touch sizing', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  let app;
  const html = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8')
    .replace('</head>', '<script src="/__review/loader.js"></script></head>');
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const name = uniqueName('browser');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true } });
  const browser = await chromium.launch();
  const project = openProject(name);
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  if (shots) mkdirSync(shots, { recursive: true });
  t.after(async () => {
    await browser.close(); server.closeAllConnections();
    await new Promise((r) => server.close(r)); cleanup();
  });
  const errors = [];
  const api = async (path, body) => {
    const r = await fetch(`${origin}/__review/__ag/${path}`, {
      method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    assert.ok(r.ok, `${path}: ${r.status}`); return r.json();
  };
  const session = await api('sessions', { url: `${origin}/` });
  const note = (comment, reviewer) => api(`sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), comment, reviewer, element: 'p', elementPath: 'main > p', x: 30, y: 200, timestamp: Date.now(),
  });
  const newPage = async (options = {}, reviewer = '') => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    if (reviewer) await context.addInitScript((name) => localStorage.setItem('feedback-toolbar-reviewer', name), reviewer);
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__);
    await page.waitForFunction(() => window.__AGENTATION_KIT_HEALTH__?.ok);
    return page;
  };
  const expand = async (p) => {
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=inbox]').waitFor({ state: 'visible' });
  };
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  const rows = (p) => p.locator('section.panel .row').filter({ has: p.locator('.copy') });

  await t.test('bridge adds no junk storage keys and idle edit mode leaves host markup alone', async () => {
    const p = await newPage();
    assert.equal(await p.locator('main [data-sk-edit]').count(), 0);
    assert.deepEqual(await p.evaluate(() => Object.keys(localStorage).filter((k) => ['setItem', 'removeItem'].includes(k))), []);
    await p.evaluate(() => { sessionStorage.setItem('agentation-test', 'private'); localStorage.setItem('host-app-key', 'untouched'); });
    assert.equal(await p.evaluate(() => sessionStorage.getItem('agentation-test')), 'private');
    await p.context().close();
  });

  await t.test('a new note reaches the server while the name prompt is open, then gains its author', async () => {
    const p = await newPage(); await expand(p);
    await p.locator('h1').click();
    await p.getByPlaceholder('What should change?', { exact: true }).fill('Saved before giving my name');
    await p.getByRole('button', { name: 'Add', exact: true }).click();
    await p.getByRole('dialog').filter({ has: p.getByText('Who is reviewing?', { exact: true }) }).waitFor();
    await p.waitForFunction(async () => {
      const r = await fetch('/__review/__ag/sessions'); const d = await r.json();
      return d.sessions.some((s) => s.annotations.some((a) => a.comment === 'Saved before giving my name'));
    });
    const a = project.items().find((a) => a.comment === 'Saved before giving my name');
    assert.ok(a); assert.equal(a.reviewer, undefined);
    await p.getByRole('textbox', { name: 'Your name', exact: true }).fill('Ana');
    await p.getByRole('button', { name: 'Save', exact: true }).click();
    await p.waitForFunction(async (id) => {
      const r = await fetch('/__review/__ag/sessions'); const d = await r.json();
      return d.sessions.some((s) => s.annotations.some((a) => a.id === id && a.reviewer === 'Ana'));
    }, a.id);
    assert.equal(project.get(a.id).reviewer, 'Ana');
    await p.context().close();
  });

  await t.test('Mine and Clear only affect the signed reviewer; dismissed history stays', async () => {
    const ana = await note('Ana owns this', 'Ana');
    const ben = await note('Ben owns this', 'Ben');
    const unsigned = await note('Unsigned belongs to another browser');
    const p = await newPage({}, 'Ana'); await expand(p);
    await p.locator('[data-review=inbox]').click();
    await p.getByRole('button', { name: 'Mine', exact: true }).click();
    await p.getByText('Ana owns this', { exact: true }).waitFor();
    assert.equal(await p.getByText('Ben owns this', { exact: true }).count(), 0);
    assert.equal(await p.getByText('Unsigned belongs to another browser', { exact: true }).count(), 0);
    await p.getByRole('button', { name: 'Everyone', exact: true }).click();
    for (const copy of ['Ben owns this', 'Unsigned belongs to another browser']) {
      const row = rows(p).filter({ has: p.getByText(copy, { exact: true }) });
      // Someone else's note: neither Delete (unsent) nor Withdraw (sent) is offered.
      assert.equal(await row.getByRole('button', { name: /^(Delete|Withdraw|Reject)$/ }).count(), 0);
    }
    await shot(p, 'inbox-ownership-desktop');
    await p.keyboard.press('Escape');
    // Clear lives in More now; the component's own button stays mounted, hidden.
    const clear = async () => { await p.locator('[data-review=more]').click(); await p.getByRole('menuitem', { name: /^(Clear my|Press again to clear)/ }).click(); };
    await clear(); await p.getByText(/Clear your .*notes? on this page\?/).waitFor();
    assert.equal(project.get(ana.id).status, 'pending');
    await clear();
    await p.waitForFunction(async (id) => {
      const d = await (await fetch('/__review/__ag/sessions')).json();
      return d.sessions.some((s) => s.annotations.some((a) => a.id === id && a.status === 'dismissed'));
    }, ana.id);
    assert.equal(project.get(ana.id).status, 'dismissed');
    assert.equal(project.get(ben.id).status, 'pending');
    assert.equal(project.get(unsigned.id).status, 'pending');
    await p.context().close();
  });

  await t.test('an incoming question waits behind Send and remains answerable afterward', async () => {
    const a = await note('A question for Ana', 'Ana');
    const p = await newPage({}, 'Ana'); await expand(p);
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open('done'));
    await project.act('reply', a.id, 'Should this be shorter?');
    await p.waitForFunction(() => document.querySelector('[data-review=inbox]')?.textContent.includes('1'));
    assert.equal(await p.getByText('Should this be shorter?', { exact: true }).isVisible(), false);
    await shot(p, 'send-with-waiting-question-desktop');
    // The question never opens by itself: closing the panel brings back the
    // one-line notice, and the reviewer opens the question from it.
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open(null));
    await p.locator('[data-question-notice]').getByRole('button', { name: "Answer the agent's question" }).click();
    await p.getByText('Should this be shorter?', { exact: true }).waitFor({ state: 'visible' });
    await p.getByPlaceholder('Answer so the agent can carry on', { exact: true }).fill('Yes, shorter');
    await p.getByRole('button', { name: 'Send answer', exact: true }).click();
    await p.waitForFunction(async (id) => {
      const d = await (await fetch('/__review/__ag/sessions')).json();
      return d.sessions.some((s) => s.annotations.some((a) => a.id === id && a.replies.at(-1)?.message === 'Yes, shorter'));
    }, a.id);
    await p.context().close();
  });

  await t.test('a refused save keeps the typed answer and reports the reason; offline is visible collapsed', async () => {
    const a = await note('Failed save question', 'Ana');
    await project.act('reply', a.id, 'Which plan?');
    const p = await newPage({}, 'Ana'); await expand(p);
    // Opened from the notice: a question no longer opens the panel by itself.
    await p.locator('[data-question-notice]').getByRole('button', { name: "Answer the agent's question" }).click();
    await p.getByText('Which plan?', { exact: true }).waitFor({ state: 'visible' });
    await p.route('**/annotations/*/reply', (route) => route.fulfill({ status: 413, contentType: 'application/json', body: '{"error":"too long"}' }));
    const field = p.getByPlaceholder('Answer so the agent can carry on', { exact: true });
    await field.fill('Keep this answer');
    await p.getByRole('button', { name: 'Send answer', exact: true }).click();
    await p.getByText(/Too long to send/).waitFor();
    assert.equal(await field.inputValue(), 'Keep this answer');
    await p.context().close();
    const offline = await newPage({}, 'Ana');
    await offline.route('**/__review/__ag/health', (route) => route.fulfill({ status: 403, contentType: 'application/json', body: '{"error":"origin refused"}' }));
    await offline.evaluate(() => window.__AGENTATION_KIT_CONNECTION__.check());
    await offline.getByRole('button', { name: /Show details/ }).waitFor({ state: 'visible' });
    assert.equal(await offline.evaluate(() => window.__AGENTATION_KIT_HEALTH__.ok), false);
    await shot(offline, 'offline-collapsed-desktop');
    await offline.unroute('**/__review/__ag/health');
    await offline.evaluate(() => window.__AGENTATION_KIT_CONNECTION__.check());
    assert.equal(await offline.evaluate(() => window.__AGENTATION_KIT_HEALTH__.ok), true);
    await offline.context().close();
  });

  await t.test('touch controls fit at 320, 360, 390 and 820; More occupies the phone panel slot', async () => {
    for (const width of [320, 360, 390, 820]) {
      const p = await newPage({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true }, 'Ana');
      await expand(p);
      const measure = () => p.evaluate(() => {
        const bar = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect();
        return [...document.querySelectorAll('[data-agentation-toolbar] [class*="controlsContent"] button')]
          .filter((b) => b.offsetParent && b.getBoundingClientRect().width > 0 && b.dataset.review !== 'grip')
          .flatMap((b) => { const r = b.getBoundingClientRect(); return r.width < 43.5 || r.height < 43.5 || r.left < bar.left - 1 || r.right > bar.right + 1 || r.top < bar.top - 1 || r.bottom > bar.bottom + 1 ? [{ label: b.getAttribute('aria-label'), width: r.width, height: r.height }] : []; });
      });
      // Allow the toolbar's width transition to reach its final geometry.
      await p.waitForTimeout(450);
      assert.deepEqual(await measure(), [], `${width} closed`);
      await p.locator('[data-review=inbox]').click();
      await p.locator('[data-review=more]').click();
      await p.waitForTimeout(450);
      assert.deepEqual(await measure(), [], `${width} More`);
      if (width <= 640) assert.equal(await p.locator('section.panel:visible').count(), 0);
      await shot(p, `more-${width}`);
      await p.context().close();
    }
  });
  await t.test('the bar: one styled tooltip, hidden controls inert, Send keeps its width, recounts at once, closes when sent', async () => {
    const p = await newPage({}, 'Cy');
    const inert = () => p.evaluate(() => [document.querySelector('[data-agentation-toolbar] [class*="controlsContent"]').inert, document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"]').inert]);
    // Collapsed: the bar's controls and the closed Settings panel take no focus.
    assert.deepEqual(await inert(), [true, true]);
    const stops = [];
    for (let i = 0; i < 10; i++) { await p.keyboard.press('Tab'); stops.push(await p.evaluate(() => document.activeElement.getAttribute('aria-label') || '')); }
    assert.ok(!stops.includes('Move toolbar') && !stops.includes('Agentation documentation'), stops.join(' | '));
    await expand(p); await p.waitForTimeout(400);
    assert.deepEqual(await inert(), [false, true], 'open: the controls take focus, closed Settings still does not');
    // One tooltip system: no native titles on the bar, a styled tip with the key.
    assert.equal(await p.locator('.sk-review-controls button[title]').count(), 0);
    assert.equal(await p.locator('.sk-review-controls button:not([aria-label])').count(), 0);
    const tip = p.locator('[data-bar-tip]');
    await p.locator('[data-mode=comment]').hover();
    await tip.waitFor({ state: 'visible' });
    assert.equal(await tip.textContent(), 'CommentN');
    assert.equal(await tip.locator('.k').textContent(), 'N');
    const [tr, br] = [await tip.boundingBox(), await p.locator('[data-mode=comment]').boundingBox()];
    assert.ok(tr.y + tr.height <= br.y && Math.abs(tr.x + tr.width / 2 - (br.x + br.width / 2)) < 1, 'centred above its button');
    await p.locator('[data-review=inbox]').hover();
    await p.waitForFunction(() => document.querySelector('[data-review=inbox]') && [...document.querySelectorAll('.sk-edit-ui')].some((h) => h.shadowRoot?.querySelector('[data-bar-tip]:not([hidden])')?.textContent.startsWith('Inbox')));
    await shot(p, 'bar-tooltip-desktop');
    await p.mouse.move(5, 5); await tip.waitFor({ state: 'hidden' });
    // A new note counts at once, and the bar keeps its width.
    const send = p.locator('[data-review=done]');
    const shellWidth = () => p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').evaluate((n) => n.getBoundingClientRect().width);
    const widths = () => p.evaluate(() => [...document.querySelectorAll('.sk-review-controls button')].filter((b) => b.offsetParent).map((b) => b.dataset.review + ':' + b.getBoundingClientRect().width.toFixed(1) + ':' + b.textContent).join(' '));
    const count = async () => Number((await send.textContent()).match(/Send (\d+)/)?.[1] || 0);
    const n0 = await count(), w0 = await shellWidth();
    await p.locator('main p').first().click();
    await p.getByPlaceholder('What should change?', { exact: true }).fill('Counted at once');
    await p.getByRole('button', { name: 'Add', exact: true }).click();
    await p.waitForFunction((n) => document.querySelector('[data-review=done]').textContent.includes(`Send ${n + 1}`), n0, { timeout: 600 });
    await p.waitForTimeout(300);
    if (n0 > 0 && n0 < 9) assert.equal(await shellWidth(), w0, 'Send N to Send N+1 keeps the bar width');
    const wReady = await shellWidth(); const dbg = await widths();
    // Sending closes the sheet; the bar says Sent at the same width.
    await send.click();
    const sheet = p.locator('section.panel[aria-label="Review tools"]');
    await sheet.getByRole('button', { name: /^Send \d+$/ }).click();
    await p.waitForFunction(() => document.querySelector('[data-review=done]').dataset.state === 'sent');
    await sheet.waitFor({ state: 'hidden' });
    await p.waitForTimeout(300);
    assert.equal(await shellWidth(), wReady, 'Sent is as wide as Send N ' + dbg + ' / ' + await widths());
    // Reopened with nothing new: what the agent has, no primary Send (UX review 5, #8).
    await send.click();
    await sheet.getByText(/^The agent has \d+ notes?\. Nothing new to send\.$/).waitFor();
    assert.equal(await sheet.locator('.actions button.primary', { hasText: 'Send' }).count(), 0);
    assert.equal(await sheet.getByRole('button', { name: 'Keep reviewing', exact: true }).getAttribute('class'), 'primary');
    assert.equal(await sheet.getByRole('button', { name: 'Send again', exact: true }).count(), 1);
    await shot(p, 'send-reopened-desktop');
    await p.context().close();
  });

  await t.test('one new note counts once, before and after its server copy arrives; the Send sheet leads with Send N', async () => {
    const until = async (fn, what) => { for (let i = 0; i < 100; i++) { if (await fn()) return; await new Promise((r) => setTimeout(r, 50)); } assert.fail(what); };
    const p = await newPage({}, 'Eve'); await expand(p);
    const send = p.locator('[data-review=done]');
    const count = async () => Number((await send.textContent()).match(/Send (\d+)/)?.[1] || 0);
    const panel = p.locator('section.panel[aria-label="Review tools"]');
    const copies = () => panel.locator('.row .copy', { hasText: 'Counted exactly once' }).count();
    const n0 = await count();
    // Hold the POST, so the optimistic copy is all there is at first.
    let release; const gate = new Promise((r) => { release = r; });
    await p.route('**/annotations', async (route) => { if (route.request().method() === 'POST') await gate; await route.continue(); });
    await p.locator('main p').first().click();
    await p.getByPlaceholder('What should change?', { exact: true }).fill('Counted exactly once');
    await p.getByRole('button', { name: 'Add', exact: true }).click();
    await p.waitForFunction((n) => document.querySelector('[data-review=done]').textContent.includes(`Send ${n + 1}`), n0, { timeout: 1000 });
    await p.locator('[data-review=inbox]').click();
    await panel.locator('.row .copy', { hasText: 'Counted exactly once' }).first().waitFor();
    assert.equal(await copies(), 1, 'the optimistic copy is one inbox row');
    // The server copy has a new id ("ann_…") and the component's id as clientId.
    release();
    await until(() => project.items().some((a) => a.comment === 'Counted exactly once'), 'the note reached the server');
    // Past one 3s stream poll, so the stream frame for the new row has come in too.
    await p.waitForTimeout(3600);
    assert.equal(await count(), n0 + 1, 'Send counts it once after the server copy and its stream frame');
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.refresh());
    await p.waitForTimeout(200);
    assert.equal(await copies(), 1, 'one inbox row after the server copy arrives');
    assert.equal(await panel.locator('.row', { has: p.getByText('Counted exactly once', { exact: true }) }).locator('.by').textContent(), 'You');
    assert.equal(await count(), n0 + 1);
    // The Send sheet leads with the button's number.
    await p.keyboard.press('Escape');
    const n = await count();
    await send.click();
    const summary = panel.locator('.summary');
    assert.equal(await summary.locator('b').textContent(), `${n} new ${n === 1 ? 'note' : 'notes'}`);
    assert.equal(await panel.getByRole('button', { name: `Send ${n}`, exact: true }).count(), 1);
    await shot(p, 'send-sheet-count-desktop');
    await panel.getByRole('button', { name: `Send ${n}`, exact: true }).click();
    await p.waitForFunction(() => document.querySelector('[data-review=done]').dataset.state === 'sent');
    // Last sent: neutral text with a check, not green.
    await send.click();
    const last = panel.locator('.sent');
    await last.waitFor();
    assert.equal(await last.locator('svg').count(), 1);
    // The sheet re-renders as the round marker refreshes: read the settled row.
    let colour = '';
    for (let i = 0; i < 20 && !colour; i++) { colour = await last.evaluate((n) => (n.isConnected ? getComputedStyle(n).color : '')).catch(() => ''); if (!colour) await p.waitForTimeout(100); }
    assert.notEqual(colour, 'rgb(88, 169, 125)');
    assert.match(colour, /^rgba\(255, 244, 224, 0\.7/);
    await p.context().close();
  });

  await t.test('Send waits for a note still saving, so it joins the round instead of being skipped', async () => {
    const p = await newPage({}, 'Fay'); await expand(p);
    let release; const gate = new Promise((r) => { release = r; });
    await p.route('**/annotations', async (route) => { if (route.request().method() === 'POST') await gate; await route.continue(); });
    await p.locator('main p').first().click();
    await p.getByPlaceholder('What should change?', { exact: true }).fill('Saved while sending');
    await p.getByRole('button', { name: 'Add', exact: true }).click();
    await p.locator('[data-review=done]').click();
    const panel = p.locator('section.panel[aria-label="Review tools"]');
    const before = project.round()?.ts || 0;
    await panel.getByRole('button', { name: /^Send \d+$/ }).click();
    setTimeout(release, 800);
    await p.waitForFunction(() => document.querySelector('[data-review=done]').dataset.state === 'sent', null, { timeout: 8000 });
    const saved = project.items().find((a) => a.comment === 'Saved while sending');
    assert.ok(saved, 'the note reached the server');
    for (let i = 0; i < 40 && !(project.round()?.ts > before); i++) await p.waitForTimeout(50);
    assert.ok(project.round().noteIds.includes(saved.id), 'the round carries the note that was still saving');
    await p.context().close();
  });

  await t.test('inbox: Before and After words, no side bars, Question, Delete and Withdraw, Done, 12px text', async () => {
    const at = (o) => api(`sessions/${session.id}/annotations`, { id: crypto.randomUUID(), element: 'p', elementPath: 'main > p', x: 30, y: 200, reviewer: 'Dee', timestamp: Date.now(), ...o });
    const old = await at({ comment: 'Sent earlier by Dee' });
    const done = await at({ comment: 'Done for Dee' }); await project.act('resolve', done.id, 'Fixed it.');
    const q = await at({ comment: 'Question for Dee', element: 'h2 "Starter"' }); await project.act('reply', q.id, 'Which colour?');
    const p = await newPage({}, 'Dee'); await expand(p);
    // Send, so the first note is sent; the next two come after it.
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open('done'));
    await p.locator('section.panel').getByRole('button', { name: /^Send \d+$/ }).click();
    await p.waitForFunction(() => document.querySelector('[data-review=done]').dataset.state === 'sent');
    await p.waitForTimeout(20);
    const fresh = await at({ comment: 'Not sent by Dee' });
    const edit = await at({ kind: 'edit', intent: 'edit', comment: 'Change to: "New words"', edit: { id: 'edit-dee', from: 'Old words', to: 'New words' } });
    await p.locator('[data-review=inbox]').click();
    await p.getByRole('button', { name: 'Mine', exact: true }).click();
    const panel = p.locator('section.panel[aria-label="Review tools"]');
    const row = (id) => panel.locator(`.row[data-annotation="${id}"]`);
    await row(fresh.id).waitFor();
    assert.equal(await row(fresh.id).getByRole('button', { name: 'Delete', exact: true }).count(), 1);
    assert.equal(await row(old.id).getByRole('button', { name: 'Withdraw', exact: true }).count(), 1);
    assert.equal(await panel.getByRole('button', { name: 'Reject' }).count(), 0);
    assert.equal(await row(done.id).locator('.status').textContent(), 'Done');
    assert.equal(await row(q.id).locator('.meta .q').textContent(), 'Question');
    // Scoped to what it is on, not "about this page".
    assert.equal(await row(q.id).locator('.meta .label').textContent(), 'Question · h2 "Starter"');
    assert.deepEqual(await row(edit.id).locator('.diff small').allTextContents(), ['Before', 'After']);
    assert.deepEqual(await row(edit.id).locator('.diff small').evaluateAll((n) => n.map((x) => [x.getBoundingClientRect().width > 0, parseFloat(getComputedStyle(x).fontSize) >= 12])), [[true, true], [true, true]]);
    // No coloured bar down one side, no text under 12px, no mono outside machine text.
    const bad = await panel.evaluate((root) => [...root.querySelectorAll('*')].filter((n) => n.getClientRects().length).flatMap((n) => {
      const cs = getComputedStyle(n), out = [];
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0);
      if (sides.filter(Boolean).length === 1 && sides[3]) out.push(`side border: ${n.className}`);
      const text = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (text && parseFloat(cs.fontSize) < 12) out.push(`${cs.fontSize}: ${n.textContent.trim().slice(0, 30)}`);
      if (text && /mono/i.test(cs.fontFamily) && !n.matches('.tweak-what')) out.push(`mono: ${n.textContent.trim().slice(0, 30)}`);
      return out;
    }));
    assert.deepEqual(bad, []);
    await shot(p, 'inbox-words-desktop');
    // Delete takes an unsent note out of the inbox; Withdraw keeps a sent one under Done.
    await row(fresh.id).getByRole('button', { name: 'Delete', exact: true }).click();
    await panel.getByRole('button', { name: 'Delete note', exact: true }).click();
    await row(fresh.id).waitFor({ state: 'detached' });
    assert.equal(project.get(fresh.id).status, 'dismissed');
    await row(old.id).getByRole('button', { name: 'Withdraw', exact: true }).click();
    await panel.getByRole('button', { name: 'Withdraw note', exact: true }).click();
    await p.waitForFunction((id) => [...document.querySelectorAll('.sk-edit-ui')].some((h) => h.shadowRoot?.querySelector(`.row[data-annotation="${id}"] .status`)?.textContent === 'Withdrawn'), old.id);
    assert.equal(project.get(old.id).status, 'dismissed');
    await p.context().close();
  });

  await t.test('phone: the inbox close is 44px, More shows no key hints, the mode sheet speaks plainly', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'Dee'); await expand(p);
    await p.locator('[data-review=inbox]').click();
    const close = await p.getByRole('button', { name: 'Close review panel', exact: true }).boundingBox();
    assert.ok(close.width >= 44 && close.height >= 44, JSON.stringify(close));
    await p.getByRole('button', { name: 'Close review panel', exact: true }).tap();
    await p.locator('[data-review=more]').tap();
    const menu = p.locator('.menu[aria-label="More tools"]');
    await menu.waitFor();
    assert.equal(await menu.locator('.k').evaluateAll((ks) => ks.filter((k) => getComputedStyle(k).display !== 'none').length), 0);
    await p.locator('[data-review=more]').tap();
    await p.locator('[data-review=mode]').tap();
    const sheet = p.locator('.menu.sheet');
    await sheet.getByText('Rewrite text in place, or open all page text full screen.').waitFor();
    assert.match(await sheet.textContent(), /using sizes the page already has/);
    assert.doesNotMatch(await sheet.textContent(), /every string|project’s scale/);
    await p.context().close();
  });

  await t.test('Edit text says Save, never commit; the strip ends where the bar ends', async () => {
    const p = await newPage({}, 'Dee'); await expand(p);
    await p.locator('[data-mode=edit]').click();
    await p.locator('.card p').click(); await p.keyboard.press('End'); await p.keyboard.type(' Today.');
    await p.evaluate(() => document.activeElement.blur());
    const strip = p.locator('section.panel.strip[aria-label="Review tools"]');
    await strip.getByRole('button', { name: 'Save 1', exact: true }).waitFor();
    assert.doesNotMatch(await strip.textContent(), /ommit/);
    // Counted as edits, like the Tweak strip's "1 tweak", not as drafts.
    assert.match(await strip.locator('#title').textContent(), /^1 edit\b/);
    await p.waitForTimeout(400);
    const [s, b] = await Promise.all([strip.boundingBox(), p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').boundingBox()]);
    assert.ok(Math.abs(s.x + s.width - (b.x + b.width)) <= 1, 'right-aligned to the bar ' + JSON.stringify([s, b]));
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open('done'));
    await p.locator('section.panel').getByText('1 text edit will be saved first.', { exact: true }).waitFor();
    // In the inbox the draft row keeps its kind word: "Text edit · draft".
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open('inbox'));
    assert.equal(await p.locator('section.panel .row[data-draft] .meta .label').first().textContent(), 'Text edit · draft');
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.open(null));
    await strip.getByRole('button', { name: 'Save 1', exact: true }).click();
    await strip.getByText(/^\d+ saved$/).waitFor();
    await p.locator('[data-mode=comment]').click();
    await p.context().close();
  });

  await t.test('healthy polling cannot hide failed session creation on a new route', async () => {
    const p = await newPage({}, 'Ana');
    await p.route('**/__review/__ag/sessions', (route) => route.request().method() === 'POST'
      ? route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"sessions unavailable"}' })
      : route.continue());
    await p.evaluate(() => history.pushState({}, '', '/pricing'));
    await p.waitForFunction(() => window.__AGENTATION_KIT_HEALTH__?.ok === false);
    await p.evaluate(() => window.__AGENTATION_KIT_CONNECTION__.check());
    assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_HEALTH__.ok), false);
    await p.unroute('**/__review/__ag/sessions');
    await p.evaluate(() => window.__AGENTATION_KIT_CONNECTION__.check());
    assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_HEALTH__.ok), true);
    const current = await p.evaluate(() => window.__AGENTATION_KIT_AGENTATION_SESSION__);
    const s = await api(`sessions/${current}`);
    assert.equal(new URL(s.url).pathname, '/pricing');
    await p.context().close();
  });
  assert.deepEqual(errors, [], 'no browser runtime exceptions');
});
