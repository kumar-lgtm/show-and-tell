// Opt in after building: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/tweak-browser.test.mjs
// Tweak mode end to end: hover → panel → change → Save → a `tweak` note stored.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

test('tweak: hover labels, the panel stays beside the element, values snap, Save stores tweak notes', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const fixture = (f) => readFileSync(new URL(`./fixtures/tweak/${f}`, import.meta.url), 'utf8');
  const html = fixture('index.html').replace('</head>', '<script src="/__review/loader.js"></script></head>');
  const example = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8').replace('</head>', '<script src="/__review/loader.js"></script></head>');
  let app;
  const server = createServer((req, res) => {
    if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice('/__review'.length));
    if (req.url === '/styles.css') { res.writeHead(200, { 'Content-Type': 'text/css' }); return res.end(fixture('styles.css')); }
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(req.url.startsWith('/example') ? example : html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const name = uniqueName('tweak');
  app = createReviewApp({ name, base: '/__review', origins: [origin] });
  const browser = await chromium.launch();
  const project = openProject(name);
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  if (shots) mkdirSync(shots, { recursive: true });
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(); });
  const errors = [];
  const newPage = async (options = {}, path = '/') => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    await context.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'Ana'));
    const page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin + path);
    await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__AGENTATION_KIT_TWEAK__ && window.__AGENTATION_KIT_HEALTH__?.ok);
    await page.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await page.locator('[data-review=inbox]').waitFor({ state: 'visible' });
    return page;
  };
  const shot = async (p, file) => { if (shots) await p.screenshot({ path: `${shots}/${file}.png` }); };
  const rect = (p, sel) => p.locator(sel).first().evaluate((n) => { const r = n.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
  const overlaps = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  const tweaks = () => project.items().filter((a) => a.kind === 'tweak');

  await t.test('desktop: hover → panel beside the element → snap to the scale → Review → Save', async () => {
    const p = await newPage();
    await p.locator('[data-mode=tweak]').click();
    assert.equal(await p.locator('[data-mode=tweak]').getAttribute('aria-pressed'), 'true');
    // The hint strip sits right-aligned to the bar, as wide as its words.
    const hint = p.locator('section.panel.strip', { hasText: 'Click anything to tweak' });
    await hint.waitFor();
    await p.waitForTimeout(400); // the bar finishes opening
    const shell = await rect(p, '[data-agentation-toolbar] [class*="toolbarContainer"]');
    const stripR = await rect(p, 'section.panel.strip'); assert.ok(Math.abs(stripR.right - shell.right) <= 1, 'the strip ends where the bar ends: ' + JSON.stringify([stripR, shell]));
    // The comment picker is suspended: hovering paints no toolbar highlight, only ours.
    const cta = p.locator('a.cta').first();
    await cta.hover();
    await p.locator('.lbl').filter({ hasText: 'a.cta' }).waitFor();
    assert.match(await p.locator('.lbl').textContent(), /a\.ctaStart free trial/);
    await shot(p, 'tweak-hover');
    await cta.click();
    assert.equal(new URL(p.url()).pathname, '/', 'the link did not navigate');
    const panel = p.locator('section.tw');
    await panel.waitFor();
    assert.equal(await p.getByText('What should change?').count(), 0, 'no comment popup opened');
    await hint.waitFor({ state: 'hidden' }); // no "Click anything" while something is picked
    assert.ok(!overlaps(await rect(p, 'section.tw'), await rect(p, 'a.cta')), 'the panel never covers the element');
    // Starts from computed values, named by the project's tokens.
    assert.match(await panel.locator('[data-prop=font-size] .field').textContent(), /text-sm\s*14px/);
    assert.match(await panel.locator('[data-prop=padding] .field').textContent(), /Off scale\s*11 × 16/);
    assert.match(await panel.locator('[data-prop=background-color] .field').textContent(), /brand/);
    // Padding snaps to --space-4 / --space-5 (the picker sits beside the panel, not over the element).
    await panel.locator('[data-prop=padding] .field').click();
    const pick = p.locator('.pick');
    // The way back reads as an action: Reset to, not Was.
    await pick.getByText('Reset to 11px').waitFor();
    assert.ok(await pick.getByText('Off scale').count());
    assert.ok(!overlaps(await rect(p, '.pick'), await rect(p, 'a.cta')));
    await shot(p, 'tweak-picker');
    // The focus ring is drawn inside the option: the list scrolls and clips,
    // and a ring outside lost its top and sides (a bar down one side).
    await p.keyboard.press('Shift');
    await pick.locator('.opt').first().focus();
    const ringFits = await pick.locator('.opt').first().evaluate((n) => {
      const cs = getComputedStyle(n), list = n.closest('.opts').getBoundingClientRect(), r = n.getBoundingClientRect();
      const out = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
      return { visible: n.matches(':focus-visible'), offset: cs.outlineOffset, inside: r.top - out >= list.top - 0.5 && r.left - out >= list.left - 0.5 && r.right + out <= list.right + 0.5 };
    });
    assert.deepEqual(ringFits, { visible: true, offset: '-2px', inside: true });
    await shot(p, 'tweak-picker-ring');
    // Padding has two sides, so the picker stays open after the first choice;
    // the panel keeps its place although the element grew.
    const before = await rect(p, 'section.tw');
    await pick.locator('.opt', { hasText: 'space-4' }).click();
    assert.equal(await pick.isHidden(), false, 'padding keeps the picker for the other side');
    assert.deepEqual(await rect(p, 'section.tw').then((r) => [r.left, r.top]), [before.left, before.top], 'the panel is pinned while it is open');
    await pick.getByRole('button', { name: 'Left and right' }).click();
    await pick.locator('.opt', { hasText: 'space-5' }).click();
    await p.keyboard.press('Escape');
    assert.equal(await pick.isHidden(), true);
    assert.equal(await cta.evaluate((n) => getComputedStyle(n).padding), '16px 24px', 'previewed live');
    // A free value is allowed and labelled.
    await panel.locator('[data-prop=font-size] .field').click();
    await pick.getByRole('textbox', { name: 'Custom value' }).fill('15px');
    await pick.getByRole('button', { name: 'Use' }).click();
    assert.match(await panel.locator('[data-prop=font-size] .field').textContent(), /Off scale\s*15px/);
    // One value is one choice: the picker closes itself and focus returns to the field.
    assert.equal(await pick.isHidden(), true, 'a size choice closes the picker');
    assert.equal(await panel.locator('[data-prop=font-size] .field').evaluate((n) => n.getRootNode().activeElement === n), true);
    await panel.locator('[data-prop=font-size] .field').click();
    await pick.locator('.opt', { hasText: 'text-md' }).click();
    assert.equal(await pick.isHidden(), true);
    assert.match(await panel.locator('[data-prop=font-size]').textContent(), /SizeChanged/);
    // A changed row resets on its own; undo brings the change back.
    await panel.getByRole('button', { name: 'Reset size' }).click();
    assert.equal(await cta.evaluate((n) => getComputedStyle(n).fontSize), '14px');
    const strip = p.locator('section.panel.strip');
    await strip.getByText('1 tweak', { exact: true }).waitFor();
    await strip.getByRole('button', { name: 'Undo last tweak' }).click();
    await strip.getByText('2 tweaks', { exact: true }).waitFor();
    assert.equal(await cta.evaluate((n) => getComputedStyle(n).fontSize), '16px');
    // Send counts unsaved tweaks.
    assert.match(await p.locator('[data-review=done]').textContent(), /Send 2/);
    await shot(p, 'tweak-panel');
    await strip.getByRole('button', { name: 'Review', exact: true }).click();
    const review = p.locator('section.rv');
    await review.getByText('Review 2 tweaks').waitFor();
    const text = await review.textContent();
    assert.match(text, /padding\s*11px 16px\s*→\s*16px 24px/);
    // Only what changed, in the reviewer's words. The rule's location rides the note for the agent.
    assert.match(text, /Uses space-4, space-5/);
    assert.doesNotMatch(text, /rule in|was partly|now space/);
    assert.match(text, /font-size\s*14px\s*→\s*16px/);
    await shot(p, 'tweak-review');
    await review.getByRole('button', { name: 'Save 2' }).click();
    await p.waitForFunction(() => window.__AGENTATION_KIT_TWEAK__.count === 0);
    const stored = tweaks();
    assert.equal(stored.length, 2);
    const pad = stored.find((a) => a.tweak.property === 'padding');
    assert.deepEqual(
      { selector: pad.tweak.selector, from: pad.tweak.from, to: pad.tweak.to, token: pad.tweak.token, ruleSource: pad.tweak.ruleSource },
      { selector: 'a.cta', from: '11px 16px', to: '16px 24px', token: '--space-4 · --space-5', ruleSource: { href: 'styles.css', selector: '.cta' } },
    );
    assert.equal(pad.reviewer, 'Ana');
    assert.equal(pad.elementPath, 'main > div.plans > div.card > a.cta');
    assert.equal(project.describe(pad).split('\n')[1].trim(), 'tweak: a.cta padding 11px 16px → 16px 24px (--space-4 · --space-5), rule in styles.css .cta');
    // In the inbox like an edit: before and after.
    await p.locator('[data-review=inbox]').click();
    const row = p.locator(`section.panel .row[data-annotation="${pad.id}"]`);
    await row.waitFor();
    assert.match(await row.textContent(), /Tweak · desktop.*a\.cta · padding.*11px 16px.*16px 24px \(--space-4 · --space-5\)/s);
    await shot(p, 'tweak-inbox');
    // Leaving Tweak restores the page's own inline style exactly (none).
    await p.keyboard.press('Escape');
    await p.locator('[data-mode=comment]').click();
    assert.equal(await cta.getAttribute('style'), null);
    // A tweak can be rejected from the inbox like any reviewer note.
    const r = await p.evaluate(async (id) => (await fetch(`/__review/__ag/annotations/${id}/withdraw`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, pad.id);
    assert.equal(r, 200);
    assert.equal(project.get(pad.id).status, 'dismissed');
    await p.context().close();
  });

  await t.test('only one of Edit text and Tweak is on; the comment picker stays suspended', async () => {
    const p = await newPage();
    await p.keyboard.press('d');
    await p.waitForFunction(() => window.__AGENTATION_KIT_TWEAK__.active);
    await p.keyboard.press('t');
    await p.waitForFunction(() => window.__AGENTATION_KIT_EDIT__.active && !window.__AGENTATION_KIT_TWEAK__.active);
    await p.evaluate(() => window.__AGENTATION_KIT_TWEAK__.toggle(true));
    assert.equal(await p.evaluate(() => window.__AGENTATION_KIT_EDIT__.active), false);
    await p.locator('h1').click();
    await p.locator('section.tw').waitFor();
    assert.equal(await p.getByPlaceholder('What should change?', { exact: true }).count(), 0);
    await p.context().close();
  });

  await t.test('no tokens: the scale falls back to values the page uses', async () => {
    const p = await newPage({}, '/example');
    await p.keyboard.press('d');
    await p.locator('main button').click();
    await p.locator('section.tw [data-prop=padding] .field').click();
    await p.locator('.pick').getByText('values the page already uses').waitFor();
    assert.ok(await p.locator('.pick .opt', { hasText: '16px' }).count());
    await p.context().close();
  });

  // UX review 4, N7: "#00000000 · Off scale", wrapped to two lines at 1280.
  await t.test('a transparent fill reads None, with a slashed swatch and no scale tag', async () => {
    const p = await newPage({}, '/example');
    await p.keyboard.press('d');
    await p.locator('main h1').click();
    const fill = p.locator('section.tw [data-prop=background-color] .field');
    await fill.waitFor();
    const f = await fill.evaluate((n) => ({ text: n.textContent.replace(/\s+/g, ' ').trim(), sw: !!n.querySelector('.sw'), tok: n.querySelector('.tok').className, lines: Math.round(n.querySelector('.tok').getBoundingClientRect().height / parseFloat(getComputedStyle(n.querySelector('.tok')).lineHeight)) }));
    assert.equal(f.text, 'None');
    assert.equal(f.sw, true);
    assert.equal(f.tok, 'tok');
    assert.equal(f.lines, 1);
    // UX review 5, #16: None is a slash, not a dark square; a near-black
    // colour gets a light ring on the dark panel.
    const sw = (sel) => p.locator(`section.tw [data-prop=${sel}] .field .sw`).evaluate((n) => {
      const cs = getComputedStyle(n);
      return { cls: n.className, image: cs.backgroundImage, colour: cs.backgroundColor, ring: cs.boxShadow };
    });
    const none = await sw('background-color');
    assert.equal(none.cls, 'sw none');
    assert.match(none.image, /linear-gradient/, 'a diagonal slash');
    assert.equal(none.colour, 'rgba(0, 0, 0, 0)');
    const ink = await sw('color'); // the h1's #1b1b1b
    assert.equal(ink.cls, 'sw dark');
    assert.match(ink.ring, /rgba\(255, 255, 255, 0\.25\) 0px 0px 0px 1px inset/);
    // The picker's swatches are drawn the same way.
    await p.locator('section.tw [data-prop=background-color] .field').click();
    await p.locator('.pick .opt').first().waitFor();
    const opts = await p.locator('.pick .opt .sw').evaluateAll((list) => list.map((n) => n.className));
    assert.ok(opts.every((c) => /^sw( none| dark)?$/.test(c)), JSON.stringify(opts));
    assert.ok(opts.includes('sw dark'), `a dark swatch in the picker: ${JSON.stringify(opts)}`);
    await p.context().close();
  });

  await t.test('phone: a bottom sheet under 55% with the element kept in view above it', async () => {
    const p = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await p.evaluate(() => window.__AGENTATION_KIT_TWEAK__.toggle(true));
    await p.locator('a.cta').nth(1).scrollIntoViewIfNeeded();
    await p.locator('a.cta').nth(1).tap();
    await p.locator('section.tw').waitFor();
    await p.waitForTimeout(400);
    const sheet = await rect(p, 'section.tw'), el = await p.locator('a.cta').nth(1).evaluate((n) => { const r = n.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
    assert.ok(sheet.bottom - sheet.top <= 844 * 0.55 + 1, 'at most 55% tall');
    assert.ok(el.bottom <= sheet.top && el.top >= 0, 'the element is above the sheet');
    // Touch targets are 44px.
    const field = await p.locator('section.tw [data-prop=font-size] .field').boundingBox();
    assert.ok(field.height >= 44);
    // A tap leaves :hover stuck: Fill starts from the resting rule, not .cta:hover.
    assert.match(await p.locator('section.tw [data-prop=background-color] .field').textContent(), /^brand/);
    await p.locator('section.tw [data-prop=font-size] .field').tap();
    await p.locator('.pick .opt', { hasText: 'text-lg' }).tap();
    await p.locator('section.tw .ft').getByText('1 tweak').waitFor();
    await shot(p, 'tweak-phone');
    await p.context().close();
  });

  assert.deepEqual(errors, []);
});
