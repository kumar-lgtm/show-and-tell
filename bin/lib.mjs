// Shared plumbing for the show-and-tell commands. Everything is local to this
// repo: the session API (server/sessions.js), the stores, the formatter and the
// toolbar bundle (dist/show-and-tell.js).
import '../server/env.js';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
// Notes live in ~/.show-and-tell. A machine that used the tool under its old
// name keeps its folder (~/.agentation-kit): the notes, screenshots and the
// voice model in it are not moved from under a running server.
const HOME_NOW = join(homedir(), '.show-and-tell'), HOME_BEFORE_RENAME = join(homedir(), '.agentation-kit');
export const STORE = process.env.AGENTATION_KIT_STORE || (!existsSync(HOME_NOW) && existsSync(HOME_BEFORE_RENAME) ? HOME_BEFORE_RENAME : HOME_NOW);
export { DEFAULT_PORT } from '../server/loader-tag.js';

/** The toolbar build. `pnpm build` writes it; the repo ships a prebuilt copy. */
export function bundlePath() {
  const p = join(ROOT, 'dist', 'show-and-tell.js');
  if (!existsSync(p)) throw new Error(`No toolbar bundle at ${p}. Build one: pnpm install && pnpm build`);
  return p;
}

/** A bad command line: the command prints the message (no stack trace) and exits 2. */
export class UsageError extends Error {}

/** Print a UsageError's message and exit 2; anything else is rethrown. */
export function exitOnUsage(e) {
  if (!(e instanceof UsageError)) throw e;
  console.error(e.message);
  process.exit(2);
}

/** `--flag` as a positive number (seconds, …), or `fallback` when absent. */
export function positiveNumber(raw, flag, fallback) {
  if (raw === undefined) return fallback;
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) throw new UsageError(`--${flag} must be a positive number, got "${raw === true ? '' : raw}"`);
  return n;
}

/** `--port` as a TCP port, or `fallback` when absent. */
export function portArg(raw, fallback) {
  if (raw === undefined) return fallback;
  const n = typeof raw === 'string' && /^\d+$/.test(raw.trim()) ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 65535) throw new UsageError(`--port must be a number from 1 to 65535, got "${raw === true ? '' : raw}"`);
  return n;
}

/** `--origin` as an http(s) origin (`http://localhost:5173`). */
export function originArg(raw) {
  let u = null;
  try { u = new URL(String(raw)); } catch {}
  if (!u || !/^https?:$/.test(u.protocol)) throw new UsageError(`--origin must be the dev server's http(s) address, e.g. http://localhost:5173, got "${raw === true ? '' : raw}"`);
  return u.origin;
}

export function assertSlug(name) {
  if (!/^[a-z0-9-]+$/.test(name || '')) throw new UsageError(`name must be lowercase letters, digits and dashes ([a-z0-9-]), got "${name ?? ''}"`);
  return name;
}

/** Minimal flag parser: --key value, --flag, positionals. Keys in `boolean` never take a value. */
export function parseArgs(argv, { boolean = [] } = {}) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (boolean.includes(key) || next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}
