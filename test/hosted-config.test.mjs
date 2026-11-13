import { test } from 'node:test';
import assert from 'node:assert/strict';

test('ShareKit configuration preserves query-routed page context in the prototype bundle',async()=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'window');
  try{
    globalThis.window={__SHAREKIT_AGENTATION__:{routeKey:['id']}};
    const { keyOf }=await import('../toolbar/page-key.js?hosted-config');
    assert.equal(keyOf('https://share.example/p/abc/iframe.html?id=pricing&args=monthly'),'/p/abc/iframe.html?id=pricing');
  }finally{if(descriptor)Object.defineProperty(globalThis,'window',descriptor);else delete globalThis.window;}
});
