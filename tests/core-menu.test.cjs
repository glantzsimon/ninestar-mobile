const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')();
const { parsePersonalChart } = load('personal-chart');
const { selectChartDetail } = load('chart-sections');
const { coreMenu, coreReading } = load('core-menu');
function detail(age = true) {
  return selectChartDetail(parsePersonalChart({ person: { isSixteenOrOver: age }, energies: {
    core: { number: 3 }, character: { number: 4 }, socialExpression: { number: 5 },
  }, sections: { core: { summary: 'Core summary', body: 'Core text' }, career: { body: 'Career text' } } }, 'full'), 'core');
}
test('Core menu matches the requested flat ten-section order', () => {
  assert.equal(Array.from(coreMenu(detail()), (item) => item.title).join('|'),
    'Overview|Essence|Intellectual Qualities|Interpersonal Qualities|Emotional Landscape|Relationships|Career|Finances|Health|Spirituality');
});
test('explicit under-sixteen flag excludes relationship category', () => {
  assert.ok(!coreMenu(detail(false)).some((item) => item.key === 'relationships'));
});
test('existing reading content is reused; unavailable topics are not fabricated', () => {
  const d = detail();
  assert.equal(coreReading(d, 'essence'), d.reading);
  assert.equal(coreReading(d, 'career').body, 'Career text');
  assert.equal(coreReading(d, 'finances').bodyBlocks.length, 0);
  assert.ok(coreReading(d, 'finances').unavailableMessage);
});
test('free response retains core reading without acquiring paid topics', () => {
  const chart = parsePersonalChart({ core: 3, character: 4, socialExpression: 5,
    sections: { core: { body: 'Free core reading' } } }, 'free');
  const d = selectChartDetail(chart, 'core');
  assert.equal(coreReading(d, 'essence').body, 'Free core reading');
  assert.equal(coreReading(d, 'relationships').body, '');
});
