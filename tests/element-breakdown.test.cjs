const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parseElementBreakdown, elementPieSlices } = load('element-breakdown');
const segments = () => [
  { key: 'supportive', label: 'API supportive', percentage: 33.333, value: 33, color: '#22BB44' },
  { key: 'sibling', label: 'API sibling', percentage: 11.111, value: 11, color: '#0074E4' },
  { key: 'challenging', label: 'API challenging', percentage: 55.556, value: 55, color: 'red' },
];

test('element breakdown preserves API order, precise proportions, labels, colours and truncated legend total 99', () => {
  const raw = segments(), before = JSON.stringify(raw), parsed = parseElementBreakdown(raw);
  assert.equal(JSON.stringify(parsed), before);
  assert.equal(parsed.reduce((sum, item) => sum + item.value, 0), 99);
  assert.equal(parsed[0].percentage, 33.333);
  const slices = elementPieSlices(parsed);
  assert.equal(slices.length, 3);
  assert.equal(slices[0].label, 'API supportive');
  assert.match(slices[0].path, / A95 95 0 0 1 /);
  assert.match(slices[2].path, / A95 95 0 1 1 /);
  assert.equal(JSON.stringify(raw), before);
});

test('missing, partial or malformed breakdowns do not turn into a misleading partial pie', () => {
  for (const raw of [undefined, null, {}, [], segments().slice(0, 2)]) assert.equal(parseElementBreakdown(raw).length, 0);
  for (const patch of [{ key: 'unknown' }, { key: 'sibling' }, { label: '' }, { percentage: NaN },
    { percentage: Infinity }, { percentage: -1 }, { percentage: 101 }, { percentage: '33' },
    { value: 33.3 }, { value: -1 }, { color: 'url(https://example.test/image)' }, { percentage: 1 }]) {
    const raw = segments(); Object.assign(raw[0], patch);
    assert.equal(parseElementBreakdown(raw).length, 0);
  }
});

test('zero slices remain in the legend and a 100 percent slice forms a complete circle', () => {
  const raw = segments().map((item, index) => ({ ...item, value: index ? 0 : 100, percentage: index ? 0 : 100 }));
  const parsed = parseElementBreakdown(raw), slices = elementPieSlices(parsed);
  assert.equal(parsed.length, 3);
  assert.equal(slices.length, 1);
  assert.equal((slices[0].path.match(/A95 95/g) || []).length, 2);
  assert.equal(/NaN|Infinity/.test(slices[0].path), false);
  assert.equal(elementPieSlices([]).length, 0);
});
