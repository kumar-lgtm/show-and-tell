import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// The novice-again round, end to end (2026-11-12): a film at one URL, playing,
// and a reviewer who points at it. Before: the note had no time, the film ran on
// under the open note, and the proof screenshot and Check both showed whatever
// frame the page happened to be on. Now: pointing stops it at the moment they
// pressed, the note says when and in which scene, Add gives the film back, the
// screenshot is of that moment, and Check returns them to it.
const FILM = `<!doctype html><html><head><meta charset="utf-8"><title>Film</title>
<style>
  *{margin:0;box-sizing:border-box} html,body{width:800px;height:450px;overflow:hidden;background:#111;font:16px system-ui}
  #root{position:relative;width:800px;height:450px;overflow:hidden}
  .scene{position:absolute;inset:0;display:grid;place-items:center;color:#fff}
  #s1{background:#264653} #s2{background:#9b2226}
  h1{font-size:56px} #cap{position:absolute;left:40px;bottom:40px;font-size:22px}
</style>
<script src="/__review/loader.js"></script></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="20" data-width="800" data-height="450">
  <div id="s1" class="scene" data-composition-id="s1" data-composition-src="compositions/s1.html" data-start="0" data-duration="10"><h1 id="t1">Scene one</h1></div>
  <div id="s2" class="scene" data-composition-id="s2" data-composition-src="compositions/s2.html" data-start="10" data-duration="10"><h1 id="t2">Scene two</h1><p id="cap" data-start="2" data-duration="5">A caption</p></div>
  <audio id="music" data-start="0" data-duration="20" src="bed.mp3"></audio>
</div>
<script>
  // A stand-in for the HyperFrames preview player: the same method names, a real clock.
  (function () {
    var time = 0, playing = false, from = 0;
    var now = function () { return playing ? Math.min(20, time + (performance.now() - from) / 1000) : time; };
    function render() {
      var t = now();
      document.getElementById('s1').style.visibility = t < 10 ? 'visible' : 'hidden';
      document.getElementById('s2').style.visibility = t >= 10 ? 'visible' : 'hidden';
      document.getElementById('cap').style.visibility = t >= 12 && t < 17 ? 'visible' : 'hidden';
      document.documentElement.dataset.t = t.toFixed(2);
    }
    function paint() { render(); requestAnimationFrame(paint); }
    window.__player = {
      getTime: now, getDuration: function () { return 20; }, isPlaying: function () { return playing; },
      play: function () { if (!playing) { from = performance.now(); playing = true; } },
      pause: function () { time = now(); playing = false; },
      // Like the real player, a seek has drawn its frame by the time it returns.
      seek: function (t) { time = t; from = performance.now(); render(); navigator.sendBeacon('/seeked?t=' + t + '&w=' + innerWidth + '&h=' + innerHeight); },
    };
    window.__playerReady = true;
    paint();
  })();
</script></body></html>`;

// A page with no timeline at all, and one whose timeline takes a seek and never answers.
const PLAIN = `<!doctype html><html><head><meta charset="utf-8"><title>Plain</title><script src="/__review/loader.js"></script></head><body style="margin:40px;font:16px system-ui"><h1 id="headline">An ordinary page</h1></body></html>`;
const STUCK = `<!doctype html><html><head><meta charset="utf-8"><title>Stuck</title></head><body><h1 id="headline">A film that never finishes seeking</h1><script>
  window.__SHOW_AND_TELL__ = { timeline: { time: function () { return 0; }, duration: function () { return 30; }, playing: function () { return false; }, pause: function () {}, seek: function () { return new Promise(function () {}); } } };
</script></body></html>`;

const SKIP = !process.env.AGENTATION_KIT_BROWSER_TESTS;

/** The film on its own server, with the review app mounted beside it. */
async function stage(t, prefix, appOptions = {}) {
  const require = createRequire(import.meta.url);
  const playwright = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName, tree } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const shots = process.env.AGENTATION_KIT_SCREENSHOTS;
  if (shots) mkdirSync(shots, { recursive: true });

  const src = tree({ 'index.html': FILM });
  let app;
  const seeks = [];
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/__review/')) return app.handler(req, res, url.pathname.slice(9));
    if (url.pathname === '/seeked') { seeks.push({ t: Number(url.searchParams.get('t')), w: Number(url.searchParams.get('w')), h: Number(url.searchParams.get('h')) }); res.writeHead(204); return res.end(); }
    const html = { '/': () => readFileSync(join(src, 'index.html')), '/strict': () => readFileSync(join(src, 'index.html')), '/plain': () => PLAIN, '/stuck': () => STUCK }[url.pathname];
    if (!html) { res.writeHead(404); return res.end(); }
    // /strict is the film behind a policy that refuses eval and new Function in the page.
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store', ...(url.pathname === '/strict' ? { 'Content-Security-Policy': "script-src 'self' 'unsafe-inline'" } : {}) });
    res.end(html());
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`, name = uniqueName(prefix);
  app = createReviewApp({ name, base: '/__review', origins: [origin], src, ...appOptions });
  const browser = await playwright.chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise((r) => server.close(r)); cleanup(src); });
  return { origin, browser, seeks, shots, playwright, project: openProject(name, { src }) };
}

test('a film: pointing stops it, the note says when, the screenshot and Check go back there', { skip: SKIP, timeout: 120000 }, async (t) => {
  const { origin, browser, seeks, shots, project } = await stage(t, 'playhead-browser');

  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'BK'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__ && window.__AGENTATION_KIT_REVIEW__ && window.__SHOW_AND_TELL__?.playhead);
  const film = () => page.evaluate(() => ({ t: window.__player.getTime(), playing: window.__player.isPlaying() }));
  // Into the note field itself: keys sent before it has focus are toolbar shortcuts (T is Edit text).
  // And wait for the popup to leave: it lingers ~150ms, and a press during that only shakes it.
  const say = async (text) => { const field = page.locator('[data-annotation-popup] textarea'); await field.fill(text); await field.press('Enter'); await page.waitForFunction(() => !document.querySelector('[data-annotation-popup]')); };

  // The page reports its playhead with nothing configured.
  await page.evaluate(() => window.__player.seek(12.5));
  assert.deepEqual(await page.evaluate(() => { const p = window.__SHOW_AND_TELL__.playhead(); return [p.time, p.duration, p.source, p.clips.map((c) => c.id).join(','), p.stage.width]; }), [12.5, 20, 'hyperframes', 's2,music', 800]);

  // ---- 1. Point while it plays: it stops at the moment of the press.
  await page.evaluate(() => window.__player.play());
  await page.keyboard.press('ControlOrMeta+Shift+F');
  await page.waitForTimeout(500);
  await page.keyboard.press('n');
  await page.waitForTimeout(300);
  const box = await page.locator('#t2').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
  const before = await film();
  assert.equal(before.playing, true, 'entering Comment mode does not stop the film; pointing does');
  await page.mouse.down();
  const pressed = (await film()).t;
  await page.mouse.up();
  await page.locator('[data-annotation-popup] textarea').waitFor({ state: 'visible' });
  await page.waitForTimeout(600); // long enough to show a film that had not stopped
  const held = await film();
  assert.equal(held.playing, false, 'an open note holds the film still');
  assert.ok(Math.abs(held.t - pressed) < 0.12, `stopped where they pressed (${pressed.toFixed(2)} s), not where the popup caught up: ${held.t.toFixed(2)} s`);
  if (shots) await page.screenshot({ path: join(shots, 'playhead-1-note-open.png') });

  // ---- 2. Add: the note carries the moment, and the film is given back.
  await say('This title sits too low');
  await page.waitForFunction(() => window.__player.isPlaying(), null, { timeout: 5000 });
  let note;
  for (let i = 0; i < 60 && !note; i++) { note = project.items().find((a) => /too low/.test(a.comment)); if (!note) await page.waitForTimeout(50); }
  assert.ok(note, 'the note reached the server');
  assert.ok(Math.abs(note.playhead.time - held.t) < 0.02, `the note's time is the held frame: ${note.playhead.time} vs ${held.t}`);
  assert.equal(note.playhead.playing, true, 'it says the film was playing when they pointed');
  assert.equal(note.playhead.duration, 20);
  assert.deepEqual(note.playhead.stage, { width: 800, height: 450 });
  assert.deepEqual(note.playhead.clips.map((c) => `${c.id}:${c.kind}`), ['s2:scene', 'music:audio']);
  assert.deepEqual(note.playhead.within.map((c) => [c.id, c.start, c.end, c.src]), [['s2', 10, 20, 'compositions/s2.html']]);
  const listed = project.describe(note);
  assert.match(listed, /\n {2}time: 1\d\.\d\d s of 20\.00 s · noted while playing/);
  assert.match(listed, /\n {2}in: s2 · 10\.00–20\.00 s · compositions\/s2\.html\n/);
  assert.match(listed, /\n {2}on screen: s2 · 10\.00–20\.00 s · compositions\/s2\.html\n/);
  assert.match(listed, /\n {2}sound: music · 0\.00–20\.00 s · bed\.mp3/);

  // ---- 3. A note left while paused leaves it paused, and Cancel gives a playing film back too.
  await page.evaluate(() => { window.__player.pause(); window.__player.seek(3); });
  // Off-centre: the first note's marker sits on the middle of the title, in every scene (markers are not
  // tied to time yet), and pressing a marker edits that note instead of starting one.
  const t1 = await page.locator('#t1').boundingBox();
  const at1 = [t1.x + 24, t1.y + t1.height / 2];
  await page.mouse.click(...at1);
  await page.locator('[data-annotation-popup] textarea').waitFor({ state: 'visible' });
  await say('Scene one opens flat');
  await page.waitForTimeout(500);
  assert.deepEqual(await film(), { t: 3, playing: false }, 'a film that was paused stays paused');
  let second;
  for (let i = 0; i < 60 && !second; i++) { second = project.items().find((a) => /opens flat/.test(a.comment)); if (!second) await page.waitForTimeout(50); }
  assert.equal(second.playhead.time, 3);
  assert.equal(second.playhead.playing, undefined);
  assert.deepEqual(second.playhead.within.map((c) => c.id), ['s1']);
  await page.evaluate(() => window.__player.play());
  await page.mouse.click(at1[0] + 60, at1[1]);
  await page.locator('[data-annotation-popup] textarea').waitFor({ state: 'visible' });
  assert.equal((await film()).playing, false);
  await page.locator('[data-annotation-popup]').getByText('Cancel', { exact: true }).click();
  await page.waitForFunction(() => window.__player.isPlaying(), null, { timeout: 5000 });
  await page.waitForFunction(() => !document.querySelector('[data-annotation-popup]'));
  await page.evaluate(() => window.__player.pause());

  // ---- 3b. Edit text and Tweak hold it while they are on, and give it back.
  for (const mode of ['EDIT', 'TWEAK']) {
    const turn = (on) => page.evaluate(([m, v]) => window[`__AGENTATION_KIT_${m}__`].toggle(v), [mode, on]);
    await page.evaluate(() => { window.__player.seek(4); window.__player.play(); });
    await turn(true);
    await page.waitForFunction(() => !window.__player.isPlaying(), null, { timeout: 5000 }).catch(() => assert.fail(`${mode} did not hold the film`));
    await turn(false);
    await page.waitForFunction(() => window.__player.isPlaying(), null, { timeout: 5000 }).catch(() => assert.fail(`leaving ${mode} did not give the film back`));
    await page.evaluate(() => window.__player.pause());
  }

  // ---- 3c. A tweak and a text edit say when they were made, not when they were saved.
  await page.evaluate(() => { window.__player.seek(13); const k = window.__AGENTATION_KIT_TWEAK__; k.toggle(true); k.draft({ element: document.getElementById('t2'), property: 'font-size', to: '64px' }); });
  await page.evaluate(() => window.__player.seek(2)); // they move on before saving
  assert.equal((await page.evaluate(() => window.__AGENTATION_KIT_TWEAK__.save())).count, 1);
  await page.evaluate(() => window.__AGENTATION_KIT_TWEAK__.toggle(false));
  const tweak = project.items().find((a) => a.kind === 'tweak');
  assert.equal(tweak.playhead.time, 13);
  assert.deepEqual(tweak.playhead.within.map((c) => c.id), ['s2']);
  await page.evaluate(() => { window.__player.seek(3); window.__AGENTATION_KIT_EDIT__.toggle(true); });
  await page.locator('#t1').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' again');
  await page.evaluate(() => window.__player.seek(8));
  await page.evaluate(() => window.__AGENTATION_KIT_EDIT__.commit());
  let edit;
  for (let i = 0; i < 60 && !edit; i++) { edit = project.items().find((a) => a.kind === 'edit'); if (!edit) await page.waitForTimeout(50); }
  assert.equal(edit?.edit.to, 'Scene one again');
  assert.equal(edit.playhead.time, 3);
  assert.deepEqual(edit.playhead.within.map((c) => c.id), ['s1']);
  await page.evaluate(() => window.__AGENTATION_KIT_EDIT__.toggle(false));

  // Send, the real button: Check the fix only offers changes made after a round was sent.
  await page.evaluate(async () => { await window.__AGENTATION_KIT_REVIEW__.refresh(); window.__AGENTATION_KIT_REVIEW__.open('done'); });
  await page.getByRole('button', { name: /^Send( \d+| to agent)$/ }).click();
  for (let i = 0; i < 40 && !project.round()?.ts; i++) await page.waitForTimeout(50);
  assert.ok(project.round()?.ts, 'the round was sent');
  await page.waitForTimeout(1100); // the resolution must be later than the Send

  // ---- 4. The agent's screenshot is of the note's moment, at the film's own size.
  seeks.length = 0;
  const shot = await project.takeShot(note.id, { settleMs: 200 });
  assert.equal(shot.time, note.playhead.time);
  assert.deepEqual(shot.viewport, { width: 800, height: 450 });
  assert.equal(shot.found, true, 'the title is on screen at that moment');
  assert.deepEqual(seeks.at(-1), { t: note.playhead.time, w: 800, h: 450 }, 'the fresh page was moved to the note\'s time before the picture');
  await project.act('resolve', note.id, 'Raised the title by 40px', { shot });
  assert.match(project.describe(project.get(note.id)), /before shot: \d+×\d+ at 800×450, 1\d\.\d\d s in/);

  // ---- 5. Check the fix takes the reviewer back to that moment.
  await page.evaluate(() => { window.__player.seek(1); window.__player.play(); });
  await page.waitForFunction(() => window.__AGENTATION_KIT_CHECK__.count() === 1, null, { timeout: 10000 });
  await page.evaluate(() => window.__AGENTATION_KIT_CHECK__.start());
  await page.waitForFunction((want) => !window.__player.isPlaying() && Math.abs(window.__player.getTime() - want) < 0.01, note.playhead.time, { timeout: 5000 });
  await page.locator('[data-check-ui]').getByText(/^You asked, at 1\d\.\d\d s$/).waitFor({ state: 'visible', timeout: 5000 });
  if (shots) await page.screenshot({ path: join(shots, 'playhead-2-check.png') });
  await page.waitForTimeout(400);
  assert.equal((await film()).playing, false, 'Check leaves it stopped: the reviewer is looking at one frame');

  assert.deepEqual(errors, []);
});

// Talk on a film. A stand-in microphone and a transcriber that returns two
// sentences: one from the start of the recording, one from its last moments.
test('a film: Talk starts it still, and each passage says where the film was', { skip: SKIP, timeout: 120000 }, async (t) => {
  const { origin, browser, project } = await stage(t, 'playhead-voice', {
    voiceLimits: { requestsPerMinute: 100 }, voiceBudget: null,
    voiceTranscriber: { id: 'qa-controlled', disclosure: 'Controlled QA transcription.', async transcribe({ durationMs }) {
      const end = durationMs / 1000;
      return { text: 'The opening is fine. This title is too low.', segments: [{ start: 0, end: 0.2, text: 'The opening is fine.' }, { start: end - 0.3, end, text: 'This title is too low.' }] };
    } },
  });
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('feedback-toolbar-reviewer', 'Ana');
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] });
    class Recorder { static isTypeSupported() { return true; } constructor() { this.mimeType = 'audio/webm'; this.state = 'inactive'; } start() { this.state = 'recording'; } stop() { this.state = 'inactive'; setTimeout(() => { this.ondataavailable?.({ data: new Blob(['controlled-qa-audio'], { type: this.mimeType }) }); this.onstop?.(); }, 0); } }
    window.MediaRecorder = Recorder;
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.__AGENTATION_KIT_VOICE__ && window.__AGENTATION_KIT_HEALTH__?.ok && window.__SHOW_AND_TELL__?.playhead);
  const film = () => page.evaluate(() => ({ t: window.__player.getTime(), playing: window.__player.isPlaying() }));

  await page.evaluate(() => { window.__player.seek(4); window.__player.play(); });
  await page.evaluate(() => window.__AGENTATION_KIT_VOICE__.open());
  await page.getByRole('button', { name: 'Start recording', exact: true }).click();
  await page.waitForFunction(() => window.__AGENTATION_KIT_VOICE__.state === 'recording');
  await page.waitForFunction(() => !window.__player.isPlaying(), null, { timeout: 5000 });
  const started = (await film()).t;
  assert.ok(started >= 4 && started < 6, `Talk stopped the film where it was: ${started}`);
  await page.waitForTimeout(700); // the first passage is spoken here
  // The reviewer moves on to the second scene and points at its title.
  await page.evaluate(() => window.__player.seek(15));
  await page.waitForTimeout(500);
  await page.locator('#t2').click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.getByRole('textbox', { name: 'Passage 2', exact: true }).waitFor();
  assert.deepEqual(await film(), { t: 15, playing: false }, 'stopping Talk does not start the film');
  await page.getByRole('button', { name: 'Save feedback', exact: true }).click();
  await page.getByText('Saved 2 feedback notes.', { exact: true }).waitFor();

  const notes = project.items().filter((a) => a.kind === 'voice').sort((a, b) => a.voice.startMs - b.voice.startMs);
  assert.deepEqual(notes.map((a) => a.comment), ['The opening is fine.', 'This title is too low.']);
  assert.ok(Math.abs(notes[0].playhead.time - started) < 0.05, `the first passage was spoken at ${started}: ${notes[0].playhead.time}`);
  assert.deepEqual(notes[0].playhead.clips.map((c) => c.id), ['s1', 'music']);
  assert.equal(notes[1].playhead.time, 15);
  assert.deepEqual(notes[1].playhead.clips.map((c) => c.id), ['s2', 'music']);
  assert.deepEqual(notes[1].playhead.within.map((c) => c.id), ['s2'], 'the target they pointed at sits in the second scene');
  assert.match(project.describe(notes[1]), /\n {2}time: 15\.00 s of 20\.00 s\n {2}in: s2 · 10\.00–20\.00 s · compositions\/s2\.html\n/);
  assert.deepEqual(errors, []);
});

// The in-page seek, run for real: every way it can fail is a reason the agent
// can act on, within a bound, and never a picture of some other frame.
test('a page with no timeline is untouched, and a seek that cannot be made is a reason', { skip: SKIP, timeout: 120000 }, async (t) => {
  const { origin, browser, playwright, project } = await stage(t, 'playhead-edges');
  const { captureShot } = await import('../server/shots.js');
  const shoot = (path, extra = {}) => captureShot({ url: origin + path, viewport: { width: 1280, height: 800 }, selectors: ['#t2', '#headline'], playwright, settleMs: 100, ...extra });

  // An ordinary page: no playhead on the note, nothing held, nothing thrown.
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => localStorage.setItem('feedback-toolbar-reviewer', 'BK'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + '/plain');
  await page.waitForFunction(() => window.__AGENTATION_KIT_REVIEW__ && window.__SHOW_AND_TELL__?.playhead);
  assert.equal(await page.evaluate(() => window.__SHOW_AND_TELL__.playhead()), undefined);
  await page.keyboard.press('ControlOrMeta+Shift+F');
  await page.waitForTimeout(500);
  await page.keyboard.press('n');
  await page.waitForTimeout(300);
  await page.locator('#headline').click();
  const field = page.locator('[data-annotation-popup] textarea');
  await field.fill('An ordinary note');
  await field.press('Enter');
  let note;
  for (let i = 0; i < 60 && !note; i++) { note = project.items().find((a) => /ordinary note/.test(a.comment)); if (!note) await page.waitForTimeout(50); }
  assert.ok(note, 'the note reached the server');
  assert.equal('playhead' in note, false);
  assert.equal(/\n {2}(time|in|on screen|sound):/.test(project.describe(note)), false);
  const plain = await shoot('/plain');
  assert.deepEqual([plain.found, plain.time, plain.untimed], [true, undefined, undefined]);
  assert.deepEqual(errors, []);

  // The note has a moment and the page has no timeline any more.
  await assert.rejects(shoot('/plain', { playhead: { time: 5 }, timelineWaitMs: 600 }), /has no timeline to move.*cannot be photographed.*--shot-file/s);
  // The film is shorter than the note's time now.
  await assert.rejects(shoot('/', { playhead: { time: 99 } }), /is 20\.00 s long now, so the note's moment \(99\.00 s\)/);
  // A seek that never answers is bounded.
  const began = Date.now();
  await assert.rejects(shoot('/stuck', { playhead: { time: 5 }, seekTimeoutMs: 700 }), /did not finish seeking within 1 s/);
  assert.ok(Date.now() - began < 15000, 'it gave up instead of hanging');
  // A policy that refuses eval in the page does not stop the seek.
  const strict = await shoot('/strict', { playhead: { time: 12.5, stage: { width: 800, height: 450 } } });
  assert.deepEqual([strict.found, strict.time], [true, 12.5]);
  // A note with no time on a page that has a timeline: photographed where the load rests, and it says so.
  const untimed = await shoot('/');
  assert.deepEqual([untimed.time, untimed.untimed], [0, true]);
});
