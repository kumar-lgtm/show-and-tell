// The critique redesign in a real browser (show-and-tell.pen chapters 9 and 10):
// the panel opens only from the bar, Fix it / Not an issue / Undo reach the
// server, a suggestion previews on the page and lands in Edit text drafts, and
// Run checks finds a deliberately small target, low contrast and text it can't
// measure. Opt in: SHOW_AND_TELL_BROWSER_TESTS=1 (after pnpm build).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:17px/1.55 system-ui,sans-serif;margin:0;color:#1b1b1b;background:#fafaf8}main{max-width:640px;margin:0 auto;padding:48px 16px}
.card{background:#fff;border:1px solid #e4e4e0;border-radius:10px;padding:20px;margin-top:24px}
.card button{font:inherit;padding:10px 16px;border-radius:8px;border:0;background:#1b1b1b;color:#fff}
#tiny{width:20px;height:20px;padding:0;border:0;background:#ddd}
#faint{color:#b5b5b5}
.hero{background:linear-gradient(90deg,#123,#345);padding:12px}.hero span{color:#fff}</style>
<script src="/__review/loader.js"></script></head><body><main>
<h1>Pricing that scales with your team</h1>
<p class="lede">Pick a plan, invite your team and start shipping.</p>
<div class="card"><h2>Starter</h2><p class="desc">Everything a small team needs to get going, billed monthly.</p><button>Start free trial</button></div>
<p><button id="tiny" aria-label="Close banner"></button></p>
<p id="faint">Prices exclude tax.</p>
<div class="hero"><span>Over a gradient</span></div>
</main></body></html>`;

test('critique: decisions, suggestions and measured checks in the page', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  let app;
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const name = uniqueName('critique-browser');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true } });
  const project = openProject(name, { create: true });
  const { annotations: [blocking, described, lede] } = await project.annotate(`${origin}/`, [
    { comment: 'Both plans say Start free trial', selector: '.card button', severity: 'blocking' },
    { comment: 'The Starter description says what it costs but not who it is for', selector: '.card p.desc',
      suggestion: { kind: 'text', to: 'For teams of up to 10. Billed monthly.' } },
    { comment: 'The subhead promises too much too early', selector: 'p.lede' },
  ], { create: true });
  const browser = await chromium.launch();
  const errors = [];
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });

  const newPage = async (options) => {
    const context = await browser.newContext(options);
    await context.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'Ana'));
    const p = await context.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(origin);
    await p.waitForFunction(() => window.__AGENTATION_KIT_CRITIQUE_COUNT__ > 0);
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=inbox]').waitFor({ state: 'visible' });
    return p;
  };
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  const shot = async (page, file) => { if (shots) { mkdirSync(shots, { recursive: true }); await page.screenshot({ path: `${shots}/${file}.png` }); } };
  const note = (id) => project.get(id);
  const until = async (fn, what) => { for (let i = 0; i < 60; i++) { if (await fn()) return; await new Promise((r) => setTimeout(r, 50)); } assert.fail(what); };

  const p = await newPage({ viewport: { width: 1280, height: 800 } });
  const panel = p.locator('section[aria-label="From the agent"]');
  const row = (text) => panel.locator('article.note', { hasText: text });

  await t.test('markers: one system that sits beside its element and follows the page', async () => {
    const d = await newPage({ viewport: { width: 1280, height: 800 } });
    const box = (sel) => d.locator(sel).first().evaluate((n) => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
    const dot = d.locator('.sk-crit-dot').first();
    await dot.waitFor();
    // Numbered by creation, decided notes included: the blocking note was made first.
    assert.equal(await dot.textContent(), 'A1', 'the agent marker carries an A and keeps its number');
    assert.equal(await dot.evaluate((n) => getComputedStyle(n).borderRadius), '6px', 'a rounded square, not a circle');
    const [crit, button] = [await box('.sk-crit-dot'), await box('.card button')];
    assert.ok(crit.r <= button.l + 4 && crit.b <= button.t + 4, `outside the top-left corner: ${JSON.stringify({ crit, button })}`);

    // A reviewer note: the toolbar's marker sits by the same corner rule, in the one accent.
    await d.locator('p.lede').click({ position: { x: 220, y: 8 } });
    await d.getByPlaceholder('What should change?', { exact: true }).fill('Say who it is for');
    await d.getByRole('button', { name: 'Add', exact: true }).click();
    const mine = d.locator('[data-annotation-marker]').first();
    await mine.waitFor();
    const id = await mine.getAttribute('data-kit-note');
    await until(async () => { const [m, p2] = [await box('[data-annotation-marker]'), await box('p.lede')]; return m.r <= p2.l + 4 && m.b <= p2.t + 4; }, 'the reviewer marker sits outside the paragraph corner');
    assert.equal(await mine.evaluate((n) => getComputedStyle(n).backgroundColor), 'rgb(255, 84, 54)', 'the accent, not the upstream blue');

    // A side sheet floats: opening the inbox leaves the page and its markers where they were.
    const before = { crit: await box('.sk-crit-dot'), mine: await box('[data-annotation-marker]'), button: await box('.card button'), lede: await box('p.lede') };
    await d.locator('[data-review=inbox]').click();
    await d.locator('[data-review-panel], .panel').first().waitFor({ state: 'attached' }).catch(() => {});
    await d.waitForTimeout(400);
    assert.equal(parseFloat(await d.evaluate(() => getComputedStyle(document.documentElement).paddingRight)), 0, 'no column reserved for the inbox');
    assert.ok(Math.abs((await box('.card button')).l - before.button.l) < 1, 'the page did not move');
    await d.keyboard.press('Escape');
    // The page reflows (the window narrows, still a desktop width, where the
    // reviewer's note belongs): both markers follow their elements.
    await d.setViewportSize({ width: 1210, height: 800 });
    const shift = (await box('.card button')).l - before.button.l;
    assert.ok(shift < -20, `the page moved left (${shift}px)`);
    await until(async () => Math.abs((await box('.sk-crit-dot')).l - before.crit.l - shift) < 2, 'the agent marker followed the reflow');
    await until(async () => Math.abs((await box('[data-annotation-marker]')).l - before.mine.l - ((await box('p.lede')).l - before.lede.l)) < 2, 'the reviewer marker followed the reflow');
    await shot(d, 'markers-reflow');
    await d.setViewportSize({ width: 1280, height: 800 });

    // Hide markers (H) hides every marker on the page, the agent's included.
    assert.equal(await d.locator('[data-review=inbox]').isVisible(), true, 'the bar is still open');
    await d.keyboard.press('h');
    await until(async () => !(await mine.isVisible()), 'Hide markers hides the reviewer markers');
    await until(async () => !(await dot.isVisible()), 'Hide markers hides the agent markers');
    await d.keyboard.press('h');
    await until(async () => dot.isVisible(), 'and Show markers brings them back');
    // Leave the round as the next tests expect it: no reviewer notes.
    await d.evaluate(async ([o, n]) => { await fetch(`${o}/__review/__ag/annotations/${n}?reviewer=Ana`, { method: 'DELETE' }); }, [origin, id]);
    await until(() => project.items().length === 0, 'the test note is gone');
    await d.context().close();
  });

  await t.test('the count is on the bar and the panel never opens by itself', async () => {
    assert.equal(await panel.isVisible(), false);
    const own = p.locator('[data-review=critique]');
    assert.equal(await own.isVisible(), true, 'no agent button: critique gets its own');
    assert.equal(await own.locator('.sk-crit-badge').textContent(), '3');
    await own.click();
    await panel.waitFor({ state: 'visible' });
    assert.match(await panel.locator('#todo').textContent(), /^3 to decide$/);
    assert.match(await panel.textContent(), /1 blocking, 2 important/);
    assert.equal(await p.locator('.sk-crit-dot').count(), 3, 'a marker for every note');
    await shot(p, 'critique-panel');
  });

  await t.test('Fix it puts a note in my round; Undo takes it back', async () => {
    await row('Both plans say').getByRole('button', { name: 'Fix it', exact: true }).click();
    await row('Both plans say').getByText('Added to your round').waitFor();
    await until(() => note(blocking.id).status === 'resolved', 'critique note decided');
    const mine = project.items();
    assert.equal(mine.length, 1);
    assert.equal(mine[0].fromCritique, blocking.id);
    assert.equal(mine[0].reviewer, 'Ana');
    await p.waitForFunction(() => /Send 1/.test(document.querySelector('[data-review=done]').textContent), null, { timeout: 5000 });
    assert.equal(await p.locator('[data-review=critique] .sk-crit-badge').textContent(), '2', 'the count drops as you go');
    assert.equal(await p.locator('.sk-crit-dot').first().evaluate((n) => n.style.opacity), '0.3', 'its marker fades');

    await row('Both plans say').getByRole('button', { name: 'Undo' }).click();
    await row('Both plans say').getByRole('button', { name: 'Fix it', exact: true }).waitFor();
    await until(() => note(blocking.id).status === 'pending', 'critique note reopened');
    assert.equal(project.items().length, 0, 'the note Fix it made is withdrawn');
    assert.equal(await p.locator('[data-review=critique] .sk-crit-badge').textContent(), '3');
    // The undone note never stood: it is not in the inbox, not even under Done.
    const q = await newPage({ viewport: { width: 1280, height: 800 } });
    await q.locator('[data-review=inbox]').click();
    const inbox = q.locator('section.panel[aria-label="Review tools"]');
    await inbox.waitFor({ state: 'visible' });
    await q.waitForTimeout(300);
    assert.doesNotMatch(await inbox.textContent(), /taken back|Undone by/, 'no "Not applied: Undone by …" row');
    assert.equal(await inbox.locator('.sec', { hasText: 'Done' }).count(), 0);
    await q.context().close();
  });

  await t.test('Not an issue keeps a reason; the decided note leaves the list', async () => {
    await row('The subhead').getByRole('button', { name: 'Not an issue' }).click();
    // Focus goes to the reason field, not BODY.
    await until(() => row('The subhead').locator('textarea').evaluate((n) => n.getRootNode().activeElement === n && document.activeElement === n.getRootNode().host), 'the reason field has focus');
    await row('The subhead').locator('textarea').fill('It answers the first worry people have');
    await row('The subhead').getByRole('button', { name: 'Not an issue' }).click();
    await row('The subhead').getByText(/Not an issue: It answers the first worry/).waitFor();
    await until(() => note(lede.id).status === 'dismissed', 'dismissed');
    assert.equal(note(lede.id).decision.reason, 'It answers the first worry people have');
    await row('The subhead').waitFor({ state: 'detached', timeout: 9000 });
    assert.match(await panel.locator('#todo').textContent(), /^2 to decide$/);
  });

  await t.test('a suggested text change previews on the page, then lands in Edit text drafts', async () => {
    const desc = p.locator('.card p.desc');
    const before = await desc.textContent();
    await row('Starter description').getByRole('button', { name: 'After' }).click();
    assert.equal(await desc.textContent(), 'For teams of up to 10. Billed monthly.');
    assert.equal(await p.locator('.sk-crit-ring').getByText('Preview, not saved').isVisible(), true);
    await shot(p, 'critique-suggestion-after');
    await row('Starter description').getByRole('button', { name: 'Before' }).click();
    assert.equal(await desc.textContent(), before, 'Before puts the page back exactly');
    await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
    await row('Starter description').getByText('In your Edit text drafts').waitFor();
    const drafts = await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.pendingEdits().map((e) => ({ from: e.from, to: e.to })));
    assert.deepEqual(drafts, [{ from: before, to: 'For teams of up to 10. Billed monthly.' }]);
    await until(() => note(described.id).decision?.draft === 'text', 'decided as a draft');
    assert.equal(await p.locator('[data-mode=edit] .sk-badge').textContent(), '1', 'Edit text shows the draft');
  });

  await t.test('after a reload, Undo on a suggestion taken into drafts takes the draft back too', async () => {
    // Codex review: the decision came back, but the suggested text stayed in
    // Edit text drafts and went out on the next Send.
    await p.reload();
    // Drafts come back once the page has hydrated (edit-mode.js), not at once.
    await p.waitForFunction(() => window.__AGENTATION_KIT_EDIT__?.pendingEdits().length === 1, undefined, { timeout: 8000 });
    await p.waitForTimeout(600);
    if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=critique]').waitFor({ state: 'visible' });
    await p.locator('[data-review=critique]').click();
    await panel.waitFor({ state: 'visible' });
    await panel.getByRole('button', { name: /^Decided \d/ }).click();
    await panel.getByRole('button', { name: 'Undo the decision on A2', exact: true }).click();
    await until(() => !note(described.id).decision || note(described.id).status === 'pending' || note(described.id).decision?.decision === 'undo', 'the decision is taken back');
    await until(async () => (await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.pendingEdits())).length === 0, 'the draft is gone');
    assert.notEqual(await p.locator('.card p.desc').textContent(), 'For teams of up to 10. Billed monthly.', 'the page shows the original text again');
  });

  await t.test('an Undo that fails offline says so and can be pressed again', async () => {
    // Codex review: with the server down for the Undo and the reload after
    // it, the button stayed disabled with no message.
    await p.route('**/__review/__ag/**', (route) => route.abort());
    const fold = panel.getByRole('button', { name: /^Decided \d/ });
    if ((await fold.getAttribute('aria-expanded')) !== 'true') await fold.click();
    const undo = panel.getByRole('button', { name: 'Undo the decision on A3', exact: true });
    await undo.click();
    await until(async () => (await panel.locator('[role=alert], .flash, .err').count()) > 0 || /could|offline|try again|connect/i.test(await panel.textContent()), 'a failure message shows');
    const again = panel.getByRole('button', { name: 'Undo the decision on A3', exact: true });
    await until(async () => (await again.count()) === 1 && !(await again.isDisabled()), 'Undo can be pressed again');
    // Back online, the same Undo works: the note is open again, as the tests after this expect.
    await p.unroute('**/__review/__ag/**');
    await again.click();
    await until(() => note(lede.id).status !== 'dismissed', 'the retried Undo took the decision back');
    await row('The subhead').waitFor();
  });

  await t.test('Undo takes back only its own draft, not a newer suggestion on the same text', async () => {
    // Codex re-review: two suggestions on one paragraph share its draft, and
    // Undo on the first deleted the second one's change.
    const { annotations: [second] } = await project.annotate(`${origin}/`, [{ comment: 'Say the price per seat', selector: '.card p.desc',
      suggestion: { kind: 'text', to: 'For teams of up to 10, at $8 a seat.' } }]);
    await p.reload();
    await p.waitForTimeout(600);
    if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=critique]').click();
    await panel.waitFor({ state: 'visible' });
    await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
    await row('Starter description').getByText('In your Edit text drafts').waitFor();
    await row('Say the price per seat').getByRole('button', { name: 'Use this change' }).click();
    await row('Say the price per seat').getByText('In your Edit text drafts').waitFor();
    await until(() => note(described.id).decision?.draft === 'text' && note(second.id).decision?.draft === 'text', 'both decided as drafts');
    await p.reload();
    await p.waitForFunction(() => window.__AGENTATION_KIT_EDIT__?.pendingEdits().length === 1, undefined, { timeout: 8000 });
    await p.waitForTimeout(600);
    if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=critique]').click();
    await panel.waitFor({ state: 'visible' });
    await panel.getByRole('button', { name: /^Decided \d/ }).click();
    await panel.getByRole('button', { name: 'Undo the decision on A2', exact: true }).click();
    await until(() => note(described.id).status !== 'resolved', 'the first decision is taken back');
    // The server changes before the page has its answer: wait for the page.
    await until(async () => (await p.evaluate((id) => localStorage.getItem('feedback-critique-draft:' + id), described.id)) === null, 'the undone note no longer claims a draft');
    const left = await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.pendingEdits().map((e) => e.to));
    assert.deepEqual(left, ['For teams of up to 10, at $8 a seat.'], 'the newer suggestion\'s draft stays');
    // Undo the second too, so the round is as the tests after this expect.
    const fold = panel.getByRole('button', { name: /^Decided \d/ });
    if ((await fold.getAttribute('aria-expanded')) !== 'true') await fold.click();
    await panel.getByRole('button', { name: /^Undo the decision on A\d+$/ }).last().click();
    await until(() => note(second.id).status !== 'resolved', 'the second decision is taken back');
    await until(async () => (await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.pendingEdits().length)) === 0, 'and its draft');
    await project.act('dismiss', second.id, 'test note');
  });

  await t.test('Undo and drafts: identical words, another breakpoint, an older record', async () => {
    // Codex re-review 2.
    const SAME = 'For teams of up to 10. Billed monthly.';
    const opened = async () => {
      await p.waitForTimeout(600);
      if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
      await p.locator('[data-review=critique], [data-review=inbox]').first().waitFor({ state: 'visible' });
      if (await p.locator('[data-review=critique]').isVisible()) await p.locator('[data-review=critique]').click();
      else { await p.locator('[data-review=inbox]').click(); await p.getByRole('button', { name: 'Decide', exact: true }).click(); }
      await panel.waitFor({ state: 'visible' });
    };
    const decidedUndo = async (label) => {
      const fold = panel.getByRole('button', { name: /^Decided \d/ });
      if ((await fold.getAttribute('aria-expanded')) !== 'true') await fold.click();
      await panel.getByRole('button', { name: label, exact: true }).click();
    };
    const drafts = () => p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('agentation-edit_')).map((k) => JSON.parse(localStorage.getItem(k)).html));
    const claim = (id) => p.evaluate((id) => localStorage.getItem('feedback-critique-draft:' + id), id);

    // 1. Two notes put the same words in one draft: Undo on the first leaves the second's.
    const { annotations: [twin] } = await project.annotate(`${origin}/`, [{ comment: 'Name the team size', selector: '.card p.desc', suggestion: { kind: 'text', to: SAME } }]);
    await p.reload(); await opened();
    await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
    await row('Starter description').getByText('In your Edit text drafts').waitFor();
    await row('Name the team size').getByRole('button', { name: 'Use this change' }).click();
    await row('Name the team size').getByText('In your Edit text drafts').waitFor();
    await until(() => note(described.id).status === 'resolved' && note(twin.id).status === 'resolved', 'both decided');
    await p.reload(); await opened();
    await decidedUndo('Undo the decision on A2');
    await until(async () => (await claim(described.id)) === null, 'the first note lets go of the draft');
    assert.deepEqual(await drafts(), [SAME], 'the second note keeps the draft with the same words');
    const twinN = await panel.locator(`.what.earlier[data-id="${twin.id}"] .num`).textContent();
    await decidedUndo(`Undo the decision on ${twinN}`);
    await until(async () => (await drafts()).length === 0, 'and its own Undo takes it back');
    await project.act('dismiss', twin.id, 'test note');

    // 2. Accepted at desktop width, undone on a phone: the desktop draft goes too.
    await p.reload(); await opened();
    await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
    await row('Starter description').getByText('In your Edit text drafts').waitFor();
    await until(() => note(described.id).status === 'resolved', 'decided');
    await p.setViewportSize({ width: 390, height: 844 });
    await p.reload(); await opened();
    await decidedUndo('Undo the decision on A2');
    await until(async () => (await claim(described.id)) === null, 'undone on the phone');
    await p.setViewportSize({ width: 1280, height: 800 });
    await p.reload();
    await p.waitForTimeout(1500);
    assert.deepEqual(await drafts(), [], 'no desktop draft waits for Send');
    assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.pendingEdits().length), 0);

    // 3. A record in the first shape (a bare draft id) still takes its draft back.
    await opened();
    await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
    await row('Starter description').getByText('In your Edit text drafts').waitFor();
    await until(() => note(described.id).status === 'resolved', 'decided');
    await p.evaluate((id) => {
      const rec = JSON.parse(localStorage.getItem('feedback-critique-draft:' + id));
      localStorage.setItem('feedback-critique-draft:' + id, rec.id);
      localStorage.removeItem('feedback-critique-draft-by:' + rec.id);
    }, described.id);
    await p.reload(); await opened();
    await decidedUndo('Undo the decision on A2');
    await until(async () => (await drafts()).length === 0, 'the older record takes its draft back');
  });

  await t.test('Undo never takes another reviewer\'s draft, and gives a sent edit back its sent words', async () => {
    // Codex re-review 3.
    const opened = async () => {
      await p.waitForTimeout(600);
      if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
      await p.locator('[data-review=critique], [data-review=inbox]').first().waitFor({ state: 'visible' });
      if (await p.locator('[data-review=critique]').isVisible()) await p.locator('[data-review=critique]').click();
      else { await p.locator('[data-review=inbox]').click(); await p.getByRole('button', { name: 'Decide', exact: true }).click(); }
      await panel.waitFor({ state: 'visible' });
    };
    const undoA2 = async () => {
      const fold = panel.getByRole('button', { name: /^Decided \d/ });
      if ((await fold.getAttribute('aria-expanded')) !== 'true') await fold.click();
      await panel.getByRole('button', { name: 'Undo the decision on A2', exact: true }).click();
      await until(async () => (await p.evaluate((id) => localStorage.getItem('feedback-critique-draft:' + id), described.id)) === null, 'Undo ran');
    };
    const accept = async () => {
      await p.reload(); await opened();
      await row('Starter description').getByRole('button', { name: 'Use this change' }).click();
      await row('Starter description').getByText('In your Edit text drafts').waitFor();
      await until(() => note(described.id).status === 'resolved', 'decided');
      return p.evaluate((id) => JSON.parse(localStorage.getItem('feedback-critique-draft:' + id)).id, described.id);
    };
    const record = (id) => p.evaluate((id) => JSON.parse(localStorage.getItem('agentation-edit_' + id) || 'null'), id);

    // 1. The record for that id is now Bob's, with the same words (the shared KV): Undo leaves it.
    let id = await accept();
    await p.evaluate((id) => { const k = 'agentation-edit_' + id; localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k)), reviewer: 'Bob' })); }, id);
    await p.reload(); await opened();
    await undoA2();
    assert.equal((await record(id))?.reviewer, 'Bob', 'Bob\'s draft is still there');
    await p.evaluate((id) => localStorage.removeItem('agentation-edit_' + id), id);

    // 2. A sent edit, revised by the suggestion, undone at another breakpoint:
    //    the stored draft goes back to the sent words, and stays sent.
    id = await accept();
    // A real reviewer note to stand for the sent edit: a pending record whose
    // note the server doesn't list is dropped on load (edit-mode reconcile).
    const sent = await p.evaluate(async (o) => {
      const s = window.__AGENTATION_KIT_AGENTATION_SESSION__;
      const r = await fetch(`${o}/__review/__ag/sessions/${s}/annotations`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: crypto.randomUUID(), kind: 'edit', comment: 'Text edit', reviewer: 'Ana', element: 'p', elementPath: '.card p.desc', timestamp: Date.now() }) });
      return (await r.json()).id;
    }, origin);
    await p.evaluate(([id, sentAs]) => {
      const k = 'agentation-edit_' + id;
      localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k)), submittedTo: 'Everything a small team needs.' }));
      localStorage.setItem('agentation-editpending_' + id, sentAs);
    }, [id, sent]);
    await p.setViewportSize({ width: 390, height: 844 });
    await p.reload(); await opened();
    await undoA2();
    const after = await record(id);
    assert.equal(after?.html, 'Everything a small team needs.', 'back to the sent words');
    assert.equal(await p.evaluate((id) => localStorage.getItem('agentation-editpending_' + id), id), sent, 'still sent');
    await p.evaluate((id) => { localStorage.removeItem('agentation-edit_' + id); localStorage.removeItem('agentation-editpending_' + id); }, id);
    await p.evaluate(async ([o, n]) => { await fetch(`${o}/__review/__ag/annotations/${n}?reviewer=Ana`, { method: 'DELETE' }); }, [origin, sent]);
    await p.setViewportSize({ width: 1280, height: 800 });
    await p.reload(); await opened();
    assert.deepEqual(errors, [], 'no page errors');
  });

  await t.test('an Undo the agent already acted on keeps its message after the refresh', async () => {
    // Codex re-review: the reload after a 409 redrew the panel and wiped the message.
    const name = 'Undo the decision on A3';
    await row('The subhead').getByRole('button', { name: 'Not an issue' }).click();
    await row('The subhead').getByRole('button', { name: 'Not an issue' }).click();
    await until(() => note(lede.id).status === 'dismissed', 'dismissed');
    await p.reload();
    await p.waitForTimeout(600);
    if (!(await p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className)))) await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=critique]').click();
    await panel.waitFor({ state: 'visible' });
    await panel.getByRole('button', { name: /^Decided \d/ }).click();
    await p.route('**/__review/__ag/annotations/*/decision', (route) => route.fulfill({ status: 409, contentType: 'application/json', body: '{"error":"acted"}' }));
    await panel.getByRole('button', { name, exact: true }).click();
    await panel.getByText("The agent already acted on that, so it can't be taken back.").waitFor();
    await p.waitForTimeout(1200);
    assert.equal(await panel.getByText("The agent already acted on that, so it can't be taken back.").isVisible(), true, 'the message is still there a second later');
    await p.unroute('**/__review/__ag/annotations/*/decision');
    await panel.getByRole('button', { name, exact: true }).click();
    await until(() => note(lede.id).status !== 'dismissed', 'undone once the server agrees');
    await row('The subhead').waitFor();
  });

  await t.test('Run checks finds the small target and the faint text, and lists what it could not measure', async () => {
    await panel.getByRole('button', { name: /Run checks/ }).click();
    await panel.locator('.group', { hasText: /^Measured/ }).waitFor({ timeout: 30000 });
    const tiny = row('Close banner');
    await tiny.waitFor();
    assert.match(await tiny.textContent(), /“Close banner” is 20 × 20px/);
    // Measured at phone widths too, so the row carries the strictest rule and its fix.
    assert.match(await tiny.textContent(), /Touch targets.*44 × 44px/);
    assert.match(await tiny.textContent(), /at all three widths and this one|at 390/i);
    assert.match(await panel.textContent(), /“Prices exclude tax\.” has \d\.\d:1 contrast/);
    assert.match(await panel.textContent(), /Couldn’t measure/);
    assert.match(await panel.textContent(), /“Over a gradient” is over a gradient/);
    assert.match(await panel.locator('#checks').textContent(), /Checked at 390, 820, 1280 and 1440/);
    // Measured first, then Couldn't measure, then Opinion.
    const order = await panel.locator('.group').allTextContents();
    assert.deepEqual(order.map((s) => s.replace(/\s*\d+$/, '')), ['Measured', 'Couldn’t measure', 'Opinion']);
    await tiny.hover();
    await shot(p, 'critique-measured');
    await tiny.getByRole('button', { name: /^Use min-/ }).click();
    await tiny.getByText('Added to your round').waitFor();
    const fixed = project.items().find((a) => a.source === 'measured');
    assert.ok(fixed, 'a measured finding is stored only once I pick Fix it');
    assert.equal(fixed.measure.check, 'target');
    assert.equal(fixed.elementPath, '#tiny');
    assert.match(project.describe(fixed), /MEASURED — “Close banner” is 20 × 20px/);
  });
  await p.context().close();

  await t.test('phone: a bottom sheet under 55%, and 44px decisions', async () => {
    await project.annotate(`${origin}/`, [{ comment: 'The headline is a size too big on phones', selector: 'h1', severity: 'suggestion',
      suggestion: { kind: 'tweak', property: 'font-size', to: '28px' } }]);
    const m = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    // A phone's bar has no room for the critique button: the count rides the inbox, which opens it.
    await m.locator('[data-review=inbox]').click();
    await m.getByRole('button', { name: 'Decide', exact: true }).click();
    const sheet = m.locator('section[aria-label="From the agent"]');
    await sheet.waitFor({ state: 'visible' });
    await shot(m, 'critique-phone');
    const box = await sheet.boundingBox();
    assert.ok(box.height <= 844 * 0.55 + 1, `sheet ${box.height}px`);
    for (const b of await sheet.locator('article.note .verbs button, .seg button').all()) {
      if (await b.isVisible()) assert.ok((await b.boundingBox()).height >= 44, await b.textContent());
    }
    const h1 = m.locator('h1');
    const size = await h1.evaluate((n) => getComputedStyle(n).fontSize);
    const headline = sheet.locator('article.note', { hasText: 'The headline is a size too big' });
    await headline.locator('.seg button', { hasText: 'After' }).click();
    assert.equal(await h1.evaluate((n) => getComputedStyle(n).fontSize), '28px', 'the tweak previews on the page');
    await shot(m, 'critique-phone-suggestion');
    await headline.locator('.seg button', { hasText: 'Before' }).click();
    assert.equal(await h1.evaluate((n) => getComputedStyle(n).fontSize), size);
    await m.context().close();
  });

  await t.test('From the agent lists notes by number, whatever their severity', async () => {
    // A blocking note made last: worst first listed it second (A1, A5, …).
    await project.annotate(`${origin}/`, [{ comment: 'The trial button is the same black as the text', selector: '.card button', severity: 'blocking' }]);
    const d = await newPage({ viewport: { width: 1280, height: 800 } });
    await d.locator('[data-review=critique]').click();
    const sheet = d.locator('section[aria-label="From the agent"]');
    await sheet.waitFor({ state: 'visible' });
    const labels = await sheet.locator('article.note .top .n').allTextContents();
    const nums = labels.map((l) => Number(l.slice(1)));
    assert.ok(nums.length >= 3, labels.join(' '));
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b), `in number order: ${labels.join(' ')}`);
    await shot(d, 'critique-number-order');
    await d.context().close();
  });

  assert.deepEqual(errors, []);
});
