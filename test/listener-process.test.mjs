import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFileSync,readFileSync,existsSync,mkdirSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {STORE,cleanup,ORIGIN} from './_seed.mjs';
import {handle} from '../server/store.js';
import {kvSet} from '../server/kv-store.js';
after(()=>cleanup());
const root=fileURLToPath(new URL('../',import.meta.url));
const name='show-and-tell-demo';
const dir=join(STORE,'listener');mkdirSync(dir,{recursive:true});
const lock=join(dir,'listener.pid'),workerLock=join(dir,'worker.pid');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(check,ms=9000){const end=Date.now()+ms;while(Date.now()<end){if(check())return;await delay(50);}throw Error('Timed out');}
const launch=()=>spawn(process.execPath,[join(root,'scripts/review-listener.mjs')],{cwd:root,env:{...process.env,SHOW_AND_TELL_STORE:STORE,SHOW_AND_TELL_CODEX:join(STORE,'fake-codex')},stdio:['ignore','pipe','pipe']});
const collect=child=>{let out='';child.stderr.on('data',b=>out+=b);child.stdout.on('data',b=>out+=b);return ()=>out;};

test('listener startup lock is atomic, never steals stale locks, and shutdown reaps a surviving worker descendant', {timeout:20000},async()=>{
  // Create the store and a pre-existing Send before startup (signal handlers
  // must already exist when that initial tick launches a worker).
  const call=async(path,body)=>{const r=await handle(new Request('http://x/__ag/'+path,{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:JSON.stringify(body)}),name,path);assert.ok(r.ok);return r.json();};
  const s=await call('sessions',{url:ORIGIN});
  const n=await call(`sessions/${s.id}/annotations`,{id:'smoke',comment:'Test',reviewer:'QA'});
  kvSet(name,'agentation-round',JSON.stringify({ts:Date.now(),noteIds:[n.id]}));
  writeFileSync(join(STORE,'fake-codex'),`#!/usr/bin/env node
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const child=spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"],{stdio:'ignore'});
fs.writeFileSync(process.env.AGENTATION_KIT_STORE+'/descendant.pid',String(child.pid));
process.on('SIGTERM',()=>process.exit(0));process.stdin.resume();setInterval(()=>{},1000);
`,{mode:0o755});
  // A stale lock must cause both concurrent attempts to fail, never replace it.
  writeFileSync(lock,'2147483647');
  const attempts=[launch(),launch()];const messages=attempts.map(collect);
  await Promise.all(attempts.map(c=>new Promise(r=>c.once('close',r))));
  assert.ok(messages.every(get=>get().includes('Stale listener lock')));
  assert.equal(readFileSync(lock,'utf8'),'2147483647');unlinkSync(lock);
  const listener=launch();const log=collect(listener);let closed=false;listener.once('close',()=>closed=true);
  let pid;
  try{
    await until(()=>existsSync(join(STORE,'descendant.pid')));
    pid=Number(readFileSync(workerLock,'utf8'));
    await delay(200);listener.kill('SIGTERM');
    await delay(200);assert.equal(existsSync(lock),true,'lock retained while descendant is alive');
    const duplicate=launch();const duplicateLog=collect(duplicate);await new Promise(r=>duplicate.once('close',r));
    assert.match(duplicateLog(),/worker is still running|listener is already running/);
    await until(()=>closed,10000);
    assert.equal(existsSync(lock),false,log());assert.equal(existsSync(workerLock),false,log());
    assert.throws(()=>process.kill(-pid,0),e=>e.code==='ESRCH','whole worker group terminated');
  }finally{
    if(!closed)listener.kill('SIGKILL');
    if(pid)try{process.kill(-pid,'SIGKILL');}catch{}
  }
});
