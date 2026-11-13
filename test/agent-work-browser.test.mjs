import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';

test('listener activity UI: real Send, progress, queue, focus, reload affordance and stale/offline state',{
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout:60000,
},async t=>{
  const require=createRequire(import.meta.url);
  const {chromium}=require(process.env.AGENTATION_KIT_PLAYWRIGHT||'playwright');
  const {cleanup,uniqueName}=await import('./_seed.mjs');
  const {createReviewApp}=await import('../server/app.js');
  const {kvSet}=await import('../server/kv-store.js');
  const {AGENT_WORK_KEY}=await import('../server/agent-work.js');
  const {openProject}=await import('../server/agent.js');
  let app;
  const server=createServer((req,res)=>{
    if(req.url.startsWith('/__review/'))return app.handler(req,res,new URL(req.url,'http://x').pathname.slice(9));
    res.writeHead(200,{'Content-Type':'text/html'});res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/__review/loader.js"></script></head><body><h1>Demo</h1></body></html>');
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`,name=uniqueName('work-browser');
  app=createReviewApp({name,base:'/__review',origins:[origin],config:{agentWork:true}});
  const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  t.after(async()=>{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));cleanup();});
  const set=(state,message,extra={})=>kvSet(name,AGENT_WORK_KEY,JSON.stringify({state,message,updatedAt:Date.now(),...extra}));
  const api=async(path,body)=>{
    const res=await fetch(`${origin}/__review/${path}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {res,data:await res.json()};
  };
  const forbidden=await api('__kv',{key:AGENT_WORK_KEY,value:'forged'});assert.equal(forbidden.res.status,422);
  const write=await api('__ag/agent-work',{});assert.equal(write.res.status,405);
  set('listening','Listening for Send to agent.');
  await page.addInitScript(()=>localStorage.setItem('feedback-toolbar-reviewer','BK'));
  await page.goto(origin);await page.waitForFunction(()=>window.__AGENTATION_KIT_AGENT_WORK_STATUS__?.state==='listening');
  const badge=page.locator('[data-agent-work-ui] .activity');
  assert.equal(await badge.locator('span').last().isVisible(),false,'routine listening is icon only');
  assert.notEqual(await badge.evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)','badge has an opaque theme surface');
  const session=(await api('__ag/sessions',{url:`${origin}/`})).data;
  await api(`__ag/sessions/${session.id}/annotations`,{id:crypto.randomUUID(),comment:'Make title blue',reviewer:'BK',element:'h1'});
  await page.evaluate(async()=>{await window.__AGENTATION_KIT_REVIEW__.refresh();window.__AGENTATION_KIT_REVIEW__.open('done');});
  await page.getByRole('button',{name:/^Send( \d+| to agent)$/}).click();
  // Send persists its marker asynchronously after committing drafts: wait for it.
  const project=openProject(name);for(let i=0;i<40&&!project.round()?.ts;i++)await page.waitForTimeout(50);assert.ok(project.round()?.ts,'real button persists the Send marker');
  assert.equal(project.round().noteIds.length,1,'Send freezes the submitted server IDs');
  set('working','Updating the title.',{queued:true});await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());
  await badge.click();await page.getByText('Your next round is queued. One agent works at a time.',{exact:true}).waitFor();
  const close=page.getByRole('dialog',{name:'Agent activity'}).getByRole('button',{name:'Close',exact:true});await close.focus();
  await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());assert.equal(await close.evaluate(n=>n.getRootNode().activeElement===n),true,'heartbeat does not replace focused controls');
  assert.ok(await badge.evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
  set('complete','Changes ready. Reload the preview to review them.');await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());
  assert.equal(await page.getByRole('button',{name:'Reload preview',exact:true}).isVisible(),true);
  // Optional structured progress and results render as lists; plain text stays the fallback.
  set('working','Updating the title.',{steps:[{label:'Read notes',state:'done'},{label:'Edit index.html',state:'active'},{label:'Resolve notes',state:'pending'}]});await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());
  const dialog=page.getByRole('dialog',{name:'Agent activity'});
  assert.equal(await dialog.getByText('Edit index.html',{exact:true}).isVisible(),true);
  assert.equal(await badge.evaluate(n=>n.textContent),'2 of 3Edit index.html','pill shows step progress');
  set('complete','Changes ready.',{changes:[{noteId:'a',summary:'Title is blue',status:'resolved'},{noteId:'b',summary:'Which heading?',status:'needs-input'}]});await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());
  assert.equal(await dialog.getByText('What changed',{exact:true}).isVisible(),true);
  assert.equal(await dialog.getByText('Needs your input',{exact:true}).isVisible(),true);
  assert.equal(await dialog.getByText('Progress',{exact:true}).isVisible(),false,'absent steps hide the progress list');
  // Reloading would end a voice recording: it waits until the reviewer stops.
  await page.evaluate(()=>{window.__AGENTATION_KIT_VOICE_RECORDING__=true;window.__AGENTATION_KIT_VOICE_KIND__='session';document.dispatchEvent(new CustomEvent('agentation-kit:voice-capture',{detail:{active:true,kind:'session'}}));});
  assert.equal(await page.getByRole('button',{name:'Reload preview',exact:true}).isDisabled(),true);
  await page.evaluate(()=>{window.__AGENTATION_KIT_VOICE_RECORDING__=false;document.dispatchEvent(new CustomEvent('agentation-kit:voice-capture',{detail:{active:false}}));});
  assert.equal(await page.getByRole('button',{name:'Reload preview',exact:true}).isDisabled(),false);
  await dialog.getByRole('button',{name:'Close',exact:true}).focus();await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(),false);
  assert.equal(await badge.evaluate(n=>n.getRootNode().activeElement===n),true,'Escape returns focus to the indicator');
  set('working','old work',{updatedAt:Date.now()-16000});await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK__.check());
  assert.equal(await page.evaluate(()=>window.__AGENTATION_KIT_AGENT_WORK_STATUS__.state),'offline');
  // Said once: not "Agent offline: Local agent listener is offline."
  const said=await badge.getAttribute('aria-label');
  assert.match(said,/offline/i);assert.doesNotMatch(said,/offline.*offline/is,said);
  const barTip=await page.evaluate(()=>document.querySelector('[data-review=agent]')?.dataset.tip||'');
  assert.doesNotMatch(barTip,/offline.*offline/is,barTip);
  // Offline is calm: icon only, docked beside the toolbar, clear of the page headline.
  await page.waitForTimeout(100);
  assert.equal(await badge.locator('.label').isVisible(),false);
  const pill=await badge.boundingBox(),shell=await page.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().boundingBox();
  assert.ok(pill.x+pill.width<=shell.x,'beside the toolbar, on its left');
  assert.ok(pill.y>=shell.y-1&&pill.y+pill.height<=shell.y+shell.height+1,'vertically within the toolbar row');
  const h1=await page.locator('h1').boundingBox();assert.ok(pill.y>h1.y+h1.height,'does not cover the page headline');
  assert.equal(await badge.locator('svg').count(),1,'a drawn icon, not a glyph');
  assert.doesNotMatch(await badge.evaluate(n=>n.textContent),/[!✦◌✓]/);
  assert.deepEqual(errors,[]);
});
