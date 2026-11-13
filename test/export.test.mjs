// `feedback <name> export`: markdown and JSON to stdout, and the GitHub paths
// against a fake `gh` on PATH that records its arguments and stdin. The real
// GitHub is never called.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, chmodSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { seedEdit, seedNote, tree, cli, cleanup, uniqueName } from './_seed.mjs';
import { diffLines } from '../server/export.js';

const NAME = uniqueName('export');
const FAKE = mkdtempSync(join(tmpdir(), 'agk-gh-'));
const LOG = join(FAKE, 'calls.jsonl');
let dir, edit, note, pricing;

// Line 3 of src/Hero.tsx is in the PR's diff; src/Footer.tsx is not.
const PR_FILES = [
  { filename: 'src/Hero.tsx', patch: '@@ -1,3 +1,4 @@\n export function Hero() {\n-  return <h1>Old</h1>;\n+  return (\n+    <h1>Pricing for everyone</h1>\n   );' },
  { filename: 'src/Other.ts', patch: '@@ -10,2 +10,2 @@\n-a\n+b\n c' },
];

before(async () => {
  writeFileSync(join(FAKE, 'gh'), `#!/usr/bin/env node
const fs = require('fs');
let input = ''; try { input = fs.readFileSync(0, 'utf8'); } catch {}
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(LOG)}, JSON.stringify({ args, input, cwd: process.cwd() }) + '\\n');
const path = args.find((a) => a.startsWith('repos/')) || '';
if (args[0] === 'issue') console.log('https://github.com/acme/site/issues/42');
else if (path.endsWith('/files')) for (const f of ${JSON.stringify(PR_FILES)}) console.log(JSON.stringify(f));
else if (path.endsWith('/reviews')) console.log(JSON.stringify({ id: 1, html_url: 'https://github.com/acme/site/pull/7#pullrequestreview-1' }));
`);
  chmodSync(join(FAKE, 'gh'), 0o755);
  dir = tree({
    'src/Hero.tsx': 'export function Hero() {\n  return (\n    <h1>Pricing for everyone</h1>\n  );\n}\n',
    'src/Footer.tsx': '<footer>Made with care in Toronto</footer>\n',
  });
  edit = await seedEdit(NAME, { from: 'Pricing for everyone', to: 'Pricing for every team', path: '/pricing' });
  note = await seedNote(NAME, { comment: 'Footer feels cramped.\nCan it breathe? cc @octocat', selectedText: 'Made with care in Toronto', path: '/' });
  pricing = await seedNote(NAME, { comment: 'Is this the annual price?', path: '/pricing', elementPath: 'main > .price' });
  assert.equal(cli(['feedback', NAME, 'reply', pricing.id, 'Monthly', 'or', 'annual?']).code, 0);
});
after(() => cleanup(dir, FAKE));

const gh = (args) => cli(['feedback', NAME, 'export', '--src', dir, ...args], { env: { PATH: FAKE + delimiter + process.env.PATH } });
const calls = () => (existsSync(LOG) ? readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const resetCalls = () => rmSync(LOG, { force: true });

test('markdown: grouped by page with viewport, pointers, words, FROM/TO and Q&A', () => {
  const { code, out, err } = cli(['feedback', NAME, 'export', '--src', dir]);
  assert.equal(code, 0, err);
  assert.match(out, /^# Review feedback: export-/);
  assert.match(out, /3 open note\(s\) on 2 page\(s\)/);
  const home = out.indexOf('## `/`'), pricingAt = out.indexOf('## `/pricing`');
  assert.ok(home > 0 && pricingAt > home, 'pages are sections');
  assert.match(out, new RegExp(`### Text edit · \`${edit.id}\``));
  assert.match(out, /- \*\*Viewport:\*\* mobile · 390×844/);
  assert.match(out, /- \*\*Source:\*\* `src\/Hero.tsx:3`/);
  assert.match(out, /\*\*FROM\*\*\n```text\nPricing for everyone\n```\n\n\*\*TO\*\*\n```text\nPricing for every team\n```/);
  // Plain markdown gets pasted into GitHub too: @handles are inert there as well.
  assert.match(out, /> Footer feels cramped\.\n> Can it breathe\? cc @\u200doctocat/);
  assert.doesNotMatch(out, /cc @octocat/);
  assert.match(out, /- \*\*Source:\*\* `src\/Footer.tsx:1`/);
  assert.match(out, /\*\*Q&A\*\*\n- \*\*Agent:\*\* Monthly or annual\?/);
  assert.equal(calls().length, 0);
});

test('json: every note with its pointers and locations', () => {
  const { code, out } = cli(['feedback', NAME, 'export', '--format', 'json', '--src', dir]);
  assert.equal(code, 0);
  const doc = JSON.parse(out);
  assert.equal(doc.project, NAME);
  assert.equal(doc.notes.length, 3);
  const e = doc.notes.find((n) => n.id === edit.id);
  assert.deepEqual(e.edit, { id: e.edit.id, from: 'Pricing for everyone', to: 'Pricing for every team' });
  assert.deepEqual(e.locations, [{ file: 'src/Hero.tsx', line: 3 }]);
  assert.deepEqual(e.pointers, [{ label: 'find', text: 'src/Hero.tsx:3' }]);
  assert.equal(e.pagePath, '/pricing');
  assert.match(doc.notes.find((n) => n.id === note.id).comment, /cc @octocat/); // JSON stays raw
  assert.equal(cli(['feedback', NAME, 'export', '--format', 'xml']).code, 1);
});

test('--github without --yes prints the command and body, and never runs gh', () => {
  resetCalls();
  const { code, out } = gh(['--github', '--repo', 'acme/site', '--label', 'review']);
  assert.equal(code, 0);
  assert.match(out, /^Dry run: would run `gh issue create --title 'Review feedback: export-[^']+ \(3 notes\)' --body-file - --repo acme\/site --label review`/);
  assert.match(out, /## `\/pricing`/);
  assert.equal(calls().length, 0);
});

test('--github --yes creates one issue with the markdown body; @mentions are made inert', () => {
  resetCalls();
  const { code, out, err } = gh(['--github', '--yes', '--repo', 'acme/site', '--label', 'review,copy']);
  assert.equal(code, 0, err);
  assert.match(out, /Created https:\/\/github.com\/acme\/site\/issues\/42/);
  const [c] = calls();
  assert.equal(calls().length, 1);
  assert.deepEqual(c.args.slice(0, 3), ['issue', 'create', '--title']);
  assert.deepEqual(c.args.slice(4), ['--body-file', '-', '--repo', 'acme/site', '--label', 'review', '--label', 'copy']);
  assert.match(c.input, /\*\*FROM\*\*\n```text\nPricing for everyone/);
  assert.match(c.input, /cc @‍octocat/);
  assert.doesNotMatch(c.input, /cc @octocat/);
});

test('--pr without --yes reads the PR files only and prints the review it would post', () => {
  resetCalls();
  const { code, out, err } = gh(['--pr', '7', '--repo', 'acme/site']);
  assert.equal(code, 0, err);
  assert.match(out, /Dry run: would post one review on PR #7 \(acme\/site\) with 1 line comment\(s\) and 2 note\(s\) in the body/);
  assert.match(out, /\n {2}src\/Hero.tsx:3\n/);
  assert.deepEqual(calls().map((c) => c.args[c.args.indexOf('--paginate') + 1]), ['repos/acme/site/pulls/7/files']);
});

test('--pr --yes posts one review: line comments in the diff, the rest in the body', () => {
  resetCalls();
  const { code, out, err } = gh(['--pr', '7', '--repo', 'acme/site', '--yes', '--label', 'review']);
  assert.equal(code, 0, err);
  assert.match(out, /Posted a review on PR #7 with 1 line comment\(s\): https:\/\/github.com\/acme\/site\/pull\/7#pullrequestreview-1/);
  const all = calls();
  const post = all.find((c) => c.args.includes('repos/acme/site/pulls/7/reviews'));
  assert.deepEqual(post.args, ['api', '--method', 'POST', 'repos/acme/site/pulls/7/reviews', '--input', '-']);
  const review = JSON.parse(post.input);
  assert.equal(review.event, 'COMMENT');
  assert.equal(review.comments.length, 1);
  assert.deepEqual({ path: review.comments[0].path, line: review.comments[0].line, side: review.comments[0].side }, { path: 'src/Hero.tsx', line: 3, side: 'RIGHT' });
  assert.match(review.comments[0].body, /Pricing for every team/);
  assert.match(review.body, /Footer feels cramped/);
  assert.match(review.body, /Is this the annual price\?/);
  assert.doesNotMatch(review.body, /Pricing for every team/);
  assert.deepEqual(all.at(-1).args, ['pr', 'edit', '7', '--repo', 'acme/site', '--add-label', 'review']);
});

test('diffLines: right-side lines that are added or context', () => {
  assert.deepEqual([...diffLines(PR_FILES[0].patch)], [1, 2, 3, 4]);
  assert.deepEqual([...diffLines('@@ -10,3 +20,2 @@\n-gone\n kept\n+new\n\\ No newline at end of file')], [20, 21]);
});
