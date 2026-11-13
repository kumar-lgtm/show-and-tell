// Shared test plumbing: a temp store, notes seeded through the real toolbar API
// (server/store.js `handle`, the same handler `serve` mounts at /__ag) without
// binding a port, and the CLI run against the same store.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const CLI = fileURLToPath(new URL('../bin/show-and-tell.mjs', import.meta.url));
export const STORE = mkdtempSync(join(tmpdir(), 'agk-store-'));
process.env.AGENTATION_KIT_STORE = STORE; // before anything imports bin/lib.mjs
const { handle } = await import('../server/store.js');

export const ORIGIN = 'http://localhost:5173';
let n = 0;
export const uniqueName = (prefix) => `${prefix}-${process.pid}-${++n}`;

async function call(name, method, rest, body) {
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: body ? JSON.stringify(body) : undefined,
  }), name, rest);
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${rest} → ${res.status} ${JSON.stringify(json)}`);
  return json;
}

const sessions = new Map();
async function sessionFor(name, path) {
  const key = `${name} ${path}`;
  if (!sessions.has(key)) sessions.set(key, (await call(name, 'POST', 'sessions', { url: `${ORIGIN}${path}` })).id);
  return sessions.get(key);
}

/** A committed text edit, shaped exactly as toolbar/edit-mode.js `commit()` posts it. */
export async function seedEdit(name, { from, to, path = '/', viewport = { width: 390, height: 844, name: 'mobile' }, element = 'h1', elementPath = 'main > h1' }) {
  const sid = await sessionFor(name, path);
  return call(name, 'POST', `sessions/${sid}/annotations`, {
    id: crypto.randomUUID(),
    kind: 'edit',
    viewport,
    url: `${ORIGIN}${path}`,
    comment: `Change to: "${to}"`,
    element,
    elementPath,
    intent: 'edit',
    edit: { id: `edit-${Math.random().toString(36).slice(2)}`, from, to },
  });
}

/** A copy edit, shaped as server/copy-view/view.js sends it: the unit's exact span travels with it. */
export async function seedCopy(name, { unit, to, path = '/', batch = 'copy-test' }) {
  const sid = await sessionFor(name, path);
  const parts = unit.parts?.map((p) => ({ ...p, start: p.start - unit.start, end: p.end - unit.start }));
  return call(name, 'POST', `sessions/${sid}/annotations`, {
    id: `copy:${unit.file}:${unit.start}:${Math.random().toString(36).slice(2)}`,
    kind: 'copy', url: `${ORIGIN}${path}`, comment: `Change to: "${to}"`, element: unit.kind, elementPath: unit.path || '', intent: 'edit',
    copy: {
      batch, from: unit.display ?? unit.text, to,
      unit: { id: unit.id, file: unit.file, start: unit.start, end: unit.end, line: unit.line, kind: unit.kind, quote: unit.quote,
        ...(unit.htmlQuote !== undefined ? { htmlQuote: unit.htmlQuote } : {}), ...(unit.inScript ? { inScript: true } : {}), raw: unit.raw, path: unit.path || null, ...(parts ? { parts } : {}) },
    },
  });
}

/** A plain comment, the shape Agentation posts for a click-and-type note. */
export async function seedNote(name, { comment, path = '/', selectedText, nearbyText, element = 'p', elementPath = 'main > p', viewport = { width: 1440, height: 900, name: 'desktop' } }) {
  const sid = await sessionFor(name, path);
  return call(name, 'POST', `sessions/${sid}/annotations`, {
    id: crypto.randomUUID(), comment, element, elementPath, selectedText, nearbyText, viewport, url: `${ORIGIN}${path}`,
  });
}

/** Read a note back through the API, the way the toolbar sees it. */
export async function readNote(name, id) {
  const { sessions: list } = await call(name, 'GET', 'sessions');
  return list.flatMap((s) => s.annotations).find((a) => a.id === id);
}

/** A source tree from {relPath: contents}. */
export function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'agk-src-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}

export function cli(args, { env = {}, cwd } = {}) {
  try {
    return { code: 0, out: execFileSync(process.execPath, ['--no-warnings', CLI, ...args], { cwd, encoding: 'utf8', env: { ...process.env, SHOW_AND_TELL_STORE: STORE, ...env }, stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (e) {
    return { code: e.status, out: String(e.stdout || ''), err: String(e.stderr || '') };
  }
}

export const cleanup = (...dirs) => { for (const d of [STORE, ...dirs]) rmSync(d, { recursive: true, force: true }); };

/** A voice note: one spoken passage anchored to a target, as toolbar/voice.js posts it. */
export async function seedVoice(name, { comment, sessionId, passage, targetId, label = 'Region: hero', path = '/' }) {
  const sid = await sessionFor(name, path);
  return call(name, 'POST', `sessions/${sid}/annotations`, {
    id: crypto.randomUUID(), clientId: `voice:${sessionId}:${passage}`, kind: 'voice', comment, element: label, elementPath: '',
    url: `${ORIGIN}${path}`, viewport: { width: 1316, height: 852, name: 'desktop' },
    voice: { version: 1, sessionId, passageId: `${sessionId}:${passage}`, startMs: 0, endMs: 1000, target: { id: `${sessionId}:${targetId}`, kind: 'region', label, page: `${ORIGIN}${path}` } },
  });
}
