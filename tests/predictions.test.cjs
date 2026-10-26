const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parsePredictions, predictionCycle, predictionScopeLabels, primaryPeriods, additionalPeriods } = load('predictions');
const cycle = (number, title, description = '<h5>Reading</h5><p>A <strong>new</strong> beginning.</p>') => ({
  energy: { number, name: 'API energy name', element: 'API element', title: 'API full energy title',
    artworkId: 'returned.artwork.id', imageUrl: 'https://media.example.test/image.png?v=revision',
    description: '<p>Natal prose must not be used as a cycle reading.</p>' },
  cycleDescriptiveName: title, description,
});

test('full predictions preserve scopes, API reading titles, artwork and rich cycle prose', () => {
  const input = { profile: { person: { name: 'Person' } }, personal: { year: cycle(1, 'Hibernation'), month: cycle(2, 'Planning'), day: cycle(3, 'Sprouting') },
    lunar: { year: cycle(4, 'Blossoming', '<p>Lunar reading.</p>') }, global: { year: cycle(5, 'Consolidation', '<p>Global reading.</p>') },
    help: { moreOnCycles: { title: 'More On Predictions', htmlBody: '<p>Generic help.</p>', culture: 'en-GB' } } };
  const result = parsePredictions(input, 'full');
  assert.equal(result.name, 'Person');
  assert.equal(result.scopes.personal.year.reading.title, 'Hibernation');
  assert.equal(result.scopes.lunar.year.reading.body, 'Lunar reading.');
  assert.equal(result.scopes.global.year.reading.body, 'Global reading.');
  assert.equal(result.scopes.personal.year.energy.artworkId, 'returned.artwork.id');
  assert.equal(result.scopes.personal.year.energy.imageUrl, 'https://media.example.test/image.png?v=revision');
  assert.equal(result.scopes.personal.year.reading.bodyBlocks[0].kind, 'heading');
  assert.ok(result.scopes.personal.year.reading.bodyBlocks[1].spans.some((span) => span.bold && span.text === 'new'));
  assert.equal(result.scopes.personal.year.reading.body.includes('Natal prose'), false);
  assert.equal(result.scopes.personal.year.energy.descriptionBlocks.length, 0);
  assert.equal(result.help.moreOnCycles.title, 'More On Predictions');
});

test('free parsing admits only granted yearly projections, never full embedded periods/artwork', () => {
  const result = parsePredictions({ year: { number: 1, title: 'Hibernation', description: '<p>Granted.</p>' },
    lunarYear: { number: 2, title: 'Planning', description: '<p>Lunar granted.</p>' },
    globalYear: { number: 3, title: 'Sprouting', description: '<p>Global supplied text.</p>' },
    personal: { day: cycle(8, 'Not granted') }, profile: { energies: { core: cycle(9, 'Not granted') } } }, 'free');
  assert.equal(result.scopes.personal.year.reading.body, 'Granted.');
  assert.equal(result.scopes.personal.day, undefined);
  assert.equal(result.scopes.personal.year.energy.artworkId, undefined);
  assert.equal(result.scopes.personal.year.energy.descriptionBlocks.length, 0);
  assert.equal(predictionCycle(result, 'epoch'), undefined);
});

test('epoch selects global prose and never silently falls back to personal epoch', () => {
  const result = parsePredictions({ personal: { epoch: cycle(1, 'Personal epoch'), year: cycle(2, 'Planning') },
    global: { epoch: cycle(9, 'Global epoch') } }, 'full');
  assert.equal(predictionCycle(result, 'epoch').reading.title, 'Global epoch');
  delete result.scopes.global.epoch;
  assert.equal(predictionCycle(result, 'epoch'), undefined);
});

test('all day variants stay distinct; missing titles/help are never manufactured from keys', () => {
  const result = parsePredictions({ personal: {
    day: cycle(1, null), afternoon: cycle(2, 'Afternoon supplied'),
    invertedDay: cycle(3, 'Inverted supplied'), invertedAfternoon: cycle(4, 'Inverted afternoon supplied'),
    unknownFuturePeriod: cycle(5, 'Ignore unknown'),
  } }, 'full');
  assert.equal(result.scopes.personal.day.reading.title, '');
  assert.equal(result.scopes.personal.afternoon.energy.number, 2);
  assert.equal(result.scopes.personal.invertedDay.energy.number, 3);
  assert.equal(result.scopes.personal.invertedAfternoon.energy.number, 4);
  assert.equal(result.scopes.personal.unknownFuturePeriod, undefined);
  assert.equal(Object.keys(result.help).length, 0);
  assert.deepEqual(Array.from(primaryPeriods), ['year', 'month', 'day']);
  assert.deepEqual(Array.from(additionalPeriods), ['generation', 'epoch', 'hour']);
});

test('invalid numeric cycles and unsafe legacy media cannot render fabricated data', () => {
  for (const number of [0, 10, 1.5, '3', null]) assert.throws(() => parsePredictions({ personal: { year: cycle(number, 'Invalid') } }, 'full'));
  const input = cycle(3, 'Sprouting');
  input.energy.imageUrl = 'javascript:bad()';
  const result = parsePredictions({ personal: { year: input, day: cycle(0, 'Invalid') } }, 'full');
  assert.equal(result.scopes.personal.year.energy.imageUrl, undefined);
  assert.equal(result.scopes.personal.day, undefined);
});

test('scope labels come only from existing metadata labels, never protocol key formatting', () => {
  const labels = predictionScopeLabels({ houseDisplays: [{ value: 'SolarHouse', label: 'Primary translated' }, { value: 'LunarHouse', label: 'Secondary translated' }],
    scopes: [{ value: 'GlobalKi', label: 'Global translated' }] });
  assert.equal(labels.personal, 'Primary translated');
  assert.equal(labels.lunar, 'Secondary translated');
  assert.equal(labels.global, 'Global translated');
  assert.equal(predictionScopeLabels({ houseDisplays: [{ value: 'SolarHouse' }] }).personal, '');
});
