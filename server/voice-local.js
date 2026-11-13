// Built-in local transcription: the review server looks after the speech
// model itself, so Talk and dictation work without anyone setting a URL.
//
// It is the same bridge the skill starts by hand (scripts/voice-transcribe-local.py
// through skill/show-and-tell/scripts/voice-server.sh): faster-whisper in its
// own Python environment in the data folder (~/.show-and-tell), bound to 127.0.0.1. This
// module starts it the first time a reviewer opens Talk or dictation, not
// when the server starts: a model in memory is too much to pay for a round
// that never uses a microphone.
//
//   idle         nothing started yet
//   starting     setting up (the first run builds the environment and
//                downloads the model) or loading the model
//   ready        the bridge answers /health
//   unavailable  it cannot run here; `message` says why and what to do
//
// A bridge that is already answering on the port is used as it is and left
// running. One this process started stops with this process.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { voiceError } from './voice.js';
import { openAICompatibleTranscriber } from './voice-providers.js';

export const DEFAULT_VOICE_PORT = 55945;
const SCRIPT = fileURLToPath(new URL('../skill/show-and-tell/scripts/voice-server.sh', import.meta.url));

// One exit hook for every transcriber this process makes (a dev server that
// restarts its config makes several).
const closers = new Set();
process.once('exit', () => { for (const close of closers) close(); });

const FIRST_RUN = 'Getting local transcription ready. The first time takes a few minutes: it sets up a speech model on this computer (about 150 MB). After that it starts in seconds.';
const LOADING = 'Starting local transcription…';

/**
 * @param {object} [o]
 * @param {number} [o.port]      loopback port for the bridge (default 55945, or SHOW_AND_TELL_VOICE_PORT)
 * @param {string} [o.model]     faster-whisper model name (default "base", multilingual)
 * @param {string} [o.script]    the launcher; injectable for tests
 * @param {Function} [o.spawnImpl] / [o.fetchImpl]  injectable for tests
 */
export function managedLocalTranscriber({ port, model, script = SCRIPT, spawnImpl = spawn, fetchImpl = fetch, env = process.env, platform = process.platform } = {}) {
  port = Number(port || env.SHOW_AND_TELL_VOICE_PORT || DEFAULT_VOICE_PORT);
  const url = `http://127.0.0.1:${port}/v1/audio/transcriptions`;
  const remote = openAICompatibleTranscriber({ url, fetchImpl });
  let state = 'idle', message = '', child = null, starting = null;
  const set = (s, m = '') => { state = s; message = m; };

  async function healthy() {
    try {
      const r = await fetchImpl(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1500) });
      const d = await r.json();
      return r.ok && d?.ok === true && !!d.provider;
    } catch { return false; }
  }

  function start() {
    if (platform === 'win32') return set('unavailable', 'Built-in transcription needs macOS or Linux. Set SHOW_AND_TELL_TRANSCRIBE_URL to a transcription service to use voice here.');
    if (!existsSync(script)) return set('unavailable', 'The transcription launcher is missing from this install. Set SHOW_AND_TELL_TRANSCRIBE_URL to use voice.');
    set('starting', LOADING);
    let errors = '';
    child = spawnImpl('bash', [script], { env: { ...env, PORT: String(port), ...(model ? { MODEL: model } : {}) }, stdio: ['ignore', 'pipe', 'pipe'] });
    const mine = child;
    const lines = (stream, each) => { let buf = ''; stream?.on('data', (c) => { buf += c; let i; while ((i = buf.indexOf('\n')) >= 0) { each(buf.slice(0, i).trim()); buf = buf.slice(i + 1); } }); };
    lines(child.stdout, (line) => {
      if (/^READY /.test(line)) set('ready');
      else if (/^Setting up /.test(line)) set('starting', FIRST_RUN);
      else if (/first run downloads/.test(line) && message !== FIRST_RUN) set('starting', LOADING);
    });
    lines(child.stderr, (line) => { if (line) errors = `${errors}\n${line}`.slice(-600); });
    child.on('error', (e) => { if (child === mine) { child = null; set('unavailable', `Local transcription could not start (${e.code || e.message}).`); } });
    // 'close', not 'exit': the last lines it printed have arrived by then, and they say why it stopped.
    child.on('close', (code) => {
      if (child !== mine) return;
      child = null;
      // A bridge that was already running: the launcher says READY and leaves.
      if (code === 0 && state === 'ready') return;
      if (stopping) return set('idle');
      if (code === 2) return set('unavailable', `Port ${port} is in use by something that isn't the transcription service. Set SHOW_AND_TELL_VOICE_PORT to a free port and restart.`);
      const why = errors.trim().split('\n').filter(Boolean).pop() || '';
      if (/Need Python 3\.10/.test(errors)) return set('unavailable', 'Built-in transcription needs Python 3.10 to 3.13 (or uv) on this computer. Install one, then open Talk again.');
      // It was ready and then stopped: the next person to open Talk starts it again.
      if (state === 'ready') return set('idle');
      set('unavailable', `Local transcription could not start${why ? `: ${why}` : '.'} Open Talk again to retry.`);
    });
  }

  let stopping = false;
  function close() { stopping = true; try { child?.kill('SIGTERM'); } catch { /* gone */ } }
  closers.add(close);

  /** Start it if it isn't running. Returns at once; `status()` says how far it has got. */
  function prepare() {
    if (state === 'starting' || starting) return;
    starting = (async () => {
      if (await healthy()) return set('ready');
      // Ready a moment ago, gone now (the machine slept, someone stopped it): start over.
      if (state === 'ready') set('idle');
      if (child) return;
      start();
    })().catch((e) => set('unavailable', `Local transcription could not start (${e.code || e.message}).`)).finally(() => { starting = null; });
  }

  return {
    id: 'local-whisper',
    disclosure: 'Audio is transcribed on this computer by a local speech model. Nothing leaves your machine, and only the text is attached to your note.',
    managed: true,
    status: () => ({ state, message }),
    prepare,
    close,
    async transcribe(input) {
      if (state !== 'ready') { prepare(); throw voiceError(503, message || LOADING); }
      try { return await remote.transcribe(input); }
      catch (e) {
        // The bridge went away under us: say so plainly and bring it back for the retry.
        if (!(await healthy())) { set('idle'); prepare(); throw voiceError(503, 'Local transcription stopped and is starting again. Your recording is kept: try again in a moment.'); }
        throw e;
      }
    },
  };
}
