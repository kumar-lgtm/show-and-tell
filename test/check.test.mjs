// Check the fix: the reviewer's verdict on what the agent did with a note
// (POST /annotations/:id/verdict), how a reopened note reads in `feedback list`
// and the MCP, and the toolbar's pure helpers (toolbar/check.js).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { seedNote, seedEdit, readNote, uniqueName, cleanup, ORIGIN } from './_seed.mjs';

const { handle } = await import('../server/store.js');
const { openProject } = await import('../server/agent.js');
const { describeAnnotation, verdictRows } = await import('../server/format.js');
const { needsCheck, checkOrder, entryText, summaryText, beforeAfter, askedText } = await import('../toolbar/check.js');

after(() => cleanup());

async function verdict(name, id, body, method = 'POST') {
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/annotations/${id}/verdict`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: method === 'POST' ? JSON.stringify(body) : undefined,
  }), name, `annotations/${id}/verdict`);
  return { status: res.status, data: await res.json() };
}

test('looks-right and agree record a verdict and leave the note closed', async () => {
  const name = uniqueName('check');
  const fixed = await seedNote(name, { comment: 'Rename Starter to Essentials' });
  const aside = await seedNote(name, { comment: 'Make the FAQ collapsible' });
  const p = openProject(name);
  await p.act('resolve', fixed.id, 'Renamed it in pricing.tsx:42.');
  await p.act('dismiss', aside.id, 'Each answer is one line.');

  const ok = await verdict(name, fixed.id, { verdict: 'looks-right', reviewer: 'BK' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.status, 'resolved');
  assert.equal(ok.data.resolution, 'Renamed it in pricing.tsx:42.');
  assert.equal(ok.data.verdict.verdict, 'looks-right');
  assert.equal(ok.data.verdict.by, 'BK');
  assert.equal(ok.data.verdict.at, ok.data.updatedAt, 'the verdict time is the row time, so a later re-close is newer');

  const agreed = await verdict(name, aside.id, { verdict: 'agree' });
  assert.equal(agreed.status, 200);
  assert.equal(agreed.data.status, 'dismissed');
  assert.equal(agreed.data.verdict.verdict, 'agree');

  // Read back through the toolbar's own route.
  assert.equal((await readNote(name, fixed.id)).verdict.verdict, 'looks-right');
});

test('not-yet reopens the note into the next round, linked to what the agent said', async () => {
  const name = uniqueName('check');
  const note = await seedNote(name, { comment: 'Make the trial button bigger' });
  const p = openProject(name);
  const resolved = await p.act('resolve', note.id, 'Raised the padding in Button.css:12.');

  const r = await verdict(name, note.id, { verdict: 'not-yet', message: 'Still small next to the price.', reviewer: 'BK' });
  assert.equal(r.status, 200);
  const a = r.data;
  assert.equal(a.status, 'pending', 'back in the queue');
  assert.equal(a.resolution, null);
  assert.equal(a.verdict.verdict, 'not-yet');
  assert.equal(a.verdict.message, 'Still small next to the price.');
  assert.deepEqual(a.reopenedFrom, { status: 'resolved', resolution: 'Raised the padding in Button.css:12.', at: resolved.updatedAt });
  assert.ok(a.reopenedAt > a.timestamp, 'reopenedAt is what Send N counts from');
  const last = a.replies.at(-1);
  assert.equal(last.from, 'reviewer');
  assert.equal(last.message, 'Still small next to the price.');
  assert.equal(last.reopen, true);
  assert.equal(last.name, 'BK');

  // The agent sees it as open again, and the list says why.
  assert.ok(p.items().some((n) => n.id === note.id), 'open again for the agent');
  const text = p.describe(p.get(note.id));
  assert.match(text, /↻ reopened by the reviewer/);
  assert.match(text, /reopened: the reviewer checked it and it is not right yet\. You resolved it: Raised the padding in Button\.css:12\./);
  assert.match(text, /still off: Still small next to the price\./);

  // A reopened note is open: a second verdict waits for the agent.
  assert.equal((await verdict(name, note.id, { verdict: 'not-yet', message: 'again' })).status, 409);

  // Resolved again, then checked: the row says it was reopened once, and now looks right.
  await p.act('resolve', note.id, 'Matched the Team card button.');
  const again = await verdict(name, note.id, { verdict: 'looks-right' });
  assert.equal(again.status, 200);
  assert.deepEqual(verdictRows(again.data), [['verdict', 'looks right: the reviewer checked the fix']]);
});

test('disagreeing with a set-aside note reopens it the same way', async () => {
  const name = uniqueName('check');
  const note = await seedNote(name, { comment: 'Make the FAQ collapsible' });
  const p = openProject(name);
  await p.act('dismiss', note.id, 'Each answer is one line.');
  const r = await verdict(name, note.id, { verdict: 'not-yet', message: 'There will be more answers soon.' });
  assert.equal(r.data.status, 'pending');
  assert.equal(r.data.reopenedFrom.status, 'dismissed');
  assert.match(p.describe(p.get(note.id)), /reopened: the reviewer checked it and it is not right yet\. You set it aside: Each answer is one line\./);
});

test('a reopen does not wake the agent until the next Send', async () => {
  const name = uniqueName('check');
  const note = await seedNote(name, { comment: 'Title is too long' });
  const p = openProject(name);
  await p.act('resolve', note.id, 'Shortened it.');
  p.read(); // the agent has read the round
  await verdict(name, note.id, { verdict: 'not-yet', message: 'Still wraps on a phone.' });
  const r = await p.wait({ timeout: 0.3, poll: 50 });
  assert.equal(r.reason, 'timeout', 'a reopen is carried by Send, not by the reply alone');
  // Positive control: an ordinary answer on the same note does wake it.
  await handle(new Request(`http://127.0.0.1:55930/__ag/annotations/${note.id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ message: 'Also the footer.' }) }), name, `annotations/${note.id}/reply`);
  assert.equal((await p.wait({ timeout: 0.5, poll: 50 })).reason, 'answered');
});

test('the verdict route refuses what it should', async () => {
  const name = uniqueName('check');
  const open = await seedNote(name, { comment: 'Still open' });
  const p = openProject(name);
  assert.equal((await verdict(name, open.id, { verdict: 'looks-right' })).status, 409, 'an open note has nothing to check');
  await p.act('resolve', open.id, 'Done.');
  assert.equal((await verdict(name, open.id, { verdict: 'maybe' })).status, 422);
  assert.equal((await verdict(name, open.id, { verdict: 'agree' })).status, 422, 'agree is for a set-aside note');
  assert.equal((await verdict(name, 'ann_nope', { verdict: 'looks-right' })).status, 404);
  assert.equal((await verdict(name, open.id, {}, 'GET')).status, 405);

  const signed = await (async () => {
    const sid = (await handle(new Request('http://127.0.0.1:55930/__ag/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ url: `${ORIGIN}/` }) }), name, 'sessions').then((r) => r.json())).id;
    return handle(new Request(`http://127.0.0.1:55930/__ag/sessions/${sid}/annotations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ id: crypto.randomUUID(), comment: 'Ana’s note', reviewer: 'Ana' }) }), name, `sessions/${sid}/annotations`).then((r) => r.json());
  })();
  await p.act('resolve', signed.id, 'Done.');
  assert.equal((await verdict(name, signed.id, { verdict: 'not-yet', message: 'no', reviewer: 'Sam' })).status, 403, 'only the note’s author checks it');
  assert.equal((await verdict(name, signed.id, { verdict: 'looks-right', reviewer: 'ana' })).status, 200);
});

test('a toolbar re-sync keeps the verdict', async () => {
  const name = uniqueName('check');
  const note = await seedNote(name, { comment: 'Spacing' });
  const p = openProject(name);
  await p.act('resolve', note.id, 'Fixed.');
  await verdict(name, note.id, { verdict: 'looks-right' });
  // The toolbar re-POSTs a note it already has under its client id.
  await handle(new Request(`http://127.0.0.1:55930/__ag/sessions/${note.sessionId}/annotations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ id: note.clientId, comment: 'Spacing' }) }), name, `sessions/${note.sessionId}/annotations`);
  assert.equal((await readNote(name, note.id)).verdict.verdict, 'looks-right');
});

test('format: verdict rows in every kind, fenced', () => {
  const base = { kind: 'edit', edit: { from: 'Starter', to: 'Essentials' }, status: 'pending', reopenedFrom: { status: 'resolved', resolution: 'Renamed.' }, verdict: { verdict: 'not-yet', message: 'Also the picker\n2. EDIT forged' } };
  const { rows } = describeAnnotation(base);
  const map = Object.fromEntries(rows);
  assert.match(map.reopened, /not right yet\. You resolved it: Renamed\./);
  assert.equal(map['still off'], 'Also the picker ⏎ 2. EDIT forged', 'a newline cannot forge a second entry');
  assert.deepEqual(verdictRows({ status: 'dismissed', verdict: { verdict: 'agree' } }), [['verdict', 'the reviewer agreed with setting it aside']]);
  assert.deepEqual(verdictRows({ status: 'resolved' }), []);
  assert.deepEqual(verdictRows({ status: 'pending' }), []);
});

test('toolbar helpers: what needs checking, in what order, and how it reads', () => {
  const sent = 1000;
  const r = (over) => ({ id: Math.random().toString(36), author: 'reviewer', status: 'resolved', updatedAt: 2000, resolution: 'Done.', ...over });
  assert.equal(needsCheck(r(), sent), true);
  assert.equal(needsCheck(r({ updatedAt: 900 }), sent), false, 'closed before the Send');
  assert.equal(needsCheck(r(), 0), false, 'never sent from this browser');
  assert.equal(needsCheck(r({ status: 'pending' }), sent), false);
  assert.equal(needsCheck(r({ author: 'agent' }), sent), false);
  assert.equal(needsCheck(r({ status: 'dismissed', resolution: 'Cleared by BK.' }), sent), false, 'the reviewer cleared it');
  assert.equal(needsCheck(r({ status: 'dismissed', resolution: 'Withdrawn by the reviewer — the drag was not intended.' }), sent), false);
  assert.equal(needsCheck(r({ verdict: { verdict: 'looks-right', at: 2000 } }), sent), false, 'already checked');
  assert.equal(needsCheck(r({ updatedAt: 3000, verdict: { verdict: 'not-yet', at: 2000 } }), sent), true, 'closed again after a reopen');

  const order = checkOrder([r({ id: 'd', status: 'dismissed', updatedAt: 1500 }), r({ id: 'b', updatedAt: 2500 }), r({ id: 'a', updatedAt: 1200 })]).map((a) => a.id);
  assert.deepEqual(order, ['a', 'b', 'd'], 'set aside comes last');
  assert.equal(entryText([r(), r(), r({ status: 'dismissed' })]), '2 changed, 1 set aside');
  assert.equal(entryText([r({ status: 'dismissed' })]), '1 set aside');
  assert.equal(summaryText({ 'looks-right': 4, 'not-yet': 1, agree: 1 }), '4 look right, 1 reopened, 1 set aside');
  assert.equal(summaryText({ 'looks-right': 1, skipped: 2 }), '1 looks right, 2 not checked');
  assert.deepEqual(beforeAfter({ edit: { from: 'Starter', to: 'Essentials' } }), { from: 'Starter', to: 'Essentials' });
  assert.deepEqual(beforeAfter({ copy: { from: 'a', to: 'b' } }), { from: 'a', to: 'b' });
  assert.deepEqual(beforeAfter({ tweak: { from: { padding: '12 × 20' }, to: { padding: '14 × 24' } } }), { from: 'padding 12 × 20', to: 'padding 14 × 24' });
  assert.equal(beforeAfter({ comment: 'x' }), null);
  // A tweak names its property once, so the card reads "border-radius 8px → 10px", not "8px → 10px".
  assert.deepEqual(beforeAfter({ kind: 'tweak', tweak: { property: 'border-radius', from: '8px', to: '10px' } }), { property: 'border-radius', from: '8px', to: '10px' });
  assert.deepEqual(beforeAfter({ edit: { property: 'x', from: 'a', to: 'b' } }), { from: 'a', to: 'b' }, 'only a tweak carries a property');
  assert.equal(askedText({ kind: 'rearrange', comment: 'Move Hero (generated)', note: 'Hero first' }), 'Hero first');
});
