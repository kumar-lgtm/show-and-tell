// The annotation store: one SQLite file per project name, driven through the
// same handler the toolbar's endpoint protocol needs (server/sessions.js).
// node:sqlite ships with Node 22.5+; no native dependency to install.
import './env.js';
import { DatabaseSync } from './sqlite.js';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { handleAgentationApi } from './sessions.js';
import { STORE } from '../bin/lib.mjs';

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS ag_sessions (
  id TEXT PRIMARY KEY, site_id TEXT NOT NULL, url TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ag_sessions_site ON ag_sessions(site_id);
-- The toolbar and the bundle both resolve a session on first load; without
-- this, concurrent inserts give one page two sessions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ag_sessions_url ON ag_sessions(site_id, url);
CREATE TABLE IF NOT EXISTS ag_annotations (
  id TEXT PRIMARY KEY, client_id TEXT, session_id TEXT NOT NULL, site_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'feedback', comment TEXT, element TEXT, element_path TEXT,
  intent TEXT, severity TEXT, status TEXT NOT NULL DEFAULT 'pending', resolution TEXT,
  replies TEXT NOT NULL DEFAULT '[]', payload TEXT NOT NULL DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'reviewer', note TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_session ON ag_annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_client ON ag_annotations(client_id);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_site ON ag_annotations(site_id);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_pending ON ag_annotations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_author ON ag_annotations(author, status);
CREATE INDEX IF NOT EXISTS idx_ag_annotations_session_author ON ag_annotations(session_id, author);
-- The toolbar's shared localStorage keys (agentation-*), the round marker and
-- the agent's read receipt. In the same file as the notes so that two processes
-- writing different keys (the server's round marker, the CLI's receipt) each
-- upsert one row instead of rewriting a shared JSON file over each other.
CREATE TABLE IF NOT EXISTS kv (
  site_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
  PRIMARY KEY (site_id, key)
);
`;

export const dbFile = (name) => join(STORE, `${name}.sqlite`);

/**
 * Every connection to a store, in any process. The server, `feedback wait` and
 * the MCP server all hold the file open at once and write to it: WAL lets the
 * readers carry on while one writes, where the default journal makes a writer
 * wait out every reader, and the busy timeout covers the moments two write.
 */
export function pragmas(db) {
  db.exec("PRAGMA busy_timeout = 10000;");
  try { db.exec("PRAGMA journal_mode = WAL;"); } catch { /* another process is switching it; it persists in the file */ }
}

/**
 * One connection per project per process, created on demand. `create: false`
 * returns null for a project with no store rather than making an empty one, so
 * a typo in a name never leaves a stray file behind. A connection whose file was
 * removed underneath it (a test cleaning up) is dropped and reopened.
 */
const handles = new Map();
export function openDb(name, { create = true } = {}) {
  if (!/^[a-z0-9-]+$/.test(name || '')) throw new Error('Invalid project name');
  const file = dbFile(name);
  const cached = handles.get(name);
  if (cached && existsSync(file)) return cached;
  if (cached) { try { cached.close(); } catch {} handles.delete(name); }
  if (!create && !existsSync(file)) return null;
  mkdirSync(STORE, { recursive: true });
  const db = new DatabaseSync(file);
  pragmas(db);
  db.exec(SCHEMA);
  handles.set(name, db);
  return db;
}

/**
 * The calls sessions.js makes, in the shape it was first written against
 * (prepare → bind → first/all/run, plus an atomic batch). Kept because every
 * query in sessions.js is written that way; here it is a thin layer over
 * node:sqlite's synchronous API.
 */
export function d1(open) {
  return { DB: { prepare(sql) {
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() { return open().prepare(sql).get(...args) ?? null; },
      async all() { return { results: open().prepare(sql).all(...args) }; },
      async run() { return open().prepare(sql).run(...args); },
    };
  },
  // All or nothing: a critique is written as one batch.
  async batch(statements) {
    const db = open(); db.exec("BEGIN");
    try { const out = []; for (const s of statements) out.push(await s.run()); db.exec("COMMIT"); return out; }
    catch (e) { db.exec("ROLLBACK"); throw e; }
  } } };
}

const envs = new Map();
export function database(name) {
  openDb(name); // validates the name, (re)opens a removed file
  if (envs.has(name)) return envs.get(name);
  const env = d1(() => openDb(name));
  envs.set(name, env);
  return env;
}

/** Answer one toolbar API request (`rest` is the path after the endpoint). */
export function handle(request, name, rest) {
  const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers });
  return handleAgentationApi({
    request, env: database(name), site: { id: name, agentation: true }, rest, json,
    apiError: (error, status) => json({ error }, status), now: () => Date.now() / 1000,
  });
}

/** Stream a fetch-style Response (incl. SSE) into a Node response. */
export async function pipeWebResponse(response, res) {
  res.writeHead(response.status, Object.fromEntries(response.headers));
  const reader = response.body?.getReader();
  if (!reader) return res.end();
  res.on('close', () => reader.cancel().catch(() => {}));
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
  } finally { res.end(); }
}
