// Built-in local transcription (server/voice-local.js): the review server
// starts the bundled bridge the first time it is asked, says how far it has
// got, and never claims to be ready before the bridge answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
import { managedLocalTranscriber } from '../server/voice-local.js';
import { createVoiceHandler } from '../server/voice.js';

/** A stand-in for the launcher process: the test says what it prints and when it exits. */
function fakeSpawn() {
  const calls = [];
  const spawnImpl = (cmd, args, opts) => {
    const child = new EventEmitter();
    child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
    child.killed = false; child.kill = () => { child.killed = true; };
    calls.push({ cmd, args, env: opts.env, child });
    return child;
  };
  return { spawnImpl, calls };
}
const down = async () => { throw new Error('ECONNREFUSED'); };
const up = async (u) => (String(u).endsWith('/health') ? new Response(JSON.stringify({ ok: true, provider: 'faster-whisper' })) : new Response(JSON.stringify({ text: 'hello', segments: [], words: [] })));
const tick = () => new Promise((r) => setTimeout(r, 5));
const base = { script: fileURLToPath(import.meta.url), platform: 'darwin' };

test('nothing starts until someone asks; first run and ready are reported as they happen', async () => {
  const { spawnImpl, calls } = fakeSpawn();
  const t = managedLocalTranscriber({ ...base, port: 59991, spawnImpl, fetchImpl: down, env: { PATH: '' } });
  assert.deepEqual(t.status(), { state: 'idle', message: '' });
  assert.equal(calls.length, 0, 'creating it starts nothing');
  t.prepare(); t.prepare(); await tick();
  assert.equal(calls.length, 1, 'one launcher, however often it is asked');
  assert.equal(calls[0].cmd, 'bash'); assert.equal(calls[0].env.PORT, '59991');
  assert.equal(t.status().state, 'starting');
  calls[0].child.stdout.emit('data', 'Setting up /x/voice-venv (one time)…\n');
  assert.match(t.status().message, /first time takes a few minutes/);
  await assert.rejects(t.transcribe({}), (e) => e.status === 503, 'not ready is a 503, never a made-up transcript');
  calls[0].child.stdout.emit('data', 'READY http://127.0.0.1:59991/v1/audio/transcriptions (faster-whisper)\n');
  assert.equal(t.status().state, 'ready');
  t.close(); assert.equal(calls[0].child.killed, true, 'a bridge this process started stops with it');
});

test('a bridge that is already answering is used and left running', async () => {
  const { spawnImpl, calls } = fakeSpawn();
  const t = managedLocalTranscriber({ ...base, port: 59992, spawnImpl, fetchImpl: up });
  t.prepare(); await tick();
  assert.equal(t.status().state, 'ready');
  assert.equal(calls.length, 0, 'no second bridge');
  assert.equal((await t.transcribe({ audio: new Blob(['x']) })).text, 'hello');
});

test('it says why when it cannot run, in words a reviewer can act on', async () => {
  for (const [code, stderr, want] of [
    [2, "Port 59993 is taken by node (pid 1), which isn't a transcription bridge\n", /Port 59993 is in use/],
    [1, 'Need Python 3.10–3.13 for faster-whisper (or install uv).\n', /needs Python 3\.10 to 3\.13/],
    [1, 'pip: network unreachable\n', /could not start: pip: network unreachable/],
  ]) {
    const { spawnImpl, calls } = fakeSpawn();
    const t = managedLocalTranscriber({ ...base, port: 59993, spawnImpl, fetchImpl: down });
    t.prepare(); await tick();
    calls[0].child.stderr.emit('data', stderr);
    calls[0].child.emit('close', code);
    assert.equal(t.status().state, 'unavailable');
    assert.match(t.status().message, want);
  }
  const win = managedLocalTranscriber({ ...base, platform: 'win32', spawnImpl: () => { throw new Error('must not spawn'); }, fetchImpl: down });
  win.prepare(); await tick();
  assert.match(win.status().message, /needs macOS or Linux/);
});

test('the voice route: usable only when ready, prepare starts it, transcribe refuses while it starts', async () => {
  const { spawnImpl, calls } = fakeSpawn();
  const t = managedLocalTranscriber({ ...base, port: 59994, spawnImpl, fetchImpl: down });
  const voice = createVoiceHandler({ transcriber: t });
  const get = async (path, method = 'GET') => { const r = await voice.handle(new Request(`http://127.0.0.1:1/__ag/voice/${path}`, { method }), path); return { status: r.status, body: await r.json() }; };
  let c = await get('capabilities');
  assert.equal(c.body.enabled, false); assert.deepEqual(c.body.local, { state: 'idle', message: '' });
  assert.equal(c.body.provider, 'local-whisper'); assert.equal(c.body.setup, undefined, 'built in: no setup instructions');
  assert.match(c.body.disclosure, /on this computer/);
  assert.equal(calls.length, 0, 'asking what is possible starts nothing');
  assert.equal((await get('prepare')).status, 405);
  await get('prepare', 'POST'); await tick();
  assert.equal(calls.length, 1);
  c = await get('capabilities');
  assert.equal(c.body.local.state, 'starting'); assert.equal(c.body.enabled, false);
  const busy = await get('transcribe', 'POST');
  assert.equal(busy.status, 503); assert.equal(busy.body.code, 'voice_starting');
  calls[0].child.stdout.emit('data', 'READY http://127.0.0.1:59994/v1/audio/transcriptions\n');
  c = await get('capabilities');
  assert.equal(c.body.enabled, true); assert.equal(c.body.local.state, 'ready');
  t.close();
});

test('the review app turns it on only where asked, and a configured URL or an off switch wins', async () => {
  const { createReviewApp } = await import('../server/app.js');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const caps = (app) => new Promise((done) => {
    const res = { headers: {}, setHeader() {}, getHeader() {}, writeHead(s) { this.status = s; }, write(c) { this.body = (this.body || '') + Buffer.from(c).toString(); }, end(c) { if (c) this.write(c); done(JSON.parse(this.body)); }, once() {}, on() {} };
    app.handler({ method: 'GET', url: '/__ag/voice/capabilities', headers: { host: '127.0.0.1:1' }, once() {}, removeListener() {} }, res, '/__ag/voice/capabilities');
  });
  const mk = (extra) => createReviewApp({ name: uniqueName('voice-local'), base: '/__review', origins: ['http://127.0.0.1:1'], ...extra });
  const saved = { ...process.env };
  try {
    delete process.env.AGENTATION_KIT_TRANSCRIBE_URL; delete process.env.SHOW_AND_TELL_VOICE; delete process.env.AGENTATION_KIT_VOICE;
    assert.equal((await caps(mk({}))).provider, null, 'not asked for: unchanged, no provider');
    assert.equal((await caps(mk({ voiceLocal: true }))).provider, 'local-whisper');
    process.env.SHOW_AND_TELL_VOICE = 'off';
    assert.equal((await caps(mk({ voiceLocal: true }))).provider, null, 'the off switch');
    delete process.env.SHOW_AND_TELL_VOICE;
    process.env.AGENTATION_KIT_TRANSCRIBE_URL = 'https://example.test/v1/audio/transcriptions';
    assert.equal((await caps(mk({ voiceLocal: true }))).provider, 'configured-transcription', 'a configured service wins');
  } finally { for (const k of ['SHOW_AND_TELL_TRANSCRIBE_URL', 'SHOW_AND_TELL_VOICE', 'SHOW_AND_TELL_VOICE']) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } cleanup(); }
});
