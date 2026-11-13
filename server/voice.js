// Portable request/response layer, shared by the Node server and hosted adapter.
// Audio is used only for this request. It is never placed in annotation JSON.
export const VOICE_LIMITS = Object.freeze({ maxDurationMs: 300000, maxBytes: 16 * 1024 * 1024, maxConcurrent: 1, requestsPerMinute: 10, timeoutMs: 120000 });
const TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/mpeg', 'audio/flac']);
export const voiceError = (status, message) => Object.assign(new Error(message), { status });
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const number = (v) => typeof v === 'number' ? v : Number(v);

/** Provider schemas use seconds; our UI uses milliseconds. Never invent word timing. */
export function normalizeTranscript(raw, durationMs, provider = 'configured') {
  const data = raw?.result ?? raw;
  if (!data || typeof data !== 'object') throw voiceError(502, 'The transcription service returned an invalid response.');
  const clean = (value) => typeof value === 'string' ? value.trim() : '';
  const text = clean(data.text ?? data.transcription_info?.text);
  const compact = (value) => value.replace(/\s+/g, ' ').trim();
  const wordText = (words) => Array.isArray(words) ? words.map((w) => clean(w?.word ?? w?.text)).filter(Boolean).join(' ') : '';
  const segmentText = (s) => clean(s?.text) || wordText(s?.words);
  // Preserve text even from a segment whose timestamps cannot be trusted. The
  // editor consumes segments, so retaining only data.text would still lose it.
  const sourceText = text || (Array.isArray(data.segments) ? data.segments.map(segmentText).filter(Boolean).join(' ') : '') || wordText(data.words);
  const clamp = (n) => Math.max(0, Math.min(durationMs, Math.round(n)));
  const rawTiming = (item) => {
    if (!item || typeof item !== 'object') return null;
    const start = item.startMs ?? number(item.start) * 1000;
    const end = item.endMs ?? number(item.end) * 1000;
    return Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start ? [start, end] : null;
  };
  const timing = (item) => rawTiming(item)?.map(clamp) ?? null;
  let segments = [];
  if (Array.isArray(data.segments)) segments = data.segments.flatMap((s, i) => {
    const t = timing(s), original = rawTiming(s), value = segmentText(s);
    if (!t || !value) return [];
    let w = [], validWords = Array.isArray(s.words) && s.words.length > 0, previousStart = -1;
    if (validWords) for (const word of s.words) {
      const rawWord = rawTiming(word), wt = timing(word), wordValue = clean(word?.word ?? word?.text);
      if (!wt || !wordValue || rawWord[0] < original[0] || rawWord[1] > original[1] || rawWord[0] < previousStart) { validWords = false; break; }
      previousStart = rawWord[0]; w.push({ text: wordValue, startMs: wt[0], endMs: wt[1] });
    }
    // A partial word list can silently remove the untimed words when the
    // client splits a segment across anchors. Keep all segment text instead.
    if (!validWords || compact(w.map((word) => word.text).join(' ')) !== compact(value)) w = [];
    return [{ id: `segment-${i}`, text: value, startMs: t[0], endMs: t[1], ...(w.length ? { words: w } : {}) }];
  });
  if (!segments.length && Array.isArray(data.words)) segments = data.words.flatMap((word, i) => {
    const t = timing(word), value = clean(word?.word ?? word?.text);
    return t && value ? [{ id: `word-${i}`, text: value, startMs: t[0], endMs: t[1], words: [{ text: value, startMs: t[0], endMs: t[1] }] }] : [];
  });
  segments.sort((a, b) => a.startMs - b.startMs);
  let timingKind = segments.length ? (segments.every((s) => s.words?.length) ? 'word' : 'segment') : 'none';
  if (sourceText && compact(segments.map((s) => s.text).join(' ')) !== compact(sourceText)) {
    // Malformed or incomplete timing must degrade precision, never content.
    segments = [{ id: 'segment-0', text: sourceText, startMs: 0, endMs: durationMs, timingUncertain: true }];
    timingKind = 'none';
  }
  const combined = sourceText || segments.map((s) => s.text).join(' ');
  if (combined.length > 100000 || segments.length > 10000) throw voiceError(502, 'The transcription is too large to review.');
  return { text: combined, segments, provider, timing: timingKind };
}

export async function readVoiceInput(request, limits = VOICE_LIMITS) {
  if (!/^multipart\/form-data;\s*boundary=/i.test(request.headers.get('content-type') || '')) throw voiceError(415, 'Send audio as multipart/form-data.');
  const size = number(request.headers.get('content-length'));
  if (size > limits.maxBytes + 65536) throw voiceError(413, 'The recording is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw voiceError(400, 'The recording is empty.');
  let total = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > limits.maxBytes + 65536) { await reader.cancel(); throw voiceError(413, 'The recording is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let form;
  try { form = await new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('content-type') } }).formData(); }
  catch { throw voiceError(400, 'The recording form could not be read.'); }
  const audio = form.get('audio'), durationMs = number(form.get('durationMs'));
  if (!(audio instanceof Blob) || !audio.size) throw voiceError(400, 'Add a non-empty audio recording.');
  if (audio.size > limits.maxBytes) throw voiceError(413, 'The recording is too large.');
  if (!TYPES.has(audio.type.split(';')[0].toLowerCase())) throw voiceError(415, 'This audio format is not supported.');
  if (!Number.isFinite(durationMs) || durationMs < 1 || durationMs > limits.maxDurationMs) throw voiceError(422, `Recording duration must be between 1 and ${limits.maxDurationMs} milliseconds.`);
  return { audio, durationMs: Math.round(durationMs) };
}

/**
 * budget.reserve must be atomic across replicas for hosted deployments. Charge
 * before inference. Failed calls remain charged: a provider may have processed
 * audio even when its answer was lost. Display names are never authorization.
 */
export function createVoiceHandler({ transcriber = null, limits = {}, budget = null, validateAudio = null, now = Date.now } = {}) {
  const bounds = { ...VOICE_LIMITS, ...limits };
  const provider = typeof transcriber === 'function' ? { id: 'configured', transcribe: transcriber } : transcriber;
  let active = 0; const attempts = [];
  // A provider the server looks after itself (voice-local.js) reports how far
  // it has got: it is usable only once it is ready, and says why when it is not.
  const local = () => (provider?.status ? provider.status() : null);
  const capability = () => {
    const st = local();
    return {
      enabled: !!provider?.transcribe && (!st || st.state === 'ready'), provider: provider?.id || null,
      disclosure: provider?.disclosure || 'Voice transcription is not configured. You can keep typing.',
      limits: { maxDurationMs: bounds.maxDurationMs, maxBytes: bounds.maxBytes },
      ...(st ? { local: { state: st.state, message: st.message || '' } } : {}),
      ...(!provider?.transcribe ? { setup: 'Set SHOW_AND_TELL_TRANSCRIBE_URL to an OpenAI-compatible audio transcription endpoint, or provide voiceTranscriber when creating the review app.' } : {}),
    };
  };
  async function handle(request, path) {
    if (path === 'capabilities' && request.method === 'GET') return json(capability());
    // The reviewer opened Talk or dictation: start the local model if it isn't running.
    if (path === 'prepare') {
      if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, { Allow: 'POST' });
      provider?.prepare?.();
      return json(capability());
    }
    if (path !== 'transcribe') return json({ error: 'not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, { Allow: 'POST' });
    if (!provider?.transcribe) return json({ error: 'Voice transcription is not configured. You can keep typing.', code: 'voice_disabled' }, 503);
    if (local() && local().state !== 'ready') { provider.prepare?.(); return json({ error: local().message || 'Local transcription is starting. Try again in a moment.', code: 'voice_starting' }, 503, { 'Retry-After': '5' }); }
    if (active >= bounds.maxConcurrent) return json({ error: 'Another recording is being transcribed. Try again shortly.', code: 'voice_busy' }, 429, { 'Retry-After': '3' });
    while (attempts.length && attempts[0] <= now() - 60000) attempts.shift();
    if (attempts.length >= bounds.requestsPerMinute) return json({ error: 'Too many transcription requests. Try again in a minute.', code: 'voice_rate_limit' }, 429, { 'Retry-After': '60' });
    attempts.push(now()); active++;
    const controller = new AbortController();
    const cancel = () => controller.abort();
    request.signal.addEventListener('abort', cancel, { once: true });
    let timer;
    try {
      if (request.signal.aborted) throw voiceError(499, 'The transcription was cancelled.');
      const input = await readVoiceInput(request, bounds);
      const actual = validateAudio ? await validateAudio({ ...input, signal: controller.signal, maxDurationMs: bounds.maxDurationMs }) : input;
      if (!Number.isFinite(actual.durationMs) || actual.durationMs < 1 || actual.durationMs > bounds.maxDurationMs) throw voiceError(422, 'The recording is longer than the allowed limit.');
      if (budget && !(await budget.reserve(Math.ceil(actual.durationMs / 1000)))) throw voiceError(429, 'Today’s voice typing allowance is used up. You can keep typing.');
      const timeout = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(voiceError(504, 'Transcription took too long. Your recording can be retried.')); }, bounds.timeoutMs); });
      const output = await Promise.race([provider.transcribe({ ...input, durationMs: actual.durationMs, signal: controller.signal }), timeout]);
      if (controller.signal.aborted) throw voiceError(499, 'The transcription was cancelled.');
      return json(normalizeTranscript(output, actual.durationMs, provider.id || 'configured'));
    } catch (error) {
      return json({ error: error.status ? error.message : 'Transcription failed. Your draft is safe; try again.', code: error.status === 429 ? 'voice_budget' : 'voice_failed' }, error.status || 502);
    } finally { clearTimeout(timer); request.signal.removeEventListener('abort', cancel); active--; }
  }
  return { handle, capability, limits: bounds };
}
