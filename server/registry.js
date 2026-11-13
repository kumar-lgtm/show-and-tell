// Which review server runs on which port, as files under the store:
//   ~/.show-and-tell/servers/<port>.json  {port, name, origin, kind, pid, startedAt}
// A file read answers "who owns 55930?" where a curl can't (a sandbox that
// blocks localhost, a server that is wedged).
//
// Records are published atomically (temp file + rename), so a reader never sees
// half a record. A record counts only while its process is alive AND started
// when the record says (a reused pid after a SIGKILL is not the old server).
// Readers drop a record only after re-reading it unchanged.
import './env.js';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { STORE } from '../bin/lib.mjs';

const DIR = () => join(STORE, 'servers');
const SLACK_MS = 5000; // ps reports elapsed time in whole seconds

/** ms since the process started, from ps; null when ps can't say. */
function elapsedMs(pid) {
  try {
    const out = execFileSync('ps', ['-o', 'etime=', '-p', String(pid)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    // [[dd-]hh:]mm:ss
    const m = /^(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+)$/.exec(out);
    if (!m) return null;
    const [, d = 0, h = 0, mi, se] = m.map((x) => (x === undefined ? 0 : Number(x)));
    return (((d * 24 + h) * 60 + mi) * 60 + se) * 1000;
  } catch { return null; }
}

function alive(rec) {
  const pid = rec?.pid;
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); } catch (e) { if (e.code !== 'EPERM') return false; }
  const started = Date.parse(rec.startedAt);
  if (!Number.isFinite(started)) return true;
  const el = elapsedMs(pid);
  if (el == null) return true; // no ps: trust the pid
  // The process must have started no later than the record was written.
  return Date.now() - el <= started + SLACK_MS;
}

function readRecord(file) {
  try { return { raw: readFileSync(file, 'utf8') }; } catch { return null; }
}

/** Record this process as the server on `port`. Returns an unregister function. */
export function registerServer({ port, name, origin, kind = 'serve', signals = true }) {
  const file = join(DIR(), `${port}.json`);
  const tmp = join(DIR(), `.${port}.${process.pid}.tmp`);
  try {
    mkdirSync(DIR(), { recursive: true });
    writeFileSync(tmp, JSON.stringify({ port, name, origin, kind, pid: process.pid, startedAt: new Date().toISOString() }));
    renameSync(tmp, file);
  } catch { try { rmSync(tmp, { force: true }); } catch {} return () => {}; }
  let done = false;
  const drop = () => {
    if (done) return; done = true;
    try { if (JSON.parse(readFileSync(file, 'utf8')).pid === process.pid) rmSync(file, { force: true }); } catch {}
  };
  process.once('exit', drop);
  // A standalone server owns its process; inside a host (a dev-server plugin, share)
  // the host owns the signals, and a stale file is dropped on a later read anyway.
  if (signals) for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(sig, () => { drop(); process.exit(0); });
  return drop;
}

/** Live servers, by port. */
export function listServers() {
  let files = [];
  try { files = readdirSync(DIR()).filter((f) => /^\d+\.json$/.test(f)); } catch { return []; }
  const out = [];
  for (const f of files) {
    const file = join(DIR(), f);
    const got = readRecord(file);
    if (!got) continue;
    let rec = null;
    try { rec = JSON.parse(got.raw); } catch { continue; } // never delete what we couldn't read
    if (alive(rec)) { out.push(rec); continue; }
    // Stale: drop it only if nobody replaced it since we read it.
    const again = readRecord(file);
    if (again && again.raw === got.raw) try { rmSync(file, { force: true }); } catch {}
  }
  return out.sort((a, b) => a.port - b.port);
}

/** The live server on `port`, or null. */
export const serverOn = (port) => listServers().find((s) => s.port === port) || null;
