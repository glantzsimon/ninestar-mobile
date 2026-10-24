const assert = require('node:assert/strict');
const test = require('node:test');
const { settleAccountLoad } = require('./load-library.cjs')()('account-load');

test('failed account load holds its guard until remaining sibling requests settle', async () => {
  let finishZones;
  let settled = false;
  const failure = new Error('options timeout');
  const load = settleAccountLoad([Promise.resolve('account'), Promise.reject(failure),
    new Promise((resolve) => { finishZones = resolve; })]);
  const observed = load.then(() => { settled = true; }, (error) => { settled = true; assert.equal(error, failure); });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  finishZones('zones');
  await observed;
  assert.equal(settled, true);
});

test('successful account load returns each response in its original position', async () => {
  const result = await settleAccountLoad([Promise.resolve('account'), Promise.resolve('metadata'), Promise.resolve('zones')]);
  assert.equal(result.join(','), 'account,metadata,zones');
});
