const assert = require('node:assert/strict');
const test = require('node:test');
const library = require('./load-library.cjs');
const { snapshot } = require('./fixtures.cjs');
const { createSessionStore } = library()('session');

test('logout clears access and rejects all previous-account replies', () => {
  const store = createSessionStore();
  store.acceptAccount(store.beginRead(), 'paid@example.test', snapshot());
  const old = store.beginRead();
  store.change('changing');
  assert.equal(store.getSnapshot().identity, null);
  assert.equal(store.getSnapshot().entitlements, null);
  assert.equal(store.acceptAccount(old, 'paid@example.test', snapshot()), false);
  assert.equal(store.acceptEntitlements(old, snapshot()), false);
});

test('switching account changes the form generation and drops old paid state', () => {
  const store = createSessionStore();
  store.acceptAccount(store.beginRead(), 'paid@example.test', snapshot());
  const generation = store.getSnapshot().generation;
  const old = store.beginRead();
  store.acceptAccount(store.beginRead(), 'free@example.test', snapshot(false));
  assert.equal(store.getSnapshot().generation, generation + 1);
  assert.equal(store.getSnapshot().entitlements.paid, false);
  assert.equal(store.acceptEntitlements(old, snapshot()), false);
});

test('same-account refresh preserves the form generation and never carries profile fields', () => {
  const store = createSessionStore();
  store.acceptAccount(store.beginRead(), 'test@example.test', snapshot());
  const generation = store.getSnapshot().generation;
  store.acceptEntitlements(store.beginRead(), snapshot(false));
  store.acceptAccount(store.beginRead(), 'test@example.test', snapshot(false));
  assert.equal(store.getSnapshot().generation, generation);
  assert.deepEqual(Object.keys(store.getSnapshot()).sort(), ['entitlements', 'generation', 'identity', 'status']);
});

test('out-of-order same-account replies and failures cannot overwrite newer access', () => {
  const store = createSessionStore();
  store.acceptAccount(store.beginRead(), 'test@example.test', snapshot());
  const old = store.beginRead();
  store.acceptEntitlements(store.beginRead(), snapshot(false));
  assert.equal(store.acceptEntitlements(old, snapshot()), false);
  store.clearEntitlements(old.generation, old.read);
  assert.equal(store.getSnapshot().entitlements.paid, false);
});

test('background account reads cannot repopulate access during or after logout', () => {
  const store = createSessionStore();
  store.acceptAccount(store.beginRead(), 'test@example.test', snapshot());
  store.change('changing');
  assert.equal(store.acceptAccount(store.beginRead(), 'test@example.test', snapshot()), false);
  store.signedOut(store.getSnapshot().generation);
  assert.equal(store.acceptAccount(store.beginRead(), 'test@example.test', snapshot()), false);
  assert.equal(store.getSnapshot().entitlements, null);
  store.change('changing');
  assert.equal(store.acceptAccount(store.beginRead(), 'next@example.test', snapshot(false), true), true);
});
