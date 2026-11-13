// Opt in with a real local provider. Chromium records the synthetic speech
// fixture through getUserMedia + MediaRecorder; the backend transcribes it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('real speech recording becomes editable element/region feedback and agent-readable notes', {
  skip: !process.env.AGENTATION_KIT_REAL_VOICE_TESTS, timeout:90000,
}, async (t) => {
  assert.ok(process.env.AGENTATION_KIT_TRANSCRIBE_URL,'configure a real transcription service');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  const { chromium } = createRequire(import.meta.url)(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const fixture=fileURLToPath(new URL('./fixtures/voice-feedback.wav',import.meta.url));
  const html=readFileSync(new URL('../example/index.html',import.meta.url),'utf8').replace('</head>','<script src="/__review/loader.js"></script></head>');
  let app;
  const server=createServer((req,res)=>{
    if(req.url.startsWith('/__review/'))return app.handler(req,res,new URL(req.url,'http://x').pathname.slice('/__review'.length));
    res.writeHead(200,{'Content-Type':'text/html'});res.end(html);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`,name=uniqueName('real-voice');
  app=createReviewApp({name,base:'/__review',origins:[origin],config:{voice:true}});
  const browser=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+fixture]});
  t.after(async()=>{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));cleanup();});
  const ctx=await browser.newContext({viewport:{width:1280,height:900},permissions:['microphone']});
  await ctx.addInitScript(()=>localStorage.setItem('feedback-toolbar-reviewer','Real voice QA'));
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin);await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__);
  await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());
  await p.getByRole('button',{name:'Start recording',exact:true}).click();
  await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.recording);
  const started=Date.now();
  await p.waitForTimeout(2700);await p.locator('h2').click();
  await p.waitForTimeout(Math.max(0,5200-(Date.now()-started)));
  await p.mouse.move(300,250);await p.mouse.down();await p.mouse.move(650,450,{steps:5});await p.mouse.up();
  await p.waitForTimeout(Math.max(0,7700-(Date.now()-started)));await p.keyboard.press('Escape');
  await p.waitForTimeout(Math.max(0,10200-(Date.now()-started)));
  await p.getByRole('button',{name:'Stop',exact:true}).click();
  await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='editor'&&window.__AGENTATION_KIT_VOICE__.draft?.passages.length>0,null,{timeout:30000});
  const draft=await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.draft);
  assert.ok(draft.passages.length>=3,'real timed speech splits at target changes');
  assert.ok(draft.anchors.some(a=>a.kind==='element'));assert.ok(draft.anchors.some(a=>a.kind==='region'));
  const text=draft.passages.map(p=>p.text).join(' ');
  assert.match(text,/crowded/i);assert.match(text,/starter/i);assert.match(text,/button/i);
  assert.equal(await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.recording),false);
  await p.getByRole('textbox',{name:'Passage 1',exact:true}).fill('Overall, give this page more breathing room.');
  await p.getByRole('button',{name:'Save feedback',exact:true}).click();
  await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.savedPassageIds.length===window.__AGENTATION_KIT_VOICE__.draft.passages.length);
  const notes=openProject(name).items().filter(a=>a.voice?.sessionId===draft.id);
  assert.equal(notes.length,draft.passages.length);
  assert.ok(notes.some(a=>a.comment==='Overall, give this page more breathing room.'));
  assert.ok(notes.every(a=>a.voice?.target&&a.voice?.passageId));
  assert.deepEqual(errors,[]);
  if(process.env.AGENTATION_KIT_SCREENSHOTS){
    mkdirSync(process.env.AGENTATION_KIT_SCREENSHOTS,{recursive:true});
    await p.screenshot({path:process.env.AGENTATION_KIT_SCREENSHOTS+'/real-speech-editor.png'});
    writeFileSync(process.env.AGENTATION_KIT_SCREENSHOTS+'/real-speech-result.json',JSON.stringify({provider:draft.provider,passages:draft.passages,targets:draft.anchors,savedNotes:notes.length,errors},null,2));
  }
});
