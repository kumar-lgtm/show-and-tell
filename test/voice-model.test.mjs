import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, addAnchor, changePage, transcriptToPassages, updatePassage, reassignPassage, splitPassage, removePassage, exportNotes, MAX_IMAGE_CHARS } from '../toolbar/voice-model.js';

const fresh = () => createSession({ id: 'review-one', page: 'https://review.example/pricing', viewport: { width: 1440, height: 900, name: 'desktop' }, reviewer: 'Ana', startedAt: 1000000 });
const element = (label = 'Trial button', selector = 'button.cta') => ({ kind: 'element', label, selector });
const region = () => ({ kind: 'region', label: 'Region 1', rect: { x: 30, y: 80, width: 250, height: 120, scrollY: 400 },
  image: { dataUrl: 'data:image/jpeg;base64,YWJj', width: 250, height: 120, mimeType: 'image/jpeg', capturedAtMs: 1000 } });
const segment = (startMs, endMs, text, words) => ({ id: 's0', startMs, endMs, text, ...(words ? { words } : {}) });

test('sessions start in General, are serializable, and never inherit raw audio', () => {
  const s = fresh();
  assert.equal(s.version, 1);
  assert.equal(s.anchors[0].kind, 'general');
  assert.equal(s.events[0].tMs, 0);
  assert.equal(s.activeAnchorId, s.anchors[0].id);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
  const next = addAnchor({ ...s, audio: 'must-not-persist' }, element(), 100);
  assert.equal('audio' in next, false);
  assert.equal('audio' in createSession({ audio: 'ignored' }), false);
});

test('anchor changes are immutable and reuse a previously selected element', () => {
  const initial = fresh(), before = JSON.stringify(initial);
  let s = addAnchor(initial, element(), 1000);
  const targetId = s.activeAnchorId;
  s = addAnchor(s, { kind: 'general' }, 1500);
  s = addAnchor(s, element(), 2000);
  assert.equal(JSON.stringify(initial), before);
  assert.equal(initial.anchors.length, 1);
  assert.equal(s.anchors.length, 2);
  assert.equal(s.activeAnchorId, targetId);
  assert.deepEqual(s.events.map((e) => e.tMs), [0, 1000, 1500, 2000]);
});

test('region selections retain separate images and scroll geometry', () => {
  let s = addAnchor(fresh(), region(), 1000);
  const first = s.activeAnchorId;
  s = addAnchor(s, region(), 2000);
  assert.notEqual(s.activeAnchorId, first);
  assert.equal(s.anchors[1].rect.scrollY, 400);
  assert.equal(s.anchors[1].image.capturedAtMs, 1000);
  assert.equal(s.anchors[1].image.mimeType, 'image/jpeg');
});

test('a page transition starts a distinct General target and preserves earlier context', () => {
  let s = addAnchor(fresh(), element(), 1000);
  s = changePage(s, 'https://review.example/about', { width: 390, height: 844, name: 'mobile' }, 2000);
  const active = s.anchors.find((a) => a.id === s.activeAnchorId);
  assert.equal(active.kind, 'general');
  assert.equal(active.page, 'https://review.example/about');
  assert.equal(active.viewport.width, 390);
  assert.equal(s.page, 'https://review.example/pricing');
  assert.equal(s.currentPage, 'https://review.example/about');
  s = transcriptToPassages(s, [segment(2100, 2500, 'About needs an introduction.')]);
  const note = exportNotes(s)[0];
  assert.equal(note.url, 'https://review.example/about');
  assert.equal(note.element, 'Page feedback');
});

test('exact boundaries use the new target while a preceding segment stays General', () => {
  const s = transcriptToPassages(addAnchor(fresh(), element(), 1000), [
    { ...segment(0, 1000, 'The page is dense.'), id: 'a' },
    { ...segment(1000, 2000, 'Make the button green.'), id: 'b' },
  ]);
  assert.equal(s.passages[0].anchorId, s.anchors[0].id);
  assert.equal(s.passages[1].anchorId, s.anchors[1].id);
  assert.equal(s.passages[0].needsReview, false);
  assert.equal(s.passages[1].needsReview, false);
});

test('word timestamps split speech at target changes without inventing a text boundary', () => {
  let s = addAnchor(fresh(), element(), 1000);
  s = transcriptToPassages(s, [segment(0, 2000, 'Overall good. Make it green.', [
    { text: 'Overall', startMs: 0, endMs: 400 }, { text: 'good.', startMs: 400, endMs: 1000 },
    { text: 'Make', startMs: 1000, endMs: 1300 }, { text: 'it', startMs: 1300, endMs: 1500 }, { text: 'green.', startMs: 1500, endMs: 2000 },
  ])]);
  assert.equal(s.passages.length, 2);
  assert.deepEqual(s.passages.map((p) => [p.text, p.startMs, p.endMs]), [['Overall good.', 0, 1000], ['Make it green.', 1000, 2000]]);
  assert.equal(s.passages[1].anchorId, s.anchors[1].id);
  assert.ok(s.passages.every((p) => !p.needsReview));
});

test('Whisper-style leading spaces do not get doubled when word groups are joined', () => {
  let s = addAnchor(fresh(), element(), 500);
  s = transcriptToPassages(s, [segment(0, 1500, ' General note. Change it.', [
    { text: ' General', startMs: 0, endMs: 200 }, { text: ' note.', startMs: 200, endMs: 500 },
    { text: ' Change', startMs: 500, endMs: 1000 }, { text: ' it.', startMs: 1000, endMs: 1500 },
  ])]);
  assert.deepEqual(s.passages.map((p) => p.text), ['General note.', 'Change it.']);
});

test('a whole segment inside one target preserves its original words and punctuation', () => {
  const s = transcriptToPassages(fresh(), [segment(0, 1000, 'Keep  the exact words: “Yes!”', [{ text: 'irrelevant', startMs: 0, endMs: 1000 }])]);
  assert.equal(s.passages[0].text, 'Keep  the exact words: “Yes!”');
});

test('a sentence crossing a click without word times stays intact and asks for review', () => {
  let s = addAnchor(fresh(), element(), 1000);
  s = transcriptToPassages(s, [segment(0, 3000, 'This may belong to either target.')]);
  assert.equal(s.passages.length, 1);
  assert.equal(s.passages[0].text, 'This may belong to either target.');
  assert.equal(s.passages[0].anchorId, s.anchors[1].id, 'largest overlap wins');
  assert.equal(s.passages[0].needsReview, true);
  assert.equal(s.passages[0].candidateAnchorIds.length, 2);
});

test('partial word timing never drops unrepresented transcript words', () => {
  const s = transcriptToPassages(addAnchor(fresh(), element(), 500), [segment(0, 1000, 'These are all the words.', [
    { text: 'These', startMs: 0, endMs: 100 }, { text: 'words.', startMs: 600, endMs: 1000 },
  ])]);
  assert.equal(s.passages[0].text, 'These are all the words.');
  assert.equal(s.passages[0].needsReview, true);
  assert.equal(s.passages[0].timingApproximate, true);
});

test('a provider without timing preserves its uncertainty in agent metadata', () => {
  const s = transcriptToPassages(fresh(), [{ ...segment(0, 2000, 'Whole recording text'), timingUncertain: true }]);
  assert.equal(s.passages[0].timingApproximate, true);
  assert.equal(exportNotes(s)[0].voice.timingApproximate, true);
});

test('same-target clicks do not create ambiguity, and same-time switches use the last one', () => {
  let s = addAnchor(fresh(), element(), 1000);
  s = addAnchor(s, element(), 1200);
  s = transcriptToPassages(s, [segment(1000, 2000, 'A single target.')]);
  assert.equal(s.passages[0].needsReview, false);
  s = addAnchor(s, { kind: 'general' }, 2000);
  s = addAnchor(s, element('Price', '.price'), 2000);
  s = transcriptToPassages(s, [segment(2000, 2000, 'An instantaneous result.')]);
  assert.equal(s.passages[0].anchorId, s.activeAnchorId);
});

test('a word straddling a boundary is still explicitly ambiguous', () => {
  const s = transcriptToPassages(addAnchor(fresh(), element(), 500), [segment(0, 1000, 'Longword', [{ text: 'Longword', startMs: 0, endMs: 1000 }])]);
  assert.equal(s.passages[0].needsReview, true);
  assert.equal(s.passages[0].candidateAnchorIds.length, 2);
});

test('editing and reassigning preserve passage IDs and clear uncertainty only on assignment', () => {
  const generated = transcriptToPassages(addAnchor(fresh(), element(), 500), [segment(0, 1000, 'Unclear sentence.')]);
  const id = generated.passages[0].id;
  const edited = updatePassage(generated, id, 'Reviewed instruction, with <code>.');
  assert.equal(edited.passages[0].id, id);
  assert.equal(edited.passages[0].needsReview, true);
  assert.equal(generated.passages[0].text, 'Unclear sentence.');
  const assigned = reassignPassage(edited, id, generated.anchors[1].id);
  assert.equal(assigned.passages[0].id, id);
  assert.equal(assigned.passages[0].needsReview, false);
  assert.equal(assigned.passages[0].manuallyAssigned, true);
});

test('splitting edited text creates distinct stable IDs and does not fabricate an audio time', () => {
  let s = transcriptToPassages(fresh(), [segment(100, 1000, 'First sentence. Second sentence.')]);
  const id = s.passages[0].id;
  s = splitPassage(s, id, 16);
  assert.equal(s.passages[0].id, id);
  assert.notEqual(s.passages[1].id, id);
  assert.deepEqual(s.passages.map((p) => p.text), ['First sentence.', 'Second sentence.']);
  assert.ok(s.passages.every((p) => p.startMs === 100 && p.endMs === 1000 && p.timingApproximate));
  const secondId = s.passages[1].id;
  s = updatePassage(s, secondId, 'Edited later.');
  assert.equal(s.passages[1].id, secondId);
  s = removePassage(s, id);
  assert.deepEqual(s.passages.map((p) => p.id), [secondId]);
});

test('export yields idempotent annotation IDs and independent structured target data', () => {
  let s = addAnchor(fresh(), region(), 1000);
  s = transcriptToPassages(s, [segment(1100, 1500, 'Tighten this region.')]);
  const [note] = exportNotes(s);
  assert.equal(note.kind, 'voice');
  assert.equal(note.id, note.clientId);
  assert.equal(note.id, exportNotes(JSON.parse(JSON.stringify(s)))[0].id);
  assert.equal(note.reviewer, 'Ana');
  assert.equal(note.timestamp, 1001100);
  assert.equal(note.voice.target.kind, 'region');
  assert.equal(note.voice.region.scrollY, 400);
  assert.equal(note.voice.image.dataUrl, region().image.dataUrl);
  assert.equal('audio' in note.voice, false);
  note.voice.region.width = 1;
  assert.equal(s.anchors[1].rect.width, 250);
});

test('empty edited passages are kept for editing but excluded from saved notes', () => {
  const s = transcriptToPassages(fresh(), [segment(0, 1000, 'A note')]);
  const edited = updatePassage(s, s.passages[0].id, '   ');
  assert.equal(edited.passages.length, 1);
  assert.deepEqual(exportNotes(edited), []);
});

test('images are bounded and cannot be script or SVG payloads', () => {
  assert.throws(() => addAnchor(fresh(), { ...region(), image: 'data:image/jpeg;base64,' + 'a'.repeat(MAX_IMAGE_CHARS) }, 0), /too long/);
  assert.throws(() => addAnchor(fresh(), { ...region(), image: 'javascript:alert(1)' }, 0), /image must/);
  assert.throws(() => addAnchor(fresh(), { ...region(), image: 'data:image/svg+xml;base64,YQ==' }, 0), /image must/);
  assert.throws(() => addAnchor(fresh(), { ...element(), image: 'https://example.com/a.jpg' }, 0), /only region/);
  const input = { ...region(), image: { ...region().image, secret: 'drop', audio: 'drop' } };
  const s = addAnchor(fresh(), input, 0);
  assert.equal('secret' in s.anchors[1].image, false);
  assert.equal('audio' in s.anchors[1].image, false);
});

test('bad clocks, anchors, transcripts and editor operations fail clearly', () => {
  const s = fresh();
  assert.throws(() => createSession({ page: 'javascript:bad' }), /page/);
  assert.throws(() => createSession({ viewport: { width: -1 } }), /viewport/);
  assert.throws(() => addAnchor(s, element(), NaN), /time/);
  assert.throws(() => addAnchor(addAnchor(s, element(), 100), element(), 50), /monotonic/);
  assert.throws(() => addAnchor(s, { kind: 'element', label: 'Missing selector' }, 0), /selector/);
  assert.throws(() => addAnchor(s, { ...region(), rect: { x: 0, y: 0, width: -1, height: 20 } }, 0), /rectangle/);
  assert.throws(() => transcriptToPassages(s, [segment(1000, 0, 'Bad')]), /ends before/);
  assert.throws(() => transcriptToPassages(s, [segment(0, 100, 'Bad', [{ text: 'Bad', startMs: 0, endMs: 200 }])]), /outside/);
  assert.throws(() => updatePassage(s, 'missing', 'x'), /not found/);
  assert.throws(() => reassignPassage(s, 'missing', 'missing'), /not found/);
  const p = transcriptToPassages(s, [segment(0, 1, 'A note')]);
  assert.throws(() => splitPassage(p, p.passages[0].id, 0), /inside/);
  assert.throws(() => reassignPassage(p, p.passages[0].id, 'unknown'), /anchor not found/);
});
