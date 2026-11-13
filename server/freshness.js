// Is the page the reviewer has open older than the source it was built from?
//
// WHY: in a real round (pollut.ai, 2026-11-07) the agent fixed the source,
// resolved the notes and checked the result in a fresh browser, while the
// reviewer's tab was still the document it had loaded before the fix (a plain
// static server, no live reload, unversioned scripts). Every check passed and
// the reviewer saw none of it. The toolbar now asks this module which of the
// files its page loaded have changed since it loaded them.
//
// The page sends the same-origin paths it loaded and when it loaded each one
// (toolbar/fresh.js). Here each path is mapped to a file under `src` and its
// mtime compared. A path that maps to no file (a bundler chunk, an API route) is
// skipped, never guessed at: a false "this page is old" would teach the
// reviewer to ignore the real one.
import { statSync, realpathSync } from 'node:fs';
import { join, resolve, relative, isAbsolute, sep } from 'node:path';
import { sourceFiles } from './apply.js';

/** How much newer than the load a file must be. Last-Modified has whole seconds. */
export const SLACK_MS = 1000;
const MAX_PATHS = 400;

export function createFreshness(src, { remote = false } = {}) {
  const root = resolve(src);
  let realRoot = root;
  try { realRoot = realpathSync(root); } catch { /* a missing src maps nothing */ }
  let known = null, knownAt = 0;
  // The file list is only the fallback (a page served from a subfolder of src); cached briefly.
  const knownFiles = () => {
    if (!known || Date.now() - knownAt > 10000) {
      try { known = sourceFiles(root).map((f) => f.split(sep).join('/')); } catch { known = []; }
      knownAt = Date.now();
    }
    return known;
  };
  /** The file's mtime when `rel` is a regular file inside src (symlinks out of it don't count). */
  const mtimeOf = (rel) => {
    const abs = join(root, rel);
    try {
      const real = realpathSync(abs);
      const r = relative(realRoot, real);
      if (!r || r.startsWith('..') || isAbsolute(r)) return null;
      const st = statSync(real);
      return st.isFile() ? st.mtimeMs : null;
    } catch { return null; }
  };

  // Each path's answer for a few seconds: a page sends the same list every poll,
  // and a bundler chunk that maps to nothing would rescan the file list each time.
  const memo = new Map();
  const MEMO_MS = 10000;
  function fileOf(path, opts = {}) {
    const key = `${opts.doc ? 'd' : 'f'}:${path}`, hit = memo.get(key);
    if (hit && Date.now() - hit.at < MEMO_MS) return hit.file;
    const file = mapPath(path, opts);
    if (memo.size > 2000) memo.clear();
    memo.set(key, { file, at: Date.now() });
    return file;
  }

  /** A URL path → a file under src, relative with forward slashes, or null. */
  function mapPath(path, { doc = false } = {}) {
    let p = String(path || '');
    if (p.startsWith('/@fs/')) {
      if (remote) return null; // an absolute path would answer "is this where your project lives?"
      const r = relative(root, resolve(p.slice(4)));
      return r && !r.startsWith('..') && !isAbsolute(r) && mtimeOf(r) != null ? r.split(sep).join('/') : null;
    }
    const parts = p.split('/').filter(Boolean);
    if (parts.some((x) => x === '..' || x === '.' || x.includes('\0'))) return null;
    const candidates = [parts.join('/')];
    if (doc) {
      const base = parts.join('/');
      candidates.length = 0;
      if (!p.endsWith('/') && base) candidates.push(base, `${base}.html`);
      candidates.push(base ? `${base}/index.html` : 'index.html');
    }
    for (const cand of candidates) {
      if (!cand) continue;
      // The page may be served from a parent of src (`/explorations/x/app.js`
      // with src at explorations/x): drop leading folders until it lands.
      const segs = cand.split('/');
      for (let i = 0; i < segs.length; i++) {
        const rel = segs.slice(i).join('/');
        if (mtimeOf(rel) != null) return rel;
      }
    }
    // Or from a child of src (public/, static/): one file under src ends with it.
    for (const cand of candidates) {
      if (!cand) continue;
      const hits = knownFiles().filter((f) => f.endsWith(`/${cand}`));
      if (hits.length === 1) return hits[0];
    }
    return null;
  }

  /**
   * @param {{path: string, at: number, doc?: boolean}[]} loaded  what the page loaded, and when (ms since epoch)
   * @returns {{checked: number, stale: {path: string, file: string, at: number, changedAt: number}[]}}
   */
  function check(loaded) {
    const stale = [];
    let checked = 0;
    const seen = new Set();
    for (const item of (Array.isArray(loaded) ? loaded : []).slice(0, MAX_PATHS)) {
      const path = typeof item?.path === 'string' ? item.path.slice(0, 2048) : '';
      const at = Number(item?.at);
      if (!path || !Number.isFinite(at) || at <= 0) continue;
      const file = fileOf(path, { doc: !!item.doc });
      if (!file || seen.has(file)) continue;
      seen.add(file);
      checked++;
      const changedAt = mtimeOf(file);
      if (changedAt != null && changedAt > at + SLACK_MS) stale.push({ path, file, at, changedAt: Math.round(changedAt) });
    }
    stale.sort((a, b) => b.changedAt - a.changedAt);
    return { checked, stale };
  }

  return { check, fileOf };
}
