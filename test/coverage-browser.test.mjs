// Opt in after build: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/coverage-browser.test.mjs
// Gate: bottom surfaces (the dock, toasts, phone sheets, the bar) reserve room
// so nothing is stuck under them, and a wide screen's side sheets float over
// the page without reflowing it, but never over what the reviewer is working
// on. The page is the real example page; microphone and status are controlled
// test doubles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

const CONTENT = 'main h1, main > p, main .card, main .card h2, main .card p, main button';

test('bottom surfaces reserve room, side sheets float without covering the working target', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 240000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { kvSet } = await import('../server/kv-store.js');
  const { AGENT_WORK_KEY } = await import('../server/agent-work.js');
  const page0 = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8')
    .replace('</head>', '<script src="/__review/loader.js"></script></head>');
  let app;
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice(9));
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page0);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`, name = uniqueName('coverage');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { voice: true, agentWork: true }, voiceLimits: { requestsPerMinute: 100 }, voiceBudget: null,
    voiceTranscriber: { id: 'qa', disclosure: 'QA.', async transcribe({ durationMs }) { return { text: 'Make this larger. And this bluer.', segments: [{ start: 0, end: durationMs / 2000, text: 'Make this larger.' }, { start: durationMs / 2000, end: durationMs / 1000, text: 'And this bluer.' }] }; } } });
  const browser = await chromium.launch();
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS; if (shots) mkdirSync(shots, { recursive: true });
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });
  let beat;
  const status = (s) => { clearInterval(beat); const w = () => kvSet(name, AGENT_WORK_KEY, JSON.stringify({ ...s, updatedAt: Date.now() })); w(); beat = setInterval(w, 3000); };
  t.after(() => clearInterval(beat));

  async function open(vp) {
    const ctx = await browser.newContext({ viewport: vp, ...(vp.width < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => {
      localStorage.setItem('feedback-toolbar-reviewer', 'Ana');
      navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] });
      class R { static isTypeSupported() { return true; } constructor() { this.mimeType = 'audio/webm'; } start() {} stop() { setTimeout(() => { this.ondataavailable?.({ data: new Blob([new Uint8Array([0x1a,0x45,0xdf,0xa3]), 'qa'], { type: 'audio/webm' }) }); this.onstop?.(); }, 0); } }
      window.MediaRecorder = R;
    });
    const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(origin, { waitUntil: 'load' });
    await p.waitForFunction(() => window.__AGENTATION_KIT_VOICE__ && window.__AGENTATION_KIT_AGENT_WORK_STATUS__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.waitForTimeout(400);
    return { p, ctx, errors };
  }
  // Every visible review surface: our shadow-root panels, dock, pill and toasts, plus the toolbar shell.
  // Side sheets float by design, so the reserve gate leaves them out (`sides`).
  const measure = (p, sides = false) => p.evaluate(([selector, sides]) => {
    const surfaces = [];
    const add = (n, label) => { if (!sides && n.dataset.sheet === 'side') return; const r = n.getBoundingClientRect(); const s = getComputedStyle(n); if (r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none') surfaces.push({ label, x: r.left, y: r.top, r: r.right, b: r.bottom }); };
    for (const host of document.querySelectorAll('[data-feedback-toolbar]')) {
      const root = host.shadowRoot; if (!root) continue;
      for (const n of root.querySelectorAll('.panel,.dock,.activity,.notice,.toast')) add(n, (host.dataset.voiceUi !== undefined ? 'voice ' : host.dataset.agentWorkUi !== undefined ? 'agent ' : '') + n.className);
    }
    const shell = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]'); if (shell) add(shell, 'toolbar');
    const content = [...document.querySelectorAll(selector)].map((n) => { const r = n.getBoundingClientRect(); return { label: n.tagName.toLowerCase() + (n.className ? '.' + n.className : '') + ' ' + (n.textContent || '').trim().slice(0, 24), x: r.left, y: r.top, r: r.right, b: r.bottom }; });
    return { surfaces, content, scrollY, max: document.documentElement.scrollHeight - innerHeight };
  }, [CONTENT, sides]);
  const hits = ({ surfaces, content }) => content.flatMap((c) => surfaces.filter((s) => Math.min(c.r, s.r) - Math.max(c.x, s.x) > 0.5 && Math.min(c.b, s.b) - Math.max(c.y, s.y) > 0.5).map((s) => `${c.label.trim()} under ${s.label}`));
  async function gate(p, label, { atRest }) {
    await p.waitForTimeout(450);
    if (shots) await p.screenshot({ path: `${shots}/${label}.png` });
    if (atRest) assert.deepEqual(hits(await measure(p)), [], `${label}: content covered at rest`);
    // Every content element can be brought into the free area, and then nothing covers it.
    const count = await p.locator(CONTENT).count();
    for (let i = 0; i < count; i++) {
      await p.locator(CONTENT).nth(i).evaluate((n) => n.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }));
      await p.waitForTimeout(60);
      const m = await measure(p);
      const own = hits({ ...m, content: [m.content[i]] });
      assert.deepEqual(own, [], `${label}: ${m.content[i].label.trim()} cannot be scrolled clear`);
    }
    // The last content can scroll fully above the toolbar and bottom surfaces.
    await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await p.waitForTimeout(60);
    const m = await measure(p);
    const last = Math.max(...m.content.map((c) => c.b));
    const floor = Math.min(...m.surfaces.filter((s) => s.b >= innerHeightOf(m) - 2).map((s) => s.y), Infinity);
    assert.ok(last <= floor + 0.5, `${label}: bottom content ends at ${last}, under surfaces starting at ${floor}`);
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  }
  let vh = 0; const innerHeightOf = () => vh;

  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    vh = vp.height;
    const wide = vp.width >= 900, tag = `${vp.width}`;
    status({ state: 'listening', message: 'Listening.' });
    const { p, ctx, errors } = await open(vp);
    const htmlStyle = await p.evaluate(() => [document.documentElement.getAttribute('style'), document.body.getAttribute('style')]);
    // Voice dock while recording.
    await p.evaluate(() => window.__AGENTATION_KIT_VOICE__.open());
    await p.getByRole('button', { name: 'Start recording', exact: true }).click();
    await p.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
    await p.locator('main h2').click();
    await gate(p, `${tag}-voice-dock`, { atRest: true });
    if (wide) {
      // A side sheet opening during a recording floats: no right inset, the
      // page keeps its width, and a region drawn across the opening keeps the
      // geometry it was drawn with.
      const width = () => p.evaluate(() => document.querySelector('main').getBoundingClientRect().width);
      const before = await width();
      const r = await p.locator('main .card').boundingBox();
      await p.mouse.move(r.x + 10, r.y + 10); await p.mouse.down(); await p.mouse.move(r.x + 120, r.y + 60, { steps: 3 });
      await p.locator('[data-agent-work-ui]').evaluate((h) => h.shadowRoot.querySelector('.activity').click());
      await p.waitForTimeout(300);
      await p.mouse.move(r.x + 210, r.y + 110, { steps: 3 }); await p.mouse.up();
      const region = await p.evaluate(() => window.__AGENTATION_KIT_VOICE__.draft.anchors.at(-1));
      assert.equal(region.kind, 'region');
      assert.deepEqual([Math.round(region.rect.x), Math.round(region.rect.y), Math.round(region.rect.width), Math.round(region.rect.height)], [Math.round(r.x + 10), Math.round(r.y + 10), 200, 100]);
      await p.waitForTimeout(300);
      assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_INSETS__?.right || 0), 0, 'an open side sheet reserves no column');
      assert.equal(await width(), before, 'an open side sheet does not reflow the page');
      await p.locator('[data-agent-work-ui]').evaluate((h) => h.shadowRoot.querySelector('.x').click());
      await p.waitForTimeout(300);
      // Escape mid-drag cancels the drag and clears the drag flag.
      await p.mouse.move(r.x + 10, r.y + 10); await p.mouse.down(); await p.mouse.move(r.x + 90, r.y + 50, { steps: 3 });
      assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_POINTER_DRAG__), true);
      await p.keyboard.press('Escape'); await p.mouse.up();
      assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_POINTER_DRAG__), false, 'Escape clears the drag flag');
    }
    // Transcript editor.
    await p.getByRole('button', { name: 'Stop', exact: true }).click();
    await p.getByRole('textbox', { name: 'Passage 1', exact: true }).waitFor();
    await gate(p, `${tag}-voice-editor`, { atRest: wide });
    if (wide) assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_INSETS__?.right || 0), 0, `${tag}: Talk review floats`);
    // Reassigning a target shows it on the page, scrolled clear of every surface.
    await p.getByRole('combobox', { name: 'Target for passage 1', exact: true }).focus();
    await p.waitForTimeout(150);
    const shown = await p.evaluate(() => { const o = document.querySelector('[data-voice-ui]').shadowRoot.querySelector('.outline'); return o.hidden ? null : o.getBoundingClientRect().toJSON(); });
    assert.ok(shown, `${tag}: the reassigned target is outlined`);
    // Its words, not its full-width block: no surface, side sheets included, covers them.
    const ink = await p.evaluate((o) => { const n = [...document.querySelectorAll('main *')].find((e) => { const r = e.getBoundingClientRect(); return Math.abs(r.left - 3 - o.left) < 2 && Math.abs(r.top - 3 - o.top) < 2 && Math.abs(r.width + 6 - o.width) < 2; }); if (!n) return null; const g = document.createRange(); g.selectNodeContents(n); return g.getBoundingClientRect().toJSON(); }, shown);
    assert.ok(ink, `${tag}: the outlined target is found`);
    const covered = hits({ surfaces: (await measure(p, true)).surfaces, content: [{ label: 'outlined target', x: ink.left, y: ink.top, r: ink.right, b: ink.bottom }] });
    assert.deepEqual(covered, [], `${tag}: outlined target is unobstructed`);
    assert.ok(shown.top >= 0 && shown.bottom <= vp.height, `${tag}: outlined target is on screen`);
    if (shots) await p.screenshot({ path: `${shots}/${tag}-reassign-preview.png` });
    await p.getByRole('button', { name: 'Close voice panel', exact: true }).click();
    // Agent activity panel, then the complete pill alone.
    status({ state: 'complete', message: 'Changes ready. Reload the preview to review them.', changes: [{ noteId: 'a', summary: 'Title is larger', status: 'resolved' }] });
    await p.evaluate(() => window.__AGENTATION_KIT_AGENT_WORK__.check());
    await p.waitForTimeout(150);
    await gate(p, `${tag}-complete-pill`, { atRest: true });
    await p.locator('[data-agent-work-ui]').evaluate((h) => h.shadowRoot.querySelector('.activity').click());
    await p.getByRole('dialog', { name: 'Agent activity' }).waitFor();
    await gate(p, `${tag}-agent-panel`, { atRest: wide });
    await p.getByRole('dialog', { name: 'Agent activity' }).getByRole('button', { name: 'Close', exact: true }).click();
    await p.waitForTimeout(300);
    assert.deepEqual(await p.evaluate(() => [document.documentElement.getAttribute('style'), document.body.getAttribute('style')]), htmlStyle, 'host inline styles untouched');
    assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_INSETS__.right), 0, 'no side inset once every sheet is closed');
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});
