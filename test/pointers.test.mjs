// Source pointers for comment notes: the text Agentation records is searched in
// the source, with its sibling context (`[before: …]`, `[after: …]`) stripped.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { seedNote, tree, cli, cleanup, uniqueName } from './_seed.mjs';
import { searchTexts } from '../server/agent.js';

const dirs = [];
after(() => cleanup(...dirs));

test('searchTexts: selection, then the element label, then nearbyText without sibling context', () => {
  assert.deepEqual(searchTexts({ nearbyText: 'Get started [after: "Edit src/App.jsx and save"]', element: 'h1 "Get started"' }), ['Get started']);
  assert.deepEqual(searchTexts({ nearbyText: '[before: "Vite + React"] count is 0 [after: "Edit src/App.jsx"]', element: 'button "count is 0"', selectedText: 'count' }),
    ['count', 'count is 0']);
  assert.deepEqual(searchTexts({ nearbyText: '[before: "a "quoted" bit"] Our story', element: 'section' }), ['Our story']);
  assert.deepEqual(searchTexts({ element: 'link "Read the long version of th..."' }), ['Read the long version of th']);
});

test('a comment on a heading lists find: file:line from the element text', async () => {
  const name = uniqueName('ptr');
  const dir = tree({
    'src/App.jsx': 'export default function App() {\n  return (\n    <>\n      <h1>Get started</h1>\n      <p>Edit <code>src/App.jsx</code> and save</p>\n    </>\n  );\n}\n',
  });
  dirs.push(dir);
  await seedNote(name, { comment: 'Bigger, please', element: 'h1 "Get started"', elementPath: 'main > h1', nearbyText: 'Get started [after: "Edit src/App.jsx and save"]' });
  await seedNote(name, { comment: 'Hmm', element: 'section', elementPath: 'main > section', nearbyText: '[before: "x"] Get started [after: "y"]' });
  const r = cli(['feedback', name, 'list', '--src', dir]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out.match(/find: src\/App\.jsx:4/g)?.length, 2, r.out);
});
