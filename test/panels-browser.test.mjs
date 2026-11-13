// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/panels-browser.test.mjs
// UX review round 1: the agent's question never opens by itself (2, 7, 8), Talk
// is never a trap (3), the popup's Dictate is visible and beside its field (4),
// and phone targets in the popup and question panel are 44px (14).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('floating panels: one at a time, a question waits as a notice, Talk always lets go', {
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
  const name = uniqueName('panels');
  // No speech provider: Talk's setup panel is the case that used to trap.
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true, voice: true } });
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
  const ask = async (comment, question) => {
    const a = await api(`sessions/${session.id}/annotations`, {
      id: crypto.randomUUID(), comment, reviewer: 'Ana', element: 'h1', elementPath: 'main > h1', x: 30, y: 120, timestamp: Date.now(),
    });
    await project.act('reply', a.id, question);
    return a;
  };
  const newPage = async (options = {}) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    await context.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'Ana'));
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    return page;
  };
  const expand = async (p) => {
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=inbox]').waitFor({ state: 'visible' });
  };
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  const tapOrClick = (p, loc, touch) => (touch ? loc.tap() : loc.click());
  const state = (p) => p.evaluate(() => {
    const vis = (n) => { if (!n || n.hidden) return false; const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const host = document.querySelector('[data-replies-ui]');
    return {
      panel: vis(host?.shadowRoot.querySelector('[aria-label="Reply from the agent"]')),
      notice: vis(host?.shadowRoot.querySelector('[data-question-notice]')),
      popup: vis(document.querySelector('[data-annotation-popup]')),
      bar: !!document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]'),
      padBottom: parseFloat(getComputedStyle(document.documentElement).paddingBottom) || 0,
      padRight: parseFloat(getComputedStyle(document.documentElement).paddingRight) || 0,
    };
  });

  await t.test('a question is a notice, never a panel over the page, at 1280, 390 and 360', async () => {
    await ask('The heading feels too heavy', 'Shorter, or just less bold?');
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 360, height: 780 }]) {
      const touch = vp.width < 900;
      const p = await newPage(touch ? { viewport: vp, hasTouch: true, isMobile: true } : { viewport: vp });
      // Collapsed: nothing of the question on screen.
      await p.waitForFunction(() => window.__AGENTATION_KIT_REPLIES__?.pending() > 0);
      await p.waitForTimeout(400);
      assert.deepEqual((({ panel, notice }) => ({ panel, notice }))(await state(p)), { panel: false, notice: false }, `${vp.width}: collapsed`);
      await expand(p);
      await p.locator('[data-question-notice]').waitFor({ state: 'visible' });
      await p.waitForTimeout(600);
      assert.equal((await state(p)).panel, false, `${vp.width}: the panel never opens by itself`);
      await shot(p, `panels-${vp.width}-question-notice`);

      // A comment popup takes over: the notice steps aside, the popup's buttons are its own.
      await tapOrClick(p, p.locator('main h2').first(), touch);
      await p.locator('[data-annotation-popup]').waitFor({ state: 'visible' });
      await p.waitForTimeout(400);
      const s1 = await state(p);
      assert.equal(s1.notice, false, `${vp.width}: notice yields to the popup`);
      assert.equal(s1.panel, false);
      const popup = await p.evaluate(() => {
        const pop = document.querySelector('[data-annotation-popup]');
        const box = (n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
        const buttons = [...pop.querySelectorAll('[class*="actions___"] button')].map((b) => {
          const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return { ...box(b), mine: !!hit?.closest('[data-annotation-popup]') };
        });
        const d = pop.querySelector('[data-voice-dictate]'), ta = pop.querySelector('textarea');
        return { buttons, dictate: d && { ...box(d), color: getComputedStyle(d).color, opacity: getComputedStyle(d).opacity }, field: box(ta), body: getComputedStyle(document.body).color };
      });
      for (const b of popup.buttons) {
        assert.ok(b.mine, `${vp.width}: a popup button is covered`);
        if (touch) assert.ok(b.h >= 44 && b.w >= 44, `${vp.width}: popup button ${b.w}x${b.h}`);
      }
      // Dictate: readable on the popup, and beside the field rather than under it.
      assert.ok(popup.dictate, 'dictate button present');
      assert.notEqual(popup.dictate.color, popup.body, 'dictate no longer inherits the page colour');
      assert.equal(popup.dictate.opacity, '1');
      assert.ok(popup.dictate.x >= popup.field.r, `dictate sits right of the field (${popup.dictate.x} vs ${popup.field.r})`);
      assert.ok(popup.dictate.y < popup.field.b && popup.dictate.b > popup.field.y, 'dictate shares the field row');
      await shot(p, `panels-${vp.width}-popup`);

      await p.keyboard.press('Escape');
      await p.locator('[data-question-notice]').waitFor({ state: 'visible' });

      // Opened on purpose. Phone targets are 44px; no side bar on the quote, no dot.
      await tapOrClick(p, p.locator('[data-question-notice]').getByRole('button', { name: "Answer the agent's question" }), touch);
      await p.getByText('Shorter, or just less bold?', { exact: true }).waitFor({ state: 'visible' });
      const panel = await p.evaluate(() => {
        const root = document.querySelector('[data-replies-ui]').shadowRoot;
        const size = (sel) => { const r = root.querySelector(sel).getBoundingClientRect(); return [r.width, r.height]; };
        return { close: size('#setaside'), send: size('#send'), quoteBar: getComputedStyle(root.querySelector('#ctx')).borderLeftWidth, dot: !!root.querySelector('.hd .dot') };
      });
      assert.equal(panel.quoteBar, '0px'); assert.equal(panel.dot, false);
      if (touch) {
        assert.ok(panel.close[0] >= 44 && panel.close[1] >= 44, `close ${panel.close}`);
        assert.ok(panel.send[1] >= 44, `send ${panel.send}`);
      }
      assert.equal((await state(p)).notice, false, 'one at a time: the notice is gone while the panel is open');
      await shot(p, `panels-${vp.width}-question-open`);
      await p.getByPlaceholder('Answer so the agent can carry on', { exact: true }).fill('Less bold');

      // Esc closes the panel first; the bar stays open, and the typed answer is kept.
      await p.keyboard.press('Escape');
      await p.waitForTimeout(300);
      const s2 = await state(p);
      assert.equal(s2.panel, false); assert.equal(s2.bar, true, `${vp.width}: Esc closed the panel, not the bar`);
      await tapOrClick(p, p.locator('[data-question-notice]').getByRole('button', { name: "Answer the agent's question" }), touch);
      assert.equal(await p.getByPlaceholder('Answer so the agent can carry on', { exact: true }).inputValue(), 'Less bold');

      // A popup opened while the panel is up closes it: one sheet at a time.
      await tapOrClick(p, p.locator('main h2').first(), touch);
      await p.locator('[data-annotation-popup]').waitFor({ state: 'visible' });
      await p.waitForTimeout(500);
      assert.equal((await state(p)).panel, false, `${vp.width}: the panel gives way to the popup`);
      await p.keyboard.press('Escape');
      await tapOrClick(p, p.locator('[data-question-notice]').getByRole('button', { name: "Answer the agent's question" }), touch);
      await p.getByText('Shorter, or just less bold?', { exact: true }).waitFor({ state: 'visible' });

      // Collapsing the bar closes the panel and releases its inset. A phone
      // sheet reserves its height; a side sheet floats and reserves nothing.
      if (touch) await p.waitForFunction(() => parseFloat(getComputedStyle(document.documentElement).paddingBottom) > 250, null, { timeout: 3000 }).catch(() => {});
      else await p.waitForTimeout(400);
      const before = await state(p);
      assert.ok(touch ? before.padBottom > 250 : before.padRight === 0, `${vp.width}: a phone sheet reserves its height, a side sheet floats (${before.padBottom}/${before.padRight})`);
      await tapOrClick(p, p.getByRole('button', { name: 'Exit', exact: true }), touch);
      await p.waitForTimeout(700);
      const after = await state(p);
      assert.equal(after.bar, false); assert.equal(after.panel, false); assert.equal(after.notice, false);
      assert.ok(after.padBottom < 150 && after.padRight === 0, `${vp.width}: inset released (${after.padBottom}/${after.padRight})`);
      await shot(p, `panels-${vp.width}-collapsed`);
      await p.context().close();
    }
  });

  await t.test('desktop: the notice steps aside for More and Settings', async () => {
    const p = await newPage(); await expand(p);
    await p.locator('[data-question-notice]').waitFor({ state: 'visible' });
    await p.locator('[data-review=more]').click();
    await p.waitForTimeout(200);
    assert.equal((await state(p)).notice, false, 'More menu');
    await p.getByRole('menuitem', { name: /Settings/ }).first().click();
    await p.waitForTimeout(1500);
    assert.deepEqual((({ panel, notice }) => ({ panel, notice }))(await state(p)), { panel: false, notice: false }, 'Settings');
    await shot(p, 'panels-1280-settings');
    await p.context().close();
  });

  await t.test('Talk without a speech provider: Esc, V, N, D and the mode buttons all leave', async () => {
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const touch = vp.width < 900;
      const p = await newPage(touch ? { viewport: vp, hasTouch: true, isMobile: true } : { viewport: vp });
      await expand(p);
      const talk = () => p.evaluate(() => {
        const panel = document.querySelector('[data-voice-ui]').shadowRoot.querySelector('section.panel');
        return { open: !panel.hidden, mode: [...document.querySelectorAll('[data-mode]')].find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.mode || '' };
      });
      const openTalk = async () => { await p.keyboard.press('v'); await p.waitForFunction(() => !document.querySelector('[data-voice-ui]').shadowRoot.querySelector('section.panel').hidden); };
      await openTalk();
      const primary = p.locator('[data-voice-ui] .foot .primary');
      await p.getByRole('button', { name: 'Type a note instead', exact: true }).waitFor({ state: 'visible' });
      assert.equal(await primary.isEnabled(), true, 'the primary action is never a dead end');
      if (touch) assert.equal(await p.getByText(/Esc returns to General/).count(), 0, 'no Esc wording on a phone');
      await shot(p, `panels-${vp.width}-talk-setup`);
      for (const [key, mode] of [['Escape', 'comment'], ['v', 'comment'], ['n', 'comment'], ['d', 'tweak']]) {
        if (!(await talk()).open) await openTalk();
        await p.keyboard.press(key);
        await p.waitForTimeout(200);
        assert.deepEqual(await talk(), { open: false, mode }, `${vp.width}: ${key} leaves Talk`);
        await p.evaluate(() => window.__AGENTATION_KIT_TWEAK__?.toggle(false));
      }
      if (!touch) {
        // The bar's buttons: Talk again toggles it off; Comment switches.
        await p.locator('[data-mode=voice]').click(); assert.equal((await talk()).open, true);
        await p.locator('[data-mode=voice]').click(); await p.waitForTimeout(150);
        assert.deepEqual(await talk(), { open: false, mode: 'comment' }, 'Talk again');
        await p.locator('[data-mode=voice]').click();
        await p.locator('[data-mode=comment]').click(); await p.waitForTimeout(150);
        assert.deepEqual(await talk(), { open: false, mode: 'comment' }, 'Comment button');
      } else {
        // The phone's mode sheet.
        await openTalk();
        await p.locator('[data-review=mode]').tap();
        await p.getByRole('menuitemradio', { name: /^Comment/ }).tap(); await p.waitForTimeout(200);
        assert.deepEqual(await talk(), { open: false, mode: 'comment' }, 'mode sheet: Comment');
      }
      await openTalk();
      await p.getByRole('button', { name: 'Type a note instead', exact: true }).click();
      await p.waitForTimeout(150);
      assert.deepEqual(await talk(), { open: false, mode: 'comment' }, 'Type a note instead switches to Comment');
      await p.context().close();
    }
    assert.deepEqual(errors, []);
  });
}
);
