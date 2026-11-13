// Opt in after build: SHOW_AND_TELL_BROWSER_TESTS=1 node --test test/voice-browser.test.mjs
// Microphone and screen APIs below are controlled test doubles; production is unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

test('voice toolbar: controlled permissions, pointing, dictation, recovery and retry', {
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout: 180000,
}, async t => {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.AGENTATION_KIT_PLAYWRIGHT || 'playwright');
  const { cleanup, uniqueName } = await import('./_seed.mjs');
  const { createReviewApp } = await import('../server/app.js');
  const { openProject } = await import('../server/agent.js');
  let app;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/__review/loader.js"></script><style>body{margin:20px;font:16px sans-serif}button{padding:12px}main{height:500px}</style></head><body><main><h1 id="heading">Voice review fixture</h1><button id="host-action" onclick="window.hostClicks=(window.hostClicks||0)+1">Host action</button><input id="host-input" value="editable"><div id="region-target" style="width:200px;height:100px;margin-top:30px">Region target</div></main></body></html>`;
  const server = createServer((req,res) => {
    if(req.url.startsWith('/__review/')) return app.handler(req,res,new URL(req.url,'http://x').pathname.slice('/__review'.length));
    res.writeHead(200,{'Content-Type':'text/html'});res.end(html);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`,name=uniqueName('voice-browser');
  app=createReviewApp({name,base:'/__review',origins:[origin],voiceLimits:{requestsPerMinute:100},voiceBudget:null,voiceTranscriber:{id:'qa-controlled',disclosure:'Controlled QA transcription.',async transcribe({durationMs}){return {text:'Keep this spoken feedback.',segments:[{start:0,end:durationMs/1000,text:'Keep this spoken feedback.'}]};}}});
  const project=openProject(name),browser=await chromium.launch();
  t.after(async()=>{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));cleanup();});
  const shots=process.env.AGENTATION_KIT_SCREENSHOTS;if(shots)mkdirSync(shots,{recursive:true});
  const errors=[];
  const page=async(options={},beforeGoto=null)=>{
    const context=await browser.newContext({viewport:{width:1280,height:800},...options});
    await context.addInitScript(()=>{
      localStorage.setItem('feedback-toolbar-reviewer','Ana');
      window.__voiceQA={denied:false,stopped:0,screenStopped:0,screenMode:'denied'};
      navigator.mediaDevices.getUserMedia=async()=>{if(window.__voiceQA.denied)throw new DOMException('denied','NotAllowedError');return {getTracks:()=>[{stop(){window.__voiceQA.stopped++;}}]};};
      navigator.mediaDevices.getDisplayMedia=async()=>{if(window.__voiceQA.screenMode==='denied')throw new DOMException('denied','NotAllowedError');const track={getSettings:()=>({displaySurface:'browser'}),getCaptureHandle:()=>({handle:'wrong-tab'}),stop(){window.__voiceQA.screenStopped++;}};return {getTracks:()=>[track],getVideoTracks:()=>[track]};};
      class Recorder{static isTypeSupported(){return true;}constructor(){this.mimeType='audio/webm';this.state='inactive';this.ordinal=window.__voiceQA.recordings=(window.__voiceQA.recordings||0)+1;}start(){this.state='recording';}stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['controlled-qa-audio-'+this.ordinal],{type:this.mimeType})});this.onstop?.();},0);}}
      window.MediaRecorder=Recorder;
    });
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));if(beforeGoto)await beforeGoto(p);await p.goto(origin);await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__);await p.waitForFunction(()=>window.__AGENTATION_KIT_HEALTH__?.ok);return p;
  };
  const start=async p=>{await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());await p.getByRole('button',{name:'Start recording',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');};
  const stop=async p=>{await p.getByRole('button',{name:'Stop',exact:true}).click();await p.getByRole('textbox',{name:'Passage 1',exact:true}).waitFor();};
  const draft=p=>p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.draft);
  const close=p=>p.context().close();

  await t.test('fully saved voice round starts fresh on reload while persisted notes remain',async()=>{
    const p=await page();await start(p);await stop(p);const original=await draft(p);await p.getByRole('button',{name:'Save feedback',exact:true}).click();await p.getByText('Saved 1 feedback note.',{exact:true}).waitFor();await p.reload();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__);assert.equal(await draft(p),null);assert.ok(project.items().some(n=>n.voice?.sessionId===original.id));await close(p);
  });
  await t.test('microphone denial retains setup and creates no recording',async()=>{
    const p=await page();await p.evaluate(()=>window.__voiceQA.denied=true);await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());await p.getByRole('button',{name:'Start recording',exact:true}).click();await p.getByText(/Microphone access was denied/).waitFor();assert.equal(await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.recording),false);assert.equal(await draft(p),null);await close(p);
  });
  await t.test('controlled ShareKit config alias mounts, records and saves voice feedback',async()=>{
    let replaced=false;const p=await page({},async p=>p.route('**/loader.js',async route=>{const response=await route.fetch(),source=await response.text();assert.ok(source.includes('__AGENTATION_KIT_AGENTATION__'));replaced=true;await route.fulfill({response,body:source.replaceAll('__AGENTATION_KIT_AGENTATION__','__SHAREKIT_AGENTATION__')});}));assert.equal(replaced,true);assert.equal(await p.evaluate(()=>!!window.__SHAREKIT_AGENTATION__),true);assert.equal(await p.evaluate(()=>!!window.__AGENTATION_KIT_AGENTATION__),false);await start(p);await stop(p);const original=await draft(p);await p.getByRole('button',{name:'Save feedback',exact:true}).click();await p.getByText('Saved 1 feedback note.',{exact:true}).waitFor();const note=project.items().find(n=>n.voice?.sessionId===original.id);assert.equal(note.comment,'Keep this spoken feedback.');assert.equal(note.url,`${origin}/`);await close(p);
  });
  await t.test('Point suppresses host action/native popup; Interact passes action and keeps anchor',async()=>{
    const p=await page();await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();await start(p);await p.locator('#host-action').click();const selected=await draft(p);assert.equal(selected.anchors.at(-1).selector,'#host-action');assert.equal(await p.evaluate(()=>window.hostClicks||0),0);assert.equal(await p.getByPlaceholder('What should change?',{exact:true}).count(),0);await p.getByRole('button',{name:'Interact',exact:true}).click();await p.locator('#host-action').click();assert.equal(await p.evaluate(()=>window.hostClicks),1);assert.equal((await draft(p)).activeAnchorId,selected.activeAnchorId);assert.equal(await p.getByPlaceholder('What should change?',{exact:true}).count(),0);await stop(p);assert.ok(await p.evaluate(()=>window.__voiceQA.stopped)>0);await close(p);
  });
  await t.test('element and region anchors capture page names, heading and contained elements; dock names and outlines the target',async()=>{
    const p=await page();await start(p);await p.locator('#host-action').click();
    let a=(await draft(p)).anchors.at(-1);
    assert.equal(a.label,'Host action');
    assert.equal(a.context.role,'button');assert.equal(a.context.name,'Host action');assert.equal(a.context.heading,'Voice review fixture');assert.equal(a.context.landmark,'main');
    const root=()=>p.locator('[data-voice-ui]');
    assert.equal(await root().evaluate(h=>h.shadowRoot.querySelector('.now .chip').textContent),'Host action');
    const box=await root().evaluate(h=>{const o=h.shadowRoot.querySelector('.outline');return o.hidden?null:o.getBoundingClientRect().toJSON();});
    const target=await p.locator('#host-action').boundingBox();
    assert.ok(box&&Math.abs(box.x-(target.x-3))<2&&Math.abs(box.width-(target.width+6))<2,'outline follows the pointed element');
    const r=await p.locator('#region-target').boundingBox();
    await p.mouse.move(r.x-4,r.y-4);await p.mouse.down();await p.mouse.move(r.x+r.width+4,r.y+r.height+4,{steps:3});await p.mouse.up();
    a=(await draft(p)).anchors.at(-1);
    assert.equal(a.kind,'region');
    assert.ok(a.context.elements.some(e=>e.name==='Region target'&&e.overlap==='inside'),JSON.stringify(a.context));
    assert.ok(!a.context.elements.some(e=>/Host action/.test(e.name||'')),'elements outside the region are not listed');
    assert.match(a.label,/^Region: Region target/);
    const focusKept=await p.getByRole('button',{name:'Interact',exact:true}).evaluate(async n=>{n.focus();await new Promise(r=>setTimeout(r,600));return n.getRootNode().activeElement===n;});
    assert.equal(focusKept,true,'the ticking clock does not rebuild the dock under focus');
    await stop(p);
    const notes=await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.draft.anchors.map(a=>a.context?.name||a.context?.elements?.[0]?.name||null));
    assert.deepEqual(notes,[null,'Host action','Region target']);
    await close(p);
  });
  await t.test('Escape ignores host inputs and returns to General outside inputs; region works after denied screenshot',async()=>{
    const p=await page();await start(p);await p.locator('#heading').click();await p.getByRole('button',{name:'Interact',exact:true}).click();await p.locator('#host-input').focus();const target=(await draft(p)).activeAnchorId;await p.keyboard.press('Escape');assert.equal((await draft(p)).activeAnchorId,target);await p.locator('#host-input').evaluate(n=>n.blur());await p.keyboard.press('Escape');const after=await draft(p);assert.equal(after.anchors.find(a=>a.id===after.activeAnchorId).kind,'general');await stop(p);await close(p);
  });
  await t.test('region remains usable after denied or wrong-tab screen capture',async()=>{
    const p=await page();await start(p);await p.getByRole('button',{name:'Enable region screenshots',exact:true}).click();await p.getByText(/Screen sharing was declined/).waitFor();await p.mouse.move(30,220);await p.mouse.down();await p.mouse.move(220,300);await p.mouse.up();assert.equal((await draft(p)).anchors.at(-1).kind,'region');assert.equal((await draft(p)).anchors.at(-1).image,undefined);await p.evaluate(()=>window.__voiceQA.screenMode='wrong');await p.getByRole('button',{name:'Enable region screenshots',exact:true}).click();await p.getByText(/could not verify a capture of this exact tab/).waitFor();assert.ok(await p.evaluate(()=>window.__voiceQA.screenStopped)>0);await stop(p);await close(p);
  });
  await t.test('controlled verified-tab stream captures a bounded region image at selection and saves it',async()=>{
    const p=await page();await p.evaluate(()=>{
      navigator.mediaDevices.setCaptureHandleConfig=({handle})=>window.__voiceQA.handle=handle;
      navigator.mediaDevices.getDisplayMedia=async()=>{const canvas=document.createElement('canvas');canvas.width=innerWidth;canvas.height=innerHeight;const ctx=canvas.getContext('2d');ctx.fillStyle='#e00000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#ffffff';for(let x=0;x<canvas.width;x+=40)ctx.fillRect(x,0,8,canvas.height);window.__voiceQA.canvas=canvas;const stream=canvas.captureStream(10),track=stream.getVideoTracks()[0];track.getSettings=()=>({displaySurface:'browser'});track.getCaptureHandle=()=>({handle:window.__voiceQA.handle});return stream;};
    });await start(p);await p.getByRole('button',{name:'Enable region screenshots',exact:true}).click();await p.getByText(/Screenshots enabled/).waitFor();await p.mouse.move(30,220);await p.mouse.down();await p.mouse.move(220,300);await p.mouse.up();const region=(await draft(p)).anchors.at(-1);assert.equal(region.kind,'region');assert.ok(region.image?.dataUrl.startsWith('data:image/jpeg;base64,'));assert.ok(region.image.dataUrl.length<44000);assert.equal(region.image.width,190);assert.equal(region.image.height,80);assert.ok(region.image.capturedAtMs>=0);await p.evaluate(()=>{const canvas=window.__voiceQA.canvas,ctx=canvas.getContext('2d');ctx.fillStyle='#0000ee';ctx.fillRect(0,0,canvas.width,canvas.height);});await stop(p);await p.getByRole('combobox',{name:'Target for passage 1',exact:true}).selectOption(region.id);const selected=(await draft(p)).anchors.at(-1);assert.equal(selected.image.dataUrl,region.image.dataUrl,'later frames cannot replace captured selection');const pixel=await p.evaluate(async dataUrl=>{const image=new Image();image.src=dataUrl;await image.decode();const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;const ctx=canvas.getContext('2d');ctx.drawImage(image,5,5,1,1,0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];},region.image.dataUrl);assert.ok(pixel[0]>180&&pixel[2]<50,'selected screenshot retained original red image');await p.getByRole('button',{name:'Save feedback',exact:true}).click();await p.getByText('Saved 1 feedback note.',{exact:true}).waitFor();const note=project.items().find(n=>n.voice?.target.id===region.id);assert.equal(note.voice.image.dataUrl,region.image.dataUrl);assert.equal(note.voice.region.width,190);await close(p);
  });
  await t.test('transcription failure retains audio and retry succeeds',async()=>{
    const p=await page();let calls=0;await p.route('**/voice/transcribe',async route=>{if(++calls===1)return route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'QA service failure'})});return route.continue();});await start(p);await p.getByRole('button',{name:'Stop',exact:true}).click();await p.getByRole('button',{name:'Retry transcription',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.hasAudio),true);await p.getByRole('button',{name:'Retry transcription',exact:true}).click();await p.getByRole('textbox',{name:'Passage 1',exact:true}).waitFor();assert.equal(calls,2);await close(p);
  });
  await t.test('cancelled microphone request stops a stream granted later',async()=>{
    const p=await page();await p.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.__voiceQA.grant=()=>resolve({getTracks:()=>[{stop(){window.__voiceQA.stopped++;}}]}));});await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());await p.getByRole('button',{name:'Start recording',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='requesting');await p.getByRole('button',{name:'Cancel',exact:true}).click();await p.evaluate(()=>window.__voiceQA.grant());await p.waitForFunction(()=>window.__voiceQA.stopped>0);assert.equal(await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.recording),false);assert.equal(await draft(p),null);await close(p);
  });
  await t.test('discard during pending transcription ignores its late response',async()=>{
    const p=await page();let release;const gate=new Promise(resolve=>release=resolve);await p.route('**/voice/transcribe',async route=>{await gate;await route.fulfill({contentType:'application/json',body:JSON.stringify({text:'Late speech',segments:[{text:'Late speech',startMs:0,endMs:100}]})}).catch(()=>{});});await start(p);await p.getByRole('button',{name:'Stop',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='transcribing');await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.discard());release();await p.waitForTimeout(100);assert.equal(await draft(p),null);assert.equal(await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.state),'idle');await close(p);
  });
  await t.test('pending save blocks destructive edits and remains signed by its original reviewer',async()=>{
    const p=await page();await start(p);await stop(p);const original=await draft(p);let release,seen;const gate=new Promise(resolve=>release=resolve),requestSeen=new Promise(resolve=>seen=resolve);await p.route('**/annotations',async route=>{seen();await gate;await route.continue();});await p.getByRole('button',{name:'Save feedback',exact:true}).click();await requestSeen;try{assert.equal(await p.getByRole('button',{name:'Discard draft',exact:true}).isDisabled(),true);assert.equal(await p.getByRole('textbox',{name:'Passage 1',exact:true}).isDisabled(),true);await p.evaluate(()=>{window.__AGENTATION_KIT_VOICE__.discard();localStorage.setItem('feedback-toolbar-reviewer','Ben');document.dispatchEvent(new CustomEvent('agentation-kit:reviewer-change'));});assert.equal((await draft(p)).id,original.id);}finally{release();}await p.getByText('Saved 1 feedback note.',{exact:true}).waitFor();const note=project.items().find(n=>n.voice?.sessionId===original.id);assert.equal(note.reviewer,'Ana');assert.equal((await draft(p)).reviewer,'Ana');assert.ok(await p.evaluate(()=>Object.entries(localStorage).some(([key,value])=>key.startsWith('feedback-toolbar-voice:')&&key.endsWith(':ana')&&JSON.parse(value).saved.length===1)));await close(p);
  });
  await t.test('edit, split, reassign, delete and partial save retry keep stable IDs',async()=>{
    const p=await page();await start(p);await p.locator('#heading').click();await stop(p);const field=p.getByRole('textbox',{name:'Passage 1',exact:true});await field.fill('First passage. Second passage.');await field.evaluate(n=>n.setSelectionRange(15,15));await p.getByRole('button',{name:'Split at caret',exact:true}).first().click();const split=await draft(p);assert.equal(split.passages.length,2);assert.notEqual(split.passages[0].id,split.passages[1].id);const second=p.getByRole('textbox',{name:'Passage 2',exact:true});await second.evaluate(n=>n.setSelectionRange(7,7));await p.getByRole('button',{name:'Split at caret',exact:true}).last().click();assert.equal((await draft(p)).passages.length,3);await p.getByRole('button',{name:'Delete passage',exact:true}).last().click();assert.deepEqual((await draft(p)).passages.map(p=>p.id),split.passages.map(p=>p.id));await p.getByRole('combobox',{name:'Target for passage 2',exact:true}).selectOption(split.anchors[0].id);let failed=false;await p.route('**/annotations',async route=>{const body=route.request().postDataJSON();if(body.voice?.passageId===split.passages[1].id&&!failed){failed=true;return route.fulfill({status:503,contentType:'application/json',body:'{"error":"controlled save failure"}'});}return route.continue();});await p.getByRole('button',{name:'Save feedback',exact:true}).click();await p.getByText(/1 saved. 1 could not save/).waitFor();await p.getByRole('button',{name:'Retry unsaved notes',exact:true}).click();await p.getByText('Saved 2 feedback notes.',{exact:true}).waitFor();const notes=project.items().filter(n=>n.voice?.sessionId===split.id);assert.equal(notes.length,2);assert.deepEqual(new Set(notes.map(n=>n.voice.passageId)),new Set(split.passages.map(p=>p.id)));assert.equal(notes.find(n=>n.voice.passageId===split.passages[1].id).voice.target.kind,'general');await close(p);
  });
  // UX review 4: N1, N10, N14, N13 (Talk's header) and F-Return (Stop).
  await t.test('the target outline follows the page while recording and goes with Stop; focus lands on the review heading',async()=>{
    const p=await page();
    // A slow recorder: Stop keeps the recording until the audio is in, the
    // gap in which an insets pass used to re-show the box for good.
    await p.evaluate(()=>{const stop=MediaRecorder.prototype.stop;MediaRecorder.prototype.stop=function(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['slow-qa-audio'],{type:this.mimeType})});this.onstop?.();},400);};void stop;});
    const root=()=>p.locator('[data-voice-ui]');
    const box=()=>root().evaluate(h=>{const o=h.shadowRoot.querySelector('.outline');return o.hidden?null:o.getBoundingClientRect().toJSON();});
    // Talk's header matches the other panels: a 13px/600 title, a 28px X.
    await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());
    const head=await root().evaluate(h=>{const t=h.shadowRoot.querySelector('.panel .hd strong'),x=h.shadowRoot.querySelector('.panel .hd button'),s=getComputedStyle(t),r=x.getBoundingClientRect();return {size:s.fontSize,weight:s.fontWeight,w:r.width,h:r.height,svg:!!x.querySelector('svg'),text:x.textContent.trim()};});
    assert.deepEqual(head,{size:'13px',weight:'600',w:28,h:28,svg:true,text:''});
    await p.getByRole('button',{name:'Start recording',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');
    // A marker where the label sits (the target's left corner), then a layout pass.
    await p.locator('#heading').click();
    const at=await root().evaluate(h=>h.shadowRoot.querySelector('.outline span').getBoundingClientRect().toJSON());
    await p.evaluate(({x,y})=>{const m=document.createElement('div');m.setAttribute('data-annotation-marker','');m.id='qa-marker';m.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:22px;height:22px;pointer-events:none`;document.body.append(m);dispatchEvent(new Event('resize'));},{x:at.x-8,y:at.y});
    await p.waitForTimeout(100);
    const label=await root().evaluate(h=>{const o=h.shadowRoot.querySelector('.outline');const s=o.firstChild,r=s.getBoundingClientRect(),k=h.shadowRoot.querySelector('.kbd');return {right:o.classList.contains('right'),size:getComputedStyle(s).fontSize,kbd:k&&getComputedStyle(k).fontSize,x:r.x,w:r.width,outlineRight:o.getBoundingClientRect().right};});
    assert.equal(label.right,true,'the label moves to the top-right, off the marker');
    assert.ok(Math.abs(label.x+label.w-label.outlineRight)<2,'flush with the outline’s right edge');
    assert.equal(label.size,'12px');assert.equal(label.kbd,'12px');
    // Without a marker in the way, the label stays at the top-left.
    await p.evaluate(()=>document.getElementById('qa-marker').remove());await p.locator('#host-action').click();
    assert.equal(await root().evaluate(h=>h.shadowRoot.querySelector('.outline').classList.contains('right')),false);
    // The page shifts under the target: the outline follows on the next layout pass.
    await p.evaluate(()=>{document.getElementById('host-action').style.marginLeft='120px';dispatchEvent(new Event('resize'));});
    await p.waitForTimeout(100);
    const moved=await box(),target=await p.locator('#host-action').boundingBox();
    assert.ok(moved&&Math.abs(moved.x-(target.x-3))<2,'outline follows a layout shift');
    // Stop, and a layout pass while the audio is still coming in.
    await p.getByRole('button',{name:'Stop',exact:true}).click();
    await p.evaluate(()=>{document.dispatchEvent(new CustomEvent('agentation-kit:insets'));dispatchEvent(new Event('scroll'));});
    assert.equal(await box(),null,'no outline once Stop is pressed');
    await p.getByRole('textbox',{name:'Passage 1',exact:true}).waitFor();
    await p.evaluate(()=>{document.getElementById('host-action').style.marginLeft='0';document.dispatchEvent(new CustomEvent('agentation-kit:insets'));});
    await p.waitForTimeout(100);
    assert.equal(await box(),null,'no outline left behind on the review');
    const focused=await root().evaluate(h=>{const a=h.shadowRoot.activeElement;return a&&a.matches('.panel .hd strong')?a.textContent:null;});
    assert.equal(focused,'Review voice feedback','Stop hands focus to the review heading, not BODY');
    await close(p);
  });
  await t.test('mobile voice setup, dock and editor stay in viewport with 44px buttons',async()=>{
    for(const width of [320,390]){const p=await page({viewport:{width,height:844},isMobile:true,hasTouch:true});await start(p);await p.waitForTimeout(50);const measure=()=>p.evaluate(()=>{const root=document.querySelector('[data-voice-ui]').shadowRoot;return [...root.querySelectorAll('button')].filter(n=>n.offsetParent).flatMap(n=>{const r=n.getBoundingClientRect();return r.width<43.5||r.height<43.5||r.x<0||r.right>innerWidth?[{label:n.ariaLabel,w:r.width,h:r.height,left:r.x,right:r.right}]:[];});});assert.deepEqual(await measure(),[],`${width} dock`);await stop(p);assert.deepEqual(await measure(),[],`${width} editor`);if(shots)await p.screenshot({path:`${shots}/voice-editor-${width}.png`});await close(p);}
  });
  await t.test('dictation inserts at the caret and preserves the existing native comment',async()=>{
    const p=await page();await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();await p.locator('#heading').click();const field=p.getByPlaceholder('What should change?',{exact:true});await field.fill('Before after');await p.waitForTimeout(100);await field.press('Home');await field.press('ArrowRight');await field.press('ArrowRight');await field.press('ArrowRight');await field.press('ArrowRight');await field.press('ArrowRight');await field.press('ArrowRight');await field.press('ArrowRight');assert.equal(await field.evaluate(n=>n.selectionStart),7);await p.locator('[data-voice-dictate]').first().click();await p.getByRole('button',{name:'Start dictation',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');assert.equal(await field.isVisible(),true,'dictation must keep the native comment open');await p.getByRole('button',{name:'Stop',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='idle');assert.equal(await field.inputValue(),'Before Keep this spoken feedback. after');await close(p);
  });
  await t.test('dictation keeps typing made during transcription and permits explicit insertion',async()=>{
    const p=await page();await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();await p.locator('#heading').click();const field=p.getByPlaceholder('What should change?',{exact:true});await field.fill('Existing note');await p.waitForTimeout(100);let release;const gate=new Promise(resolve=>release=resolve);await p.route('**/voice/transcribe',async route=>{await gate;await route.continue();});await p.locator('[data-voice-dictate]').first().click();await p.getByRole('button',{name:'Start dictation',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');await p.getByRole('button',{name:'Stop',exact:true}).click();await field.fill('Typed while waiting');release();await p.getByRole('textbox',{name:'Dictation transcript',exact:true}).waitFor();assert.equal(await field.inputValue(),'Typed while waiting');await field.evaluate(n=>n.setSelectionRange(n.value.length,n.value.length));await p.getByRole('button',{name:'Insert at current caret',exact:true}).click();assert.equal(await field.inputValue(),'Typed while waiting Keep this spoken feedback.');await close(p);
  });
  await t.test('dictation does not replace audio retained for a failed talk-and-point draft',async()=>{
    const p=await page();let calls=0;const uploaded=[];await p.route('**/voice/transcribe',async route=>{uploaded.push(route.request().postDataBuffer().toString());if(++calls===1)return route.fulfill({status:502,contentType:'application/json',body:'{"error":"first recording failed"}'});return route.continue();});await start(p);await p.getByRole('button',{name:'Stop',exact:true}).click();await p.getByRole('button',{name:'Retry transcription',exact:true}).waitFor();await p.getByRole('button',{name:'Close voice panel',exact:true}).click();await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();await p.locator('#heading').click();const field=p.getByPlaceholder('What should change?',{exact:true});await field.fill('Keep typed');await p.waitForTimeout(100);await p.locator('[data-voice-dictate]').first().click();await p.getByRole('button',{name:'Start dictation',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');await p.getByRole('button',{name:'Stop',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='idle');await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());await p.getByRole('button',{name:'Retry transcription',exact:true}).click();await p.getByRole('textbox',{name:'Passage 1',exact:true}).waitFor();assert.ok(uploaded[2].includes('controlled-qa-audio-1'),'talk-and-point retry must submit its original audio');await close(p);
  });
  await t.test('failed dictation preserves typed text and retries the same audio without a new recording',async()=>{
    const p=await page();await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();await p.locator('#heading').click();const field=p.getByPlaceholder('What should change?',{exact:true});await field.fill('Keep typed');await p.waitForTimeout(100);let calls=0;const uploads=[];await p.route('**/voice/transcribe',async route=>{uploads.push(route.request().postDataBuffer().toString());if(++calls===1)return route.fulfill({status:502,contentType:'application/json',body:'{"error":"dictation failure"}'});return route.continue();});await p.locator('[data-voice-dictate]').first().click();await p.getByRole('button',{name:'Start dictation',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='recording');await p.getByRole('button',{name:'Stop',exact:true}).click();await p.getByRole('button',{name:'Retry transcription',exact:true}).waitFor();assert.equal(await field.inputValue(),'Keep typed');await p.getByRole('button',{name:'Retry transcription',exact:true}).click();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__.state==='idle');assert.equal(await field.inputValue(),'Keep typed Keep this spoken feedback.');assert.equal(await p.evaluate(()=>window.__voiceQA.recordings),1);assert.ok(uploads.every(body=>body.includes('controlled-qa-audio-1')));await close(p);
  });
  await t.test('recovered draft keeps original page provenance when saving from another page',async()=>{
    const p=await page();await start(p);await stop(p);const before=await draft(p);await p.reload();await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__);assert.equal((await draft(p)).id,before.id);await p.goto(`${origin}/other`);await p.waitForFunction(()=>window.__AGENTATION_KIT_VOICE__);assert.equal((await draft(p)).id,before.id);await p.evaluate(()=>window.__AGENTATION_KIT_VOICE__.open());await p.getByRole('button',{name:'Save feedback',exact:true}).click();await p.getByText('Saved 1 feedback note.',{exact:true}).waitFor();assert.equal(project.items().find(n=>n.voice?.sessionId===before.id).url,`${origin}/`);await p.evaluate(()=>{localStorage.setItem('feedback-toolbar-reviewer','Ben');document.dispatchEvent(new CustomEvent('agentation-kit:reviewer-change'));});assert.equal(await draft(p),null,'another reviewer must not inherit Ana draft');await close(p);
  });
  assert.deepEqual(errors,[],'no browser runtime exceptions');
});
