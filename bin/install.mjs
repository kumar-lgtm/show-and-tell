#!/usr/bin/env node
// Add (or remove) the one marked, dev-only line that loads the review toolbar.
//
//   show-and-tell install <project dir | file> [--port 55930] [--name my-app] [--storybook]
//                                                                 install / re-install
//   show-and-tell install <project dir | file> --remove          take it out again
//   show-and-tell install <project dir | file> --check           exit 1 if present
//
// A project dir installs into the app's entry file (CANDIDATES below). Storybook's
// .storybook/preview-head.html is used only with --storybook, or when there is no
// app entry. The loader URL carries the project name (--name, default: the
// package.json name) so a review server for another project refuses the page.
// A file the installer had to create is marked as such, and --remove deletes
// only those; files keep their own line endings (CRLF stays CRLF).
//
// The block is gated twice over — HTML to a localhost hostname, JSX to
// NODE_ENV=development — so a stray commit is inert in production. It is still
// scaffolding: remove it before committing.
import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve, extname, basename, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs, DEFAULT_PORT, portArg, UsageError, exitOnUsage } from './lib.mjs';
import { loaderGate, loaderUrl as loaderUrlFor } from '../server/loader-tag.js';
import { projectName, projectRoot } from '../server/project-name.js';
import { START, END, stripLoader, hasLoader } from '../server/loader-strip.js';
import { addCommitFilter, removeCommitFilter } from '../server/git-filter.js';
import { serverOn } from '../server/registry.js';

const USAGE = `usage: show-and-tell install <project dir | file> [--port ${DEFAULT_PORT}] [--name my-app] [--storybook]
       show-and-tell install <project dir | file> --remove   take the loader out again
       show-and-tell install <project dir | file> --check    exit 1 if it is present`;
if (process.argv.slice(2).some((a) => a === '--help' || a === '-h')) { console.log(USAGE); process.exit(0); }
let args, port;
try {
  args = parseArgs(process.argv.slice(2), { boolean: ['remove', 'check', 'storybook'] });
  port = portArg(args.port, DEFAULT_PORT);
} catch (e) { exitOnUsage(e); }
const target = resolve(args._[0] || '.');
// In the START comment of a file the installer created: --remove deletes the file instead of leaving it empty.
const CREATED = 'show-and-tell:created-file';
const CREATED_BEFORE_RENAME = 'agentation-kit:created-file';

// First match wins. JSX targets insert before </body>; HTML targets before </head>.
const CANDIDATES = [
  'app/layout.tsx', 'app/layout.jsx', 'app/layout.js', 'src/app/layout.tsx', 'src/app/layout.jsx', 'src/app/layout.js',
  'pages/_document.tsx', 'pages/_document.jsx', 'pages/_document.js', 'src/pages/_document.tsx', 'src/pages/_document.jsx', 'src/pages/_document.js',
  'index.html', 'public/index.html', 'src/app.html', 'default.hbs',
  'src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro', 'src/layouts/Base.astro',
];

// Storybook: the stories render in the preview iframe, whose <head> is .storybook/preview-head.html
// (created if missing). The toolbar there needs the sidecar started with --framed --route-key id.
const STORYBOOK_MAIN = ['main.js', 'main.ts', 'main.mjs', 'main.cjs'];
const notes = [];
let created = false;
function findFile(p) {
  if (!existsSync(p)) throw new UsageError(`${p} does not exist`);
  if (statSync(p).isFile()) return p;
  const hasStorybook = STORYBOOK_MAIN.some((m) => existsSync(join(p, '.storybook', m)));
  const hit = CANDIDATES.map((c) => join(p, c)).find(existsSync);
  if (hasStorybook && (args.storybook || !hit)) {
    const head = join(p, '.storybook', 'preview-head.html');
    created = !existsSync(head);
    notes.push(args.storybook ? 'Storybook preview (--storybook).' : 'Storybook preview: no app entry file found.');
    return head;
  }
  if (args.storybook) throw new UsageError(`--storybook: no .storybook/main.* in ${p}`);
  if (!hit) throw new UsageError(`No known entry file in ${p}. Pass the file that renders <head>/<body> directly.\nLooked for: ${CANDIDATES.join(', ')}`);
  notes.push(`App entry file${hasStorybook ? '. This project has Storybook too: add --storybook to install into .storybook/preview-head.html instead' : ''}.`);
  return hit;
}

let file;
try { file = findFile(target); } catch (e) { exitOnUsage(e); }
const ext = extname(file);
const storybook = basename(file) === 'preview-head.html';
const jsx = ['.tsx', '.jsx', '.js', '.ts'].includes(ext);
let src = created ? '' : readFileSync(file, 'utf8');
const root = projectRoot(statSync(target).isFile() ? dirname(target) : target);
const name = projectName(args.name, root);

const strip = (text) => stripLoader(text, file);

if (args.check) {
  const on = hasLoader(src);
  console.log(on ? `present in ${file}` : `not present in ${file}`);
  process.exit(on ? 1 : 0);
}

const clean = strip(src);
if (args.remove) {
  if (clean === src) { console.log(`Nothing to remove in ${file}`); process.exit(0); }
  // Delete only a file the installer created; a file that was empty before install stays (empty).
  if ((src.includes(CREATED) || src.includes(CREATED_BEFORE_RENAME)) && !clean.trim()) { unlinkSync(file); console.log(`Removed the review loader (and ${file}, which install created)`); process.exit(0); }
  writeFileSync(file, clean);
  removeCommitFilter(file);
  console.log(`Removed the review loader from ${file}`);
  process.exit(0);
}

const loaderUrl = loaderUrlFor(port, name);
const anchor = jsx ? '</body>' : '</head>';
// preview-head.html is a fragment Storybook puts into the preview's <head>: the block goes at its end.
const at = storybook ? clean.length : clean.lastIndexOf(anchor);
if (at < 0) { console.error(`${file}: no ${anchor} to insert before. Pass the file that renders it.`); process.exit(2); }
const lineStart = clean.lastIndexOf('\n', at) + 1;
const indent = clean.slice(lineStart, at).match(/^\s*/)[0];
const inner = indent + '  ';

// The gated snippet (localhost only, offline pill, Storybook test skip): server/loader-tag.js.
const gate = loaderGate({ port, storybook, name });
const made = created ? ` · ${CREATED}` : '';
const astro = ext === '.astro' ? ' is:inline' : '';
const lines = jsx
  ? [
      `${inner}{/* ${START} — local review toolbar; remove before committing${made} */}`,
      // Inline, not <script src>: a server-component layout can't pass onError,
      // and this is the same gated snippet (offline pill included) as HTML.
      `${inner}{process.env.NODE_ENV === "development" && <script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(gate)} }} />}`,
      `${inner}{/* ${END} */}`,
    ]
  : [
      `${inner}<!-- ${START} — local review toolbar; remove before committing${made} -->`,
      `${inner}<script${astro}>${gate}</script>`,
      `${inner}<!-- ${END} -->`,
    ];

// Own lines when the anchor leads its line; inline when it doesn't
// (`<head>…</head>` on one line) — either way --remove restores the exact bytes.
const leads = at === lineStart + indent.length;
// The file's own line endings: a CRLF file gets a CRLF block.
const eol = clean.includes('\r\n') ? '\r\n' : '\n';
const next = leads
  ? clean.slice(0, lineStart) + lines.join(eol) + eol + clean.slice(lineStart)
  : clean.slice(0, at) + lines.map((l) => l.trim()).join('') + clean.slice(at);
// Guard: the only change is our block.
if (strip(next) !== clean) throw new Error('Unexpected mutation — aborting without writing');
writeFileSync(file, next);

let tracked = false;
try { execFileSync('git', ['-C', resolve(file, '..'), 'ls-files', '--error-unmatch', basename(file)], { stdio: 'ignore' }); tracked = true; } catch {}
console.log(JSON.stringify({ file, why: notes.join(' ') || 'the file you passed', name, mode: jsx ? 'jsx (NODE_ENV=development)' : 'html (localhost only)', loader: loaderUrl, tracked, ...(created ? { created: true } : {}) }, null, 2));
const filtered = tracked && addCommitFilter(file);
if (filtered) console.log(`${basename(file)} is tracked by git: commits leave the loader out (a local clean filter strips it when staged; nothing to undo before committing). --remove takes it out of the file.`);
else if (tracked) console.log(`⚠ ${basename(file)} is tracked by git — run with --remove before committing.`);
if (!args.name) console.log(`Project name "${name}" (from ${root}). Pass --name to choose another; serve and feedback must use the same one.`);
const running = serverOn(port);
if (running && running.name !== name) console.log(`⚠ The review server on port ${port} is "${running.name}", not "${name}": it will refuse this page. Use --name ${running.name}, or start a server for "${name}" on a free --port.`);
else if (running) console.log(`Review server for "${name}" is already running on ${port}.`);
if (storybook) console.log(`Storybook: start the server with --framed --route-key id (stories share /iframe.html; ?id= names the story).`);
console.log(`Start the review server for this page with: show-and-tell serve --name ${name}${port !== DEFAULT_PORT ? ` --port ${port}` : ''} --origin <your dev server's origin>`);
