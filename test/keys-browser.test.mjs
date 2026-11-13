// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/keys-browser.test.mjs
// UX review round 2: typing in our own fields is typing (N1), the collapsed
// bar opens from the keyboard (N5), every dictate field has its mic beside it
// and opens in view (N10), Esc closes Settings first (N12), markers and
// Settings have 44px targets on touch (N13, N14) and the hover label is 12px (R13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('keyboard, fields and upstream chrome', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 150000,
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
  const name = uniqueName('keys');
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
  const note = (comment, element, y) => api(`sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), comment, reviewer: 'Ana', element, elementPath: `main > ${element}`, x: 30, y, timestamp: Date.now(),
  });
  // Two notes and a question, all Ana's: X twice would clear all three.
  await note('Tighten this', 'h1', 140); await note('Too long', 'p', 260);
  const q = await note('Make the price bigger', 'h2', 400);
  await project.act('reply', q.id, 'Which size: 28 or 32?');
  const open = async () => (await api(`sessions/${session.id}`)).annotations.filter((a) => a.status !== 'dismissed' && a.status !== 'resolved').length;
  const newPage = async (options = {}) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    await context.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'Ana'));
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    return page;
  };
  const SHELL = '[data-agentation-toolbar] [class*="toolbarContainer"]';
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  const bar = (p) => p.evaluate(() => {
    const c = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]');
    return {
      expanded: /expanded/.test(c.className),
      label: c.getAttribute('aria-label'), keys: c.getAttribute('aria-keyshortcuts'),
      settings: !!document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'),
      layout: !!document.querySelector('[data-agentation-root] [class*="palette___"]'),
      markers: document.querySelectorAll('[data-agentation-root] [data-annotation-marker]').length,
      paused: document.querySelector('[data-agentation-toolbar] button[aria-label="Pause animations"]')?.dataset.active === 'true',
      focus: document.activeElement?.closest?.('[data-agentation-toolbar]') ? (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim()) : null,
    };
  });
  // The field, its mic and the button under it, and the sheet's scroller.
  const form = (p, fieldSel, actionText) => p.evaluate(([fieldSel, actionText]) => {
    const root = [...document.querySelectorAll('.sk-edit-ui')].map((h) => h.shadowRoot).find((r) => r.querySelector(fieldSel));
    const f = root.querySelector(fieldSel), mic = f.parentElement.querySelector('[data-voice-dictate]');
    const act = [...root.querySelectorAll('button')].filter((b) => b.textContent.trim() === actionText).pop();
    let sc = f.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
    const R = (n) => n && n.getBoundingClientRect().toJSON();
    return { field: R(f), mic: R(mic), action: R(act), scroller: R(sc), value: f.value, focused: root.activeElement === f };
  }, [fieldSel, actionText]);

  await t.test('desktop: the collapsed bar opens from the keyboard and says what it is', async () => {
    const p = await newPage();
    let s = await bar(p);
    assert.equal(s.expanded, false);
    assert.equal(s.label, 'Open review toolbar', 'the collapsed toggle is named, not its hidden controls run together');
    assert.match(s.keys, /Meta\+Shift\+F/);
    await p.focus(SHELL); await p.keyboard.press('Enter');
    await p.waitForFunction(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
    await p.waitForTimeout(100);
    s = await bar(p);
    assert.equal(s.label, null, 'open, the shell is no longer a button and drops the name');
    assert.equal(s.keys, null);
    assert.ok(s.focus, 'focus lands on a bar control');
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => /collapsed/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
    await p.waitForFunction(() => document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getAttribute('aria-label') === 'Open review toolbar');
    await p.focus(SHELL); await p.keyboard.press(' ');
    await p.waitForFunction(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
    await p.close();
  });

  await t.test('desktop: typing p, x, h and l in the inbox Answer field fires no shortcut', async () => {
    const p = await newPage();
    await p.locator(SHELL).first().click();
    await p.locator('[data-review=inbox]').click();
    await p.getByRole('button', { name: 'Answer' }).first().click();
    const before = await bar(p);
    assert.equal(before.markers, 3);
    const text = 'Use 32px, then tidy the line height. Help explain px';
    await p.keyboard.type(text, { delay: 10 });
    await p.waitForTimeout(300);
    const f = await form(p, '#sk-review-answer', 'Send answer');
    assert.equal(f.value, text, 'every letter arrives in the field');
    const after = await bar(p);
    assert.equal(after.layout, false, 'L did not open Layout mode');
    assert.equal(after.markers, 3, 'H did not hide the markers, X did not clear them');
    assert.equal(after.paused, false, 'P did not pause animations');
    assert.equal(await open(), 3, 'no note was cleared on the server');
    // N10: the mic sits beside the field, top-aligned, not on a row under it.
    assert.ok(Math.abs(f.mic.top - f.field.top) < 2, `mic top ${f.mic.top} vs field top ${f.field.top}`);
    assert.ok(f.mic.left >= f.field.right, 'mic is to the right of the field');
    assert.ok(f.action.top >= f.field.bottom && f.action.top - f.field.bottom < 20, 'Send answer follows the field directly');
    assert.equal(f.focused, true, 'wrapping the field kept its focus');
    await shot(p, 'keys-1280-answer');
    await p.close();
  });

  await t.test('desktop: Esc closes Settings first, then the bar; the hover label is 12px', async () => {
    const p = await newPage();
    await p.locator(SHELL).first().click();
    await p.evaluate(() => document.querySelector('[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="Settings"]').click());
    await p.waitForFunction(() => document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    let s = await bar(p);
    assert.equal(s.settings, false, 'the first Esc closes Settings');
    assert.equal(s.expanded, true, 'and leaves the bar open');
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    s = await bar(p);
    assert.equal(s.expanded, false, 'the second Esc collapses the bar');
    await p.locator(SHELL).first().click();
    await p.mouse.move(400, 330); await p.mouse.move(420, 340);
    const label = p.locator('[data-agentation-root] [class*="hoverTooltip___"]');
    await label.waitFor({ state: 'visible' });
    assert.equal(await label.evaluate((n) => getComputedStyle(n).fontSize), '12px');
    await p.close();
  });

  await t.test('phone: 44px marker and Settings targets, Answer opens whole inside its sheet', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await p.locator(SHELL).first().tap();
    await p.waitForFunction(() => document.querySelector('[data-agentation-root] [data-annotation-marker]'));
    await p.waitForTimeout(600); // the markers' entrance animation scales them in
    const m = await p.evaluate(() => {
      // One whose hit area is on screen on every side (the h1's marker sits at the left edge).
      const all = [...document.querySelectorAll('[data-agentation-root] [data-annotation-marker]')];
      const k = all.find((n) => { const b = n.getBoundingClientRect(); return b.left > 24 && b.right < innerWidth - 24 && b.top > 24; }) || all[0], r = k.getBoundingClientRect();
      const y = r.top + r.height / 2, x = r.left + r.width / 2;
      return { w: k.offsetWidth, near: [[x + 19, y], [x - 19, y], [x, y + 19], [x, y - 19]].map(([a, b]) => !!document.elementFromPoint(a, b)?.closest('[data-annotation-marker]')) };
    });
    assert.equal(m.w, 22, 'the marker is still drawn at 22px');
    assert.deepEqual(m.near, [true, true, true, true], 'a tap 19px from the centre still lands on the marker');

    await p.evaluate(() => document.querySelector('[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="Settings"]').click());
    await p.waitForFunction(() => document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => {
      const s = document.querySelector('[class*="settingsPanel___"][class*="enter"]'), r = s.getBoundingClientRect();
      const b = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect();
      const page = s.querySelector('[class*="settingsPage___"]');
      const small = [...page.querySelectorAll('button,a,input,label')].filter((n) => n.getClientRects().length)
        .map((n) => ({ t: (n.textContent || n.getAttribute('aria-label') || n.type).trim().slice(0, 30), h: Math.round(n.getBoundingClientRect().height) }))
        .filter((n) => n.h < 44);
      return { left: r.left, right: r.right, bottom: r.bottom, height: r.height, barLeft: b.left, barRight: b.right, barTop: b.top, width: document.documentElement.clientWidth, small };
    });
    // UX review 4, N12: the same 12px inset as every other phone sheet (it spanned the bar, 20px in).
    assert.ok(Math.abs(st.left - 12) < 1 && Math.abs(st.right - (st.width - 12)) < 1, `Settings is a full-width sheet, 12px from each edge (${st.left}–${st.right})`);
    assert.ok(st.bottom <= st.barTop, 'and sits above it');
    assert.ok(st.height <= 844 * 0.55 + 1, `capped at 55% of the height (${st.height})`);
    assert.deepEqual(st.small, [], 'every Settings target is 44px tall');
    await shot(p, 'keys-390-settings');
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => !document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));

    await p.locator('[data-review=inbox]').tap();
    await p.getByRole('button', { name: 'Answer' }).first().tap();
    await p.waitForTimeout(400);
    const f = await form(p, '#sk-review-answer', 'Send answer');
    assert.ok(f.scroller, 'the inbox sheet scrolls');
    assert.ok(Math.abs(f.mic.top - f.field.top) < 2 && f.mic.left >= f.field.right, 'mic beside the field on a phone too');
    assert.ok(f.action.bottom <= f.scroller.bottom + 1, `Send answer (${f.action.bottom}) is inside the sheet (${f.scroller.bottom})`);
    assert.ok(f.field.top >= f.scroller.top - 1, 'and the field is not scrolled off the top');
    await shot(p, 'keys-390-answer');
    await p.close();
  });

  await t.test('no page errors', () => assert.deepEqual(errors, []));
});
