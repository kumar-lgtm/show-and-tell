// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/focus-browser.test.mjs
// UX review round 4: focus never falls to the page (F-Add, F-Answer, F-Return),
// the Decided fold opens in view (F-Decided) and names its notes once (N2), the
// light theme's small text is 4.5:1 (N6), one panel header (N13), the phone's
// mode button keeps its width and More draws the viewport it is on (N16), and
// Agent activity says "Set aside" as the inbox does (R11).
// UX review round 5, the focus group: focus is kept by row and control through
// any later re-render (F-Answer), one floating layer at a time (#1), Talk's
// Start, Stop, setup and Esc (#9, #10, #11), the Tweak panel, Edit text and the
// Decided fold (#12), Fix it and Undo (#13), and one page inset per Talk pass (#18).
// UX review round 6, the flow group: no half-covered component tooltip (N1),
// Exit waits behind a typed note (N3), the popup's Esc and Cancel return focus
// (N4), Esc in a reason keeps it (N5), the More menu's ring and arrows (N11),
// and Send N lands on the bar's Send (N12).
//
// Every focus check waits a full second after the action: the losses this
// covers happened 150ms to 1.3s later (an exit animation, a stream re-render).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('focus, panels, headers and bar polish', {
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
  const name = uniqueName('focus');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true, agentWork: true, voice: true },
    voiceLimits: { requestsPerMinute: 100 }, voiceBudget: null,
    voiceTranscriber: { id: 'qa-controlled', disclosure: 'Controlled QA transcription.', async transcribe({ durationMs }) { return { text: 'Keep this spoken feedback.', segments: [{ start: 0, end: durationMs / 1000, text: 'Keep this spoken feedback.' }] }; } } });
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
  await note('Tighten this', 'h1');
  const q = await note('Make the price bigger', 'h2');
  await project.act('reply', q.id, 'Which size: 28 or 32?');
  // Three critique notes to decide, and a fourth decided before the page loads.
  const { annotations: crit } = await project.annotate(`${origin}/`, [
    { comment: 'Both plans say Start free trial', selector: '.card button', severity: 'blocking' },
    { comment: 'The Starter description says what it costs but not who it is for', selector: '.card p' },
    { comment: 'The subhead promises too much too early', selector: 'h1 + p' },
    { comment: 'The footer links are too small', selector: 'footer' },
  ], { create: true });
  await api(`annotations/${crit[3].id}/decision`, { decision: 'not-an-issue', reason: 'Fine as is', reviewer: 'Ana' });
  const [crit1, crit4] = [crit[0].id, crit[3].id];
  const status = (state, message, extra = {}) => kvSet(name, AGENT_WORK_KEY, JSON.stringify({ state, message, updatedAt: Date.now(), ...extra }));
  status('listening', 'Listening for Send to agent.');

  const newPage = async (options = {}, light = false) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    await context.addInitScript((light) => {
      localStorage.setItem('feedback-toolbar-reviewer', 'Ana');
      if (light) localStorage.setItem('feedback-toolbar-theme', 'light');
      // A controlled microphone (as in voice-browser): Talk records without a device.
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] });
      window.MediaRecorder = class { static isTypeSupported() { return true; } constructor() { this.mimeType = 'audio/webm'; this.state = 'inactive'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; setTimeout(() => { this.ondataavailable?.({ data: new Blob([new Uint8Array([0x1a,0x45,0xdf,0xa3]), 'qa-audio'], { type: this.mimeType }) }); this.onstop?.(); }, 0); } };
    }, light);
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_HEALTH__?.ok && window.__AGENTATION_KIT_CRITIQUE_COUNT__ > 0);
    const shell = page.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first();
    if (options.hasTouch) await shell.tap(); else await shell.click();
    await page.waitForFunction(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
    await page.locator('[data-review=inbox]').waitFor({ state: 'visible' });
    return page;
  };
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  // The focused element, through our shadow roots, in words a failure can show.
  const active = (p) => p.evaluate(() => {
    let a = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    return { tag: a?.tagName, review: a?.dataset?.review || '', mode: a?.dataset?.mode || '', label: a?.getAttribute?.('aria-label') || '', annotation: a?.dataset?.annotation || '', focus: a?.dataset?.focus || '', role: a?.getAttribute?.('role') || '' };
  });
  const after = async (p, ms = 1000) => { await p.waitForTimeout(ms); return active(p); };
  const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
  // A fresh question for each test that answers one.
  const question = async (comment, element, ask) => { const n = await note(comment, element); await project.act('reply', n.id, ask); return n; };
  // Answer a question in the inbox, opened from the keyboard; returns its row.
  const answer = async (p, id, text, touch = false) => {
    await p.locator('[data-review=inbox]').focus(); await p.keyboard.press('Enter');
    const row = p.locator(`article.row[data-annotation="${id}"]`);
    const press = (l) => (touch ? l.tap() : l.click());
    await press(row.getByRole('button', { name: 'Answer', exact: true }));
    await p.locator('#sk-review-answer').fill(text);
    await press(p.getByRole('button', { name: 'Send answer', exact: true }));
    return row;
  };
  const reviewPanel = (p) => p.locator('section[aria-label="Review tools"]');
  const expanded = (p) => p.evaluate(() => /expanded/.test(document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').className));
  // WCAG contrast of one element's text against what is painted under it.
  const contrast = (p, sel) => p.locator(sel).first().evaluate((e) => {
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
  });

  await t.test('F-Add: after Add, by Enter or by click, focus is on the current mode', async () => {
    const p = await newPage();
    await p.locator('h1 + p').click({ position: { x: 200, y: 8 } });
    const field = p.getByPlaceholder('What should change?', { exact: true });
    await field.fill('Say who it is for'); await field.press('Enter');
    let a = await after(p);
    assert.equal(a.mode, 'comment', `Enter: focus on ${JSON.stringify(a)}`);
    await p.locator('h1').click({ position: { x: 40, y: 10 } });
    await field.fill('Shorter'); await p.getByRole('button', { name: 'Add', exact: true }).click();
    a = await after(p);
    assert.equal(a.mode, 'comment', `Add: focus on ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Add on a phone: focus goes to the mode button', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await p.locator('h1 + p').tap();
    await p.getByPlaceholder('What should change?', { exact: true }).fill('Phone note');
    await p.getByRole('button', { name: 'Add', exact: true }).tap();
    const a = await after(p);
    assert.equal(a.review, 'mode', `focus on ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Answer: focus stays on the answered row through every re-render', async () => {
    const p = await newPage();
    await p.locator('[data-review=inbox]').focus(); await p.keyboard.press('Enter');
    const row = p.locator(`article.row[data-annotation="${q.id}"]`);
    await row.getByRole('button', { name: 'Answer', exact: true }).click();
    await p.locator('#sk-review-answer').fill('32, please');
    await p.getByRole('button', { name: 'Send answer', exact: true }).click();
    let a = await after(p);
    assert.equal(a.annotation, q.id, `1s after Send answer: ${JSON.stringify(a)}`);
    // Another reviewer's note re-renders the list from the stream: a new row node.
    const before = await row.elementHandle();
    await note('Ben says the footer is busy', 'footer', { reviewer: 'Ben' });
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.refresh());
    await p.waitForFunction((el) => !el.isConnected, before);
    a = await after(p, 600);
    assert.equal(a.annotation, q.id, `after a re-render: ${JSON.stringify(a)}`);
    await shot(p, 'focus-answered');
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.review, 'inbox', `Esc: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Answer, round 5: focus is kept by row and control, past the hold, through a later re-render', async () => {
    const q2 = await question('The footer is too long', 'footer', 'Drop the address line?');
    const p = await newPage();
    const row = await answer(p, q2.id, 'Yes, drop it');
    // Well past the 5s hold that used to be all there was.
    let a = await after(p, 5600);
    assert.equal(a.annotation, q2.id, `5.6s after Send answer: ${JSON.stringify(a)}`);
    // A critique arriving over the stream re-renders the list with new nodes.
    const before = await row.elementHandle();
    await p.evaluate(() => document.dispatchEvent(new CustomEvent('agentation-kit:critique-count', { detail: { count: 9 } })));
    await p.waitForFunction((el) => !el.isConnected, before);
    a = await after(p, 400);
    assert.equal(a.annotation, q2.id, `after a critique arrived: ${JSON.stringify(a)}`);
    // And again from a refresh, as another reviewer's note would.
    const again = await row.elementHandle();
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.refresh());
    await p.waitForFunction((el) => !el.isConnected, again);
    a = await after(p, 400);
    assert.equal(a.annotation, q2.id, `after a refresh: ${JSON.stringify(a)}`);
    // A press on the page lets go: no re-render pulls focus back after it.
    await p.locator('h1').click({ position: { x: 4, y: 4 } });
    await p.evaluate(() => window.__AGENTATION_KIT_REVIEW__.refresh());
    a = await after(p, 400);
    assert.notEqual(a.annotation, q2.id, `the reviewer moved on: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Answer on a phone: the answered row keeps focus and is in the sheet\'s view', async () => {
    // Answered, it moves from Needs you at the top to Not sent yet, under
    // newer notes: at 390 it landed below the sheet's bottom edge.
    const q3 = await question('The menu is cramped', 'h2', 'All of it, or the links only?');
    for (const words of ['Card one is loud', 'Card two is quiet', 'The price wraps', 'Tighter footer', 'More room above the fold', 'The badge is tiny']) await note(words, 'p');
    const p = await newPage(phone);
    const row = await answer(p, q3.id, 'The links only', true);
    const a = await after(p, 3000);
    assert.equal(a.annotation, q3.id, `focus on ${JSON.stringify(a)}`);
    const [r, sheet] = [await row.boundingBox(), await reviewPanel(p).boundingBox()];
    assert.ok(r.y >= sheet.y - 1 && r.y + Math.min(r.height, sheet.height) <= sheet.y + sheet.height + 1, `the row is in the sheet's view: ${JSON.stringify({ r, sheet })}`);
    await shot(p, 'focus-answered-phone');
    await p.context().close();
  });

  await t.test('F-Return: Esc puts focus back where each panel was opened', async () => {
    const p = await newPage();
    // From the agent, opened from the agent button (it carries the critique count).
    await p.locator('[data-review=agent]').focus(); await p.keyboard.press('Enter');
    const crit = p.locator('section[aria-label="From the agent"]');
    await crit.waitFor({ state: 'visible' });
    await p.keyboard.press('Escape');
    let a = await after(p);
    assert.equal(await crit.isVisible(), false);
    assert.equal(a.review, 'agent', `From the agent: ${JSON.stringify(a)}`);
    // More.
    await p.locator('[data-review=more]').focus(); await p.keyboard.press('Enter');
    await p.locator('.menu[aria-label="More tools"]').waitFor({ state: 'visible' });
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.review, 'more', `More: ${JSON.stringify(a)}`);
    // The Layout palette and Settings: focus goes in as they open, back to More on Esc.
    for (const [item, label] of [[/Layout moves/, 'Layout moves'], [/^Settings$/, 'Settings']]) {
      await p.keyboard.press('Enter');
      const menuItem = p.getByRole('menuitem', { name: item });
      await menuItem.waitFor(); await menuItem.focus(); await p.keyboard.press('Enter');
      a = await after(p, 500);
      assert.deepEqual([a.label, a.role], [label, 'dialog'], `${label} open: ${JSON.stringify(a)}`);
      await shot(p, `focus-${label.split(' ')[0].toLowerCase()}`);
      await p.keyboard.press('Escape');
      a = await after(p);
      assert.equal(a.review, 'more', `${label} Esc: ${JSON.stringify(a)}`);
      assert.equal(await expanded(p), true, `${label}: one Esc closes only it, not the bar`);
    }
    assert.equal(await p.evaluate(() => !!document.querySelector('[data-agentation-root] [class*="palette___"]')), false, 'the palette closed');
    // Agent activity: back to the agent button.
    await p.locator('[data-review=agent]').focus();
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.toggle());
    await p.getByRole('dialog', { name: 'Agent activity' }).waitFor();
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.review, 'agent', `Agent activity: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Return on a phone: From the agent and Agent activity return to the inbox', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await p.locator('[data-review=inbox]').focus();
    await p.evaluate(() => window.__AGENTATION_KIT_CRITIQUE__.open());
    await p.locator('section[aria-label="From the agent"]').waitFor({ state: 'visible' });
    await p.keyboard.press('Escape');
    let a = await after(p);
    assert.equal(a.review, 'inbox', `From the agent: ${JSON.stringify(a)}`);
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.toggle());
    await p.getByRole('dialog', { name: 'Agent activity' }).waitFor();
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.review, 'inbox', `Agent activity: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('F-Decided and N2: the fold opens in view, keeps focus, and names A4 once', async () => {
    const p = await newPage();
    await p.locator('[data-review=agent]').click();
    const crit = p.locator('section[aria-label="From the agent"]');
    await crit.waitFor({ state: 'visible' });
    const fold = crit.getByRole('button', { name: /^Decided 1/ });
    assert.equal(await fold.getAttribute('aria-expanded'), 'false');
    const turn = () => crit.locator('.group.fold .chev').evaluate((n) => getComputedStyle(n).transform);
    assert.equal(await turn(), 'none', 'the chevron points down while folded');
    await fold.focus(); await p.keyboard.press('Enter');
    await p.waitForTimeout(400);
    assert.equal(await fold.getAttribute('aria-expanded'), 'true');
    assert.notEqual(await turn(), 'none', 'the chevron turns with aria-expanded');
    const a = await active(p);
    assert.equal(a.focus, 'fold', `the fold keeps focus: ${JSON.stringify(a)}`);
    const row = crit.locator('.what.earlier');
    assert.equal(await row.locator('.num').textContent(), 'A4', 'A4, not AA4');
    const undo = row.getByRole('button', { name: 'Undo the decision on A4', exact: true });
    const [u, list] = [await undo.boundingBox(), await crit.locator('.list').boundingBox()];
    assert.ok(u.y >= list.y && u.y + u.height <= list.y + list.height + 0.5, `Undo inside the list's view: ${JSON.stringify({ u, list })}`);
    await shot(p, 'focus-decided');
    await p.context().close();
  });

  await t.test('#12: Undo in the Decided fold focuses the restored note\'s first decision, in view', async () => {
    const p = await newPage();
    await p.locator('[data-review=agent]').click();
    const crit = p.locator('section[aria-label="From the agent"]');
    await crit.waitFor({ state: 'visible' });
    await crit.getByRole('button', { name: /^Decided 1/ }).click();
    const undo = crit.getByRole('button', { name: 'Undo the decision on A4', exact: true });
    await undo.focus(); await p.keyboard.press('Enter');
    const a = await after(p);
    assert.equal(a.focus, `${crit4}:decide`, `focus on ${JSON.stringify(a)}`);
    const [b, list] = [await crit.locator(`article[data-id="${crit4}"] [data-focus="${crit4}:decide"]`).boundingBox(), await crit.locator('.list').boundingBox()];
    assert.ok(b.y >= list.y - 0.5 && b.y + b.height <= list.y + list.height + 0.5, `the decision is in the list's view: ${JSON.stringify({ b, list })}`);
    await p.context().close();
    // Decided again, as the tests after this one expect.
    await api(`annotations/${crit4}/decision`, { decision: 'not-an-issue', reason: 'Fine as is', reviewer: 'Ana' });
  });

  await t.test('#13: Fix it from the keyboard lands on its Undo, and Undo on its Fix it', async () => {
    const p = await newPage();
    await p.locator('[data-review=agent]').focus(); await p.keyboard.press('Enter');
    const crit = p.locator('section[aria-label="From the agent"]');
    await crit.waitFor({ state: 'visible' });
    const row = crit.locator(`article[data-id="${crit1}"]`);
    await row.getByRole('button', { name: 'Fix it', exact: true }).focus(); await p.keyboard.press('Enter');
    let a = await after(p);
    assert.equal(a.focus, `${crit1}:undo`, `after Fix it: ${JSON.stringify(a)}`);
    await p.keyboard.press('Enter');
    a = await after(p);
    assert.equal(a.focus, `${crit1}:fix`, `after Undo: ${JSON.stringify(a)}`);
    assert.equal(await row.getByRole('button', { name: 'Fix it', exact: true }).isVisible(), true, 'the note is open again');
    await p.context().close();
  });

  await t.test('N13: one header: a 15px/700 title and the same drawn close, 28px and 44px on a phone', async () => {
    for (const phone of [false, true]) {
      const p = await newPage(phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : {});
      const want = phone ? 44 : 28;
      const header = (panel) => p.locator(panel).first().evaluate((s) => {
        const title = s.querySelector('.hd .sk-title'), x = s.querySelector('.hd .sk-x');
        const r = x.getBoundingClientRect(), cs = getComputedStyle(title);
        return { size: cs.fontSize, weight: cs.fontWeight, w: Math.round(r.width), h: Math.round(r.height), svg: !!x.querySelector('svg'), text: x.textContent.trim() };
      });
      const check = (h, what) => assert.deepEqual(h, { size: '15px', weight: '700', w: want, h: want, svg: true, text: '' }, what);
      await p.locator('[data-review=inbox]').click();
      check(await header('section[aria-label="Review tools"]'), 'inbox');
      await p.keyboard.press('Escape');
      await p.evaluate(() => window.__AGENTATION_KIT_CRITIQUE__.open());
      await p.locator('section[aria-label="From the agent"]').waitFor({ state: 'visible' });
      check(await header('section[aria-label="From the agent"]'), 'From the agent');
      await p.keyboard.press('Escape');
      await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.toggle());
      await p.getByRole('dialog', { name: 'Agent activity' }).waitFor();
      check(await header('section[aria-label="Agent activity"]'), 'Agent activity');
      await p.context().close();
    }
  });

  await t.test('N6: light-theme small text is 4.5:1; the tooltip key hint too, dark and light', async () => {
    for (const light of [false, true]) {
      const p = await newPage({}, light);
      await p.locator('[data-mode=comment]').focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
      await p.locator('.tip .k').waitFor({ state: 'visible' });
      const k = await contrast(p, '.tip .k');
      assert.ok(k >= 4.5, `${light ? 'light' : 'dark'} key hint ${k.toFixed(2)}:1`);
      await p.locator('[data-review=more]').click();
      const clear = await contrast(p, '.menu .danger');
      assert.ok(clear >= 4.5, `${light ? 'light' : 'dark'} Clear ${clear.toFixed(2)}:1`);
      await p.context().close();
    }
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, true);
    await p.waitForTimeout(500); // the bar's controls fade in
    const label = await contrast(p, '[data-review=mode] .sk-label');
    assert.ok(label >= 4.5, `light phone mode label ${label.toFixed(2)}:1`);
    await shot(p, 'focus-light-phone-bar');
    await p.context().close();
  });

  await t.test('N16: the phone mode button keeps one width; More draws the viewport it is on', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const geo = () => p.evaluate(() => {
      const b = document.querySelector('[data-review=mode]').getBoundingClientRect();
      const bar = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect();
      return { pick: Math.round(b.width), left: Math.round(bar.left) };
    });
    await p.waitForTimeout(800); // the bar settles its width after opening
    const sizes = [];
    for (const key of ['comment', 'tweak', 'edit', 'comment']) {
      await p.evaluate((k) => document.querySelector(`[data-mode=${k}]`).click(), key);
      await p.waitForTimeout(450);
      sizes.push({ key, label: (await p.locator('[data-review=mode] .sk-label').textContent()), ...(await geo()) });
    }
    assert.equal(new Set(sizes.map((s) => s.label)).size, 3, `the label changed: ${JSON.stringify(sizes)}`);
    assert.equal(new Set(sizes.map((s) => s.pick)).size, 1, `one width: ${JSON.stringify(sizes)}`);
    assert.equal(new Set(sizes.map((s) => s.left)).size, 1, `the bar's left edge stays: ${JSON.stringify(sizes)}`);
    const viewportIcon = async (page) => {
      await page.locator('[data-review=more]').click();
      const item = page.getByRole('menuitem', { name: /Viewport/ });
      const out = { value: (await item.locator('.v').textContent()), icon: await item.locator('svg').first().innerHTML() };
      await page.keyboard.press('Escape');
      return out;
    };
    const phone = await viewportIcon(p);
    const d = await newPage();
    const desk = await viewportIcon(d);
    assert.deepEqual([phone.value, desk.value], ['Mobile', 'Desktop']);
    assert.notEqual(phone.icon, desk.icon, 'a phone, not a monitor, on a phone');
    await p.context().close(); await d.context().close();
  });

  await t.test('R11: Agent activity says Set aside, as the inbox does', async () => {
    status('complete', 'Changes ready.', { changes: [{ noteId: 'a', summary: 'Title is blue', status: 'resolved' }, { noteId: 'b', summary: 'Kept the old footer', status: 'rejected' }] });
    const p = await newPage();
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.check());
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.toggle());
    const dialog = p.getByRole('dialog', { name: 'Agent activity' });
    await dialog.getByText('Set aside', { exact: true }).waitFor();
    assert.doesNotMatch(await dialog.textContent(), /Not applied/);
    await p.context().close();
    status('listening', 'Listening for Send to agent.');
  });

  await t.test('#1: a bar button closes an empty comment popup, and waits behind one with words in it', async () => {
    for (const touch of [false, true]) {
      const p = await newPage(touch ? phone : {});
      const press = (sel) => (touch ? p.locator(sel).tap() : p.locator(sel).click());
      const popup = async () => {
        if (touch) await p.locator('h1 + p').tap(); else await p.locator('h1 + p').click({ position: { x: 200, y: 8 } });
        await p.getByPlaceholder('What should change?', { exact: true }).waitFor();
        await p.waitForTimeout(250);
      };
      // Empty: the popup goes and the panel opens. Never both.
      for (const [sel, open] of [['[data-review=more]', '.menu[aria-label="More tools"]'], ['[data-review=done]', 'section[aria-label="Review tools"]'], ['[data-review=inbox]', 'section[aria-label="Review tools"]']]) {
        await popup();
        await press(sel);
        await p.waitForTimeout(500);
        assert.equal(await p.locator('[data-annotation-popup]').count(), 0, `${sel}: the empty popup closed`);
        assert.equal(await p.locator(open).first().isVisible(), true, `${sel}: it opened`);
        await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      }
      // Words in it: the button waits, says why, and the note keeps focus.
      await popup();
      const field = p.getByPlaceholder('What should change?', { exact: true });
      await field.fill('Half a thought');
      for (const sel of ['[data-review=more]', '[data-review=done]', '[data-review=inbox]']) {
        await press(sel);
        await p.waitForTimeout(400);
        assert.equal(await field.inputValue(), 'Half a thought', `${sel}: the note is kept`);
        assert.equal(await p.locator('.menu[aria-label="More tools"]').isVisible(), false, `${sel}: More stayed shut`);
        assert.equal(await reviewPanel(p).isVisible(), false, `${sel}: no sheet opened`);
        assert.equal(await p.getByText('Finish or cancel the note first.', { exact: true }).isVisible(), true, `${sel}: it says why`);
        assert.equal(await field.evaluate((n) => n === document.activeElement), true, `${sel}: focus is back in the note`);
      }
      await shot(p, `focus-popup-blocks${touch ? '-phone' : ''}`);
      await p.context().close();
    }
  });

  // Talk, from the keyboard: setup focuses Start recording (#11), Start focuses
  // Stop (#9), and Esc on the review goes to the mode button (#10). One right
  // inset holds from setup to review (#18).
  await t.test('#9 #10 #11 #18: Talk keeps focus and the page holds still through a pass', async () => {
    const p = await newPage();
    const inset = () => p.evaluate(() => window.__AGENTATION_KIT_INSETS__?.right || 0);
    await p.locator('[data-mode=voice]').focus(); await p.keyboard.press('Enter');
    let a = await after(p, 800);
    assert.equal(a.label, 'Start recording', `setup: ${JSON.stringify(a)}`);
    // Talk's sheets float, so nothing reflows from setup to review (#18).
    const setup = await inset();
    assert.equal(setup, 0, `setup floats over the page: ${setup}`);
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
    a = await after(p);
    assert.equal(a.label, 'Stop', `recording: ${JSON.stringify(a)}`);
    assert.equal(await inset(), setup, 'recording reserves no column either');
    await shot(p, 'focus-talk-recording');
    await p.keyboard.press('Enter');
    await p.getByRole('textbox', { name: 'Passage 1', exact: true }).waitFor();
    await p.waitForTimeout(400);
    assert.equal(await inset(), setup, 'nor does the review');
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.mode, 'comment', `Esc on the review: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('#9: Start recording by mouse focuses Stop; #10 on a phone: Esc goes to the mode button', async () => {
    const p = await newPage();
    await p.locator('[data-mode=voice]').click();
    await p.getByRole('button', { name: 'Start recording', exact: true }).click();
    await p.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
    let a = await after(p);
    assert.equal(a.label, 'Stop', `mouse: ${JSON.stringify(a)}`);
    await p.context().close();
    const m = await newPage(phone);
    await m.evaluate(() => window.__AGENTATION_KIT_VOICE__.open());
    const start = m.getByRole('button', { name: 'Start recording', exact: true });
    await start.waitFor(); await m.waitForFunction(() => !document.querySelector('[data-voice-ui]').shadowRoot.querySelector('.foot .primary')?.disabled);
    await start.tap();
    await m.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
    await m.getByRole('button', { name: 'Stop', exact: true }).tap();
    await m.getByRole('textbox', { name: 'Passage 1', exact: true }).waitFor();
    await m.keyboard.press('Escape');
    a = await after(m);
    assert.equal(a.review, 'mode', `phone Esc: ${JSON.stringify(a)}`);
    await m.context().close();
  });

  await t.test('#12: Esc in the Tweak panel and in edited text goes to the mode button', async () => {
    const p = await newPage();
    await p.locator('[data-mode=tweak]').click();
    await p.locator('.card button').first().click();
    await p.locator('section.tw').waitFor();
    await p.keyboard.press('Escape');
    let a = await after(p);
    assert.equal(a.mode, 'tweak', `Tweak Esc: ${JSON.stringify(a)}`);
    await p.locator('[data-mode=edit]').click();
    await p.locator('h1').click();
    assert.equal(await p.locator('h1').evaluate((n) => n === document.activeElement), true, 'editing the heading');
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(a.mode, 'edit', `Edit text Esc: ${JSON.stringify(a)}`);
    await p.context().close();
  });

  // UX review round 6, the flow group.
  const popupOpen = async (p) => {
    await p.locator('h1 + p').click({ position: { x: 200, y: 8 } });
    const field = p.getByPlaceholder('What should change?', { exact: true });
    await field.waitFor(); await p.waitForTimeout(250);
    return field;
  };
  const exitButton = (p) => p.locator('[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="Exit"]');

  await t.test('N3: Exit waits behind a comment popup with words in it, as the other bar buttons do', async () => {
    const p = await newPage();
    const field = await popupOpen(p);
    await field.fill('Half a thought');
    await exitButton(p).click();
    await p.waitForTimeout(500);
    assert.equal(await expanded(p), true, 'the bar stayed open');
    assert.equal(await field.inputValue(), 'Half a thought', 'the note is kept');
    assert.equal(await p.getByText('Finish or cancel the note first.', { exact: true }).isVisible(), true, 'it says why');
    assert.equal(await field.evaluate((n) => n === document.activeElement), true, 'focus is back in the note');
    // An empty popup is no reason to wait: Exit closes it and collapses the bar.
    await field.fill('');
    await exitButton(p).click();
    await p.waitForTimeout(500);
    assert.equal(await expanded(p), false, 'an empty popup lets Exit through');
    await p.context().close();
  });

  await t.test('N4: Esc or Cancel on the comment popup puts focus on the current mode', async () => {
    const p = await newPage();
    await popupOpen(p);
    await p.keyboard.press('Escape');
    let a = await after(p);
    assert.equal(await p.locator('[data-annotation-popup]').count(), 0, 'Esc closed the popup');
    assert.equal(await expanded(p), true, 'Esc on the popup leaves the bar open');
    assert.equal(a.mode, 'comment', `Esc: focus on ${JSON.stringify(a)}`);
    await popupOpen(p);
    await p.locator('[data-annotation-popup]').getByRole('button', { name: 'Cancel', exact: true }).click();
    a = await after(p);
    assert.equal(await p.locator('[data-annotation-popup]').count(), 0, 'Cancel closed the popup');
    assert.equal(a.mode, 'comment', `Cancel: focus on ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('N5: Esc in a Not an issue reason closes the form only and keeps the reason; a second Esc closes the panel', async () => {
    const p = await newPage();
    const id = crit[1].id;
    await p.locator('[data-review=agent]').focus(); await p.keyboard.press('Enter');
    const crit_ = p.locator('section[aria-label="From the agent"]');
    await crit_.waitFor({ state: 'visible' });
    const row = crit_.locator(`article[data-id="${id}"]`);
    await row.getByRole('button', { name: 'Not an issue', exact: true }).focus(); await p.keyboard.press('Enter');
    const reason = row.getByRole('textbox', { name: 'Reason it is not an issue', exact: true });
    await reason.waitFor();
    await reason.fill('The price says who it is for');
    await p.keyboard.press('Escape');
    let a = await after(p, 600);
    assert.equal(await crit_.isVisible(), true, 'the panel stays open');
    assert.equal(await reason.count(), 0, 'the reason form closed');
    assert.equal(a.focus, `${id}:decide`, `first Esc: focus on ${JSON.stringify(a)}`);
    // The reason is a draft: it comes back with the form.
    await p.keyboard.press('Enter');
    await reason.waitFor();
    assert.equal(await reason.inputValue(), 'The price says who it is for', 'the reason is restored');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    await p.keyboard.press('Escape');
    a = await after(p);
    assert.equal(await crit_.isVisible(), false, 'the second Esc closes the panel');
    assert.equal(a.review, 'agent', `second Esc: focus on ${JSON.stringify(a)}`);
    await p.context().close();
  });

  await t.test('N11: the More menu draws a 2px accent ring and moves by arrow, Home and End', async () => {
    const p = await newPage();
    await p.locator('[data-review=more]').focus(); await p.keyboard.press('Enter');
    const menu = p.locator('.menu[aria-label="More tools"]');
    await menu.waitFor({ state: 'visible' });
    const items = await menu.locator('button').allTextContents();
    assert.ok(items.length >= 3, `menu items: ${items}`);
    const now = () => p.evaluate(() => {
      const r = document.querySelector('[data-review-ui]')?.shadowRoot || [...document.querySelectorAll('.sk-edit-ui')].map((h) => h.shadowRoot).find((s) => s?.querySelector('.menu[aria-label="More tools"]'));
      const a = r.activeElement; const cs = a && getComputedStyle(a);
      return { text: a?.textContent || '', inMenu: !!a?.closest?.('.menu'), outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth}` : '', tab: a?.tabIndex };
    });
    let a = await now();
    assert.equal(a.text, items[0], `opens on the first item: ${JSON.stringify(a)}`);
    assert.equal(a.outline, 'solid 2px', `a visible ring: ${JSON.stringify(a)}`);
    await p.keyboard.press('ArrowDown'); a = await now();
    assert.equal(a.text, items[1], `ArrowDown: ${JSON.stringify(a)}`);
    await p.keyboard.press('End'); a = await now();
    assert.equal(a.text, items.at(-1), `End: ${JSON.stringify(a)}`);
    await p.keyboard.press('ArrowDown'); a = await now();
    assert.equal(a.text, items[0], `ArrowDown wraps to the first: ${JSON.stringify(a)}`);
    await p.keyboard.press('ArrowUp'); a = await now();
    assert.equal(a.text, items.at(-1), `ArrowUp wraps to the last: ${JSON.stringify(a)}`);
    await p.keyboard.press('Home'); a = await now();
    assert.equal(a.text, items[0], `Home: ${JSON.stringify(a)}`);
    assert.equal(a.outline, 'solid 2px', `the ring follows: ${JSON.stringify(a)}`);
    const tabs = await menu.locator('button').evaluateAll((bs) => bs.map((b) => b.tabIndex));
    assert.deepEqual(tabs, tabs.map((_, i) => (i === 0 ? 0 : -1)), `one tab stop (roving): ${tabs}`);
    await p.context().close();
  });

  await t.test('N1: an upstream tooltip under one of our layers is hidden, never half covered', async () => {
    const p = await newPage();
    // The Exit tip, measured: is it showing, and does one of our layers sit on it?
    const tip = () => p.evaluate(() => {
      const t = [...document.querySelectorAll('[data-agentation-toolbar] [class*="controlsContent"] [class*="buttonTooltip"]')].find((n) => /^Exit/.test(n.textContent));
      const cs = getComputedStyle(t), r = t.getBoundingClientRect();
      const shown = cs.visibility === 'visible' && Number(cs.opacity) > 0.05;
      let covered = 0;
      // Every 2px across the tip, edges included.
      for (let x = r.left + 0.5; x < r.right; x += 2) for (let y = r.top + 0.5; y < r.bottom; y += 2) {
        const top = document.elementFromPoint(x, y);
        if (top?.closest?.('.sk-edit-ui') && !top.closest('[data-agentation-root]')) covered++;
      }
      return { shown, covered, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] };
    });
    await exitButton(p).hover();
    await p.waitForTimeout(1200);
    let s = await tip();
    assert.equal(s.shown, true, `with nothing open the tip shows: ${JSON.stringify(s)}`);
    assert.equal(s.covered, 0, `and nothing covers it: ${JSON.stringify(s)}`);
    // More opens over the tip, the pointer still on Exit.
    await p.evaluate(() => document.querySelector('[data-review=more]').click());
    await p.locator('.menu[aria-label="More tools"]').waitFor({ state: 'visible' });
    await p.waitForTimeout(300);
    s = await tip();
    assert.ok(s.covered > 0, `More sits on the tip (the case this covers): ${JSON.stringify(s)}`);
    assert.equal(s.shown, false, `More: no half-covered tip: ${JSON.stringify(s)}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    // Talk: setup, then the recording dock.
    await p.keyboard.press('v');
    await p.getByRole('button', { name: 'Start recording', exact: true }).waitFor();
    await p.waitForTimeout(400);
    s = await tip();
    assert.ok(s.covered > 0, `Talk setup tucks over the tip by a few px: ${JSON.stringify(s)}`);
    assert.equal(s.shown, false, `Talk setup: no half-covered tip: ${JSON.stringify(s)}`);
    // Clicked from script, so the pointer stays on Exit.
    await p.waitForFunction(() => !document.querySelector('[data-voice-ui]').shadowRoot.querySelector('.foot .primary')?.disabled);
    await p.getByRole('button', { name: 'Start recording', exact: true }).evaluate((b) => b.click());
    await p.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
    await p.waitForTimeout(400);
    s = await tip();
    assert.ok(s.covered > 0, `the dock sits on the tip: ${JSON.stringify(s)}`);
    assert.equal(s.shown, false, `recording dock: no half-covered tip: ${JSON.stringify(s)}`);
    await shot(p, 'focus-tip-under-dock');
    await p.context().close();
  });

  // Last: it sends a round, which every later page would read as already sent.
  await t.test('N12: Send N in the Send sheet puts focus on the bar\'s Send, never on the page', async () => {
    const p = await newPage();
    await p.locator('[data-review=done]').focus(); await p.keyboard.press('Enter');
    const sheet = reviewPanel(p);
    await sheet.waitFor({ state: 'visible' });
    const go = sheet.getByRole('button', { name: /^Send \d+$/ });
    await go.waitFor();
    await go.focus();
    await p.evaluate(() => {
      window.__focusTrail = [];
      const deep = () => { let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return a; };
      const end = performance.now() + 2500;
      const tick = () => { const a = deep(); window.__focusTrail.push(a === document.body || !a ? 'BODY' : a.dataset?.review || a.textContent.trim().slice(0, 20)); if (performance.now() < end) requestAnimationFrame(tick); };
      tick();
    });
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => document.querySelector('[data-review=done]')?.dataset.state === 'sent', null, { timeout: 8000 });
    const a = await after(p, 1500);
    const trail = await p.evaluate(() => window.__focusTrail);
    assert.equal(await sheet.isVisible(), false, 'the sheet closed');
    assert.equal(a.review, 'done', `focus on ${JSON.stringify(a)}`);
    assert.ok(!trail.includes('BODY'), `focus never fell to the page: ${[...new Set(trail)].join(' → ')}`);
    assert.ok(!trail.includes('inbox'), `nor passed through the inbox: ${[...new Set(trail)].join(' → ')}`);
    await p.context().close();
  });

  await t.test('no page errors', () => assert.deepEqual(errors, []));
});
