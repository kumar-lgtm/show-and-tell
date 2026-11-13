// Fixes from the cross-agent review of the toolbar redesign (Codex, P2s):
// who may reopen a signed note, Discuss after a decision, revisions counting
// toward Send, tweak payload validation, and measured findings across widths.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN, uniqueName, cleanup } from './_seed.mjs';

const { handle } = await import('../server/store.js');
const { openProject } = await import('../server/agent.js');
const { cleanTweak } = await import('../server/sessions.js');
const { describeAnnotation } = await import('../server/format.js');
const m = await import('../toolbar/measure.js');

after(() => cleanup());

async function api(name, method, rest, body) {
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: body ? JSON.stringify(body) : undefined,
  }), name, rest.split('?')[0]);
  return { status: res.status, body: await res.json() };
}
async function note(name, extra) {
  const s = await api(name, 'POST', 'sessions', { url: `${ORIGIN}/` });
  const r = await api(name, 'POST', `sessions/${s.body.id}/annotations`, { id: crypto.randomUUID(), element: 'p', elementPath: 'main > p', x: 10, y: 10, timestamp: Date.now(), ...extra });
  assert.ok(r.status === 200 || r.status === 201, JSON.stringify(r.body));
  return r.body;
}

test('a signed note is reopened only by its author; a request naming no one is refused', async () => {
  const name = uniqueName('fix-owner');
  const a = await note(name, { comment: 'Ana owns this', reviewer: 'Ana' });
  await openProject(name).act('resolve', a.id, 'Done.');
  const anon = await api(name, 'POST', `annotations/${a.id}/verdict`, { verdict: 'not-yet', message: 'Nope' });
  assert.equal(anon.status, 403);
  const ben = await api(name, 'POST', `annotations/${a.id}/verdict`, { verdict: 'not-yet', message: 'Nope', reviewer: 'Ben' });
  assert.equal(ben.status, 403);
  const ana = await api(name, 'POST', `annotations/${a.id}/verdict`, { verdict: 'not-yet', message: 'Still off', reviewer: 'Ana' });
  assert.equal(ana.status, 200, 'the positive control: the author can');
  assert.equal(ana.body.status, 'pending');
});

test('Discuss after Fix it is refused, so Undo still finds the note Fix it made', async () => {
  const name = uniqueName('fix-discuss');
  const p = openProject(name, { create: true });
  const [crit] = (await p.annotate(`${ORIGIN}/`, [{ comment: 'Two trial buttons', selector: 'button', severity: 'blocking' }], { create: true })).annotations;
  const fix = await api(name, 'POST', `annotations/${crit.id}/decision`, { decision: 'fix', reviewer: 'Ana' });
  assert.equal(fix.status, 200);
  const late = await api(name, 'POST', `annotations/${crit.id}/decision`, { decision: 'discuss', reviewer: 'Ana' });
  assert.equal(late.status, 409);
  const undo = await api(name, 'POST', `annotations/${crit.id}/decision`, { decision: 'undo', reviewer: 'Ana' });
  assert.equal(undo.status, 200);
  const made = (await api(name, 'GET', 'sessions?author=all')).body.sessions.flatMap((s) => s.annotations).find((a) => a.id === fix.body.fixNote.id);
  assert.equal(made.status, 'dismissed', 'Undo took back the reviewer note Fix it made');
  // Discuss on an undecided note still works.
  const open = await api(name, 'POST', `annotations/${crit.id}/decision`, { decision: 'discuss', reviewer: 'Ana' });
  assert.equal(open.status, 200);
});

test('rewording a note records revisedAt; a re-sync that changes nothing does not', async () => {
  const name = uniqueName('fix-revise');
  const a = await note(name, { comment: 'Shorter intro', reviewer: 'Ana' });
  const same = await api(name, 'PATCH', `annotations/${a.id}`, { comment: 'Shorter intro' });
  assert.equal(same.body.revisedAt, undefined);
  const changed = await api(name, 'PATCH', `annotations/${a.id}`, { comment: 'Shorter intro, one line' });
  assert.equal(changed.status, 200);
  assert.ok(changed.body.revisedAt >= a.timestamp, 'revisedAt is set when the words change');
});

test('tweak payloads are cleaned on the way in, and odd stored values still render', async () => {
  assert.deepEqual(cleanTweak({ selector: '.cta', property: 'padding', from: '12px', to: '16px', token: 123, onScale: 'yes', ruleSource: { href: 'a.css', selector: '.cta', extra: 1 }, evil: '<x>' }),
    { selector: '.cta', property: 'padding', from: '12px', to: '16px', token: '123', ruleSource: { href: 'a.css', selector: '.cta' } });
  assert.equal(cleanTweak('nope'), undefined);
  const name = uniqueName('fix-tweak');
  const a = await note(name, { kind: 'tweak', comment: 'tweak', tweak: { selector: '.cta', property: 'padding', from: '12px', to: '16px', token: 123 } });
  assert.equal(a.tweak.token, '123');
  // A row stored before validation, with a number token, must not throw.
  assert.doesNotThrow(() => describeAnnotation({ ...a, tweak: { ...a.tweak, token: 456, fromToken: 7 } }));
});

test('measured runs merged across widths carry the strictest rule, so the fix satisfies every width', () => {
  const finding = (rule, need, to) => ({ check: 'target', selector: '.cta', label: 'Start free trial', rule, need, value: '20 × 30px', suggestion: { kind: 'tweak', property: 'min-height', from: '30px', to } });
  const { findings } = m.mergeRuns([
    { width: 1440, findings: [finding('Pointer targets: 24 × 24px', 24, '24px')], unknown: [] },
    { width: 390, findings: [finding('Touch targets: 44 × 44px', 44, '44px')], unknown: [] },
  ]);
  assert.equal(findings.length, 1);
  assert.deepEqual(findings[0].widths, [390, 1440]);
  assert.equal(findings[0].rule, 'Touch targets: 44 × 44px');
  assert.equal(findings[0].suggestion.to, '44px');
});
