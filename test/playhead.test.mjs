// A page with its own timeline (a film, a HyperFrames preview). The failure this
// answers, measured on a real round (novice-again, 2026-11-12): a note left at
// 14.2 s came back with no time and no scene, and its proof screenshot was of
// frame 0. Here: the timeline contract, what is stored, what the agent reads,
// voice passages, and the screenshot's refusal to photograph the wrong moment.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { uniqueName, cleanup, ORIGIN, readNote } from './_seed.mjs';

const { resolveTimeline, cleanPlayhead, readPlayhead, playheadRows, playheadLabel, clock } = await import('../server/playhead.js');
const { describeAnnotation } = await import('../server/format.js');
const { captureShot } = await import('../server/shots.js');
const { openProject } = await import('../server/agent.js');
const { handle } = await import('../server/store.js');
const { createSession, addAnchor, addPlayhead, playheadAt, transcriptToPassages, exportNotes } = await import('../toolbar/voice-model.js');

after(() => cleanup());

// ---- a small DOM, enough for the HyperFrames reader -------------------------
function node(tag, attrs = {}, children = []) {
  const n = {
    nodeType: 1, tagName: tag.toUpperCase(), id: attrs.id || '', children, parentElement: null,
    getAttribute: (k) => (k in attrs ? String(attrs[k]) : null),
    hasAttribute: (k) => k in attrs,
  };
  for (const c of children) c.parentElement = n;
  return n;
}
const find = (n, id) => (n.id === id ? n : n.children.map((c) => find(c, id)).find(Boolean) || null);
function film() {
  const video = node('video', { id: 'w3-vid', 'data-start': 0, 'data-duration': 5.2, src: 'assets/culler.mp4' });
  const label = node('div', { id: 'st-w3', 'data-start': 12.3, 'data-duration': 4.2 });
  const w2 = node('div', { id: 'w2', 'data-composition-id': 'w2', 'data-composition-src': 'compositions/w2.html', 'data-start': 6.4, 'data-duration': 6.4 });
  // As the preview serves a scene: its length and file under other names, and a wrapper inside it.
  const inner = node('div', { 'data-hf-inner-root': 'true', 'data-width': 1920, 'data-height': 1080 }, [video]);
  const w3 = node('div', { id: 'w3', 'data-composition-id': 'w3', 'data-composition-file': 'compositions/w3.html', 'data-start': 11.8, 'data-hf-authored-duration': 5.2 }, [inner]);
  const stamp = node('div', { id: 'stamp', 'data-composition-id': 'stamp', 'data-composition-src': 'compositions/stamp.html', 'data-start': 0, 'data-duration': 40 }, [label]);
  const music = node('audio', { id: 'music', 'data-start': 0, 'data-duration': 41.5, src: 'assets/audio/bed.mp3' });
  const whoosh = node('audio', { id: 'sfx-zoom-2', 'data-start': 11.83, 'data-end': 12.4, src: 'assets/audio/sfx/whoosh-short.mp3' });
  const root = node('div', { id: 'root', 'data-composition-id': 'main', 'data-start': 0, 'data-duration': 50.8, 'data-width': 1920, 'data-height': 1080 }, [w2, w3, stamp, music, whoosh]);
  let time = 0, playing = false;
  const calls = [];
  const win = {
    document: { querySelector: (s) => (s === '[data-composition-id]' ? root : null), getElementById: (id) => find(root, id) },
    __player: {
      getTime: () => time, getDuration: () => 50.8, isPlaying: () => playing,
      play: () => { playing = true; calls.push('play'); }, pause: () => { playing = false; calls.push('pause'); },
      seek: (t) => { time = t; calls.push(`seek ${t}`); },
    },
  };
  return { win, root, video, label, calls, set: (t, p = false) => { time = t; playing = p; } };
}

test('a HyperFrames preview is recognised from its player and its data-start attributes', () => {
  const f = film();
  f.set(14.2);
  const tl = resolveTimeline(f.win);
  assert.equal(tl.source, 'hyperframes');
  assert.equal(tl.time(), 14.2);
  assert.equal(tl.duration(), 50.8);
  assert.equal(tl.fps(), undefined, 'the preview does not state a frame rate, so none is claimed');
  assert.deepEqual(tl.stage(), { width: 1920, height: 1080 });
  // On screen at 14.2 s: the third scene and the stamp layer; the second scene ended at 12.8.
  assert.deepEqual(tl.clips(14.2).map((c) => `${c.id} ${c.kind}`), ['w3 scene', 'stamp scene', 'music audio']);
  assert.deepEqual(tl.clips(12).map((c) => c.id), ['w2', 'w3', 'stamp', 'music', 'sfx-zoom-2']);
  // A nested element's start counts from its timed parent: the scene's video starts with the scene.
  assert.deepEqual(tl.within(f.video), [
    { id: 'w3', kind: 'scene', start: 11.8, end: 17, src: 'compositions/w3.html' },
    { id: 'w3-vid', kind: 'video', start: 11.8, end: 17, src: 'assets/culler.mp4' },
  ]);
  assert.deepEqual(tl.within(f.label).map((c) => [c.id, c.start, c.end]), [['stamp', 0, 40], ['st-w3', 12.3, 16.5]]);
  tl.pause(); tl.seek(3); tl.play();
  assert.deepEqual(f.calls, ['pause', 'seek 3', 'play']);
});

test('a page can describe its own timeline, and that wins over a player', () => {
  const f = film();
  let t = 2.5;
  f.win.__SHOW_AND_TELL__ = { timeline: {
    time: () => t, duration: () => 9, playing: () => true, fps: 24, seek: (x) => { t = x; },
    clips: () => [{ id: 'intro', kind: 'scene', start: 0, end: 4 }], within: () => [{ id: 'title', start: 1, end: 3 }],
    stage: () => ({ width: 1080, height: 1920 }),
  } };
  const tl = resolveTimeline(f.win);
  assert.equal(tl.source, 'host');
  assert.equal(tl.fps(), 24);
  tl.seek(4);
  assert.equal(tl.time(), 4);
  assert.deepEqual(readPlayhead(f.win, {}), {
    time: 4, duration: 9, fps: 24, frame: 96, playing: true, stage: { width: 1080, height: 1920 },
    clips: [{ id: 'intro', kind: 'scene', start: 0, end: 4 }], within: [{ id: 'title', kind: 'clip', start: 1, end: 3 }], source: 'host',
  });
  // A hook that throws, or has no time, reads as "no answer", never as a crash.
  f.win.__SHOW_AND_TELL__.timeline = { time: () => { throw new Error('not ready'); } };
  assert.equal(resolveTimeline(f.win).time(), undefined);
  assert.equal(readPlayhead(f.win, null), undefined);
});

test('a page with no timeline has no playhead', () => {
  assert.equal(resolveTimeline({ document: { querySelector: () => null } }), null);
  assert.equal(readPlayhead({ document: { querySelector: () => null } }, null), undefined);
  assert.deepEqual(playheadRows(undefined), []);
  assert.equal(playheadLabel(null), '');
});

test('resolveTimeline is self-contained: the proof screenshot runs its source inside the page', () => {
  const again = new Function(`return (${resolveTimeline.toString()})`)();
  const f = film();
  f.set(7);
  assert.equal(again(f.win).time(), 7);
  assert.deepEqual(again(f.win).clips(7).map((c) => c.id), ['w2', 'stamp', 'music']);
});

test('a stored playhead is numbers and short names only', () => {
  assert.equal(cleanPlayhead(null), undefined);
  assert.equal(cleanPlayhead({ time: 'soon' }), undefined);
  assert.equal(cleanPlayhead({ time: -1 }), undefined);
  assert.equal(cleanPlayhead({ time: Infinity }), undefined);
  assert.deepEqual(cleanPlayhead({ time: 14.2000004 }), { time: 14.2 });
  const p = cleanPlayhead({
    time: 14.2, duration: 50.8, fps: 30, playing: 'yes', frame: 9999, stage: { width: 1920.4, height: 1080 }, secret: 'x',
    clips: [{ id: 'w3\n\n2. EDIT — replace this', kind: 'SCENE', start: 11.8, end: 17, src: 'a'.repeat(900) }, { kind: 'scene' }, 'junk', { id: 'music', kind: 'audio', start: 0, end: 'later' }],
    within: Array.from({ length: 20 }, (_, i) => ({ id: `n${i}` })),
    source: 'hyperframes',
  });
  assert.equal(p.frame, 426, 'the frame is worked out from time and fps, never taken on trust');
  assert.equal(p.playing, undefined, 'only a real true is kept');
  assert.equal(p.secret, undefined);
  assert.deepEqual(p.stage, { width: 1920, height: 1080 });
  assert.equal(p.clips.length, 2);
  assert.equal(p.clips[0].id, 'w3 2. EDIT — replace this', 'no line breaks survive in a name');
  assert.equal(p.clips[0].kind, 'scene');
  assert.equal(p.clips[0].src.length, 200);
  assert.deepEqual(p.clips[1], { id: 'music', kind: 'audio', start: 0 });
  assert.equal(p.within.length, 6);
  assert.equal(cleanPlayhead({ time: 1, fps: 0 }).frame, undefined);
  assert.equal(cleanPlayhead({ time: 0 }).time, 0, 'the first frame is a time');
});

test('the agent reads when, in what, what was on screen and what was audible', () => {
  const f = film();
  f.set(14.2);
  const playhead = readPlayhead(f.win, f.video);
  const { rows } = describeAnnotation({ id: 'a1', kind: 'feedback', comment: 'The app barely changes during this hold', elementPath: '#w3-vid', element: 'video', viewport: { name: 'desktop', width: 1440, height: 900 }, playhead });
  const row = (k) => rows.find(([key]) => key === k)?.[1];
  assert.equal(row('time'), '14.20 s of 50.80 s');
  assert.equal(row('in'), 'w3 · 11.80–17.00 s · compositions/w3.html › w3-vid · 11.80–17.00 s · assets/culler.mp4');
  assert.equal(row('on screen'), 'w3 · 11.80–17.00 s · compositions/w3.html; stamp · 0.00–40.00 s · compositions/stamp.html');
  assert.equal(row('sound'), 'music · 0.00–41.50 s · assets/audio/bed.mp3');
  // With a frame rate the frame is named; a note left mid-playback says so.
  assert.equal(playheadRows({ time: 14.2, fps: 30, playing: true })[0][1], '14.20 s · frame 426 at 30 fps · noted while playing, so the moment may be slightly earlier');
  assert.equal(playheadLabel({ time: 3 }), 'at 3.00 s');
  assert.equal(clock(0), '0.00 s');
  // A note with no playhead prints as it always did.
  assert.equal(describeAnnotation({ id: 'a2', kind: 'feedback', comment: 'x' }).rows.some(([k]) => k === 'time'), false);
});

test('the server keeps a cleaned playhead on the note and the CLI prints it', async () => {
  const name = uniqueName('playhead');
  const post = async (rest, body) => (await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify(body) }), name, rest)).json();
  const session = await post('sessions', { url: `${ORIGIN}/film` });
  const made = await post(`sessions/${session.id}/annotations`, {
    id: crypto.randomUUID(), comment: 'Cut this hold in half', element: 'video', elementPath: '#w3-vid', url: `${ORIGIN}/film`,
    playhead: { time: 14.2, duration: 50.8, fps: 30, junk: '<script>', clips: [{ id: 'w3', kind: 'scene', start: 11.8, end: 17, src: 'compositions/w3.html' }] },
  });
  const bad = await post(`sessions/${session.id}/annotations`, { id: crypto.randomUUID(), comment: 'No time on this one', element: 'p', elementPath: 'p', url: `${ORIGIN}/film`, playhead: { time: 'never' } });
  const stored = await readNote(name, made.id);
  assert.deepEqual(stored.playhead, { time: 14.2, duration: 50.8, fps: 30, frame: 426, clips: [{ id: 'w3', kind: 'scene', start: 11.8, end: 17, src: 'compositions/w3.html' }] });
  assert.equal((await readNote(name, bad.id)).playhead, undefined, 'an unusable playhead is dropped, the note is kept');
  const text = openProject(name).describe(openProject(name).get(made.id));
  assert.match(text, /\n {2}time: 14\.20 s of 50\.80 s · frame 426 at 30 fps\n/);
  assert.match(text, /\n {2}on screen: w3 · 11\.80–17\.00 s · compositions\/w3\.html/);
});

test('a voice passage says where the film was when it began', () => {
  let s = createSession({ id: 'v1', page: `${ORIGIN}/film`, viewport: { width: 1440, height: 900, name: 'desktop' }, startedAt: 1000 });
  assert.equal(playheadAt(s, 0), undefined, 'no timeline, no playhead');
  s = addPlayhead(s, { time: 8, playing: false }, 250);            // paused at 8 s when Talk began
  const same = addPlayhead(s, { time: 8, playing: false }, 500);
  assert.equal(same, s, 'a sample the last one already predicts is not kept');
  s = addPlayhead(s, { time: 8, playing: true }, 2000);            // the reviewer presses play
  assert.equal(addPlayhead(s, { time: 9.01, playing: true }, 3000), s, 'still playing at 1x: predicted');
  s = addPlayhead(s, { time: 22.5, playing: true }, 4000);         // they scrub ahead
  s = addPlayhead(s, { time: 23.5, playing: false }, 5000);        // and pause
  assert.deepEqual(s.playheads.map((p) => [p.tMs, p.time, p.playing]), [[250, 8, false], [2000, 8, true], [4000, 22.5, true], [5000, 23.5, false]]);
  assert.deepEqual(playheadAt(s, 0), { time: 8, playing: false }, 'before the first sample: the first sample');
  assert.deepEqual(playheadAt(s, 3500), { time: 9.5, playing: true });
  assert.deepEqual(playheadAt(s, 4500), { time: 23, playing: true });
  assert.deepEqual(playheadAt(s, 9000), { time: 23.5, playing: false });
  // The track survives the model's own operations, and each note carries its moment.
  s = addAnchor(s, { kind: 'element', label: 'Photo Culler recording', selector: '#w3-vid' }, 5200);
  assert.equal(s.playheads.length, 4);
  s = transcriptToPassages(s, [{ id: 'a', startMs: 300, endMs: 1800, text: 'The opening is fine.' }, { id: 'b', startMs: 5300, endMs: 7000, text: 'This hold is too long.' }]);
  const notes = exportNotes(s);
  assert.deepEqual(notes.map((n) => n.playhead), [{ time: 8, playing: false }, { time: 23.5, playing: false }]);
  assert.equal(addPlayhead(s, { time: NaN }, 6000), s);
  assert.equal(addPlayhead(s, { time: 1 }, 100), s, 'never out of order');
});

// ---- the proof screenshot ---------------------------------------------------
function fakePlaywright({ moved, rests = null }) {
  const seen = { contexts: [], evaluated: [] };
  const page = {
    goto: async () => ({ status: () => 200 }),
    waitForTimeout: async () => {},
    evaluate: async (fn, arg) => {
      const source = typeof fn === 'string' ? fn : '';
      const name = /async function seekInPage/.test(source) ? 'seekInPage' : source ? 'timelineProbe' : 'target';
      seen.evaluated.push({ name, source, arg });
      if (name === 'seekInPage') return moved;
      if (name === 'timelineProbe') return rests;
      return null; // no selector matched: the whole viewport
    },
    screenshot: async ({ clip }) => { seen.clip = clip; return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]); },
  };
  return { seen, chromium: { launch: async () => ({ newContext: async (o) => { seen.contexts.push(o); return { addInitScript: async () => {}, newPage: async () => page }; }, close: async () => {} }) } };
}

test('a note with a playhead is photographed at its moment, at the size the piece is made at', async () => {
  const pw = fakePlaywright({ moved: { ok: true } });
  const playhead = { time: 14.2, stage: { width: 1920, height: 1080 } };
  const r = await captureShot({ url: `${ORIGIN}/film`, viewport: { width: 1440, height: 900 }, selectors: ['#w3-vid'], playhead, playwright: pw, settleMs: 0 });
  assert.deepEqual(pw.seen.contexts[0].viewport, { width: 1920, height: 1080 }, 'the whole frame, not the window the reviewer watched it in');
  const seek = pw.seen.evaluated.find((e) => e.name === 'seekInPage');
  assert.match(seek.source, /resolve: function resolveTimeline\(win\)/, 'the page gets the same timeline reader the toolbar uses');
  assert.match(seek.source, /time: 14\.2, waitMs: 10000, seekMs: 8000 \}\)\)$/);
  assert.doesNotMatch(seek.source, /new Function|\beval\(/, 'nothing a page\'s Content-Security-Policy would refuse');
  // The source parses as one expression, the way the browser receives it.
  assert.doesNotThrow(() => new Function(`return ${seek.source}`));
  assert.equal(pw.seen.contexts[0].isMobile, false);
  assert.equal(pw.seen.evaluated[0].name, 'seekInPage', 'it seeks before it looks for the target');
  assert.equal(r.time, 14.2);
  assert.deepEqual(r.viewport, { width: 1920, height: 1080 });
  assert.equal(pw.seen.evaluated.find((e) => e.name === 'target').arg.still, true, 'a fixed stage is not scrolled to centre the target');
  // A small stage is a small film, not a phone; a video still loading is said, not hidden.
  const small = fakePlaywright({ moved: { ok: true, unsettled: true } });
  const s2 = await captureShot({ url: `${ORIGIN}/film`, playhead: { time: 1, stage: { width: 480, height: 270 } }, playwright: small, settleMs: 0 });
  assert.equal(small.seen.contexts[0].isMobile, false);
  assert.equal(small.seen.contexts[0].deviceScaleFactor, 1);
  assert.equal(s2.unsettled, true);
});

test('a page that cannot be moved to the moment is an error, never a picture of frame 0', async () => {
  const pw = fakePlaywright({ moved: { ok: false, why: 'has no timeline to move' } });
  await assert.rejects(
    captureShot({ url: `${ORIGIN}/film`, viewport: { width: 1440, height: 900 }, playhead: { time: 14.2 }, playwright: pw, settleMs: 0 }),
    /has no timeline to move, so the note's moment \(14\.20 s\) cannot be photographed.*--shot-file/s,
  );
  assert.equal(pw.seen.clip, undefined, 'nothing was photographed');
  // A note with no playhead is photographed as before, with no seek.
  const plain = fakePlaywright({ moved: { ok: true } });
  const r = await captureShot({ url: `${ORIGIN}/page`, viewport: { width: 1440, height: 900 }, playwright: plain, settleMs: 0 });
  assert.equal(plain.seen.evaluated.some((e) => e.name === 'seekInPage'), false);
  assert.equal(r.time, undefined);
  assert.equal(r.untimed, undefined);
  assert.deepEqual(plain.seen.contexts[0].viewport, { width: 1440, height: 900 });
  assert.equal(plain.seen.evaluated.find((e) => e.name === 'target').arg.still, false, 'an ordinary page is still scrolled to its target');
  // A note with no time on a page that HAS a timeline (a layout drag, a measured check): the picture says where it was taken.
  const film0 = fakePlaywright({ moved: { ok: true }, rests: 0 });
  const untimed = await captureShot({ url: `${ORIGIN}/film`, viewport: { width: 1440, height: 900 }, playwright: film0, settleMs: 0 });
  assert.deepEqual([untimed.time, untimed.untimed], [0, true]);
});

// ---- HyperFrames' own timing rules ------------------------------------------
test('starts follow HyperFrames\' rules: relative to another clip, and local to the composition', () => {
  const f = film();
  const add = (parent, n) => { parent.children.push(n); n.parentElement = parent; return n; };
  // In the root composition: "when that clip ends", give or take.
  const intro = add(f.root, node('video', { id: 'intro', 'data-start': 0, 'data-duration': 4, src: 'intro.mp4' }));
  const result = add(f.root, node('section', { id: 'result', 'data-start': 'intro + 0.5', 'data-duration': 3 }));
  const early = add(f.root, node('section', { id: 'early', 'data-start': 'intro - 0.5', 'data-duration': 1 }));
  const after = add(f.root, node('section', { id: 'after', 'data-start': 'result', 'data-duration': 2 }));
  // Cannot be worked out: an unknown clip, a cycle, a start that is neither a number nor a reference.
  add(f.root, node('section', { id: 'lost', 'data-start': 'nobody + 1', 'data-duration': 2 }));
  add(f.root, node('section', { id: 'loop-a', 'data-start': 'loop-b', 'data-duration': 2 }));
  add(f.root, node('section', { id: 'loop-b', 'data-start': 'loop-a', 'data-duration': 2 }));
  add(f.root, node('section', { id: '3d-title', 'data-start': '3d intro', 'data-duration': 2 }));
  const tl = resolveTimeline(f.win);
  const span = (el) => tl.within(el).map((c) => [c.id, c.start, c.end]);
  assert.deepEqual(span(intro), [['intro', 0, 4]]);
  assert.deepEqual(span(result), [['result', 4.5, 7.5]]);
  assert.deepEqual(span(early), [['early', 3.5, 4.5]]);
  assert.deepEqual(span(after), [['after', 7.5, 9.5]]);
  const ids = tl.clips(1).map((c) => c.id);
  for (const id of ['lost', 'loop-a', 'loop-b', '3d-title']) assert.equal(ids.includes(id), false, `${id} has no start that can be worked out, so it is left out, never read as 0`);
  assert.equal(ids.includes('intro'), true);

  // A timed wrapper does not offset what is inside it: only a composition host does.
  const wrapper = add(f.root, node('div', { id: 'wrap', 'data-start': 5, 'data-duration': 10 }));
  const title = add(wrapper, node('h1', { id: 'title', 'data-start': 6, 'data-duration': 3 }));
  assert.deepEqual(span(title), [['wrap', 5, 15], ['title', 6, 9]]);
  // Inside a composition host it is local time; a legacy global start is film time already.
  const local = add(f.video.parentElement, node('div', { id: 'local', 'data-start': 1, 'data-duration': 2 }));
  const legacy = add(f.video.parentElement, node('audio', { id: 'legacy', 'data-start': 12, 'data-duration': 2, 'data-hf-media-start-basis': 'global', src: 'vo.mp3' }));
  assert.deepEqual(span(local).at(-1), ['local', 12.8, 14.8]);
  assert.deepEqual(span(legacy).at(-1), ['legacy', 12, 14]);
  // Media may leave its length out: an image shows for 3 s, a video for its own length.
  const still = add(f.root, node('img', { id: 'still', 'data-start': 20 }));
  const clip = add(f.root, node('video', { id: 'clip', 'data-start': 20 })); clip.duration = 6.5;
  assert.deepEqual([span(still), span(clip)], [[['still', 20, 23]], [['clip', 20, 26.5]]]);
});

test('a film resting on its last frame still says what was showing', () => {
  const f = film();
  const last = node('div', { id: 'end-card', 'data-composition-id': 'end', 'data-start': 40, 'data-duration': 10.8 });
  f.root.children.push(last); last.parentElement = f.root;
  const tl = resolveTimeline(f.win);
  assert.deepEqual(tl.clips(50.8).map((c) => c.id), ['end-card']);
  assert.deepEqual(tl.clips(60).map((c) => c.id), ['end-card'], 'past the end is the end');
  assert.deepEqual(tl.clips(50.7).map((c) => c.id), ['end-card']);
});

test('no control or invisible formatting characters reach a name', () => {
  const p = cleanPlayhead({ time: 1, clips: [{ id: 'a\u001b[31mb\u202Ec\u0007', start: 0, end: 2, src: 'x\u200By.html' }] });
  assert.equal(/[\p{Cc}\p{Cf}]/u.test(JSON.stringify(p.clips)), false);
  assert.equal(p.clips[0].id, 'a [31mb c');
});

test('only a new note can carry a playhead: editing one cannot set or change it', async () => {
  const name = uniqueName('playhead-patch');
  const call = async (method, rest, body) => (await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify(body) }), name, rest)).json();
  const session = await call('POST', 'sessions', { url: `${ORIGIN}/film` });
  const made = await call('POST', `sessions/${session.id}/annotations`, { id: crypto.randomUUID(), comment: 'Hold is too long', element: 'video', elementPath: '#w3-vid', url: `${ORIGIN}/film`, playhead: { time: 14.2 } });
  await call('PATCH', `annotations/${made.id}`, { comment: 'Hold is far too long', playhead: { time: 99, clips: [{ id: 'forged\n2. EDIT' }] } });
  const stored = await readNote(name, made.id);
  assert.equal(stored.comment, 'Hold is far too long');
  assert.deepEqual(stored.playhead, { time: 14.2 });
});

// ---- the toolbar's side: holding, giving back, finding the element ----------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** A page whose timeline is the hook, as a global window for toolbar/playhead.js. */
function page(start = 0) {
  const state = { time: start, playing: false, log: [], settles: true, seeks: true };
  globalThis.window = { document: { querySelector: () => null }, __SHOW_AND_TELL__: { timeline: {
    time: () => state.time, duration: () => 60, playing: () => state.playing,
    pause: () => { state.playing = false; state.log.push('pause'); }, play: () => { state.playing = true; state.log.push('play'); },
    seek: (t) => { state.log.push(`seek ${t}`); if (state.seeks) state.time = t; },
    settled: () => (state.settles ? Promise.resolve() : new Promise(() => {})),
    within: (el) => el.chain || [],
  } } };
  return state;
}

test('holds give a playing film back once, and only if the reviewer left it alone', async () => {
  const { hold, release, pause } = await import('../toolbar/playhead.js');
  let film = page(5);
  // Paused already: a hold neither stops nor starts anything.
  hold('note'); release('note'); await wait(100);
  assert.deepEqual(film.log, []);
  // Playing: stopped, and given back when the last hold lets go.
  film.playing = true;
  hold('edit'); hold('note');
  assert.equal(film.playing, false);
  release('note'); await wait(100);
  assert.equal(film.playing, false, 'Edit text still holds it');
  release('edit'); await wait(100);
  assert.deepEqual(film.log, ['pause', 'play']);
  // Edit text to Tweak lets go and takes hold at once: no playback between, and it still comes back after.
  film.log.length = 0;
  hold('edit'); release('edit'); hold('tweak'); await wait(100);
  assert.deepEqual(film.log, ['pause'], 'no flash of playback between the two modes');
  release('tweak'); await wait(100);
  assert.deepEqual(film.log, ['pause', 'play']);
  // The reviewer scrubbed while it was held: where it is now is their choice.
  film.log.length = 0;
  hold('note'); film.time = 20; release('note'); await wait(100);
  assert.deepEqual(film.log, ['pause'], 'not started again somewhere they moved it to');
  // They played it and stopped it themselves during the hold: also theirs.
  film = page(5); film.playing = true;
  hold('note'); film.playing = true; film.time = 6; film.playing = false; release('note'); await wait(100);
  assert.deepEqual(film.log, ['pause']);
  // Talk (pause) cancels a give-back that was about to happen, and never resumes.
  film = page(5); film.playing = true;
  hold('note'); release('note'); pause(); await wait(100);
  assert.deepEqual(film.log, ['pause']);
  // A page with no timeline: nothing happens, nothing throws.
  globalThis.window = { document: { querySelector: () => null } };
  hold('note'); release('note'); pause(); await wait(80);
});

test('going back to a moment is bounded and says whether it arrived', async () => {
  const { showMoment, soon } = await import('../toolbar/playhead.js');
  assert.equal(await soon(new Promise(() => {}), 30), 'late');
  assert.equal(await soon(Promise.reject(new Error('x')), 30), 'failed');
  assert.equal(await soon(undefined, 30), 'done');
  let film = page(1); film.playing = true;
  assert.equal(await showMoment(14.2), true);
  assert.deepEqual([film.time, film.playing], [14.2, false]);
  // Already there: no seek, and a settle that would never fire is not waited on.
  film.settles = false; film.log.length = 0;
  assert.equal(await showMoment(14.2, { seekMs: 50 }), true);
  assert.deepEqual(film.log, []);
  // A settle that never comes is bounded; the film is where it should be, so it still counts.
  assert.equal(await showMoment(3, { seekMs: 50 }), true);
  // A seek that does not arrive is false, not a claim.
  film.seeks = false;
  assert.equal(await showMoment(30, { seekMs: 50 }), false);
  // No timeline within the wait: false.
  globalThis.window = { document: { querySelector: () => null } };
  assert.equal(await showMoment(3, { wait: 100 }), false);
  assert.equal(await showMoment('soon'), false);
});

test('a selector that matches one element per scene means the one playing at that time', async () => {
  const { targetAt } = await import('../toolbar/playhead.js');
  page(14.2);
  const el = (id, chain) => ({ id, chain, isConnected: true, contains: (o) => o === undefined ? false : o.parent === id });
  const one = el('h1-scene-1', [{ id: 's1', start: 0, end: 5 }]), three = el('h1-scene-3', [{ id: 's3', start: 11.8, end: 17 }]);
  globalThis.document = { querySelectorAll: (s) => { if (s === ':::') throw new Error('bad selector'); return s === 'div.scene > h1' ? [one, three] : s === '#only' ? [one] : []; } };
  assert.equal(targetAt('div.scene > h1', 14.2).id, 'h1-scene-3', 'not the first match, which is the first scene\'s');
  assert.equal(targetAt('div.scene > h1', 2).id, 'h1-scene-1');
  assert.equal(targetAt('div.scene > h1', 30).id, 'h1-scene-1', 'nothing playing then: the first, as before');
  // What they pressed wins over the clock: a word inside the third title.
  const word = { parent: 'h1-scene-3', isConnected: true, contains: () => false };
  assert.equal(targetAt('div.scene > h1', 2, word).id, 'h1-scene-3');
  assert.equal(targetAt('#only', 14.2).id, 'h1-scene-1');
  assert.equal(targetAt('', 1), null);
  assert.equal(targetAt(':::', 1), null);
  assert.equal(targetAt('#gone', 1), null);
});
