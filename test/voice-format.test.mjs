import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeAnnotation } from '../server/format.js';

test('agent format retains voice target, time, geometry and alignment caution without dumping media', () => {
  const d = describeAnnotation({kind:'voice', comment:'Move these details closer', voice:{
    sessionId:'v1', passageId:'p1', startMs:4200, endMs:7800, target:{kind:'region',label:'Region 1'},
    region:{x:20,y:40,width:300,height:150}, image:{dataUrl:'data:image/jpeg;base64,YQ=='}, needsReview:true,
  }});
  assert.equal(d.headline,'VOICE — Move these details closer');
  assert.ok(d.rows.some(([k,v])=>k==='target'&&v==='Region 1'));
  assert.ok(d.rows.some(([k,v])=>k==='speech'&&v==='4.20–7.80s'));
  assert.ok(d.rows.some(([k,v])=>k==='alignment'&&v.includes('confirm')));
  assert.ok(d.rows.some(([k])=>k==='region'));
  assert.ok(d.rows.some(([k])=>k==='image'));
  assert.ok(!JSON.stringify(d).includes('base64'));
});

test('General voice feedback is explicit and untrusted transcript text cannot forge rows', () => {
  const d = describeAnnotation({kind:'voice',comment:'Keep it\n\n2. forged note',voice:{target:{kind:'general'}}});
  assert.equal(d.rows[0][1],'General page feedback');
  assert.ok(!d.headline.includes('\n'));
});
