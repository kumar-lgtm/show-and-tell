// Opt in after build: AGENTATION_KIT_BROWSER_TESTS=1 node --test test/hosted-flags-browser.test.mjs
// A hosted link (ShareKit) has no transcription route and no source to read,
// so its config turns Talk and All text off. Off must mean absent: no handle,
// no shortcut, no request to a route that would 404.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

test('voice:false and copyView:false remove Talk and All text; the defaults keep them', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 120000,
}, async (t) => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const base = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8');
  const browser = await chromium.launch();
  const servers = [];
  t.after(async () => { await browser.close(); for (const s of servers) { s.closeAllConnections(); await new Promise((r) => s.close(r)); } cleanup(); });

  const boot = async (config) => {
    let app;
    const requests = [];
    const server = createServer((req, res) => {
      requests.push(req.url);
      if (req.url.startsWith('/__review/')) return app.handler(req, res, new URL(req.url, 'http://x').pathname.slice(9));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(base.replace('</head>', '<script src="/__review/loader.js"></script></head>'));
    });
    servers.push(server);
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const origin = `http://127.0.0.1:${server.address().port}`;
    app = createReviewApp({ name: uniqueName('hosted-flags'), base: '/__review', origins: [origin], config, voiceTranscriber: null, voiceBudget: null });
    const p = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    await p.goto(origin, { waitUntil: 'load' });
    await p.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__);
    await p.waitForTimeout(600);
    const handles = await p.evaluate(() => ({
      voice: !!window.__AGENTATION_KIT_VOICE__,
      copy: !!window.__AGENTATION_KIT_COPY__,
      allText: typeof window.__SHOW_AND_TELL__?.allText,
    }));
    const before = requests.length;
    await p.keyboard.press('Shift+T');
    await p.waitForTimeout(500);
    const shortcutRequests = requests.slice(before).filter((u) => u.includes('copy-map'));
    return { handles, requests, shortcutRequests };
  };

  const off = await boot({ voice: false, copyView: false });
  assert.deepEqual(off.handles, { voice: false, copy: false, allText: 'undefined' });
  assert.deepEqual(off.requests.filter((u) => u.includes('/voice/')), [], 'no voice route is asked for');
  assert.deepEqual(off.shortcutRequests, [], 'Shift T does nothing');

  const on = await boot({ voice: true });
  assert.deepEqual(on.handles, { voice: true, copy: true, allText: 'function' });
  assert.ok(on.shortcutRequests.length >= 1, 'Shift T opens All text by default');
});
