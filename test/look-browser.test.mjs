// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/look-browser.test.mjs
// UX review round 6, the "look" group: on a phone no marker, agent's or
// reviewer's, nor its touch area, sits on any line of text (N2); the Send
// sheet counts the same questions as the inbox (N6); light Settings' "MCP and
// webhooks" and its subpage help are 4.5:1 (N7); a guard toast is not red and
// looks like the notice (N8); the inbox's focus ring is never clipped (N9);
// a row's "You" is never the part cut off (N10); and the phone bar's Sent
// keeps its check (N13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('round-6 look', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 240000,
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
  const name = uniqueName('look');
  app = createReviewApp({ name, base: '/__review', origins: [origin], config: { critique: true } });
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
  const note = (comment, element, reviewer = 'Ana', extra = {}) => api(`sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), comment, reviewer, element, elementPath: `main ${element}`, x: 30, y: 200, timestamp: Date.now(), ...extra,
  });
  // Questions: two for Ana (this browser), one for Ben (N6).
  for (const [c, q, who] of [['Make the price bigger', 'Which size: 28 or 32?', 'Ana'], ['Tighten this', 'Shorter, or less bold?', 'Ana'], ['Swap the order', 'Monthly first?', 'Ben']]) {
    const a = await note(c, 'h2', who); await project.act('reply', a.id, q);
  }
  // Reviewer notes on the subhead under the heading, the heading and the card:
  // their markers follow the agent's rules (N2), and they fill the inbox (N9, N10).
  for (const [c, el] of [['Say who it is for', 'h1 + p'], ['Shorter', 'h1 + p'], ['Bigger', 'h1'], ['Less grey', 'h2'], ['Price first', 'h2'], ['Card padding', 'h2'], ['One more line', 'h2']]) await note(c, el);
  // The agent's notes, as round 6 seeded them: the subhead A4 sits under the heading at the 16px margin.
  await project.annotate(`${origin}/`, [
    { comment: 'Both plans say Start free trial', selector: '.card button', severity: 'blocking' },
    { comment: 'Say who Starter is for', selector: '.card p' },
    { comment: 'The heading is long', selector: 'h1' },
    { comment: 'The subhead promises too much', selector: 'h1 + p' },
    { comment: 'Starter needs a price', selector: '.card h2' },
  ], { create: true });

  const touch = (width, height) => ({ viewport: { width, height }, hasTouch: true, isMobile: true });
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
  const press = (p, loc, phone) => (phone ? loc.tap() : loc.click());
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
  const contrasts = (p, sel) => p.evaluate(({ sel, fn }) => {
    const contrast = new Function('return ' + fn)();
    return [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && e.textContent.trim())
      .map((e) => ({ text: e.textContent.trim().slice(0, 30), ratio: Math.round(contrast(e) * 100) / 100 }));
  }, { sel, fn: contrastOf.toString() });
  const assertReadable = (list, what) => {
    assert.ok(list.length, `${what}: something to measure`);
    for (const c of list) assert.ok(c.ratio >= 4.5, `${what} "${c.text}" ${c.ratio}:1`);
  };
  const inbox = (p) => p.locator('section.panel[aria-label="Review tools"]');

  await t.test('N2: on a phone no marker, nor its touch area, is on any line of text, and A4 sits by its own text', async () => {
    for (const [w, h] of [[390, 844], [360, 780]]) {
      const p = await newPage(touch(w, h));
      // The reviewer's own markers are the toolbar's, made in this browser:
      // two on the subhead (they step apart) and one on the card's heading.
      if (!await p.locator('[data-annotation-marker]').count()) {
        for (const [sel, text] of [['h1 + p', 'Say who it is for'], ['h1 + p', 'Shorter'], ['.card h2', 'Price first']]) {
          await p.locator(sel).tap({ position: { x: 60, y: 10 } });
          await p.getByPlaceholder('What should change?', { exact: true }).fill(text);
          await p.getByRole('button', { name: 'Add', exact: true }).tap();
          await p.locator('[data-annotation-popup]').waitFor({ state: 'hidden' });
        }
      }
      await p.waitForTimeout(800); // the markers settle after the bar opens
      const MARKERS = '.sk-crit-dot:not([hidden]), [data-agentation-root] [data-annotation-marker]';
      const geo = await p.evaluate((MARKERS) => {
        const box = (r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
        // Every line of text on the page, one rect per line fragment.
        const lines = [];
        const walk = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          if (!n.data.trim()) continue;
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) if (r.width && r.height) lines.push({ ...box(r), el: n.parentElement.matches('h1 + p') ? 'h1 + p' : n.parentElement.tagName.toLowerCase() + (n.parentElement.closest('.card') ? ' (card)' : ''), text: n.data.trim().slice(0, 24) });
        }
        const markers = [...document.querySelectorAll(MARKERS)].filter((m) => m.checkVisibility()).map((m) => ({ label: (m.classList.contains('sk-crit-dot') ? '' : 'reviewer ') + m.textContent.trim(), ...box(m.getBoundingClientRect()), hit: m.style.getPropertyValue('--sk-hit'), style: m.getAttribute('style') }));
        // Sample every line within 60px of a marker, on a 1px grid inside its
        // edges: a point that lands on a marker or its touch area is a defect.
        const near = (l) => markers.some((m) => l.right > m.left - 60 && l.left < m.right + 60 && l.bottom > m.top - 60 && l.top < m.bottom + 60);
        const hits = [];
        for (const l of lines.filter(near)) {
          const seen = new Map();
          for (let x = l.left + 1; x < l.right - 1; x += 1) for (let y = l.top + 1; y < l.bottom - 1; y += 1) {
            const at = document.elementFromPoint(x, y)?.closest?.('.sk-crit-dot, [data-annotation-marker]');
            if (at) { const k = at.textContent.trim(); const s = seen.get(k) || { n: 0, x: Math.round(x), y: Math.round(y) }; s.n++; seen.set(k, s); }
          }
          for (const [k, s] of seen) hits.push(`${k} takes ${s.n} points of the ${l.el} line "${l.text}" (first at ${s.x},${s.y})`);
        }
        const sub = document.querySelector('h1 + p').getBoundingClientRect();
        return { lines, markers, hits, sub: box(sub) };
      }, MARKERS);
      assert.equal(geo.markers.filter((m) => /^A\d/.test(m.label)).length, 5, `${w}: the agent's five markers are on the page`);
      assert.ok(geo.markers.some((m) => m.label.startsWith('reviewer')), `${w}: reviewer markers are on the page`);
      assert.deepEqual(geo.hits, [], `${w}: a marker or its touch area on a line of text ${JSON.stringify(geo.markers)}`);

      // The marker's own box: no ink under it (marker hidden, device pixels counted).
      const inks = [];
      const all = p.locator(MARKERS);
      for (let i = 0; i < await all.count(); i++) {
        const m = all.nth(i);
        if (!await m.isVisible()) continue;
        const b = await m.boundingBox();
        // Only glyphs count: the page's fills and borders (the dark button) go for the shot.
        await m.evaluate((e) => {
          e.style.visibility = 'hidden';
          const s = document.createElement('style'); s.id = 'ink-only'; s.textContent = 'main, main * { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }'; document.head.append(s);
        });
        const png = await p.screenshot({ clip: b });
        await m.evaluate((e) => { e.style.visibility = ''; document.getElementById('ink-only').remove(); });
        const dark = await p.evaluate(async (b64) => {
          const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
          const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
          const x = c.getContext('2d'); x.drawImage(img, 0, 0);
          const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0;
          for (let i = 0; i < d.length; i += 4) if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 140) n++;
          return n;
        }, png.toString('base64'));
        if (dark) inks.push(`${(await m.textContent()).trim()}: ${dark} px of ink under it`);
      }
      assert.deepEqual(inks, [], `${w}: ink under a marker`);

      // A4 reads as the subhead's: nearer the subhead's text than any other text.
      const a4 = geo.markers.find((m) => m.label === 'A4');
      const gap = (a, b) => Math.hypot(Math.max(0, b.left - a.right, a.left - b.right), Math.max(0, b.top - a.bottom, a.top - b.bottom));
      const own = Math.min(...geo.lines.filter((l) => l.el === 'h1 + p').map((l) => gap(a4, l)));
      const other = Math.min(...geo.lines.filter((l) => l.el !== 'h1 + p').map((l) => gap(a4, l)));
      assert.ok(own < 8, `${w}: A4 ${JSON.stringify(a4)} within 8px of the subhead's text (${own.toFixed(1)})`);
      assert.ok(other > own * 3, `${w}: A4 is ${other.toFixed(1)}px from other text and ${own.toFixed(1)}px from its own`);
      await shot(p, `look-${w}-markers`);
      await p.context().close();
    }
  });

  await t.test('N6: the Send sheet counts the questions the inbox says are yours', async () => {
    for (const phone of [false, true]) {
      const p = await newPage(phone ? touch(390, 844) : {});
      const label = await p.locator('[data-review=inbox]').getAttribute('aria-label');
      assert.match(label, /\b2 questions for you\b/, 'the inbox: Ana has two, Ben one');
      await press(p, p.locator('[data-review=done]'), phone);
      const sheet = inbox(p);
      await sheet.locator('p.summary').waitFor();
      const text = await sheet.textContent();
      assert.match(text, /2 questions are waiting on your answer\./, text);
      await p.context().close();
    }
  });

  await t.test('N7: light Settings, "MCP and webhooks" and its subpage help are 4.5:1', async () => {
    for (const phone of [false, true]) {
      const p = await newPage(phone ? touch(390, 844) : {}, true);
      await press(p, p.locator('[data-review=more]'), phone);
      await press(p, p.getByRole('menuitem', { name: /^Settings$/ }).first(), phone);
      await p.waitForFunction(() => document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
      if (!phone) await p.mouse.move(5, 5); // measured at rest, not hovered
      await p.waitForTimeout(400);
      const nav = '[data-agentation-root] [class*="styles-module__settingsNavLink___"]';
      const links = await contrasts(p, nav);
      assert.deepEqual(links.map((c) => c.text), ['MCP and webhooks']);
      assertReadable(links, `${phone ? 'phone' : 'desktop'} Settings link`);
      await press(p, p.locator(nav).first(), phone);
      if (!phone) await p.mouse.move(5, 5);
      await p.waitForTimeout(500);
      const help = await contrasts(p, '[data-agentation-root] [class*="styles-module__automationDescription___"]');
      assert.ok(help.some((c) => /^MCP connection/.test(c.text)), JSON.stringify(help));
      assertReadable(help, `${phone ? 'phone' : 'desktop'} MCP and webhooks help`);
      await shot(p, `look-${phone ? 390 : 1280}-light-mcp`);
      await p.context().close();
    }
  });

  await t.test('N8: a guard toast is plain text in the notice’s shape; only a failed save is red', async () => {
    for (const light of [false, true]) {
      const p = await newPage({}, light);
      await p.locator('main h2').first().click();
      const pop = p.locator('[data-annotation-popup]');
      await pop.waitFor({ state: 'visible' });
      await pop.locator('textarea').fill('Half a thought');
      await p.locator('[data-review=inbox]').click();
      const host = p.locator('.sk-edit-ui').filter({ has: p.locator('.toast') });
      const toast = p.locator('.toast:not([hidden])');
      await toast.getByText('Finish or cancel the note first.').waitFor();
      const look = () => toast.evaluate((e) => {
        const s = getComputedStyle(e), strong = getComputedStyle(e.querySelector('strong')), probe = document.createElement('span');
        probe.style.cssText = 'color:var(--sk-text);font-family:var(--sk-font)'; e.append(probe);
        const want = getComputedStyle(probe); const out = { radius: s.borderRadius, font: s.fontFamily, size: s.fontSize, strong: strong.color, text: want.color, skFont: want.fontFamily };
        probe.remove(); return out;
      });
      const guard = await look();
      assert.equal(guard.strong, guard.text, `${light ? 'light' : 'dark'}: the guard's words are the text colour, not red`);
      assert.equal(guard.radius, '8px', 'the notice’s radius');
      assert.equal(guard.font, guard.skFont, 'the notice’s font');
      assert.equal(guard.size, '12px');
      await p.evaluate(() => window.__AGENTATION_KIT_SAVE_FAILED__({ status: 0 }));
      await toast.getByText('Your note was not saved to the review server.').waitFor();
      const failed = await look();
      assert.equal(failed.strong, light ? 'rgb(197, 48, 48)' : 'rgb(223, 137, 137)', 'a failed save stays red');
      assert.ok(await host.count(), 'the toast is ours');
      await p.context().close();
    }
  });

  await t.test('the popup guard counts a popup still fading in, never one that is hidden', async () => {
    const p = await newPage();
    await p.locator('main h2').first().click();
    const pop = p.locator('[data-annotation-popup]');
    await pop.waitFor({ state: 'visible' });
    await pop.locator('textarea').fill('Half a thought');
    // Fading in (opacity under the old .05 floor): the guard holds.
    await pop.evaluate((n) => { n.style.setProperty('opacity', '0', 'important'); });
    await p.locator('[data-review=inbox]').click();
    await p.locator('.toast:not([hidden])').getByText('Finish or cancel the note first.').waitFor();
    // Hidden by CSS: nothing invisible blocks the bar (Codex re-review).
    await pop.evaluate((n) => { n.style.removeProperty('opacity'); n.style.setProperty('visibility', 'hidden', 'important'); });
    await p.waitForTimeout(4200);
    await p.locator('[data-review=inbox]').click();
    await p.getByText('Feedback inbox', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await p.context().close();
  });

  await t.test('N9 and N10: an inbox row’s focus ring is never clipped, and its "You" is never cut', async () => {
    for (const [w, h] of [[390, 844], [360, 780]]) {
      const p = await newPage(touch(w, h));
      await p.locator('[data-review=inbox]').tap();
      const sheet = inbox(p);
      await sheet.locator('article.row').first().waitFor();
      await p.waitForTimeout(400);
      // N10: every row of mine says "You", whole, and no row says the default "Any viewport".
      const labels = await sheet.locator('article.row .meta .label').evaluateAll((ls) => ls.map((l) => {
        const by = l.querySelector('.by'), lr = l.getBoundingClientRect(), br = by?.getBoundingClientRect();
        return { text: l.textContent, by: by?.textContent || '', whole: !by || (br.right <= lr.right + 0.5 && by.scrollWidth <= by.clientWidth + 0.5 && br.width > 0) };
      }));
      assert.ok(labels.filter((l) => l.by === 'You').length >= 5, JSON.stringify(labels));
      for (const l of labels) {
        assert.doesNotMatch(l.text, /Any viewport/, `${w}: "${l.text}"`);
        assert.ok(l.whole, `${w}: "${l.text}" cuts its name`);
      }
      // N9: a row near the bottom of the sheet, focused and brought into view
      // as the inbox's focus keeper does, shows its whole ring.
      const ring = await sheet.evaluate((panel) => {
        const rows = [...panel.querySelectorAll('article.row')];
        const pr = panel.getBoundingClientRect();
        const row = rows.find((r) => r.getBoundingClientRect().bottom > pr.bottom) || rows[rows.length - 1];
        row.tabIndex = -1; row.focus({ preventScroll: true });
        row.scrollIntoView({ block: 'nearest' });
        const r = row.getBoundingClientRect(), s = getComputedStyle(row);
        const out = parseFloat(s.outlineWidth) + parseFloat(s.outlineOffset);
        const clip = panel.getBoundingClientRect(), hd = panel.querySelector('.hd').getBoundingClientRect();
        return { top: r.top - out, bottom: r.bottom + out, clipTop: hd.bottom, clipBottom: clip.top + panel.clientTop + panel.clientHeight, out };
      });
      assert.ok(ring.out > 0, 'the row draws a ring');
      assert.ok(ring.bottom <= ring.clipBottom + 0.5, `${w}: ring bottom ${ring.bottom} past the sheet’s ${ring.clipBottom}`);
      assert.ok(ring.top >= ring.clipTop - 0.5, `${w}: ring top ${ring.top} under the header (${ring.clipTop})`);
      await shot(p, `look-${w}-inbox`);
      await p.context().close();
    }
  });

  await t.test('N13: the phone bar’s Sent keeps its check, and the bar still fits', async () => {
    for (const [w, h] of [[360, 780], [390, 844], [330, 700]]) {
      const p = await newPage(touch(w, h));
      const send = p.locator('[data-review=done]');
      if (await send.getAttribute('data-state') !== 'sent') {
        await send.tap();
        await inbox(p).getByRole('button', { name: /^Send (again|to agent|\d+)$/ }).tap();
        await p.waitForFunction(() => document.querySelector('[data-review=done]').dataset.state === 'sent');
        await p.waitForTimeout(400);
      }
      const bar = await send.evaluate((b) => {
        const icon = b.querySelector('svg'), label = b.querySelector('.sk-label');
        const shell = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]').getBoundingClientRect();
        const controls = [...document.querySelectorAll('[data-agentation-toolbar] button')].filter((x) => x.checkVisibility() && x.getBoundingClientRect().top < shell.bottom && x.getBoundingClientRect().bottom > shell.top).map((x) => ({ what: x.getAttribute('aria-label') || x.textContent.trim(), ...x.getBoundingClientRect().toJSON() }));
        return { icon: !!icon && icon.checkVisibility() && icon.getBoundingClientRect().width > 0, path: icon?.innerHTML || '', label: label?.textContent, b: b.getBoundingClientRect().toJSON(), shell: shell.toJSON(), out: controls.filter((r) => r.left < shell.left - 0.5 || r.right > shell.right + 0.5).map((r) => `${r.what} ${Math.round(r.left)}-${Math.round(r.right)} in ${Math.round(shell.left)}-${Math.round(shell.right)}`) };
      });
      assert.equal(bar.label, 'Sent');
      assert.ok(bar.icon, `${w}: the check shows`);
      assert.match(bar.path, /M5 12\.5l4\.5 4\.5L19 7\.5/, `${w}: it is the check`);
      assert.deepEqual(bar.out, [], `${w}: a control past the bar's edge`);
      assert.ok(bar.shell.left >= 0 && bar.shell.right <= w, `${w}: the bar ${bar.shell.left}-${bar.shell.right} on screen`);
      await shot(p, `look-${w}-sent`);
      await p.context().close();
    }
  });

  await t.test('no page errors', () => assert.deepEqual(errors, []));
});
