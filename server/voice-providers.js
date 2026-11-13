import { voiceError } from './voice.js';

/** Uses a full /v1/audio/transcriptions URL, never a browser-visible credential. */
export function openAICompatibleTranscriber({ url, apiKey, model = 'whisper-1', fetchImpl = fetch }) {
  const endpoint = new URL(url);
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error('Invalid transcription endpoint.');
  if (endpoint.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) throw new Error('Remote transcription endpoints require HTTPS.');
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname);
  return {
    id: local ? 'local-whisper' : 'configured-transcription',
    disclosure: local ? 'Audio is sent to the local transcription service on this computer. Only text is attached to your note.' : 'Audio is sent to the configured transcription service. Only text is attached to your note.',
    async transcribe({ audio, signal }) {
      const form = new FormData(); form.set('file', audio, 'feedback-audio'); form.set('model', model);
      form.set('response_format', 'verbose_json'); form.append('timestamp_granularities[]', 'word'); form.append('timestamp_granularities[]', 'segment');
      const response = await fetchImpl(endpoint, { method: 'POST', headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, body: form, signal });
      if (!response.ok) throw voiceError(response.status === 429 ? 429 : 502, response.status === 429 ? 'The transcription service is at its limit. Try again later.' : 'The transcription service could not process this recording.');
      return response.json();
    },
  };
}

export function voiceTranscriberFromEnv(env = process.env) {
  if (!env.AGENTATION_KIT_TRANSCRIBE_URL) return null;
  return openAICompatibleTranscriber({ url: env.AGENTATION_KIT_TRANSCRIBE_URL, apiKey: env.AGENTATION_KIT_TRANSCRIBE_KEY, model: env.AGENTATION_KIT_TRANSCRIBE_MODEL || 'whisper-1' });
}
