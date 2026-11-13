// Hosted adapter, not a deployed ShareKit route.
// Call only from the existing /p/<token>/__ag dispatch after site/password/
// expiry/feedback-mode checks. authorize() must repeat the relevant checks.
import { createVoiceHandler, voiceError } from '../server/voice.js';

export const VOICE_BUDGET_SCHEMA = 'CREATE TABLE IF NOT EXISTS voice_budget (scope TEXT NOT NULL, day TEXT NOT NULL, seconds INTEGER NOT NULL, PRIMARY KEY(scope, day));';

/** Account-wide atomic D1 reservation. Create VOICE_BUDGET_SCHEMA in a migration. */
export function createD1VoiceBudget(db, { dailySeconds = 1800, scope = 'voice' } = {}) {
  if (!Number.isSafeInteger(dailySeconds) || dailySeconds < 0) throw new Error('Invalid voice budget.');
  return {
    async reserve(seconds) {
      if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > dailySeconds) return false;
      const day = new Date().toISOString().slice(0, 10);
      // The WHERE belongs inside the upsert: a separate SELECT races replicas.
      const row = await db.prepare(`INSERT INTO voice_budget(scope, day, seconds) VALUES (?, ?, ?)
        ON CONFLICT(scope, day) DO UPDATE SET seconds = seconds + excluded.seconds
        WHERE seconds + excluded.seconds <= ? RETURNING seconds`).bind(scope, day, seconds, dailySeconds).first();
      return !!row;
    },
  };
}

/** Safe free-mode default: inspect PCM WAV's actual sample duration ourselves. */
export async function validatePcmWav({ audio, maxDurationMs }) {
  if (!['audio/wav', 'audio/x-wav'].includes(audio.type.split(';')[0])) throw voiceError(415, 'Hosted voice typing expects PCM WAV audio.');
  const buffer = await audio.arrayBuffer(), data = new DataView(buffer);
  const tag = (at, length = 4) => String.fromCharCode(...new Uint8Array(buffer, at, length));
  if (buffer.byteLength < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE' || data.getUint32(4, true) + 8 !== buffer.byteLength) throw voiceError(422, 'The recording is not a complete WAV file.');
  let rate, alignment, format, bits, channels, audioBytes = 0;
  for (let pos = 12; pos + 8 <= buffer.byteLength;) {
    const kind = tag(pos), length = data.getUint32(pos + 4, true), start = pos + 8;
    if (start + length > buffer.byteLength) throw voiceError(422, 'The WAV recording is incomplete.');
    if (kind === 'fmt ') {
      if (length < 16) throw voiceError(422, 'The WAV format is invalid.');
      format = data.getUint16(start, true); channels = data.getUint16(start + 2, true);
      rate = data.getUint32(start + 4, true); alignment = data.getUint16(start + 12, true); bits = data.getUint16(start + 14, true);
    } else if (kind === 'data') audioBytes += length;
    pos = start + length + (length % 2);
  }
  if (format !== 1 || ![1, 2].includes(channels) || bits !== 16 || !Number.isInteger(rate) || rate < 8000 || rate > 48000 || alignment !== channels * 2 || !audioBytes || audioBytes % alignment) throw voiceError(422, 'Use 16-bit PCM WAV audio at 8–48 kHz.');
  const durationMs = Math.ceil(audioBytes / alignment / rate * 1000);
  if (durationMs > maxDurationMs) throw voiceError(422, 'The recording is longer than five minutes.');
  return { audio, durationMs };
}

function base64(buffer) {
  const bytes = new Uint8Array(buffer); let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 16384) binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  return btoa(binary);
}

/**
 * authorize(request, context) -> {allowed:true, enabled:true}. Names are labels,
 * not authorization. reserveBudget({context,seconds}) must atomically reserve
 * from the hosting account's configured cap before any AI invocation.
 * A custom validateAudio can support more codecs; it must decode/verify actual
 * duration rather than accepting the client's durationMs claim.
 */
export function createShareKitVoiceHandler({ AI, authorize, reserveBudget, validateAudio = validatePcmWav, limits = {}, language } = {}) {
  if (typeof authorize !== 'function' || typeof reserveBudget !== 'function') throw new Error('Hosted voice requires authorization and an atomic budget reservation.');
  const handlers = new Map();
  return async function handle(request, context) {
    const path = new URL(request.url).pathname;
    const token = context?.token;
    if (typeof token !== 'string' || !/^[A-Za-z0-9]{22}$/.test(token)) return Response.json({ error: 'not found' }, { status: 404 });
    const prefix = `/p/${token}/__ag/voice/`;
    if (!path.startsWith(prefix)) return Response.json({ error: 'not found' }, { status: 404 });
    const access = await authorize(request, context);
    if (!access?.allowed) return Response.json({ error: 'locked' }, { status: 401 });
    if (!access.enabled) return Response.json({ error: 'Voice feedback is disabled for this link.' }, { status: 403 });
    const origin = request.headers.get('origin');
    if (request.method !== 'GET' && origin !== new URL(request.url).origin) return Response.json({ error: 'origin not allowed' }, { status: 403 });
    if (!handlers.has(token)) {
      // Limit cache growth; the durable reservation, not this cache, is the
      // account-wide budget guard. Local concurrency/rate gates are best effort.
      if (handlers.size > 500) handlers.delete(handlers.keys().next().value);
      handlers.set(token, createVoiceHandler({
        limits,
        validateAudio,
        budget: { reserve: (seconds) => reserveBudget({ context: { token, siteId: context.siteId }, seconds }) },
        transcriber: AI?.run ? {
          id: 'cloudflare-whisper',
          disclosure: 'Audio goes to Cloudflare for transcription. Only text is attached to your note.',
          async transcribe({ audio, signal }) {
            if (signal.aborted) throw voiceError(499, 'The transcription was cancelled.');
            // Official Workers AI Whisper Turbo input is encoded audio base64.
            // No system prompt or translation: retain the original language.
            const result = await AI.run('@cf/openai/whisper-large-v3-turbo', {
              audio: base64(await audio.arrayBuffer()), task: 'transcribe',
              ...(language ? { language } : {}),
            });
            if (signal.aborted) throw voiceError(499, 'The transcription was cancelled.');
            return result;
          },
        } : null,
      }));
    }
    const handler = handlers.get(token), rest = path.slice(prefix.length);
    if (rest === 'capabilities' && request.method === 'GET') return Response.json({ ...handler.capability(), mimeTypes: validateAudio === validatePcmWav ? ['audio/wav'] : undefined }, { headers: { 'Cache-Control': 'no-store' } });
    return handler.handle(request, rest);
  };
}
