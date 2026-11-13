// The critique redesign's server half (show-and-tell.pen 9.1, 9.2, 9.4): a
// decision on every critique note, suggested fixes checked at annotate time,
// and what the agent reads back. No ports: the toolbar API runs in-process.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN, uniqueName, cli, cleanup } from './_seed.mjs';

const { handle } = await import('../server/store.js');
const { openProject } = await import('../server/agent.js');
const { cleanSuggestion, DECISIONS } = await import('../server/sessions.js');
const { describeAnnotation } = await import('../server/format.js');

after(() => cleanup());

async function api(name, method, rest, body) {
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: body ? JSON.stringify(body) : undefined,
  }), name, rest.split('?')[0]);
  return { status: res.status, body: await res.json() };
}
const decide = (name, id, body) => api(name, 'POST', `annotations/${id}/decision`, body);
const reviewerNotes = async (name) => (await api(name, 'GET', 'sessions')).body.sessions.flatMap((s) => s.annotations);

async function critique(name, items) {
  const p = openProject(name, { create: true });
  const r = await p.annotate(`${ORIGIN}/pricing`, items, { create: true });
  return { p, notes: r.annotations };
}

test('Fix it puts a reviewer note in the round, linked to the critique note, and closes it as decided', async () => {
  const name = uniqueName('fix');
  const { p, notes: [crit] } = await critique(name, [{ comment: 'Both plans say Start free trial', selector: '.card button', severity: 'blocking' }]);
  const r = await decide(name, crit.id, { decision: 'fix', reviewer: 'Ana', note: { x: 40, y: 320, viewport: { width: 1280, height: 800, name: 'desktop' } } });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.status, 'resolved');
  assert.equal(r.body.decision.decision, 'fix');
  assert.equal(r.body.decision.reviewer, 'Ana');
  const note = r.body.fixNote;
  assert.equal(note.author, 'reviewer');
  assert.equal(note.fromCritique, crit.id);
  assert.equal(note.comment, 'Both plans say Start free trial');
  assert.equal(note.elementPath, '.card button', 'keeps the critique note\'s target');
  assert.equal(note.reviewer, 'Ana');
  assert.equal(note.x, 40);
  assert.equal(r.body.decision.noteId, note.id);
  // It is the reviewer's note now: in what the toolbar reads, and in the agent's list.
  assert.ok((await reviewerNotes(name)).some((a) => a.id === note.id));
  const listed = p.items();
  assert.deepEqual(listed.map((a) => a.id), [note.id]);
  assert.match(p.describe(listed[0]), new RegExp(`from critique: ${crit.id}`));
  // Deciding twice is refused; undo first.
  assert.equal((await decide(name, crit.id, { decision: 'not-an-issue' })).status, 409);
});

test('Fix it my way uses the reviewer\'s words; Undo tombstones that note and reopens the critique', async () => {
  const name = uniqueName('undo');
  const { p, notes: [crit] } = await critique(name, [{ comment: 'Starter says what it costs, not who it is for', selector: '.card p' }]);
  const r = await decide(name, crit.id, { decision: 'fix', comment: 'Say it is for teams up to 10', reviewer: 'Ana' });
  assert.equal(r.body.fixNote.comment, 'Say it is for teams up to 10');
  const undone = await decide(name, crit.id, { decision: 'undo', reviewer: 'Ana' });
  assert.equal(undone.status, 200);
  assert.equal(undone.body.status, 'pending');
  assert.equal(undone.body.decision, undefined);
  assert.equal(undone.body.fixNote.status, 'dismissed', 'the note Fix it made is withdrawn, not deleted');
  assert.equal(p.items().length, 0, 'nothing left in the round');
  // Undo with nothing to undo is a no-op.
  assert.equal((await decide(name, crit.id, { decision: 'undo' })).body.status, 'pending');
  // Once the agent handled the note Fix it made, it cannot be taken back.
  const again = await decide(name, crit.id, { decision: 'fix' });
  await p.act('resolve', again.body.fixNote.id, 'Done');
  assert.equal((await decide(name, crit.id, { decision: 'undo' })).status, 409);
});

test('Not an issue keeps the reason, and the agent reads it in get_critique / list --agent and wakes on it', async () => {
  const name = uniqueName('nai');
  const { p, notes: [crit, other] } = await critique(name, [
    { comment: 'The subhead promises Change or cancel any time too early', selector: 'main > p' },
    { comment: 'FAQ in two columns', severity: 'suggestion' },
  ]);
  p.read();
  await new Promise((r) => setTimeout(r, 20));
  const waiting = p.wait({ timeout: 5, poll: 50 });
  const r = await decide(name, crit.id, { decision: 'not-an-issue', reason: 'It answers the first worry people have', reviewer: 'Ana' });
  assert.equal(r.body.status, 'dismissed');
  assert.match(r.body.resolution, /Not an issue \(Ana\): It answers the first worry/);
  const woke = await waiting;
  assert.equal(woke.reason, 'answered');
  assert.deepEqual(woke.critique.map((a) => a.id), [crit.id]);

  // Decided notes stay visible to the agent; undecided ones too.
  assert.deepEqual(p.critique().map((a) => a.id).sort(), [crit.id, other.id].sort());
  const out = cli(['feedback', name, 'list', '--agent']);
  assert.equal(out.code, 0, out.err);
  assert.match(out.out, /decision: not an issue: It answers the first worry people have · Ana/);

  // Discuss is recorded and changes nothing else.
  const d = await decide(name, other.id, { decision: 'discuss' });
  assert.equal(d.body.status, 'pending');
  assert.equal(d.body.decision.decision, 'discuss');
});

test('the decision route refuses what is not a critique note, and unknown decisions', async () => {
  const name = uniqueName('refuse');
  const { notes: [crit] } = await critique(name, [{ comment: 'x' }]);
  const fixed = await decide(name, crit.id, { decision: 'fix' });
  assert.equal((await decide(name, fixed.body.fixNote.id, { decision: 'not-an-issue' })).status, 422, 'a reviewer note is never decided from the page');
  assert.equal((await decide(name, crit.id, { decision: 'resolve' })).status, 422);
  assert.equal((await decide(name, 'ann_nope', { decision: 'fix' })).status, 404);
  assert.equal((await api(name, 'GET', `annotations/${crit.id}/decision`)).status, 405);
  assert.deepEqual(DECISIONS, ['fix', 'not-an-issue', 'discuss', 'undo']);
});

test('a suggestion accepted into drafts closes the note without making a second one', async () => {
  const name = uniqueName('draft');
  const { p, notes: [crit] } = await critique(name, [{ comment: 'Say who Starter is for', selector: '.card p', suggestion: { kind: 'text', to: 'For teams of up to 10.' } }]);
  const r = await decide(name, crit.id, { decision: 'fix', draft: 'text', reviewer: 'Ana' });
  assert.equal(r.body.status, 'resolved');
  assert.equal(r.body.decision.draft, 'text');
  assert.equal(r.body.fixNote, undefined);
  assert.equal(p.items().length, 0, 'the draft reaches the agent as an edit on Send, not as a note now');
  assert.match(describeAnnotation(r.body).rows.map((x) => x.join(': ')).join('\n'), /decision: fix it: the suggested change is in their Edit text drafts/);
});

test('suggestions are checked when written, stored, and shown to the agent', async () => {
  assert.deepEqual(cleanSuggestion(undefined), { suggestion: null });
  assert.deepEqual(cleanSuggestion({ kind: 'text', to: 'New' }).suggestion, { kind: 'text', from: null, to: 'New' });
  assert.deepEqual(cleanSuggestion({ kind: 'tweak', property: 'Min-Height', from: '39px', to: ' 44px ' }).suggestion,
    { kind: 'tweak', property: 'min-height', from: '39px', to: '44px' });
  for (const bad of [
    'text', { kind: 'diff', to: 'x' }, { kind: 'text', to: '' }, { kind: 'text', to: 'x', property: 'color' },
    { kind: 'tweak', to: '44px' }, { kind: 'tweak', property: 'color; x', to: 'red' },
    { kind: 'tweak', property: 'color', to: 'red; background: blue' }, { kind: 'tweak', property: 'background', to: 'url(https://x)' },
  ]) assert.ok(cleanSuggestion(bad).error, JSON.stringify(bad));

  const name = uniqueName('suggest');
  const p = openProject(name, { create: true });
  await assert.rejects(p.annotate(`${ORIGIN}/`, [{ comment: 'x', suggestion: { kind: 'tweak', property: 'color', to: 'url(x)' } }], { create: true }), /one CSS value/);
  const { annotations: [t, w] } = await p.annotate(`${ORIGIN}/`, [
    { comment: 'Say who it is for', selector: '.card p', suggestion: { kind: 'text', from: 'Everything a small team needs', to: 'For teams of up to 10.' } },
    { comment: 'Trial buttons are 39px tall', selector: '.card button', suggestion: { kind: 'tweak', property: 'min-height', from: '39px', to: '44px' } },
  ]);
  assert.equal(t.suggestion.to, 'For teams of up to 10.');
  // The page reads it back with the note.
  const sres = await api(name, 'POST', 'sessions?author=agent', { url: `${ORIGIN}/` });
  assert.deepEqual(sres.body.annotations.find((a) => a.id === w.id).suggestion, { kind: 'tweak', property: 'min-height', from: '39px', to: '44px' });
  const text = p.describe(p.get(t.id)) + '\n' + p.describe(p.get(w.id));
  assert.match(text, /suggested: text: "Everything a small team needs" → "For teams of up to 10\."/);
  assert.match(text, /suggested: tweak: min-height 39px → 44px/);
});

test('CLI annotate takes --suggest-text and --suggest-tweak, and refuses a malformed one', () => {
  const name = uniqueName('clisuggest');
  const a = cli(['feedback', name, 'annotate', `${ORIGIN}/`, 'Say who it is for', '--selector', '.card p', '--suggest-text', 'For teams of up to 10.', '--create']);
  assert.equal(a.code, 0, a.err);
  assert.match(a.out, /suggests a text change/);
  const b = cli(['feedback', name, 'annotate', `${ORIGIN}/`, 'Too small', '--selector', 'button', '--suggest-tweak', 'min-height=44px']);
  assert.equal(b.code, 0, b.err);
  const list = openProject(name).critique();
  assert.deepEqual(list.map((x) => x.suggestion), [{ kind: 'text', from: null, to: 'For teams of up to 10.' }, { kind: 'tweak', property: 'min-height', from: null, to: '44px' }]);
  assert.equal(cli(['feedback', name, 'annotate', `${ORIGIN}/`, 'x', '--suggest-tweak', 'nonsense']).code, 2);
  assert.equal(cli(['feedback', name, 'annotate', `${ORIGIN}/`, 'x', '--suggest-tweak', 'color=red;x:y']).code, 1);
});

test('a measured finding the reviewer fixed reads as measured, with its number and rule', () => {
  const { headline, rows } = describeAnnotation({ kind: 'feedback', comment: 'Start free trial is 39px tall', source: 'measured', elementPath: '.card button',
    measure: { check: 'target', value: '39px tall', rule: 'Touch targets: 44 × 44px', widths: [390, 820] } });
  assert.match(headline, /^MEASURED — Start free trial is 39px tall/);
  assert.ok(rows.some(([k, v]) => k === 'measured' && /39px tall · Touch targets: 44 × 44px at 390, 820px/.test(v)));
});
