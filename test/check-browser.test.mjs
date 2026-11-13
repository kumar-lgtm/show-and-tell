import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';

// Check the fix, end to end: a real Send, the agent resolving through its own
// API, the strip appearing, the card walking the changes, Looks right and Not
// yet, and the reopened note counting toward the next Send.
test('check the fix: strip, card, looks right, not yet reopens and counts',{
  skip: !process.env.AGENTATION_KIT_BROWSER_TESTS, timeout:90000,
},async t=>{
  const require=createRequire(import.meta.url);
  const {chromium}=require(process.env.AGENTATION_KIT_PLAYWRIGHT||'playwright');
  const {cleanup,uniqueName}=await import('./_seed.mjs');
  const {createReviewApp}=await import('../server/app.js');
  const {openProject}=await import('../server/agent.js');
  let app;
  const server=createServer((req,res)=>{
    if(req.url.startsWith('/__review/'))return app.handler(req,res,new URL(req.url,'http://x').pathname.slice(9));
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/__review/loader.js"></script></head><body style="margin:0;font:16px system-ui"><main style="padding:40px"><h1 id="plan">Starter</h1><div style="height:1400px"></div><p id="far">Far down the page</p><div style="height:400px"></div></main></body></html>');
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`,name=uniqueName('check-browser');
  app=createReviewApp({name,base:'/__review',origins:[origin]});
  const browser=await chromium.launch();
  t.after(async()=>{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));cleanup();});
  const errors=[];
  const open=async(viewport,touch=false)=>{
    const ctx=await browser.newContext({viewport,hasTouch:touch,isMobile:touch});
    await ctx.addInitScript(()=>localStorage.setItem('feedback-toolbar-reviewer','BK'));
    const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin);await page.waitForFunction(()=>window.__AGENTATION_KIT_CHECK__&&window.__AGENTATION_KIT_REVIEW__);
    return page;
  };
  const api=async(path,body)=>(await fetch(`${origin}/__review/__ag/${path}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})).json();
  const page=await open({width:1280,height:800});
  const session=await api('sessions',{url:`${origin}/`});
  const edit=await api(`sessions/${session.id}/annotations`,{id:crypto.randomUUID(),kind:'edit',reviewer:'BK',comment:'Change to: "Essentials"',element:'h1',elementPath:'#plan',edit:{id:'e1',from:'Starter',to:'Essentials'}});
  const far=await api(`sessions/${session.id}/annotations`,{id:crypto.randomUUID(),reviewer:'BK',comment:'Make this line bolder.',element:'p',elementPath:'#far'});

  // Send, the real button.
  await page.evaluate(async()=>{await window.__AGENTATION_KIT_REVIEW__.refresh();window.__AGENTATION_KIT_REVIEW__.open('done');});
  await page.getByRole('button',{name:/^Send( \d+| to agent)$/}).click();
  const project=openProject(name);for(let i=0;i<40&&!project.round()?.ts;i++)await page.waitForTimeout(50);
  assert.ok(project.round()?.ts,'the round was sent');
  await page.evaluate(()=>window.__AGENTATION_KIT_REVIEW__.open(null));
  const strip=page.locator('[data-check-ui] section.strip');
  assert.equal(await strip.isVisible(),false,'nothing to check before the agent acts');

  // The agent resolves both through its own API; the stream brings the strip.
  await page.waitForTimeout(1100); // updated_at must be later than the Send
  await project.act('resolve',edit.id,'Renamed it in pricing.tsx:42.');
  await project.act('resolve',far.id,'Bolded it in styles.css:8.');
  await strip.waitFor({state:'visible',timeout:15000});
  assert.match(await strip.innerText(),/2 changed/);
  assert.equal(await strip.getByRole('button',{name:'Check 2 changes'}).isVisible(),true);

  // Passive: an open panel is never covered, and the strip comes back after.
  await page.evaluate(()=>window.__AGENTATION_KIT_REVIEW__.open('inbox'));
  await page.waitForTimeout(150);
  assert.equal(await strip.isVisible(),false,'the inbox holds the slot; the strip waits');
  const entry=page.locator('[data-check]');
  assert.equal((await entry.innerText()).trim(),'Check 2','the inbox Done group offers Check too');
  await page.evaluate(()=>window.__AGENTATION_KIT_REVIEW__.open(null));
  await strip.waitFor({state:'visible'});

  // It steps aside for what isn't in the slot too (ui.js othersOpen, shared
  // with the question notice): upstream Settings and the comment popup, at
  // every width. It comes back when they close.
  const stepsAside=async(p,s,label)=>{
    await p.locator('[data-agentation-toolbar] [class*="toolbarContainer"]').first().click();
    await p.locator('[data-review=more]').waitFor({state:'visible'});
    await s.waitFor({state:'visible'});
    const settings=async()=>{await p.locator('[data-review=more]').click();await p.getByRole('menuitem',{name:'Settings',exact:true}).click();};
    await settings();
    await p.waitForFunction(()=>!!document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
    await s.waitFor({state:'hidden',timeout:2000});
    if(process.env.AGENTATION_KIT_SCREENSHOTS)await p.screenshot({path:`${process.env.AGENTATION_KIT_SCREENSHOTS}/check-strip-aside-settings-${label}.png`});
    await settings();
    await p.waitForFunction(()=>!document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]'));
    await s.waitFor({state:'visible',timeout:2000});
    await p.locator('#plan').click();
    await p.locator('[data-annotation-popup]').first().waitFor({state:'visible'});
    await s.waitFor({state:'hidden',timeout:2000});
    await p.getByRole('button',{name:'Cancel',exact:true}).click();
    await p.locator('[data-annotation-popup]').first().waitFor({state:'hidden'});
    await s.waitFor({state:'visible',timeout:2000});
  };
  await stepsAside(page,strip,'desktop');

  // Phone: the card sits on the bar, buttons are 44px.
  const phone=await open({width:390,height:844},true);
  await phone.waitForFunction(()=>window.__AGENTATION_KIT_CHECK__.count()===2,null,{timeout:10000});
  await stepsAside(phone,phone.locator('[data-check-ui] section.strip'),'phone');
  await phone.evaluate(()=>window.__AGENTATION_KIT_CHECK__.start());
  const pcard=phone.locator('[data-check-ui] section.card');await pcard.waitFor({state:'visible'});
  for(const b of await pcard.locator('button').all())assert.ok((await b.boundingBox()).height>=44,'phone targets are 44px');
  const pbox=await pcard.boundingBox();assert.ok(pbox.x>=12&&pbox.x+pbox.width<=378,'inside the 12px gutters');
  assert.ok(pbox.height<=844*0.55+1,'capped at 55% of the height');
  await phone.getByRole('button',{name:'Not yet'}).click();
  const before=pbox.height;
  await phone.locator('[data-check-ui] textarea').fill('A long reply that wraps over several lines on a phone, so the field has to grow the card instead of scrolling inside a tiny box.');
  assert.ok((await pcard.boundingBox()).height>before,'the reply field grows the card');
  await phone.keyboard.press('Escape');await phone.keyboard.press('Escape');
  assert.equal(await pcard.isVisible(),false,'Escape leaves the reply, then closes');
  await phone.context().close();

  // The card: 1 of 2, the change outlined in the free area.
  await strip.getByRole('button',{name:'Check 2 changes'}).click();
  const card=page.locator('[data-check-ui] section.card');await card.waitFor({state:'visible'});
  assert.match(await card.innerText(),/1 of 2/);
  // A text edit shows its before → after under You asked, not the stored "Change to:" line.
  assert.match(await card.innerText(),/You asked\s+Starter\s*Essentials/);
  assert.doesNotMatch(await card.innerText(),/Change to:/);
  assert.match(await card.innerText(),/The agent\s+Renamed it in pricing\.tsx:42\./);
  assert.match(await card.innerText(),/Starter\s*Essentials/,'before → after from the edit');
  const ring=page.locator('[data-check-ring]');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-check-ring]')).display==='block');
  const h1=await page.locator('#plan').boundingBox(),rb=await ring.boundingBox();
  assert.ok(rb.x<=h1.x&&rb.y<=h1.y&&rb.x+rb.width>=h1.x+h1.width,'the ring surrounds the target');

  // Right arrow moves; the far target scrolls above the card.
  await page.keyboard.press('ArrowRight');
  assert.match(await card.innerText(),/2 of 2/);
  await page.waitForFunction(()=>{const r=document.querySelector('#far').getBoundingClientRect(),c=document.querySelector('[data-check-ui]').shadowRoot.querySelector('section.card').getBoundingClientRect();return r.top>=0&&r.bottom<=c.top;},null,{timeout:5000});
  await page.keyboard.press('ArrowLeft');
  assert.match(await card.innerText(),/1 of 2/);

  // Enter is Looks right.
  await card.locator('.count').click();
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>/2 of 2/.test(document.querySelector('[data-check-ui]').shadowRoot.querySelector('section.card')?.innerText||''));
  const checked=project.get(edit.id);
  assert.equal(checked.status,'resolved');assert.equal(checked.verdict.verdict,'looks-right');assert.equal(checked.verdict.by,'BK');

  // Not yet: an empty reply is refused, a real one reopens the note.
  await card.getByRole('button',{name:'Not yet'}).click();
  await card.getByRole('button',{name:'Reopen'}).click();
  assert.match(await card.innerText(),/Say what.s still off/);
  await card.locator('textarea').fill('Still thin next to the heading.');
  await card.getByRole('button',{name:'Reopen'}).click();
  await page.locator('[data-check-ui] section.strip').waitFor({state:'visible'});
  assert.equal(await card.isVisible(),false,'all checked: the card closes');
  assert.equal((await strip.innerText()).trim(),'1 looks right, 1 reopened');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('[data-check-ring]')).display),'none','the outline leaves with the card');

  const reopened=project.get(far.id);
  assert.equal(reopened.status,'pending');
  assert.equal(reopened.verdict.verdict,'not-yet');
  assert.equal(reopened.reopenedFrom.resolution,'Bolded it in styles.css:8.');
  assert.equal(reopened.replies.at(-1).message,'Still thin next to the heading.');
  assert.ok(project.items().some(a=>a.id===far.id),'back in the agent’s queue');
  // Send carries only what was reopened.
  await page.waitForFunction(()=>document.querySelector('[data-review=done]')?.textContent.trim()==='Send 1',null,{timeout:5000});
  assert.equal(await page.evaluate(()=>window.__AGENTATION_KIT_CHECK__.count()),0);
  assert.deepEqual(errors,[]);
});
