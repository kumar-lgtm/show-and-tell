// `feedback <name> apply`: text edits written into a temp source tree, only
// when the old text is there exactly once. Notes are seeded through the real
// toolbar API in the shape toolbar/edit-mode.js commits.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, symlinkSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seedEdit, seedNote, readNote, tree, cli, cleanup, uniqueName } from './_seed.mjs';

const dirs = [];
after(() => cleanup(...dirs));
const src = (files) => { const d = tree(files); dirs.push(d); return d; };
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf8');

const HERO = `export function Hero() {
  return (
    <section>
      <h1>Pricing for everyone</h1>
      <p>
        Start free and upgrade
        when your team grows.
      </p>
    </section>
  );
}
`;

test('dry run prints a diff, writes nothing, leaves the note open', async () => {
  const name = uniqueName('dry');
  const dir = src({ 'src/Hero.tsx': HERO });
  const note = await seedEdit(name, { from: 'Pricing for everyone', to: 'Pricing for every team' });
  const r = cli(['feedback', name, 'apply', '--src', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /Dry run/);
  assert.match(r.out, new RegExp(`\\[${note.id}\\] src/Hero.tsx:4`));
  assert.match(r.out, /--- a\/src\/Hero.tsx\n\+\+\+ b\/src\/Hero.tsx\n@@ -2,5 \+2,5 @@/);
  assert.match(r.out, /\n-      <h1>Pricing for everyone<\/h1>\n\+      <h1>Pricing for every team<\/h1>\n/);
  assert.equal(read(dir, 'src/Hero.tsx'), HERO);
  assert.equal((await readNote(name, note.id)).status, 'pending');
});

test('--yes writes the change and resolves the note with file:line', async () => {
  const name = uniqueName('yes');
  const dir = src({ 'src/Hero.tsx': HERO, 'README.md': '# Demo\n' });
  const a = await seedEdit(name, { from: 'Pricing for everyone', to: 'Pricing for every team' });
  // Rendered text is collapsed onto one line; the source wraps it. Only the changed word moves.
  const b = await seedEdit(name, { from: 'Start free and upgrade when your team grows.', to: 'Start free and upgrade when you grow.', element: 'p' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /2 applied, 0 already in source, 0 skipped/);
  assert.equal(read(dir, 'src/Hero.tsx'), HERO.replace('for everyone', 'for every team').replace('when your team grows.', 'when you grow.'));
  const na = await readNote(name, a.id), nb = await readNote(name, b.id);
  assert.equal(na.status, 'resolved');
  assert.equal(na.resolution, 'Applied: src/Hero.tsx:4');
  assert.equal(nb.resolution, 'Applied: src/Hero.tsx:6');
  // Nothing left to do on a second run.
  assert.match(cli(['feedback', name, 'apply', '--src', dir]).out, /No open text edits/);
});

test('an id before or after --yes applies only that note', async () => {
  const name = uniqueName('ids');
  const dir = src({ 'a.html': '<h1>First headline here</h1>\n<p>Second paragraph text</p>\n' });
  const a = await seedEdit(name, { from: 'First headline here', to: 'First headline there' });
  const b = await seedEdit(name, { from: 'Second paragraph text', to: 'Second paragraph copy' });
  assert.equal(cli(['feedback', name, 'apply', '--yes', a.id, '--src', dir]).code, 0);
  assert.equal(read(dir, 'a.html'), '<h1>First headline there</h1>\n<p>Second paragraph text</p>\n');
  assert.equal((await readNote(name, b.id)).status, 'pending');
  const r = cli(['feedback', name, 'apply', 'nope', '--src', dir]);
  assert.match(r.out, /\[nope\]: no note nope/);
});

test('ambiguous: found twice → skipped, nothing written even with --yes', async () => {
  const name = uniqueName('amb');
  const files = { 'src/A.tsx': '<button>Get started</button>\n', 'src/B.tsx': 'const label = "Get started";\n' };
  const dir = src(files);
  const note = await seedEdit(name, { from: 'Get started', to: 'Start now' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /found 2 times \(src\/A.tsx:1, src\/B.tsx:1\)/);
  assert.equal(read(dir, 'src/A.tsx'), files['src/A.tsx']);
  assert.equal(read(dir, 'src/B.tsx'), files['src/B.tsx']);
  assert.equal((await readNote(name, note.id)).status, 'pending');
});

test('dependencies, build output, lockfiles, minified files and links out of --src are not searched', async () => {
  const name = uniqueName('ign');
  const outside = mkdtempSync(join(tmpdir(), 'agk-outside-')); dirs.push(outside);
  writeFileSync(join(outside, 'secret.txt'), 'Join the waitlist today\n');
  const dir = src({
    'src/App.jsx': '<a>Join the waitlist today</a>\n',
    'node_modules/pkg/index.js': '"Join the waitlist today"\n',
    'dist/app.js': '"Join the waitlist today"\n',
    'build/index.html': 'Join the waitlist today\n',
    'pnpm-lock.yaml': '# Join the waitlist today\n',
    'public/vendor.min.js': '"Join the waitlist today"\n',
  });
  symlinkSync(outside, join(dir, 'linked'));
  await seedEdit(name, { from: 'Join the waitlist today', to: 'Join the waitlist now' });
  // Without ripgrep on PATH, the fallback walker applies the same rules.
  const noRg = cli(['feedback', name, 'apply', '--src', dir], { env: { PATH: '/nonexistent' } });
  assert.match(noRg.out, /1 to apply/, noRg.out + noRg.err);
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /1 applied/, r.out);
  assert.equal(read(dir, 'src/App.jsx'), '<a>Join the waitlist now</a>\n');
  assert.equal(read(dir, 'node_modules/pkg/index.js'), '"Join the waitlist today"\n');
  assert.equal(readFileSync(join(outside, 'secret.txt'), 'utf8'), 'Join the waitlist today\n');
});

test('not found, split across markup, entities differ: skipped with the reason', async () => {
  const name = uniqueName('miss');
  const dir = src({
    'index.html': '<p>Hello <strong>brave</strong> new world</p>\n<p>Terms &amp; conditions apply</p>\n',
    'src/Greet.jsx': 'export const G = ({ name }) => <h2>Welcome back, {name}!</h2>;\n',
  });
  const missing = await seedEdit(name, { from: 'This copy is nowhere', to: 'Anything' });
  const split = await seedEdit(name, { from: 'Hello brave new world', to: 'Hello world' });
  const ent = await seedEdit(name, { from: 'Terms & conditions apply', to: 'Terms apply' });
  const jsx = await seedEdit(name, { from: 'Welcome back, Ana!', to: 'Hi, Ana!' });
  const before = read(dir, 'index.html');
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, new RegExp(`\\[${missing.id}\\] "This copy is nowhere": not found in the source`));
  assert.match(r.out, new RegExp(`\\[${split.id}\\] "Hello brave new world": looks split across JSX/markup \\(index.html:1\\)`));
  assert.match(r.out, new RegExp(`\\[${ent.id}\\] "Terms & conditions apply": HTML entities differ .*index.html:2`));
  assert.match(r.out, new RegExp(`\\[${jsx.id}\\] "Welcome back, Ana!": not found`)); // {name} rendered as data
  assert.match(r.out, /0 applied, 0 already in source, 4 skipped/);
  assert.equal(read(dir, 'index.html'), before);
});

test('new text already in source: resolved without writing', async () => {
  const name = uniqueName('already');
  const files = { 'src/Cta.tsx': '<p>Ship your first project this week</p>\n', 'src/Grow.tsx': '<p>Buy now today</p>\n' };
  const dir = src(files);
  const a = await seedEdit(name, { from: 'Ship your first project', to: 'Ship your first project this week' });
  // FROM still matches, but only inside the new text: the edit is already there.
  const b = await seedEdit(name, { from: 'Buy now', to: 'Buy now today' });
  const dry = cli(['feedback', name, 'apply', '--src', dir]);
  assert.match(dry.out, /Already in source \(--yes resolves these without writing\)/);
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /0 applied, 2 already in source/);
  assert.equal(read(dir, 'src/Cta.tsx'), files['src/Cta.tsx']);
  assert.equal(read(dir, 'src/Grow.tsx'), files['src/Grow.tsx']);
  assert.equal((await readNote(name, a.id)).resolution, 'Already in source: src/Cta.tsx:1');
  assert.equal((await readNote(name, b.id)).resolution, 'Already in source: src/Grow.tsx:1');
});

test('a short new text found elsewhere is not taken as proof', async () => {
  const name = uniqueName('short');
  const dir = src({ 'a.html': '<button>Go</button>\n' });
  const note = await seedEdit(name, { from: 'Continue', to: 'Go' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /too short to be sure/);
  assert.equal((await readNote(name, note.id)).status, 'pending');
});

test('regex and replacement special characters are literal', async () => {
  const name = uniqueName('special');
  const line = 'const price = "Only $9.99 (save 50%)* [today] + more? $& $1";\n';
  const dir = src({ 'src/price.js': line, 'src/other.js': 'const x = "Only $9X99 (save 50%)* [today] + more? $& $1";\n' });
  const note = await seedEdit(name, { from: 'Only $9.99 (save 50%)* [today] + more? $& $1', to: 'Only $4.99 (save 75%)* [today] + more? $& $2' });
  // So many symbols read as code to the scanner: held back until a person says yes.
  assert.match(cli(['feedback', name, 'apply', '--yes', '--src', dir]).out, /held: it changes/);
  const r = cli(['feedback', name, 'apply', '--yes', '--include-code', note.id, '--src', dir]);
  assert.match(r.out, /1 applied/, r.out);
  assert.match(r.out, /WARNING: changes a string that looks like code/);
  assert.equal(read(dir, 'src/price.js'), 'const price = "Only $4.99 (save 75%)* [today] + more? $& $2";\n');
  assert.equal(read(dir, 'src/other.js'), 'const x = "Only $9X99 (save 50%)* [today] + more? $& $1";\n');
});

test('CRLF files keep their line endings, and a word is not matched inside a longer one', async () => {
  const name = uniqueName('crlf');
  const crlf = '<section>\r\n  <p>\r\n    Fast, private\r\n    and local.\r\n  </p>\r\n  <button onSave="x">Saved</button>\r\n</section>\r\n';
  const dir = src({ 'page.html': crlf });
  await seedEdit(name, { from: 'Fast, private and local.', to: 'Fast, private and yours.' });
  await seedEdit(name, { from: 'Save', to: 'Keep' }); // only "onSave"/"Saved" exist
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /1 applied, 0 already in source, 1 skipped/, r.out);
  const out = read(dir, 'page.html');
  assert.equal(out, crlf.replace('and local.', 'and yours.'));
  assert.equal(out.split('\n').length, out.split('\r\n').length);
});

test('new text that would break markup or the enclosing string is left to a person', async () => {
  const name = uniqueName('unsafe');
  const files = { 'src/Nav.tsx': '<a>Read the docs</a>\n', 'src/copy.js': "export const save = 'Save changes';\n" };
  const dir = src(files);
  await seedEdit(name, { from: 'Read the docs', to: 'Read the {docs}' });
  await seedEdit(name, { from: 'Save changes', to: "Don't lose changes" });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /new text has <, >, \{ or \}, which \.tsx reads as markup/);
  assert.match(r.out, /sits in a '…' string and the new text contains '/);
  assert.equal(read(dir, 'src/Nav.tsx'), files['src/Nav.tsx']);
  assert.equal(read(dir, 'src/copy.js'), files['src/copy.js']);
});

test('only open text edits are candidates', async () => {
  const name = uniqueName('kinds');
  const dir = src({ 'a.txt': 'Pricing for everyone\n' });
  const comment = await seedNote(name, { comment: 'Make this bigger', selectedText: 'Pricing for everyone' });
  assert.match(cli(['feedback', name, 'apply', '--src', dir]).out, /No open text edits/);
  assert.match(cli(['feedback', name, 'apply', comment.id, '--src', dir]).out, /not a text edit/);
});

test('JSX in plain .js/.ts files is markup: <, >, { or } in new text is left to a person', async () => {
  const name = uniqueName('jsxjs');
  const files = {
    'src/Price.js': 'export const Price = () => <p>Prices shown monthly</p>;\n',
    'src/Promo.ts': 'export const promo = "Limited offer today";\n',
  };
  const dir = src(files);
  await seedEdit(name, { from: 'Prices shown monthly', to: 'Prices shown in {currency} monthly' });
  await seedEdit(name, { from: 'Limited offer today', to: 'Limited <b>offer</b> today' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, /\.js reads as markup/, r.out);
  assert.match(r.out, /\.ts reads as markup/, r.out);
  assert.match(r.out, /0 applied, 0 already in source, 2 skipped/, r.out);
  assert.equal(read(dir, 'src/Price.js'), files['src/Price.js']);
  assert.equal(read(dir, 'src/Promo.ts'), files['src/Promo.ts']);
});

test('a quote added inside a partly matched string literal is left to a person; in JSX text it applies', async () => {
  const name = uniqueName('partq');
  const files = {
    'src/copy.js': "export const tagline = 'Fresh coffee, roasted daily for our friends';\n",
    'src/Hero.jsx': 'export const Hero = () => <p>Small batches, brewed slowly for our neighbours</p>;\n',
    'src/tpl.ts': 'export const t = `Hello there, welcome to the shop`;\n',
  };
  const dir = src(files);
  const str = await seedEdit(name, { from: 'roasted daily for our friends', to: "roasted daily for Bob's friends" });
  const jsx = await seedEdit(name, { from: 'brewed slowly for our neighbours', to: "brewed slowly for Ana's neighbours" });
  const tpl = await seedEdit(name, { from: 'welcome to the shop', to: 'welcome to the `shop`' });
  const r = cli(['feedback', name, 'apply', '--yes', '--src', dir]);
  assert.match(r.out, new RegExp(`\\[${str.id}\\] .*adds ', which could end the string`), r.out);
  assert.match(r.out, new RegExp(`\\[${tpl.id}\\] .*adds \`, which could end the string`), r.out);
  assert.match(r.out, /1 applied, 0 already in source, 2 skipped/, r.out);
  assert.equal(read(dir, 'src/copy.js'), files['src/copy.js']);
  assert.equal(read(dir, 'src/tpl.ts'), files['src/tpl.ts']);
  assert.equal(read(dir, 'src/Hero.jsx'), files['src/Hero.jsx'].replace('for our neighbours', "for Ana's neighbours"));
  assert.equal((await readNote(name, jsx.id)).status, 'resolved');
  assert.equal((await readNote(name, str.id)).status, 'pending');
});
