import { test } from 'node:test';
import assert from 'node:assert/strict';

test('unsigned notes arriving during a name update are drained, and failures stay queued', async () => {
  const storage = new Map([['feedback-toolbar-reviewer', 'Ana']]);
  const saved = {};
  for (const k of ['window', 'document', 'localStorage', 'fetch']) saved[k] = Object.getOwnPropertyDescriptor(globalThis, k);
  globalThis.window = {};
  globalThis.document = new EventTarget();
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };
  const calls = [];
  let release;
  globalThis.fetch = (url) => {
    calls.push(url);
    if (url.endsWith('/one')) return new Promise((r) => { release = () => r(Response.json({ reviewer: 'Ana' })); });
    if (url.endsWith('/failed')) return Promise.reject(new Error('offline'));
    return Promise.resolve(Response.json({ reviewer: 'Ana' }));
  };
  const until = async (check) => {
    for (let i = 0; i < 100; i++) { if (check()) return; await new Promise((r) => setTimeout(r, 2)); }
    assert.fail('name update did not settle');
  };
  try {
    const { installReviewerGlobals, syncNew, ownsNote } = await import('../toolbar/reviewer.js');
    installReviewerGlobals('http://localhost/__ag');
    await syncNew(() => Promise.resolve({ id: 'one' }), { id: 'local-one' });
    await until(() => release);
    await syncNew(() => Promise.resolve({ id: 'two' }), { id: 'local-two' });
    // The second successful POST arrives while the first PATCH is pending.
    await new Promise((r) => setTimeout(r, 0)); release();
    await until(() => calls.some((url) => url.endsWith('/two')) && storage.get('sk-unsigned-notes') === '[]');
    assert.ok(ownsNote({ id: 'local-two' }));
    await syncNew(() => Promise.resolve({ id: 'failed' }), { id: 'local-failed' });
    await until(() => calls.some((url) => url.endsWith('/failed')));
    assert.ok(JSON.parse(storage.get('sk-unsigned-notes')).includes('failed'));
    globalThis.fetch = async () => Response.json({ reviewer: 'Ana' });
    document.dispatchEvent(new CustomEvent('agentation-kit:health', { detail: { ok: true } }));
    await until(() => storage.get('sk-unsigned-notes') === '[]');
  } finally {
    for (const [k, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, k, descriptor); else delete globalThis[k];
    }
  }
});
