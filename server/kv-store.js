/**
 * The project's small key-value store: the toolbar's shared localStorage keys
 * (`agentation-*`, mirrored by the KV bridge in server/client.js), the round
 * marker the toolbar's "Send to agent" writes, and the agent's read receipt.
 *
 * WHY IN THE PROJECT'S SQLITE FILE: the notes already live there, and two
 * processes write these keys at the same time — the review server records a
 * round while `feedback wait` (another process) records what the agent has
 * read. As a JSON file that was a read-modify-write of the whole map on each
 * side, so one writer's save erased the other's key, and a half-written or
 * corrupt file read back as `{}` and was then saved over, losing every key.
 * One row per key, one upsert per write, makes both of those impossible.
 *
 * WHY IT OUTLIVES THE SERVER: the review server dies with the dev server (or the
 * terminal); a round the reviewer sent must still be there for the next
 * `feedback` run. So it lives with the notes under the store directory
 * (SHOW_AND_TELL_STORE, default ~/.show-and-tell), keyed by project name, and
 * not inside the project being reviewed.
 *
 * A store written by an older version kept these keys in `<name>.json`. It is
 * imported once, the first time the project's database is opened for KV, and
 * then renamed to `<name>.json.imported` (kept, not deleted). A file that fails
 * to parse is left exactly where it is and nothing is imported from it.
 */

import { existsSync, readFileSync, renameSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cleanRoundValue } from "./reviewer.js";
import { openDb, dbFile } from "./store.js";
import { STORE } from "../bin/lib.mjs";

/** Caps per value, key and project, so one runaway page cannot fill the disk. */
export const KV_MAX_VALUE = 64 * 1024;
export const KV_MAX_KEY = 200;
export const KV_MAX_KEYS = 5000;

const imported = new Set();

/** One-time import of a legacy `<slug>.json`. Safe to race: rows are INSERT OR IGNORE. */
function importLegacy(slug, db) {
  if (imported.has(slug)) return;
  imported.add(slug);
  const file = join(STORE, `${slug}.json`);
  if (!existsSync(file)) return;
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`show-and-tell: ${file} could not be read (${e.message}); left as is, nothing imported from it.`);
    return;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return;
  const insert = db.prepare("INSERT OR IGNORE INTO kv (site_id, key, value) VALUES (?, ?, ?)");
  db.exec("BEGIN");
  try {
    for (const [k, v] of Object.entries(data)) {
      if (!k || k.length > KV_MAX_KEY || v == null) continue;
      insert.run(slug, k, String(v).slice(0, KV_MAX_VALUE));
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    imported.delete(slug);
    throw e;
  }
  try { renameSync(file, `${file}.imported`); } catch { /* another process got there first */ }
}

/** The database for KV, or null when reading a project that has no store yet. */
function db(slug, { create }) {
  if (!/^[a-z0-9-]+$/.test(slug || "")) throw new Error(`refusing to open a store for unsafe slug: ${slug}`);
  // A legacy JSON with no database yet still counts as a store to read from.
  const legacy = existsSync(join(STORE, `${slug}.json`));
  const handle = openDb(slug, { create: create || legacy });
  if (handle) importLegacy(slug, handle);
  return handle;
}

/** `{ items: [{ key, value }] }`, the shape the KV bridge reads. */
export function kvList(slug, prefix = "") {
  const d = db(slug, { create: false });
  if (!d) return { items: [] };
  // substr, not LIKE: LIKE would read _ and % in the prefix as wildcards.
  const p = String(prefix);
  const rows = d.prepare("SELECT key, value FROM kv WHERE site_id = ? AND substr(key, 1, ?) = ? ORDER BY key LIMIT ?")
    .all(slug, p.length, p, KV_MAX_KEYS);
  return { items: rows.map((r) => ({ key: r.key, value: r.value })) };
}

export function kvGet(slug, key) {
  const d = db(slug, { create: false });
  const row = d ? d.prepare("SELECT value FROM kv WHERE site_id = ? AND key = ?").get(slug, String(key)) : null;
  return { key, value: row ? row.value : null };
}

/** Returns `{ ok }` or `{ error, status }` — the caller turns it into a response. */
export function kvSet(slug, key, value) {
  const k = String(key ?? "");
  // The round marker names who pressed Send; that name is printed by `feedback`.
  const v = k === "agentation-round" ? cleanRoundValue(String(value ?? "")) : String(value ?? "");
  if (!k || k.length > KV_MAX_KEY) return { error: "invalid key", status: 422 };
  if (v.length > KV_MAX_VALUE) return { error: "value too large", status: 413 };
  const d = db(slug, { create: true });
  const exists = d.prepare("SELECT 1 FROM kv WHERE site_id = ? AND key = ?").get(slug, k);
  if (!exists && d.prepare("SELECT COUNT(*) AS n FROM kv WHERE site_id = ?").get(slug).n >= KV_MAX_KEYS) {
    return { error: "too many keys for this project", status: 409 };
  }
  d.prepare("INSERT INTO kv (site_id, key, value) VALUES (?, ?, ?) ON CONFLICT(site_id, key) DO UPDATE SET value = excluded.value").run(slug, k, v);
  return { ok: true };
}

export function kvDelete(slug, key) {
  const d = db(slug, { create: false });
  if (d) d.prepare("DELETE FROM kv WHERE site_id = ? AND key = ?").run(slug, String(key));
  return { ok: true };
}

/** Every project with a store on disk. */
export function storedSlugs() {
  if (!existsSync(STORE)) return [];
  return readdirSync(STORE).filter((f) => f.endsWith(".sqlite")).map((f) => f.slice(0, -7)).sort();
}

/** Test seam. Not wired to any tool — dropping a reviewer's notes is never something to automate. */
export function clearStore(slug) {
  const d = existsSync(dbFile(slug)) ? db(slug, { create: false }) : null;
  if (d) d.prepare("DELETE FROM kv WHERE site_id = ?").run(slug);
}
