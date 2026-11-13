// Project names for the review server and the loader tag: [a-z0-9-], derived
// from package.json or the folder. No SQLite here, so the installer and the
// plugins' config-time code can use it without loading the store.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { sanitizeName } from './loader-tag.js';

export { sanitizeName };

/** The project name for a root dir: its package.json name, else the repo's folder name. */
export function defaultName(root) {
  let pkg;
  try { pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name; } catch {}
  return sanitizeName(pkg) || sanitizeName(repoFolder(root)) || 'app';
}

/**
 * The folder name that names this checkout. A git worktree
 * (`repo/.worktrees/my-branch`, whose .git is a file) is named for the repo it
 * belongs to, not the branch folder, so every worktree shares one project.
 */
export function repoFolder(root) {
  try {
    const g = join(root, '.git');
    if (existsSync(g) && statSync(g).isFile()) {
      const m = /^gitdir:\s*(.+?)[\/]\.git[\/]worktrees[\/]/m.exec(readFileSync(g, 'utf8'));
      if (m) return basename(m[1]);
    }
  } catch {}
  return basename(root);
}

/** An explicit name, sanitised; falls back to the default for `root`. */
export function projectName(explicit, root) {
  return sanitizeName(explicit) || defaultName(root);
}

/**
 * The project a file belongs to: the nearest directory at or above `dir` with a
 * package.json or a .git, else `dir`. Stopping at .git keeps a repo without a
 * package.json from borrowing the name of a workspace folder that has one.
 */
export function projectRoot(dir) {
  for (let d = resolve(dir); ; d = dirname(d)) {
    if (existsSync(join(d, 'package.json')) || existsSync(join(d, '.git'))) return d;
    if (dirname(d) === d) return resolve(dir);
  }
}
