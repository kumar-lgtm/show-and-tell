import { kvGet } from './kv-store.js';

export const AGENT_WORK_KEY = 'agent-work-status';
export const AGENT_CURSOR_KEY = 'agent-work-cursor';
export const HEARTBEAT_MS = 15000;

export function publicAgentWork(name, now = Date.now()) {
  let status;
  try { status = JSON.parse(kvGet(name, AGENT_WORK_KEY).value || 'null'); } catch {}
  if (!status || !Number.isFinite(status.updatedAt) || now - status.updatedAt > HEARTBEAT_MS) {
    return { state: 'offline', message: 'Local agent listener is offline.', updatedAt: status?.updatedAt || null };
  }
  const out = Object.fromEntries(['state', 'message', 'updatedAt', 'startedAt', 'finishedAt', 'roundTs', 'count', 'queued']
    .filter(key => status[key] !== undefined).map(key => [key, status[key]]));
  // Optional structured progress, bounded and whitelisted like the rest.
  const steps = boundedList(status.steps, 8, s => typeof s?.label === 'string' && s.label.trim()
    ? { label: s.label.replace(/\s+/g, ' ').trim().slice(0, 120), state: ['done', 'active', 'pending', 'failed'].includes(s.state) ? s.state : 'pending' } : null);
  const changes = boundedList(status.changes, 12, c => typeof c?.summary === 'string' && c.summary.trim()
    ? { noteId: String(c.noteId ?? '').slice(0, 128), summary: c.summary.replace(/\s+/g, ' ').trim().slice(0, 200), status: ['resolved', 'needs-input', 'rejected'].includes(c.status) ? c.status : 'resolved' } : null);
  if (steps) out.steps = steps;
  if (changes) out.changes = changes;
  return out;
}

function boundedList(list, max, map) {
  if (!Array.isArray(list)) return null;
  const out = list.slice(0, max).map(map).filter(Boolean);
  return out.length ? out : null;
}

/** One worker at a time, with a durable Send cursor independent of manual reads. */
export function createReviewListener({ getRound, getNotes, readCursor, writeCursor, writeStatus, run, now = Date.now }) {
  let cursor = Number(readCursor()) || 0;
  let active = false;
  let stopped = false;
  let status = { state: 'listening', message: 'Listening for Send to agent.' };
  const publish = () => writeStatus({ ...status, updatedAt: now() });
  async function tick() {
    if (stopped) return;
    const round = getRound();
    const next = Number.isFinite(round?.ts) && round.ts > cursor;
    if (active) { status.queued = !!next; publish(); return; }
    if (!next) { publish(); return; }
    const submitted = Array.isArray(round.noteIds) ? new Set(round.noteIds) : null;
    const notes = getNotes().filter(n => submitted ? submitted.has(n.id) : n.timestamp <= round.ts);
    cursor = round.ts;
    writeCursor(cursor);
    if (!notes.length) { status = { state: 'listening', message: 'No open feedback. Listening for the next round.', roundTs: cursor }; publish(); return; }
    active = true;
    const ids = new Set(notes.map(n => n.id));
    status = { state: 'working', message: `Reading ${notes.length} feedback ${notes.length === 1 ? 'note' : 'notes'}.`, count: notes.length, roundTs: cursor, startedAt: now(), queued: false };
    publish();
    const progress = message => {
      if (stopped || !active || typeof message !== 'string') return;
      status.message = message.replace(/\s+/g, ' ').trim().slice(0, 240);
      publish();
    };
    try {
      const result = await run({ notes, round, progress });
      if (stopped) return;
      const remaining = getNotes().filter(n => ids.has(n.id));
      status = { ...status, state: result?.exitCode === 0 ? remaining.length ? 'needs-input' : 'complete' : 'failed',
        message: result?.exitCode === 0 ? remaining.length ? `${remaining.length} notes remain open. Check the inbox for questions or the agent result.` : 'Changes ready. Reload the preview to review them.' : 'Agent run failed. Your notes are kept; send again to retry.', finishedAt: now() };
    } catch {
      status = { ...status, state: 'failed', message: 'Agent could not start. Your notes are kept; check the local listener log.', finishedAt: now() };
    } finally { active = false; if (!stopped) publish(); }
  }
  return { tick, stop() { stopped = true; status = { ...status, state: 'offline', message: 'Local agent listener stopped.' }; publish(); }, get active() { return active; } };
}
