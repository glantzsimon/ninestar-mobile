const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { createCalculatorMemory } = load('calculator-memory');
const { calculationDraft } = load('calculation');
const draft = () => calculationDraft({}, [{ value: 'Female', label: 'Female' }], new Date(2026, 9, 25), () => 0);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('last used calculator inputs survive a store restart, isolated by account/environment/calculator', async () => {
  let disk = null;
  const storage = { read: async () => disk, write: async (value) => { disk = clone(value); } };
  const first = createCalculatorMemory(storage);
  const edited = { ...draft(), name: 'Another Person', dateOfBirth: '1974-05-13', gender: 'Male' };
  await first.remember('integration', 'account-a', 'personal-chart', edited);
  const reopened = createCalculatorMemory(storage);
  assert.deepEqual(clone(await reopened.read('integration', 'account-a', 'personal-chart')), clone(edited));
  assert.equal(await reopened.read('integration', 'account-b', 'personal-chart'), null);
  assert.equal(await reopened.read('production', 'account-a', 'personal-chart'), null);
  assert.equal(await reopened.read('integration', 'account-a', 'predictions'), null);
});

test('legacy Simple drafts retain all inputs while discarding the removed mode field', async () => {
  const previous = { ...draft(), calculatorType: 'Simple', name: 'Retained name', calculationMethod: 'Traditional' };
  const disk = { version: 1, entries: { '["int","a","chart"]': previous } };
  const store = createCalculatorMemory({ read: async () => disk, write: async () => {} });
  const restored = await store.read('int', 'a', 'chart');
  assert.equal(restored.name, 'Retained name');
  assert.equal(restored.calculationMethod, 'Traditional');
  assert.equal(restored.dateOfBirth, previous.dateOfBirth);
  assert.equal(restored.calculatorType, undefined);
});

test('queued rapid edits retain the latest values and do not overwrite another account', async () => {
  let disk = null;
  const store = createCalculatorMemory({ read: async () => clone(disk), write: async (value) => { disk = clone(value); } });
  const first = draft();
  const writes = [store.remember('int', 'a', 'chart', first)];
  first.name = 'Must not change queued copy';
  writes.push(store.remember('int', 'b', 'chart', { ...draft(), name: 'B' }));
  writes.push(store.remember('int', 'a', 'chart', { ...draft(), name: 'Latest A' }));
  await Promise.all(writes);
  assert.equal((await store.read('int', 'a', 'chart')).name, 'Latest A');
  assert.equal((await store.read('int', 'b', 'chart')).name, 'B');
});

test('only allowlisted inputs are stored, never extra credentials, account fields or results', async () => {
  let disk;
  const store = createCalculatorMemory({ read: async () => disk, write: async (value) => { disk = value; } });
  await store.remember('int', 'a', 'chart', { ...draft(), password: 'do-not-store', csrfToken: 'do-not-store',
    entitlements: { paid: true }, emailAddress: 'do-not-store', chart: { body: 'do-not-store' } });
  assert.equal(JSON.stringify(disk).includes('do-not-store'), false);
  assert.deepEqual(Object.keys(await store.read('int', 'a', 'chart')).sort(), Object.keys(draft()).sort());
});

test('missing, invalid and unavailable storage cannot block or manufacture retained inputs', async () => {
  for (const disk of [null, { version: 999, entries: {} }, { version: 1, entries: { '["int","a","chart"]': { name: 'Partial' } } }]) {
    const store = createCalculatorMemory({ read: async () => disk, write: async () => {} });
    assert.equal(await store.read('int', 'a', 'chart'), null);
  }
  const broken = createCalculatorMemory({ read: async () => { throw Error('Unavailable'); }, write: async () => { throw Error('Unavailable'); } });
  assert.equal(await broken.read('int', 'a', 'chart'), null);
  await broken.remember('int', 'a', 'chart', draft());
  assert.equal(await broken.read('int', 'a', 'chart'), null);
});
