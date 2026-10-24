const assert = require('node:assert/strict');
const test = require('node:test');
const library = require('./load-library.cjs');
const { snapshot } = require('./fixtures.cjs');
const { parseEntitlements, entitlementSnapshotsAgree } = library()('entitlements');

test('free, paid, lifetime and no-grant snapshots retain server-owned benefits', () => {
  for (const paid of [false, true]) {
    const input = snapshot(paid);
    // A local date must not determine benefit flags.
    input.sources[0].endsOn = '2000-01-01';
    assert.equal(parseEntitlements(input).mobileAccess, paid);
  }
  assert.equal(parseEntitlements({ ...snapshot(false), sources: [] }).sources.length, 0);
});

test('missing/malformed flags, timestamps and source fields cannot grant access', () => {
  for (const input of [null, {}, { ...snapshot(), paid: 'true' }, { ...snapshot(), asOfUtc: 'yesterday' },
    { ...snapshot(), sources: [{ ...snapshot().sources[0], verifiedAtUtc: undefined }] }]) {
    assert.throws(() => parseEntitlements(input));
  }
});

test('snapshot comparison ignores only asOfUtc and object key ordering', () => {
  const a = snapshot();
  const b = { ...snapshot(), asOfUtc: '2026-10-23T20:01:00Z' };
  b.sources[0] = Object.fromEntries(Object.entries(b.sources[0]).reverse());
  assert.equal(entitlementSnapshotsAgree(parseEntitlements(a), parseEntitlements(b)), true);
  for (const field of ['paid', 'unlimited', 'websiteAccess', 'mobileAccess']) {
    assert.equal(entitlementSnapshotsAgree(a, { ...b, [field]: false }), false);
  }
  assert.equal(entitlementSnapshotsAgree(a, { ...b, sources: [] }), false);
  b.sources[0].endsOn = '2026-11-23';
  assert.equal(entitlementSnapshotsAgree(a, b), false);
});
