import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import {cleanup, uniqueName} from './_seed.mjs';
import {createReviewListener, publicAgentWork, AGENT_WORK_KEY} from '../server/agent-work.js';
import {kvSet} from '../server/kv-store.js';
after(()=>cleanup());

function setup(run) {
  let round = null, notes = [], cursor = 0, status, calls = 0;
  const listener = createReviewListener({getRound:()=>round,getNotes:()=>notes,readCursor:()=>cursor,writeCursor:v=>cursor=v,writeStatus:v=>status=v,
    run:async args=>{calls++;return run(args, () => {notes=[];});}, now:()=>10000});
  return {listener,setRound:v=>round=v,setNotes:v=>notes=v,get status(){return status;},get cursor(){return cursor;},get calls(){return calls;}};
}
test('only a new Send starts work, persists its own cursor, shows progress and completes after notes close',async()=>{
  const f=setup(async({progress},resolve)=>{progress('Making the trial button blue.');assert.equal(f.status.message,'Making the trial button blue.');resolve();return {exitCode:0};});
  f.setNotes([{id:'one'}]);await f.listener.tick();assert.equal(f.calls,0);assert.equal(f.status.state,'listening');
  f.setRound({ts:100,noteIds:['one']});await f.listener.tick();assert.equal(f.calls,1);assert.equal(f.cursor,100);assert.equal(f.status.state,'complete');
  await f.listener.tick();assert.equal(f.calls,1);
});
test('a Send during a run queues without overlap; the next run only sees remaining open notes',async()=>{
  let release;const gate=new Promise(r=>release=r);let batch;
  const f=setup(async({notes},resolve)=>{if(f.calls===1){await gate;f.setNotes([{id:'two'}]);}else{batch=notes;resolve();}return {exitCode:0};});
  f.setNotes([{id:'one'}]);f.setRound({ts:100,noteIds:['one']});const first=f.listener.tick();
  f.setNotes([{id:'one'},{id:'two'}]);f.setRound({ts:200,noteIds:['one','two']});await f.listener.tick();assert.equal(f.calls,1);assert.equal(f.status.queued,true);
  release();await first;await f.listener.tick();assert.equal(f.calls,2);assert.deepEqual(batch,[{id:'two'}]);assert.equal(f.status.state,'complete');
});
test('unresolved notes are never reported complete; failed work waits for an explicit new Send',async()=>{
  const f=setup(async()=>({exitCode:0}));f.setNotes([{id:'question'}]);f.setRound({ts:1,noteIds:['question']});await f.listener.tick();assert.equal(f.status.state,'needs-input');
  const failed=setup(async()=>({exitCode:1}));failed.setNotes([{id:'kept'}]);failed.setRound({ts:1,noteIds:['kept']});await failed.listener.tick();assert.equal(failed.status.state,'failed');
  await failed.listener.tick();assert.equal(failed.calls,1);failed.setRound({ts:2,noteIds:['kept']});await failed.listener.tick();assert.equal(failed.calls,2);
});
test('empty Send does not launch; launch errors and listener stop are honest states',async()=>{
  const f=setup(async()=>{throw Error('failed spawn');});f.setRound({ts:1});await f.listener.tick();assert.equal(f.calls,0);
  f.setNotes([{id:'one'}]);f.setRound({ts:2,noteIds:['one']});await f.listener.tick();assert.equal(f.status.state,'failed');
  f.listener.stop();assert.equal(f.status.state,'offline');f.setRound({ts:3});await f.listener.tick();assert.equal(f.calls,1);
});
test('notes added after a queued Send are excluded until their own Send',async()=>{
  let release;const gate=new Promise(r=>release=r);const batches=[];
  const f=setup(async({notes},resolve)=>{batches.push(notes.map(n=>n.id));if(f.calls===1){await gate;f.setNotes([{id:'two'},{id:'unsent'}]);}return {exitCode:0};});
  f.setNotes([{id:'one'}]);f.setRound({ts:1,noteIds:['one']});const first=f.listener.tick();
  f.setRound({ts:2,noteIds:['one','two']});await f.listener.tick();release();await first;await f.listener.tick();
  assert.deepEqual(batches,[['one'],['two']]);
});
test('public status expires and exposes no private logs or prompts',()=>{
  const name=uniqueName('work-status');assert.equal(publicAgentWork(name).state,'offline');
  kvSet(name,AGENT_WORK_KEY,JSON.stringify({state:'working',message:'Updating heading',updatedAt:1000,prompt:'secret',log:'/private/log'}));
  assert.deepEqual(publicAgentWork(name,2000),{state:'working',message:'Updating heading',updatedAt:1000});
  assert.equal(publicAgentWork(name,17000).state,'offline');
});
test('optional steps and changes pass through bounded and whitelisted; absent fields stay absent',()=>{
  const name=uniqueName('work-steps');
  kvSet(name,AGENT_WORK_KEY,JSON.stringify({state:'working',message:'m',updatedAt:1000}));
  assert.deepEqual(Object.keys(publicAgentWork(name,2000)).sort(),['message','state','updatedAt']);
  const steps=[...Array.from({length:12},(_,i)=>({label:`Step ${i}\n`+'x'.repeat(300),state:i?'pending':'done',secret:'/log'})),{label:''},null];
  const changes=[{noteId:'a',summary:'Made it blue',status:'resolved',prompt:'secret'},{noteId:'b',summary:'Which one?',status:'bogus'},{summary:42}];
  kvSet(name,AGENT_WORK_KEY,JSON.stringify({state:'working',message:'m',updatedAt:1000,steps,changes}));
  const s=publicAgentWork(name,2000);
  assert.equal(s.steps.length,8);assert.equal(s.steps[0].state,'done');assert.ok(s.steps[0].label.length<=120);assert.ok(!s.steps[0].label.includes('\n'));
  assert.equal(s.steps[0].secret,undefined);
  assert.deepEqual(s.changes,[{noteId:'a',summary:'Made it blue',status:'resolved'},{noteId:'b',summary:'Which one?',status:'resolved'}]);
});
