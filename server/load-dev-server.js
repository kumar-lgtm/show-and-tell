// The plugins load the in-process review server lazily, through this, so a
// production build never touches node:sqlite, and the dev server's terminal
// doesn't print Node's "SQLite is an experimental feature" warning. Only that
// one warning is dropped, and only while the module loads (Node emits it once,
// when node:sqlite is first imported); every other warning passes through.
const SQLITE_WARNING = /^SQLite is an experimental feature/;

export async function loadDevServer() {
  const emit = process.emitWarning;
  process.emitWarning = function quietSqlite(warning, ...rest) {
    const type = typeof rest[0] === 'string' ? rest[0] : rest[0]?.type ?? warning?.name;
    if (type === 'ExperimentalWarning' && SQLITE_WARNING.test(String(warning?.message ?? warning))) return;
    return emit.call(this, warning, ...rest);
  };
  try { return await import('./dev-server.js'); } finally { process.emitWarning = emit; }
}
