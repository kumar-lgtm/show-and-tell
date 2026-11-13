// node:sqlite, loaded so that its one ExperimentalWarning does not print.
//
// Every command (and a dev server that starts the review server in-process)
// would otherwise open with "ExperimentalWarning: SQLite is an experimental
// feature" on stderr. That line is noise to a reviewer and, worse, reads as an
// error to an agent parsing `feedback` output.
//
// Only that warning is dropped. Node prints warnings from a single 'warning'
// listener it installs at startup; we take the listeners that exist now, put one
// filter in front of them, and hand every other warning on unchanged. The module
// is loaded with require() AFTER the filter is in place, because a static
// `import 'node:sqlite'` is linked before any of our code runs. Node emits the
// warning on the next tick, so a filter installed in the same tick still sees it.
import { createRequire } from 'node:module';

const MARK = Symbol.for('show-and-tell.quiet-sqlite');

export function isSqliteWarning(w) {
  return w?.name === 'ExperimentalWarning' && /\bSQLite\b/.test(String(w.message));
}

export function quietSqliteWarning() {
  if (process[MARK]) return;
  process[MARK] = true;
  const previous = process.listeners('warning');
  process.removeAllListeners('warning');
  process.on('warning', function filter(w) {
    if (isSqliteWarning(w)) return;
    for (const listener of previous) listener.call(process, w);
  });
}

quietSqliteWarning();
export const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');
