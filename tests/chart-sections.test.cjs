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
  return parsePersonalChart({ roleLabels: { core: 'Constitution' }, help: { core: { title: 'Constitution', htmlBody: '<p>Introduction.</p>', culture: 'en-GB' } }, summary: '<p>Persistent chart summary.</p>', energies: {
    core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 },
    dayStar: { number: 4, description: '<p>Day-star reading.</p>' },
    generation: { number: 5, description: '<p>Generation reading.</p>' }, epoch: { number: 6 },
  }, sections: Object.fromEntries(keys.map((key) => [key, { body: `<p>${key} reading.</p>` }])) }, 'full');
}
const keys = (detail) => [detail.reading.key, ...detail.groups.flatMap((group) => group.readings.map((reading) => reading.key))];

test('Core selection contains only its own website subsections', () => {
  const detail = selectChartDetail(chart(), 'core');
  const included = keys(detail);
  assert.equal(detail.title, 'Constitution');
  for (const key of ['core', 'intellectualQualities', 'relationships', 'career', 'health']) assert.ok(included.includes(key));
  for (const key of ['character', 'socialExpression', 'childNature', 'stressResponse', 'dayStar']) assert.ok(!included.includes(key));
});

test('Character navigation uses API titles, distinct heading/help and one ordered stress panel', () => {
  const source = chart();
  source.energies.find((energy) => energy.key === 'character').title = 'Full energy heading';
  source.help.character = { title: 'Generic introduction', culture: 'en', blocks: [] };
  const titles = { character: 'The Diplomat', childNature: 'Child Nature',
    adultChildRelationship: 'Adult / Child Relationship', stressResponse: 'Stress Response' };
  for (const reading of source.readings) reading.title = titles[reading.key];
  const before = JSON.stringify(source);
  const detail = selectChartDetail(source, 'character');
  assert.equal(detail.groups.length, 0);
  assert.deepEqual(Array.from(detail.navigation, (item) => item.title), Object.values(titles));
  assert.equal(detail.navigation[0].heading, 'Full energy heading');
  assert.equal(detail.help.title, 'Generic introduction');
  assert.deepEqual(Array.from(detail.navigation[3].reading.bodyBlocks, (block) => block.text),
    ['stressResponse reading.', 'natalHouseStressResponse reading.', 'childStressResponse reading.']);
  assert.equal(JSON.stringify(source), before);
});

test('missing Character titles omit navigation without invented labels; partial stress data is safe', () => {
  const source = chart();
  assert.equal(selectChartDetail(source, 'character').navigation.length, 0);
  source.readings = source.readings.filter((item) => item.key !== 'natalHouseStressResponse');
  source.readings.find((item) => item.key === 'stressResponse').title = 'Réponse au stress';
  const detail = selectChartDetail(source, 'character');
  assert.equal(detail.navigation.length, 1);
  assert.equal(detail.navigation[0].title, 'Réponse au stress');
  assert.deepEqual(Array.from(detail.navigation[0].reading.bodyBlocks, (block) => block.text),
    ['stressResponse reading.', 'childStressResponse reading.']);
});

test('free Character navigation keeps only returned titled readings', () => {
  const source = parsePersonalChart({ core: 1, character: 2, socialExpression: 3,
    sections: { character: { title: 'The Diplomat', body: '<p>Personal reading.</p>', summary: 'Summary' } } }, 'free');
  const detail = selectChartDetail(source, 'character');
  assert.deepEqual(Array.from(detail.navigation, (item) => item.key), ['character']);
  assert.equal(detail.navigation[0].reading.summary, 'Summary');
  assert.equal(detail.navigation[0].heading, '');
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
