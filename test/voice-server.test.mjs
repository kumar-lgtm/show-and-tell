import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cleanup, uniqueName } from './_seed.mjs';
import { createVoiceHandler, normalizeTranscript } from '../server/voice.js';
import { openAICompatibleTranscriber, voiceTranscriberFromEnv } from '../server/voice-providers.js';
import { createShareKitVoiceHandler, validatePcmWav, createD1VoiceBudget, VOICE_BUDGET_SCHEMA } from '../integrations/sharekit-voice.js';
const { createReviewApp } = await import('../server/app.js');
const { openDb, handle } = await import('../server/store.js');
const { createVoiceBudget } = await import('../server/voice-budget.js');
after(() => cleanup());

const origin = 'http://127.0.0.1:5173';
function wav(seconds = 1) {
  const samples = seconds * 16000, bytes = new Uint8Array(44 + samples * 2), d = new DataView(bytes.buffer);
  const tag = (at, s) => [...s].forEach((c, i) => d.setUint8(at + i, c.charCodeAt(0)));
  tag(0, 'RIFF'); d.setUint32(4, bytes.length - 8, true); tag(8, 'WAVE'); tag(12, 'fmt '); d.setUint32(16, 16, true);
  d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, 16000, true); d.setUint32(28, 32000, true);
  d.setUint16(32, 2, true); d.setUint16(34, 16, true); tag(36, 'data'); d.setUint32(40, samples * 2, true);
  return new Blob([bytes], { type: 'audio/wav' });
}
function request({ audio = wav(), durationMs = 1000, url = origin + '/__ag/voice/transcribe', headers = {} } = {}) {
  const form = new FormData(); if (audio) form.set('audio', audio, 'recording.wav');
  if (durationMs !== null) form.set('durationMs', String(durationMs));
  return new Request(url, { method: 'POST', body: form, headers });
}
const transcriber = { id: 'test-transcriber', disclosure: 'Synthetic test provider', transcribe: async () => ({ text: 'Make this shorter.', segments: [{ start: 0.1, end: 0.9, text: 'Make this shorter.' }] }) };

test('normalizes provider segment/word timestamps and marks untimed text uncertain', () => {
  const result = normalizeTranscript({ text: 'Hello world.', segments: [{ start: 0.1, end: 1.2, text: 'Hello world.', words: [{ word: 'Hello', start: 0.1, end: 0.4 }, { word: 'world.', start: 0.5, end: 1.2 }] }] }, 1000, 'local');
  assert.equal(result.timing, 'word'); assert.equal(result.segments[0].endMs, 1000);
  assert.deepEqual(result.segments[0].words[0], { text: 'Hello', startMs: 100, endMs: 400 });
  const untimed = normalizeTranscript({ text: 'No fabricated timing.' }, 2000);
  assert.equal(untimed.timing, 'none'); assert.equal(untimed.segments[0].timingUncertain, true);
  assert.deepEqual(normalizeTranscript({ text: '' }, 1000).segments, []);
  assert.throws(() => normalizeTranscript(null, 1000), /invalid response/);
});

test('malformed or partial segment timing preserves the complete transcript', () => {
  for (const raw of [
    { text: 'first second', segments: [{ start: 0, end: 0.4, text: 'first' }, { start: 'bad', end: 1, text: 'second' }] },
    { segments: [{ start: 0, end: 0.4, text: 'first' }, { text: 'second' }] },
    { text: 'first second', segments: [{ start: 0, end: 0.4, text: 'first' }] },
    { text: 'first second', segments: [{ start: 0, end: 0.9, text: 'firstsecond' }] },
    { text: 'first second', words: [{ start: 0, end: 0.4, word: 'first' }, { word: 'second' }] },
    { text: 'first second', segments: [{ start: 0.5, end: 1, text: 'first' }, { start: 0, end: 0.4, text: 'second' }] },
  ]) {
    const result = normalizeTranscript(raw, 1000);
    assert.equal(result.text, 'first second');
    assert.equal(result.segments.length, 1);
    assert.equal(result.segments[0].text, 'first second');
    assert.equal(result.segments[0].timingUncertain, true);
    assert.equal(result.timing, 'none');
  }
});

test('partial, out-of-segment or unordered word timestamps cannot truncate a segment or break the editor', () => {
  for (const words of [
    [{ word: 'first', start: 0.1, end: 0.3 }],
    [{ word: 'first', start: 0.1, end: 0.3 }, { word: 'second', start: 'bad', end: 0.8 }],
    [{ word: 'first', start: 0, end: 0.3 }, { word: 'second', start: 0.5, end: 0.8 }],
    [{ word: 'first', start: 0.5, end: 0.7 }, { word: 'second', start: 0.3, end: 0.4 }],
    [{ word: 'first', start: 0.1, end: 0.3 }, { word: 'second', start: 0.5, end: 1.2 }],
  ]) {
    const result = normalizeTranscript({ text: 'first second', segments: [{ start: 0.1, end: 0.9, text: 'first second', words }] }, 1000);
    assert.equal(result.segments[0].text, 'first second');
    assert.equal(result.segments[0].words, undefined);
    assert.equal(result.timing, 'segment');
  }
});

test('disabled provider is explicit and never returns a fake transcript', async () => {
  const service = createVoiceHandler();
  const cap = await (await service.handle(new Request(origin), 'capabilities')).json();
  assert.equal(cap.enabled, false); assert.match(cap.setup, /SHOW_AND_TELL_TRANSCRIBE_URL/);
  assert.equal((await service.handle(request(), 'transcribe')).status, 503);
});

test('valid audio reaches the injected provider and returns timestamped text', async () => {
  const service = createVoiceHandler({ transcriber });
  const response = await service.handle(request(), 'transcribe');
  assert.equal(response.status, 200); const data = await response.json();
  assert.equal(data.provider, 'test-transcriber'); assert.equal(data.text, 'Make this shorter.');
  assert.equal(data.segments[0].startMs, 100);
});

test('audio form, duration, MIME and byte bounds are enforced before inference', async () => {
  let called = 0;
  const service = createVoiceHandler({ transcriber: async () => { called++; return {}; }, limits: { maxBytes: 100000 } });
  for (const [req, code] of [
    [request({ audio: null }), 400], [request({ durationMs: null }), 422],
    [request({ durationMs: 0 }), 422], [request({ durationMs: 300001 }), 422],
    [request({ audio: new Blob(['not audio'], { type: 'text/html' }) }), 415],
    [request({ audio: new Blob([new Uint8Array(100001)], { type: 'audio/wav' }) }), 413],
    [new Request(origin, { method: 'POST', body: '{}' }), 415],
  ]) assert.equal((await service.handle(req, 'transcribe')).status, code);
  assert.equal(called, 0);
});

test('budget rejection, concurrency, rate and timeout gates do not report success', async () => {
  let calls = 0;
  const capped = createVoiceHandler({ transcriber: async () => { calls++; return {}; }, budget: { reserve: async () => false } });
  assert.equal((await capped.handle(request(), 'transcribe')).status, 429); assert.equal(calls, 0);
  let release; const busy = createVoiceHandler({ transcriber: () => new Promise((r) => { release = r; }) });
  const pending = busy.handle(request(), 'transcribe');
  while (!release) await new Promise((r) => setTimeout(r, 1));
  assert.equal((await busy.handle(request(), 'transcribe')).status, 429);
  release({ text: 'Done' }); assert.equal((await pending).status, 200);
  const rate = createVoiceHandler({ transcriber, limits: { requestsPerMinute: 1 } });
  assert.equal((await rate.handle(request(), 'transcribe')).status, 200);
  assert.equal((await rate.handle(request(), 'transcribe')).status, 429);
  const slow = createVoiceHandler({ transcriber: () => new Promise(() => {}), limits: { timeoutMs: 5 } });
  assert.equal((await slow.handle(request(), 'transcribe')).status, 504);
});

test('OpenAI-compatible provider uploads the real bytes and requests original-language timestamps', async () => {
  const service = openAICompatibleTranscriber({ url: 'http://127.0.0.1:55940/v1/audio/transcriptions', fetchImpl: async (url, init) => {
    assert.equal(url.pathname, '/v1/audio/transcriptions'); assert.equal(init.body.get('file').size, wav().size);
    assert.equal(init.body.get('response_format'), 'verbose_json'); assert.equal(init.body.get('language'), null);
    assert.deepEqual(init.body.getAll('timestamp_granularities[]'), ['word', 'segment']);
    return Response.json({ text: 'Real bytes' });
  } });
  assert.equal((await service.transcribe({ audio: wav() })).text, 'Real bytes');
  assert.equal(voiceTranscriberFromEnv({}), null);
  assert.throws(() => openAICompatibleTranscriber({ url: 'http://remote.example/transcribe' }), /HTTPS/);
});

test('local daily reservation persists across handler creation', () => {
  const name = uniqueName('voicebudget');
  assert.equal(createVoiceBudget(name, 3).reserve(2), true);
  assert.equal(createVoiceBudget(name, 3).reserve(2), false);
  assert.equal(createVoiceBudget(name, 3).reserve(1), true);
});

test('HTTP route accepts binary larger than annotation JSON and respects the existing Origin gate', async () => {
  let app; const server = createServer((req, res) => app.handler(req, res));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  app = createReviewApp({ name: uniqueName('voicehttp'), base, origins: [base], voiceTranscriber: transcriber });
  try {
    const cap = await (await fetch(base + '/__ag/voice/capabilities')).json(); assert.equal(cap.enabled, true);
    const req = request({ audio: wav(10), durationMs: 10000 });
    const response = await fetch(base + '/__ag/voice/transcribe', { method: 'POST', body: req.body, duplex: 'half', headers: { 'Content-Type': req.headers.get('content-type'), Origin: base } });
    assert.equal(response.status, 200); assert.equal((await response.json()).text, 'Make this shorter.');
    assert.equal((await fetch(base + '/__ag/voice/capabilities', { headers: { Origin: 'https://other.example' } })).status, 403);
  } finally { server.closeAllConnections(); await new Promise((r) => server.close(r)); }
});

test('hosted WAV validation derives duration from samples, not the browser claim', async () => {
  assert.equal((await validatePcmWav({ audio: wav(2), maxDurationMs: 3000 })).durationMs, 2000);
  await assert.rejects(validatePcmWav({ audio: wav(2), maxDurationMs: 1000 }), /longer/);
  await assert.rejects(validatePcmWav({ audio: new Blob(['fake'], { type: 'audio/wav' }), maxDurationMs: 3000 }), /complete WAV/);
});

test('hosted adapter requires authorized link, opt-in, same origin and atomic budget before AI', async () => {
  const token = 'AbCdEf0123456789012345', url = `https://share.example/p/${token}/__ag/voice/transcribe`;
  let allowed = false, enabled = true, reserved = false, calls = 0, charge;
  const hosted = createShareKitVoiceHandler({ AI: { run: async (model, input) => { calls++; assert.equal(model, '@cf/openai/whisper-large-v3-turbo'); assert.ok(input.audio.length > 100); return { transcription_info: { text: 'Hosted text' }, segments: [{ start: 0, end: 1, text: 'Hosted text' }] }; } }, authorize: async () => ({ allowed, enabled }), reserveBudget: async ({ seconds }) => { charge = seconds; return reserved; } });
  const req = () => request({ url, durationMs: 1, audio: wav(2), headers: { Origin: 'https://share.example' } });
  assert.equal((await hosted(req(), { token })).status, 401); allowed = true; enabled = false;
  assert.equal((await hosted(req(), { token })).status, 403); enabled = true;
  assert.equal((await hosted(request({ url, headers: { Origin: 'https://other.example' } }), { token })).status, 403);
  assert.equal((await hosted(req(), { token })).status, 429); assert.equal(calls, 0); assert.equal(charge, 2);
  reserved = true;
  assert.equal((await hosted(req(), { token })).status, 200); assert.equal(calls, 1);
  assert.throws(() => createShareKitVoiceHandler({ AI: {} }), /authorization/);
});

test('D1 budget upsert reserves atomically and never exceeds its configured cap', async () => {
  const db = openDb(uniqueName('d1voice')); db.exec(VOICE_BUDGET_SCHEMA);
  const d1 = { prepare(sql) { return { bind(...args) { return { async first() { return db.prepare(sql).get(...args); } }; } }; } };
  const a = createD1VoiceBudget(d1, { dailySeconds: 10 });
  const b = createD1VoiceBudget(d1, { dailySeconds: 10 });
  assert.deepEqual(await Promise.all([a.reserve(6), b.reserve(6)]), [true, false]);
  assert.equal(await b.reserve(4), true); assert.equal(await a.reserve(1), false);
});

test('voice annotation payload survives reads and can be rejected as a tombstone', async () => {
  const name = uniqueName('voicenote');
  const api = async (method, rest, body) => {
    const response = await handle(new Request(`${origin}/__ag/${rest}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), name, rest);
    return { status: response.status, body: await response.json() };
  };
  const session = (await api('POST', 'sessions', { url: origin + '/pricing' })).body;
  const voice = { sessionId: 'voice-session', passageId: 'passage-1', anchorId: 'target-1', startMs: 100, endMs: 900 };
  const note = (await api('POST', `sessions/${session.id}/annotations`, { id: 'voice-1', kind: 'voice', comment: 'Shorten this', element: 'h1', elementPath: 'main > h1', voice })).body;
  assert.deepEqual(note.voice, voice);
  const withdrawn = await api('POST', `annotations/${note.id}/withdraw`, {});
  assert.equal(withdrawn.status, 200); assert.equal(withdrawn.body.status, 'dismissed'); assert.deepEqual(withdrawn.body.voice, voice);
});
