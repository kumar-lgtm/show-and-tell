#!/usr/bin/env bash
# Show and Tell: free local speech-to-text for the review toolbar.
# Creates a faster-whisper venv once, then serves an OpenAI-compatible
# /v1/audio/transcriptions endpoint. Port 55945 (55940 is `share`'s default).
#
# Prints "READY <transcribe url>" only once the bridge answers /health as a
# transcriber (it binds after the model has loaded, so health means usable).
# Exit codes: 0 ready (and keeps serving; reused bridges exit at once),
# 2 the port is held by something that isn't the bridge, 1 setup/start failed.
set -euo pipefail
# cd -P: the skill is usually reached through a symlink (~/.claude/skills/…),
# and a logical ../../.. from there is the skills folder, not the repo.
KIT="${SHOW_AND_TELL_KIT:-$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && cd ../../.. && pwd)}"   # the repo this skill ships in
# The data folder is ~/.show-and-tell; a machine that used the tool under its old name keeps ~/.agentation-kit.
DATA="$HOME/.show-and-tell"; [ ! -d "$DATA" ] && [ -d "$HOME/.agentation-kit" ] && DATA="$HOME/.agentation-kit"
VENV="${SHOW_AND_TELL_VENV:-$DATA/voice-venv}"
PORT="${PORT:-55945}"
MODEL="${MODEL:-base}"
START_TIMEOUT="${START_TIMEOUT:-600}"   # the first run downloads the model
URL="http://127.0.0.1:$PORT/v1/audio/transcriptions"

# Is a compatible bridge answering? Prints its provider when it is.
bridge_health() {
  local body
  body="$(curl -fsS --max-time 3 "http://127.0.0.1:$PORT/health" 2>/dev/null)" || return 1
  # Node, not python3: Node is the one runtime the kit guarantees.
  printf '%s' "$body" | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{try{const d=JSON.parse(s);if(d.ok!==true||!d.provider)process.exit(1);console.log(d.provider)}catch{process.exit(1)}})' 2>/dev/null
}

if provider="$(bridge_health)"; then
  echo "Reusing the transcription bridge already on :$PORT ($provider)."
  echo "READY $URL"
  exit 0
fi
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  owner="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $1" (pid "$2")"}')"
  echo "Port $PORT is taken by ${owner:-another process}, which isn't a transcription bridge (no valid /health). Leaving it alone." >&2
  echo "Use another port: PORT=55946 bash \"$0\", and point SHOW_AND_TELL_TRANSCRIBE_URL at it." >&2
  exit 2
fi

# faster-whisper's dependencies ship wheels for Python 3.10–3.13 only; the
# system python3 can be newer and then tries to compile Rust.
# PyAV 16+ dropped an argument faster-whisper 1.2 still passes (decode fails),
# so pin av<16. Check the import, not just the venv, so a half-built venv is rebuilt.
if ! "$VENV/bin/python" -c "import faster_whisper, av; assert int(av.__version__.split('.')[0]) < 16" >/dev/null 2>&1; then
  echo "Setting up $VENV (one time)…"
  rm -rf "$VENV"
  if command -v uv >/dev/null 2>&1; then
    uv venv --quiet --python 3.12 "$VENV"
    uv pip install --quiet --python "$VENV/bin/python" faster-whisper "av<16"
  else
    PY=""
    for v in 3.12 3.13 3.11 3.10; do
      c="$(command -v "python$v" || true)"
      if [ -n "$c" ] && [ "$("$c" -c 'import platform; print(platform.machine())')" = "$(uname -m)" ]; then PY="$c"; break; fi
    done
    [ -n "$PY" ] || { echo "Need Python 3.10–3.13 for faster-whisper (or install uv)." >&2; exit 1; }
    "$PY" -m venv "$VENV"
    "$VENV/bin/python" -m pip install --quiet faster-whisper "av<16"
  fi
fi
PYTHON="$VENV/bin/python"

echo "Starting the bridge on :$PORT (model $MODEL; the first run downloads it)…"
"$VENV/bin/python" "$KIT/scripts/voice-transcribe-local.py" --model "$MODEL" --port "$PORT" &
child=$!
trap 'kill "$child" 2>/dev/null' INT TERM EXIT
waited=0
until provider="$(bridge_health)"; do
  if ! kill -0 "$child" 2>/dev/null; then
    wait "$child" || true
    echo "The bridge stopped before it was ready (see the output above)." >&2
    exit 1
  fi
  if [ "$waited" -ge "$START_TIMEOUT" ]; then
    echo "The bridge didn't answer /health within ${START_TIMEOUT}s. Stopping it." >&2
    exit 1
  fi
  sleep 2; waited=$((waited + 2))
done
echo "READY $URL ($provider)"
# Health is not a transcription: the first real clip still proves the model works.
wait "$child"
