// Keep the loader block out of commits without taking it out of the file:
// a local git clean filter strips it whenever the file is staged.
//   <common git dir>/info/attributes          "/<path>" filter=show-and-tell   (never committed)
//   <common git dir>/show-and-tell-strip.mjs  a self-contained copy of the stripper
//   .git/config  filter.show-and-tell.clean = node <that copy>, required = true
// The copy lives in the git dir, so moving or deleting the kit checkout can't
// silently turn the filter off; `required` makes a broken filter fail `git add`
// loudly instead of staging the loader. Every worktree of the repo shares the
// common dir, so --remove keeps the rule while any worktree still has a loader.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasLoader } from './loader-strip.js';

const FILTER = 'show-and-tell';
// The filter's name before the tool was renamed. A project installed then still
// has a rule under it; installing or removing replaces or clears that rule too.
const FILTER_BEFORE_RENAME = 'agentation-kit';
const STRIP_SRC = resolve(fileURLToPath(new URL('./loader-strip.js', import.meta.url)));
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const shq = (s) => `"${String(s).replace(/(["\\$`])/g, '\\$1')}"`;

/**
 * A gitattributes pattern for exactly one path. Glob characters are escaped;
 * a path with spaces (or quotes) is C-quoted, which git reads as one pattern.
 */
export function attrPattern(rel) {
  const globbed = '/' + rel.replace(/([*?[\]!\\])/g, '\\$1');
  if (!/[\s"]/.test(globbed)) return globbed;
  return '"' + globbed.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function where(file) {
  // Real paths on both sides: git reports the toplevel resolved (/private/var/…
  // on macOS), so a symlinked path (/var/…) would make a "../../…" pattern that
  // matches nothing, and the filter would silently not apply.
  const real = realpathSync(resolve(file));
  const dir = dirname(real);
  const top = realpathSync(git(dir, 'rev-parse', '--show-toplevel'));
  const common = resolve(dir, git(dir, 'rev-parse', '--git-common-dir'));
  const rel = relative(top, real).split('\\').join('/');
  if (rel.startsWith('..')) throw new Error(`${file} is outside the repo at ${top}`);
  return { dir, common, rel, attrs: join(common, 'info', 'attributes'), line: `${attrPattern(rel)} filter=${FILTER}`, oldLine: `${attrPattern(rel)} filter=${FILTER_BEFORE_RENAME}` };
}

/** The stripper as one file with no imports, written into the git dir. */
function writeHelper(common) {
  const lib = readFileSync(STRIP_SRC, 'utf8').replace(/^export /gm, '');
  const main = `
const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const buf = Buffer.concat(chunks);
let out = buf;
if (hasLoader(buf.toString('latin1'))) { try { out = Buffer.from(stripLoader(buf.toString('latin1')), 'latin1'); } catch { out = buf; } }
process.stdout.write(out);
`;
  const path = join(common, 'show-and-tell-strip.mjs');
  writeFileSync(path, `// Written by Show and tell (show-and-tell install): the git clean filter that keeps the\n// review loader out of commits. Safe to delete with \`show-and-tell install <file> --remove\`.\n${lib}\n${main}`);
  return path;
}

/** Register the filter for `file`. Returns true when commits will now leave the block out. */
export function addCommitFilter(file) {
  try {
    const { dir, common, attrs, line, oldLine } = where(file);
    const helper = writeHelper(common);
    git(dir, 'config', `filter.${FILTER}.clean`, `${shq(process.execPath)} --no-warnings ${shq(helper)}`);
    git(dir, 'config', `filter.${FILTER}.required`, 'true');
    let have = existsSync(attrs) ? readFileSync(attrs, 'utf8') : '';
    // One rule per path: the rule from before the rename gives way to this one.
    if (have.split('\n').includes(oldLine)) have = have.split('\n').filter((l) => l !== oldLine).join('\n');
    if (!have.split('\n').includes(line)) {
      mkdirSync(dirname(attrs), { recursive: true });
      writeFileSync(attrs, have + (have && !have.endsWith('\n') ? '\n' : '') + line + '\n');
    }
    // The file's stat changed, so status would call it modified until git
    // re-reads it; refresh the index stat cache (through the filter). Never stages.
    try { git(dir, 'update-index', '-q', '--refresh'); } catch {}
    return git(dir, 'check-attr', 'filter', '--', resolve(file)).endsWith(`filter: ${FILTER}`);
  } catch { return false; }
}

/** Worktrees of this repo (paths), from `git worktree list`. */
function worktrees(dir) {
  try { return git(dir, 'worktree', 'list', '--porcelain').split('\n').filter((l) => l.startsWith('worktree ')).map((l) => l.slice(9)); } catch { return []; }
}

/**
 * Unregister it for `file`, unless another worktree of the same repo still has
 * a loader in the same path (they share the rule).
 */
export function removeCommitFilter(file) {
  try {
    const { dir, attrs, line, oldLine, rel } = where(file);
    if (!existsSync(attrs)) return;
    const self = realpathSync(resolve(file));
    const stillUsed = worktrees(dir).some((wt) => {
      const p = join(wt, rel);
      try { return realpathSync(p) !== self && hasLoader(readFileSync(p, 'latin1')); } catch { return false; }
    });
    if (stillUsed) return;
    const have = readFileSync(attrs, 'utf8');
    const next = have.split('\n').filter((l) => l !== line && l !== oldLine).join('\n');
    if (next !== have) writeFileSync(attrs, next);
  } catch {}
}
