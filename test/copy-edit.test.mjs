// Copy edit mode, steps 3–4: an edit made in the copy view is written into the
// exact span it came from (server/copy-edit.js), through `feedback apply`.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
// _seed first: it points the store at a temp folder before any server module reads it.
import { tree, cli, cleanup, uniqueName, seedCopy, seedEdit, readNote } from './_seed.mjs';
import { planUnitEdit, applySplices, displayText, relativeParts, relocate } from '../server/copy-edit.js';
import { scanFile, extractCopy } from '../server/copy-map.js';

const dirs = [];
after(() => cleanup(...dirs));
const src = (files) => { const d = tree(files); dirs.push(d); return d; };
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf8');

/** Edit one unit's display text and return the unit's new raw source (or the error). */
const edit = (unit, to) => {
  const u = { ...unit, parts: unit.parts ? relativeParts(unit) : undefined };
  const r = planUnitEdit(u, to);
  return r.error ? `ERROR: ${r.error}` : applySplices(u.raw, 0, r.splices);
};
const unitOf = (rel, text, display) => {
  const u = scanFile(rel, text).find((x) => (x.display ?? displayText({ ...x, parts: x.parts && relativeParts(x) })) === display);
  assert.ok(u, `no unit "${display}" in ${rel}`);
  return u;
};

test('JS strings: escapes outside the change stay as written; quotes and newlines are escaped', () => {
  const js = "const a = 'Don\\'t stop \\u2014 ever.';\nconst b = \"Say \\\"hi\\\"\";\n";
  const a = unitOf('a.js', js, 'Don\'t stop — ever.');
  assert.equal(edit(a, 'Don\'t stop — never.'), "Don\\'t stop \\u2014 never.");
  assert.equal(edit(a, 'It\'s fine — ever.'), "It\\'s fine \\u2014 ever.");
  assert.equal(edit(a, 'Two\nlines — ever.'), 'Two\\nlines \\u2014 ever.');
  assert.equal(edit(a, 'Back\\slash — ever.'), 'Back\\\\slash \\u2014 ever.');
  const b = unitOf('a.js', js, 'Say "hi"');
  assert.equal(edit(b, 'Say "hello"'), 'Say \\"hello\\"');
});

test('templates: ${…} is locked; backticks and ${ in new text are escaped', () => {
  const js = 'el.textContent = `Reading ${count} records about ${name || \'you\'}…`;\n';
  const t = unitOf('a.js', js, "Reading ${count} records about ${name || 'you'}…");
  assert.equal(edit(t, "Scanning ${count} files about ${name || 'you'}…"), "Scanning ${count} files about ${name || 'you'}…");
  // `${` typed as text (not one of the locked parts) is escaped, so it stays text.
  assert.equal(edit(t, "Reading ${count} records about ${name || 'you'}, costs $5 ${'{'}…"), "Reading ${count} records about ${name || 'you'}, costs $5 \\${'{'}…");
  assert.equal(edit(t, "Reading ${count} `records` about ${name || 'you'}…"), "Reading ${count} \\`records\\` about ${name || 'you'}…");
  assert.match(edit(t, "Reading ${count} records"), /^ERROR: the \$\{…\} parts must stay/);
  assert.match(edit(t, "Reading ${name || 'you'} records about ${count}…"), /^ERROR/);
});

test('HTML: entities and line wraps outside the change survive; new markup characters are encoded', () => {
  const html = '<title>pollut.ai &mdash; Nobody,\n   Everywhere</title><p class="x">Fish &amp; chips</p><img alt="A &quot;real&quot; review">';
  const title = unitOf('i.html', html, 'pollut.ai — Nobody, Everywhere');
  assert.equal(edit(title, 'pollut.ai — Nobody, Anywhere'), 'pollut.ai &mdash; Nobody,\n   Anywhere');
  assert.equal(edit(title, 'pollut.ai — <b>Nobody</b>, Everywhere'), 'pollut.ai &mdash; &lt;b&gt;Nobody&lt;/b&gt;,\n   Everywhere');
  const fish = unitOf('i.html', html, 'Fish & chips');
  assert.equal(edit(fish, 'Fish & mushy peas'), 'Fish &amp; mushy peas');
  const alt = unitOf('i.html', html, 'A "real" review');
  assert.equal(edit(alt, 'A "fake" review'), 'A &quot;fake&quot; review');
});

test('JSX text: braces and angle brackets are encoded, whitespace layout kept', () => {
  const jsx = 'export const P = () => (\n  <p>\n    Start free and upgrade\n    when ready.\n  </p>\n);\n';
  const p = unitOf('P.jsx', jsx, 'Start free and upgrade when ready.');
  assert.equal(edit(p, 'Start {free} and upgrade when ready.'), 'Start &#123;free&#125; and upgrade\n    when ready.');
  assert.equal(edit(p, 'Start free and upgrade when you are ready.'), 'Start free and upgrade\n    when you are ready.');
});

test('markup inside a template: text between expressions keeps its spaces', () => {
  const js = 'li.innerHTML = `<span class="n">${i}</span><span class="y">b. ${e.born}</span>`;\n';
  const born = unitOf('a.js', js, 'b. ${e.born}');
  assert.equal(edit(born, 'born ${e.born}'), 'born ${e.born}');
  assert.equal(edit(born, 'b. ${e.born} (approx.)'), 'b. ${e.born} (approx.)');
  const svg = 'const F = [`<svg><text x="0" y="12">fake bios</text></svg>`];\n';
  assert.equal(edit(unitOf('a.js', svg, 'fake bios'), 'fake <bios>'), 'fake &lt;bios&gt;');
});

test('an untouched field is never a change, for every unit in a mixed fixture', () => {
  const files = {
    'a.js': "const R = [['PROFILE', 'Beloved beekeeper.'], ['WIKI', 'Don\\'t \\u2014 ask.']];\nel.textContent = `Hi ${n}, you’re \\`it\\`.`;\nli.innerHTML = `<b>b. ${x}</b> &amp; more`;\n",
    'i.html': '<p>Fish &amp; chips,\n  twice</p><img alt=\'Single "quoted"\'><meta name="description" content="A &lt;b&gt; tag">',
    'P.jsx': 'export const P = () => <p title="Hello &amp; welcome">Hey{" "}\n  there</p>;\n',
  };
  for (const [rel, text] of Object.entries(files)) {
    for (const u of scanFile(rel, text)) {
      const unit = { ...u, parts: u.parts && relativeParts(u) };
      const shown = displayText(unit);
      const r = planUnitEdit(unit, shown);
      assert.ok(!r.error, `${rel} ${u.id}: ${r.error}`);
      assert.deepEqual(r.splices, [], `${rel} ${u.id} "${shown}"`);
      // And an edit reads back as exactly the new text.
      if (!/\$\{/.test(shown) && shown.length > 1) {
        const next = `${shown} edited`;
        const plan = planUnitEdit(unit, next);
        assert.ok(!plan.error, plan.error);
        assert.equal(displayText({ ...unit, raw: applySplices(unit.raw, 0, plan.splices) }), next, `${rel} ${u.id}`);
      }
    }
  }
});

test('an unquoted attribute refuses text that would break it', () => {
  const html = '<img alt=Smoggy src=a.png>';
  const alt = unitOf('i.html', html, 'Smoggy');
  assert.equal(edit(alt, 'Smoggy2'), 'Smoggy2');
  assert.match(edit(alt, 'Smoggy waving'), /^ERROR: an unquoted attribute/);
});

test('relocate: same place, moved once, gone, or now ambiguous', () => {
  assert.deepEqual(relocate('abc Hello def', 'Hello', 4), { at: 4 });
  assert.deepEqual(relocate('xx abc Hello def', 'Hello', 4), { at: 7 });
  assert.match(relocate('abc Bye def', 'Hello', 4).error, /no longer in the file/);
  assert.match(relocate('Hello Hello', 'Hello', 40).error, /more than once/);
});

// --- feedback apply ---------------------------------------------------------

const APP = `const recordData = [
  ['PROFILE', 'Beloved beekeeper.', 'Three hives.'],
  ['FORUM', 'Allergic to cats.', 'Posting since 2011.'],
];
status.textContent = \`Reading \${count} records about \${name}…\`;
const dup = 'Beloved beekeeper.';
`;
const HTML = '<h1>BECOME<br>NO ONE.</h1>\n<p>Fish &amp; chips</p>\n<section data-line="Ask me where you live.">x</section>\n';

test('apply: copy notes are written at their exact span, even where the text repeats', async () => {
  const name = uniqueName('copy-apply');
  const dir = src({ 'app.js': APP, 'index.html': HTML });
  const map = extractCopy(dir);
  const at = (text, file) => map.units.find((u) => u.text === text && (!file || u.file === file));
  // "Beloved beekeeper." appears twice in app.js: a find-and-replace edit could not choose; a copy note can.
  const bee = await seedCopy(name, { unit: at('Beloved beekeeper.'), to: 'Award-winning beekeeper.' });
  const tpl = await seedCopy(name, { unit: at('Reading ${count} records about ${name}…'), to: 'Scanning ${count} files about ${name}…' });
  const fish = await seedCopy(name, { unit: at('Fish & chips'), to: 'Fish & peas' });
  const line = await seedCopy(name, { unit: at('Ask me where you live.'), to: 'Ask me "where" you live.' });
  const bad = await seedCopy(name, { unit: at('Reading ${count} records about ${name}…'), to: 'Scanning ${total}…' });

  const dry = cli(['feedback', name, 'apply', '--src', dir]);
  assert.equal(dry.code, 0, dry.err);
  assert.match(dry.out, /Dry run/);
  assert.match(dry.out, new RegExp(`\\[${bee.id}\\] app\\.js:2`));
  assert.match(dry.out, /-  \['PROFILE', 'Beloved beekeeper\.', 'Three hives\.'\],\n\+  \['PROFILE', 'Award-winning beekeeper\.', 'Three hives\.'\],/);
  assert.match(dry.out, new RegExp(`\\[${bad.id}\\].*the \\$\\{…\\} parts must stay`));
  assert.equal(read(dir, 'app.js'), APP);

  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  const app = read(dir, 'app.js');
  assert.match(app, /\['PROFILE', 'Award-winning beekeeper\.', 'Three hives\.'\]/);
  assert.match(app, /const dup = 'Beloved beekeeper\.';/); // the other copy is untouched
  assert.match(app, /`Scanning \$\{count\} files about \$\{name\}…`/);
  assert.equal(read(dir, 'index.html'), '<h1>BECOME<br>NO ONE.</h1>\n<p>Fish &amp; peas</p>\n<section data-line="Ask me &quot;where&quot; you live.">x</section>\n');
  for (const n of [bee, tpl, fish, line]) assert.equal((await readNote(name, n.id)).status, 'resolved', n.id);
  assert.equal((await readNote(name, bad.id)).status, 'pending');
});

test('apply: a file that moved is found again; a changed span is refused; already applied is resolved', async () => {
  const name = uniqueName('copy-drift');
  const dir = src({ 'app.js': APP });
  const map = extractCopy(dir);
  const at = (text) => map.units.find((u) => u.text === text);
  const moved = await seedCopy(name, { unit: at('Three hives.'), to: 'Four hives.' });
  const gone = await seedCopy(name, { unit: at('Allergic to cats.'), to: 'Allergic to dogs.' });
  const done = await seedCopy(name, { unit: at('Posting since 2011.'), to: 'Posting since 2012.' });
  // The file changes after the view was opened: a line above, one string rewritten, one already applied.
  writeFileSync(join(dir, 'app.js'), `// header\n${APP.replace('Allergic to cats.', 'Allergic to everything.').replace('Posting since 2011.', 'Posting since 2012.')}`);
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  assert.match(read(dir, 'app.js'), /'Four hives\.'/);
  assert.match(r.out, new RegExp(`\\[${gone.id}\\].*no longer in the file`));
  assert.equal((await readNote(name, moved.id)).status, 'resolved');
  assert.equal((await readNote(name, gone.id)).status, 'pending');
  assert.equal((await readNote(name, done.id)).status, 'resolved');
});

test('apply: copy notes and find-and-replace edits in one round; paths outside --src are refused', async () => {
  const name = uniqueName('copy-mixed');
  const dir = src({ 'app.js': APP, 'index.html': HTML });
  const map = extractCopy(dir);
  await seedCopy(name, { unit: map.units.find((u) => u.text === 'Three hives.'), to: 'Four hives.' });
  const plain = await seedEdit(name, { from: 'Posting since 2011.', to: 'Posting since forever.' });
  const outside = await seedCopy(name, { unit: { ...map.units.find((u) => u.text === 'Allergic to cats.'), file: '../escape.js' }, to: 'Nope.' });
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  assert.match(read(dir, 'app.js'), /'Four hives\.'/);
  assert.match(read(dir, 'app.js'), /'Posting since forever\.'/);
  assert.match(r.out, new RegExp(`\\[${outside.id}\\].*not a source file under --src`));
  assert.equal((await readNote(name, plain.id)).status, 'resolved');
});

test('list shows a copy note with its exact place; the store lets the view revise it', async () => {
  const name = uniqueName('copy-list');
  const dir = src({ 'app.js': APP });
  const unit = extractCopy(dir).units.find((u) => u.text === 'Three hives.');
  const note = await seedCopy(name, { unit, to: 'Four hives.' });
  const out = cli(['feedback', name, 'list', '--src', dir]).out;
  assert.match(out, /COPY — replace this text at its source/);
  assert.match(out, /at: +app\.js:2 recordData\[0\]\[2\]/);
  assert.match(out, /FROM: +Three hives\./);
  assert.match(out, /TO: +Four hives\./);
  assert.match(out, /find: +app\.js:2 \(exact span/);
  const { handle } = await import('../server/store.js');
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/annotations/${note.id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, body: JSON.stringify({ copy: { to: 'Five hives.' } }),
  }), name, `annotations/${note.id}`);
  assert.equal(res.status, 200);
  const again = await readNote(name, note.id);
  assert.equal(again.copy.to, 'Five hives.');
  assert.equal(again.copy.unit.raw, 'Three hives.');
});

// --- Fixes from the Codex review of the branch --------------------------------

test('apply encodes for the string as it is now: quotes switched since the view opened', async () => {
  const name = uniqueName('copy-quote');
  const dir = src({ 'a.js': 'const title = "Hello";\n' });
  const unit = extractCopy(dir).units.find((u) => u.text === 'Hello');
  writeFileSync(join(dir, 'a.js'), "const title = 'Hello';\n");
  await seedCopy(name, { unit, to: "It's fine" });
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  assert.equal(read(dir, 'a.js'), "const title = 'It\\'s fine';\n");
});

test('a ${…} in a markup attribute stays an expression', () => {
  const js = 'el.innerHTML = `<span title="Hello ${name}!">x</span>`;\n';
  const u = scanFile('a.js', js).find((x) => x.kind === 'markup-attr');
  assert.equal(displayText({ ...u, parts: relativeParts(u) }), 'Hello ${name}!');
  assert.equal(edit(u, 'Welcome ${name}.'), 'Welcome ${name}.');
});

test('two edits at one point where one inserts: the second is refused, not merged', async () => {
  const name = uniqueName('copy-overlap');
  const dir = src({ 'a.js': 'const title = "Hello";\n' });
  const unit = extractCopy(dir).units.find((u) => u.text === 'Hello');
  await seedCopy(name, { unit, to: 'xHello' });
  const second = await seedCopy(name, { unit, to: 'Jello' });
  const r = cli(['feedback', name, 'apply', '--src', dir, '--yes']);
  assert.equal(r.code, 0, r.err);
  assert.equal(read(dir, 'a.js'), 'const title = "xHello";\n');
  assert.match(r.out, new RegExp(`\\[${second.id}\\].*overlaps another copy edit`));
});

test('an escape or entity that decodes to an emoji is replaced whole', () => {
  const js = 'const a = "Hello \\u{1F600}";\n';
  assert.equal(edit(unitOf('a.js', js, 'Hello 😀'), 'Hello 😁'), 'Hello 😁');
  const html = '<p>Hello &#x1F600; there</p>';
  assert.equal(edit(unitOf('i.html', html, 'Hello 😀 there'), 'Hello 😁 there'), 'Hello 😁 there');
});

test('a string inside an inline <script> cannot close the script', () => {
  const html = '<p>x</p><script>const msg = "Hello world";</script>';
  const u = unitOf('i.html', html, 'Hello world');
  assert.equal(u.inScript, true);
  assert.equal(edit(u, 'Hello </script><script>alert(1)</script>'), 'Hello <\\/script><script>alert(1)<\\/script>');
});
