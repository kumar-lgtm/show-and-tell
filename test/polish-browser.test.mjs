// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/polish-browser.test.mjs
// UX review round 5, polish: the question notice says its line whole (#2) and
// closes with the drawn X (#14), the bar's tooltips open above it (#3), every
// control in From the agent has our focus ring (#4), upstream's light-theme
// text and the tooltip key hint are 4.5:1 (#5, #6), Send pressed with nothing
// new is readable (#7) and its sheet agrees with the bar (#8), Agent activity
// says "Changes ready" once (#15), the agent's markers never sit on the text
// they point at (N15) and the phone popup is 312px wide (N16).
//
// Contrast is measured against what is painted under the text, in the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('round-5 polish', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 180000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const { kvSet } = await import('../server/kv-store.js');
  const { AGENT_WORK_KEY } = await import('../server/agent-work.js');
  let app;
  const html = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8')
    .replace('</head>', '<script src="/__review/loader.js"></script></head>');
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const name = uniqueName('polish');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true, agentWork: true, voice: true } });
  const browser = await chromium.launch();
  const project = openProject(name, { create: true });
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
  const note = (comment, element, extra = {}) => api(`sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), comment, reviewer: 'Ana', element, elementPath: `main > ${element}`, x: 30, y: 200, timestamp: Date.now(), ...extra,
  });
  // Two questions for Ana: open notes, nothing of hers to send, and this browser never sent.
  for (const [c, q] of [['Make the price bigger', 'Which size: 28 or 32?'], ['Tighten this', 'Shorter, or less bold?']]) {
    const a = await note(c, 'h2'); await project.act('reply', a.id, q);
  }
  // The agent's notes on the two targets that start at the page's 16px margin on a phone.
  await project.annotate(`${origin}/`, [
    { comment: 'Both plans say Start free trial', selector: '.card button', severity: 'blocking' },
    { comment: 'Say who Starter is for', selector: '.card p' },
    { comment: 'The heading is long', selector: 'h1' },
    { comment: 'The subhead promises too much', selector: 'h1 + p' },
  ], { create: true });
  const status = (state, message, extra = {}) => kvSet(name, AGENT_WORK_KEY, JSON.stringify({ state, message, updatedAt: Date.now(), ...extra }));
  status('listening', 'Listening for Send to agent.');

  const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
  const newPage = async (options = {}, light = false) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    await context.addInitScript((light) => {
      localStorage.setItem('feedback-toolbar-reviewer', 'Ana');
      if (light) localStorage.setItem('feedback-toolbar-theme', 'light');
    }, light);
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok && window.__AGENTATION_KIT_CRITIQUE_COUNT__ > 0);
    const shell = page.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first();
    if (options.hasTouch) await shell.tap(); else await shell.click();
    await page.waitForFunction(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
    await page.locator('[data-review=inbox]').waitFor({ state: 'visible' });
    await page.waitForTimeout(500); // the bar's controls fade in
    return page;
  };
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  const noticeLoc = (p) => p.locator('[data-question-notice]');
  // WCAG contrast of one element's text against what is painted under it.
  const contrastOf = (e) => {
    const parse = (s) => { const v = s.match(/rgba?\(([^)]+)\)/)[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const mix = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
    const up = (x) => x.parentElement || x.getRootNode()?.host || null;
    const stack = []; let x = e;
    while (x) { const c = parse(getComputedStyle(x).backgroundColor); if (c[3] > 0) { stack.push(c); if (c[3] >= 0.99) break; } x = up(x); }
    let b = [255, 255, 255]; for (let i = stack.length - 1; i >= 0; i--) b = mix(stack[i], b);
    let o = 1; x = e; while (x) { o *= Number(getComputedStyle(x).opacity); x = up(x); }
    const fg = parse(getComputedStyle(e).color); fg[3] *= o;
    const [l1, l2] = [lum(mix(fg, b)), lum(b)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  // Every visible element matching `sel` with its own text, and its contrast.
  const contrasts = (p, sel) => p.evaluate(({ sel, fn }) => {
    const contrast = new Function('return ' + fn)();
    return [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && e.textContent.trim())
      .map((e) => ({ text: e.textContent.trim().slice(0, 30), ratio: Math.round(contrast(e) * 100) / 100 }));
  }, { sel, fn: contrastOf.toString() });
  const assertReadable = (list, what) => {
    assert.ok(list.length, `${what}: something to measure`);
    for (const c of list) assert.ok(c.ratio >= 4.5, `${what} "${c.text}" ${c.ratio}:1`);
  };

  await t.test('#2 and #14: the notice says its line whole, sized to it, and closes with the drawn X', async () => {
    for (const [vp, phone] of [[{ width: 1280, height: 800 }, false], [{ width: 1440, height: 900 }, false], [{ width: 360, height: 780 }, true]]) {
      const p = await newPage(phone ? { viewport: vp, hasTouch: true, isMobile: true } : { viewport: vp });
      await noticeLoc(p).waitFor({ state: 'visible' });
      await p.waitForTimeout(300);
      const n = await noticeLoc(p).evaluate((el) => {
        const m = el.querySelector('.msg'), r = el.getBoundingClientRect(), x = el.querySelector('#nhide');
        return { text: m.textContent, clipped: m.scrollWidth > m.clientWidth + 0.5, left: r.left, right: r.right, width: r.width, svg: !!x.querySelector('svg'), glyph: x.textContent.trim() };
      });
      assert.equal(n.text, '2 questions from the agent', `${vp.width}`);
      assert.equal(n.clipped, false, `${vp.width}: the line is whole`);
      assert.ok(n.left >= 12 - 0.5 && n.right <= vp.width - 12 + 0.5, `${vp.width}: inside the 12px insets (${n.left}-${n.right})`);
      if (!phone) assert.ok(n.width < 320, `${vp.width}: as wide as its line, ${n.width}`);
      assert.deepEqual([n.svg, n.glyph], [true, ''], `${vp.width}: the drawn close, not a glyph`);
      await shot(p, `polish-${vp.width}-notice`);
      await p.context().close();
    }
  });

  await t.test('#3: the bar’s tooltips, ours and the toolbar’s, open above the notice', async () => {
    const p = await newPage();
    await noticeLoc(p).waitFor({ state: 'visible' });
    const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; });
    const clear = (a, b) => a.r <= b.l || b.r <= a.l || a.b <= b.t || b.b <= a.t;
    const n = await box(noticeLoc(p));
    const tip = p.locator('[data-bar-tip]');
    for (const key of ['inbox', 'agent', 'done', 'more']) {
      await p.locator(`[data-review=${key}]`).focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
      await tip.waitFor({ state: 'visible' });
      const b = await box(tip);
      assert.ok(clear(b, n), `${key} tooltip ${JSON.stringify(b)} over the notice ${JSON.stringify(n)}`);
    }
    await p.locator('[data-review=more]').blur();
    await p.mouse.move(5, 5); await p.waitForTimeout(200);
    await p.locator('[data-agentation-toolbar] button[aria-label="Exit"]').first().hover();
    const up = p.locator('[data-agentation-toolbar] [class*="buttonTooltip"]').filter({ hasText: 'Exit' });
    await p.waitForFunction(() => [...document.querySelectorAll('[data-agentation-toolbar] [class*="buttonTooltip"]')].some((e) => /Exit/.test(e.textContent) && getComputedStyle(e).opacity === '1'));
    const u = await box(up);
    assert.ok(clear(u, n), `Exit tooltip ${JSON.stringify(u)} over the notice ${JSON.stringify(n)}`);
    await shot(p, 'polish-1280-exit-tooltip');
    // The key hint in it is 4.5:1 (#6), dark here and light below.
    assertReadable(await contrasts(p, '[data-agentation-toolbar] [class*="buttonTooltip"] [class*="shortcut"]').then((l) => l.filter((c) => c.text === 'Esc')), 'dark Exit key hint');
    // Hidden, the notice gives the toolbar its tooltips back where they were.
    await noticeLoc(p).locator('#nhide').click();
    await p.waitForFunction(() => !document.querySelector('[data-agentation-toolbar]').style.getPropertyValue('--sk-tip-lift'));
    await p.context().close();
  });

  await t.test('#4: every control in From the agent shows the one focus ring', async () => {
    for (const phone of [false, true]) {
      const p = await newPage(phone ? PHONE : {});
      await p.evaluate(() => window.__AGENTATION_KIT_CRITIQUE__.open());
      const panel = p.locator('section[aria-label="From the agent"]');
      await panel.waitFor({ state: 'visible' });
      await panel.locator('.sk-x').focus();
      const seen = [];
      for (let i = 0; i < 8; i++) {
        const ring = await p.evaluate(() => {
          let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
          if (!a?.closest?.('section[aria-label="From the agent"]')) return null;
          const cs = getComputedStyle(a);
          return { what: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 24), visible: a.matches(':focus-visible'), style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor };
        });
        if (!ring) break;
        if (ring.visible) seen.push(ring);
        await p.keyboard.press('Tab');
      }
      assert.ok(seen.length >= 2, `${phone ? 'phone' : 'desktop'}: tabbed through ${seen.length} controls`);
      for (const r of seen) assert.deepEqual([r.style, r.width, r.color], ['solid', '2px', 'rgb(255, 199, 44)'], `${phone ? 'phone' : 'desktop'} ${r.what}`);
      await p.context().close();
    }
  });

  await t.test('#5 and #6: upstream Settings, the Layout palette, the popup and the key hint are 4.5:1 in the light theme', async () => {
    const p = await newPage({}, true);
    await p.mouse.move(5, 5);
    await p.locator('[data-agentation-toolbar] button[aria-label="Exit"]').first().hover();
    await p.waitForFunction(() => [...document.querySelectorAll('[data-agentation-toolbar] [class*="buttonTooltip"]')].some((e) => /Exit/.test(e.textContent) && getComputedStyle(e).opacity === '1'));
    assertReadable(await contrasts(p, '[data-agentation-toolbar] [class*="buttonTooltip"] [class*="shortcut"]').then((l) => l.filter((c) => c.text === 'Esc')), 'light Exit key hint');
    await p.mouse.move(5, 5);
    await p.locator('[data-review=more]').click();
    await p.getByRole('menuitem', { name: /^Settings$/ }).first().click();
    await p.waitForFunction(() => document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
    await p.waitForTimeout(400);
    const settings = '[data-agentation-root] [class*="settingsPanel___"]';
    assertReadable(await contrasts(p, `${settings} [class*="settingsLabel___"]`), 'Settings label');
    const boxes = await contrasts(p, `${settings} [class*="styles-module__label___"]`);
    assert.deepEqual(boxes.map((c) => c.text).sort(), ['Block page interactions', 'Clear on copy/send']);
    assertReadable(boxes, 'Settings checkbox');
    await shot(p, 'polish-light-settings');
    await p.keyboard.press('Escape');
    await p.locator('[data-review=more]').click();
    await p.getByRole('menuitem', { name: /Layout moves/ }).first().click();
    await p.locator('[data-agentation-root] [class*="paletteSectionTitle___"]').first().waitFor({ state: 'visible' });
    await p.waitForTimeout(300);
    assertReadable(await contrasts(p, '[data-agentation-root] [class*="paletteSectionTitle___"]'), 'palette section head');
    assertReadable(await contrasts(p, '[data-agentation-root] [class*="canvasToggleLabel___"]'), 'Wireframe a new page');
    await shot(p, 'polish-light-palette');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.locator('main h2').first().click();
    await p.locator('[data-annotation-popup]').waitFor({ state: 'visible' });
    await p.waitForTimeout(300);
    assertReadable(await contrasts(p, '[data-annotation-popup] [class*="cancel___"]'), 'popup Cancel');
    await p.context().close();
  });

  await t.test('#7 and #8: Send with nothing new reads, and its sheet agrees with the bar', async () => {
    for (const light of [false, true]) {
      const p = await newPage({}, light);
      const send = p.locator('[data-review=done]');
      assert.equal(await send.getAttribute('data-state'), 'empty', 'nothing of Ana’s to send');
      assert.match(await send.getAttribute('aria-label'), /Nothing to send yet/);
      await send.click();
      const sheet = p.locator('section.panel[aria-label="Review tools"]');
      await sheet.getByText(/^The agent has \d+ notes\. Nothing new to send\.$/).waitFor();
      assert.equal(await sheet.getByRole('button', { name: 'Keep reviewing', exact: true }).getAttribute('class'), 'primary');
      assert.equal(await sheet.getByRole('button', { name: 'Send again', exact: true }).getAttribute('class'), 'ghost');
      assert.equal(await sheet.locator('.actions button.primary', { hasText: 'Send' }).count(), 0);
      assert.doesNotMatch(await sheet.textContent(), /You can send now/);
      await p.waitForTimeout(300);
      assert.equal(await send.getAttribute('aria-pressed'), 'true');
      const label = await send.locator('.sk-label').evaluate(contrastOf);
      assert.ok(label >= 4.5, `${light ? 'light' : 'dark'} pressed Send label ${label.toFixed(2)}:1`);
      await shot(p, `polish-${light ? 'light' : 'dark'}-send-nothing-new`);
      await p.context().close();
    }
  });

  await t.test('#15: Agent activity says Changes ready once', async () => {
    status('complete', 'Changes ready.', { changes: [{ noteId: 'a', summary: 'Title is blue', status: 'resolved' }] });
    const p = await newPage();
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.check());
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.toggle());
    const dialog = p.getByRole('dialog', { name: 'Agent activity' });
    await dialog.getByText('Title is blue').waitFor();
    assert.equal(await dialog.getByText(/^Changes ready\.?$/).count(), 1, 'the title only');
    await p.context().close();
    status('listening', 'Listening for Send to agent.');
  });

  await t.test('N15: no agent marker, nor its touch target, covers the first letters it points at', async () => {
    for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 780 }, { width: 1280, height: 800 }]) {
      const touch = vp.width < 900;
      const p = await newPage(touch ? { viewport: vp, hasTouch: true, isMobile: true } : { viewport: vp });
      await p.waitForTimeout(600); // the markers settle after the bar opens
      const hits = await p.evaluate(() => {
        const out = [];
        for (const sel of ['.card p', '.card button', 'h1', 'h1 + p']) {
          const e = document.querySelector(sel);
          const range = document.createRange(); range.selectNodeContents(e);
          const line = range.getClientRects()[0];
          // A marker may reach 3px into the corner of the line, in its
          // leading, as designed; past that it is on the letters. It was
          // 12x16px of "Pr" and 14x11px of "Pi" at 390.
          for (let x = line.left + 0.5; x < line.left + 30; x += 1) {
            for (let y = line.top + 0.5; y < line.bottom - 1; y += 1) {
              if (x < line.left + 4 && y < line.top + 4) continue;
              const at = document.elementFromPoint(x, y);
              if (at?.closest?.('.sk-crit-dot')) out.push(`${sel} ${Math.round(x - line.left)},${Math.round(y - line.top)} into the line, ${at.textContent}`);
            }
          }
        }
        return { out, markers: document.querySelectorAll('.sk-crit-dot:not([hidden])').length };
      });
      assert.equal(hits.markers, 4, `${vp.width}: the agent's four markers are on the page`);
      assert.deepEqual(hits.out.slice(0, 6), [], `${vp.width}: a marker over its text`);
      await shot(p, `polish-${vp.width}-markers`);
      await p.context().close();
    }
  });

  await t.test('N16: the comment popup is 312px on a phone, as on a desktop, inside the 20px margins', async () => {
    for (const [opts, w] of [[PHONE, 390], [{}, 1280], [{ viewport: { width: 330, height: 700 }, hasTouch: true, isMobile: true }, 330]]) {
      const p = await newPage(opts);
      const h2 = p.locator('main h2').first();
      if (opts.hasTouch) await h2.tap(); else await h2.click();
      const pop = p.locator('[data-annotation-popup]');
      await pop.waitFor({ state: 'visible' });
      await p.waitForTimeout(400);
      const r = await pop.evaluate((e) => { const b = e.getBoundingClientRect(); return { w: Math.round(b.width), l: b.left, r: b.right }; });
      assert.equal(r.w, Math.min(312, w - 40), `${w}: popup width`);
      if (opts.hasTouch) assert.ok(r.l >= 19.5 && r.r <= w - 19.5, `${w}: inside the margins ${r.l}-${r.r}`);
      await p.context().close();
    }
  });

  await t.test('no page errors', () => assert.deepEqual(errors, []));
});
