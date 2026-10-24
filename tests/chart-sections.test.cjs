const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parsePersonalChart } = load('personal-chart');
const { selectChartDetail } = load('chart-sections');

function chart() {
  const keys = ['core', 'character', 'socialExpression', 'intellectualQualities', 'emotionalLandscape',
    'interpersonalQualities', 'relationships', 'relationshipsStraight', 'relationshipsLgbtq', 'career',
    'occupations', 'finances', 'spirituality', 'health', 'illnesses', 'childNature',
    'adultChildRelationship', 'stressResponse', 'natalHouseStressResponse', 'childStressResponse'];
  return parsePersonalChart({ summary: '<p>Persistent chart summary.</p>', energies: {
    core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 },
    dayStar: { number: 4, description: '<p>Day-star reading.</p>' },
    generation: { number: 5, description: '<p>Generation reading.</p>' }, epoch: { number: 6 },
  }, sections: Object.fromEntries(keys.map((key) => [key, { body: `<p>${key} reading.</p>` }])) }, 'full');
}
const keys = (detail) => [detail.reading.key, ...detail.groups.flatMap((group) => group.readings.map((reading) => reading.key))];

test('Core selection contains only its own website subsections', () => {
  const detail = selectChartDetail(chart(), 'core');
  const included = keys(detail);
  assert.equal(detail.title, 'Core Nature');
  for (const key of ['core', 'intellectualQualities', 'relationships', 'career', 'health']) assert.ok(included.includes(key));
  for (const key of ['character', 'socialExpression', 'childNature', 'stressResponse', 'dayStar']) assert.ok(!included.includes(key));
});

test('Character selection owns childhood and all website stress sections', () => {
  const detail = selectChartDetail(chart(), 'character');
  assert.deepEqual(Array.from(keys(detail)), ['character', 'childNature', 'adultChildRelationship',
    'stressResponse', 'natalHouseStressResponse', 'childStressResponse']);
});

test('switching social/extended selections replaces detail without changing headers or summary', () => {
  const source = chart();
  const before = JSON.stringify(source);
  const social = selectChartDetail(source, 'socialExpression');
  assert.equal(social.groups.length, 0);
  assert.equal(social.reading.key, 'socialExpression');
  const day = selectChartDetail(source, 'dayStar');
  assert.equal(day.groups.length, 0);
  assert.equal(day.reading.bodyBlocks[0].text, 'Day-star reading.');
  assert.ok(selectChartDetail(source, 'epoch').reading.unavailableMessage);
  assert.equal(JSON.stringify(source), before);
});

test('free/missing sections remain unavailable and unknown widgets cannot select other content', () => {
  const source = parsePersonalChart({ core: 1, character: 2, socialExpression: 3, dayStar: 4,
    sections: { core: { body: '<p>Included core reading.</p>' } } }, 'free');
  assert.equal(selectChartDetail(source, 'core').groups.length, 0);
  assert.ok(selectChartDetail(source, 'socialExpression').reading.unavailableMessage);
  assert.equal(selectChartDetail(source, 'dayStar').reading.bodyBlocks.length, 0);
  assert.equal(selectChartDetail(source, 'career'), null);
  assert.equal(selectChartDetail(source, 'unknown'), null);
});
