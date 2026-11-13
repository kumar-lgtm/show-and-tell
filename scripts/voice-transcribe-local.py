#!/usr/bin/env python3
"""Optional loopback OpenAI-compatible bridge. Requires faster-whisper.

python scripts/voice-transcribe-local.py --model base --port 55940
SHOW_AND_TELL_TRANSCRIBE_URL=http://127.0.0.1:55940/v1/audio/transcriptions

The default model is multilingual; an .en model is used only if explicitly
requested. Audio is deleted after the request and is not logged.
"""
import argparse
from email import policy
from email.parser import BytesParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import tempfile
import threading
from pathlib import Path

MAX_BYTES = 16 * 1024 * 1024
MAX_SECONDS = 300


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', default='base', help='faster-whisper model name or local model directory')
    parser.add_argument('--port', type=int, default=55940)
    parser.add_argument('--device', default='cpu')
    parser.add_argument('--compute-type', default='int8')
    parser.add_argument('--language', default=None, help='Optional ISO language; default detects original language')
    args = parser.parse_args()
    from faster_whisper import WhisperModel
    from faster_whisper.audio import decode_audio
    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    lock = threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'

        def log_message(self, *_):
            pass  # No audio, text, headers, or paths in request logs.

        def reply(self, status, data):
            body = json.dumps(data, ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def permitted(self):
            host = self.headers.get('Host', '').lower()
            if host not in (f'127.0.0.1:{args.port}', f'localhost:{args.port}') or self.headers.get('Origin'):
                self.reply(403, {'error': 'This service is for the local review server only.'})
                return False
            return True

        def do_GET(self):
            if not self.permitted():
                return
            if self.path != '/health':
                return self.reply(404, {'error': 'not found'})
            self.reply(200, {'ok': True, 'provider': 'faster-whisper', 'language': args.language or 'auto'})

        def do_POST(self):
            if not self.permitted():
                return
            if self.path != '/v1/audio/transcriptions':
                return self.reply(404, {'error': 'not found'})
            try:
                length = int(self.headers.get('Content-Length', '0'))
            except ValueError:
                return self.reply(400, {'error': 'Invalid content length.'})
            if not 0 < length <= MAX_BYTES + 65536:
                self.close_connection = True
                return self.reply(413, {'error': 'The recording is empty or too large.'})
            content_type = self.headers.get('Content-Type', '')
            if not content_type.lower().startswith('multipart/form-data;'):
                return self.reply(415, {'error': 'Expected multipart audio.'})
            if not lock.acquire(blocking=False):
                self.close_connection = True
                return self.reply(429, {'error': 'A transcription is already running.'})
            try:
                self.connection.settimeout(30)
                body = self.rfile.read(length)
                message = BytesParser(policy=policy.default).parsebytes(
                    ('Content-Type: ' + content_type + '\r\nMIME-Version: 1.0\r\n\r\n').encode() + body)
                audio = None
                for part in message.iter_parts():
                    if part.get_param('name', header='content-disposition') == 'file':
                        audio = part.get_payload(decode=True)
                        break
                if not audio or len(audio) > MAX_BYTES:
                    return self.reply(400, {'error': 'Add a non-empty audio file.'})
                with tempfile.TemporaryDirectory(prefix='agk-voice-') as directory:
                    path = Path(directory) / 'recording.bin'
                    path.write_bytes(audio)
                    # Decode once, validate actual duration before inference, then
                    # reuse the samples. This does not trust the browser timer.
                    samples = decode_audio(str(path), sampling_rate=16000)
                    seconds = len(samples) / 16000
                    if not 0 < seconds <= MAX_SECONDS:
                        return self.reply(422, {'error': 'Audio must be no longer than five minutes.'})
                    output, info = model.transcribe(samples, language=args.language, word_timestamps=True,
                                                    vad_filter=True, condition_on_previous_text=False)
                    segments = []
                    for segment in output:
                        segments.append({'id': segment.id, 'start': segment.start, 'end': segment.end,
                                         'text': segment.text.strip(), 'words': [
                                             {'word': word.word.strip(), 'start': word.start, 'end': word.end}
                                             for word in (segment.words or [])]})
                    self.reply(200, {'text': ' '.join(s['text'] for s in segments), 'segments': segments,
                                     'language': info.language, 'duration': seconds})
            except Exception:
                self.reply(422, {'error': 'The audio could not be decoded or transcribed.'})
            finally:
                lock.release()

    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    server.daemon_threads = True
    print(f'Local voice transcription ready on http://127.0.0.1:{args.port} (language: {args.language or "auto"})', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
