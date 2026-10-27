const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parsePredictions, predictionCycle, primaryPeriods, additionalPeriods,
  personalAdditionalPeriods, globalAdditionalPeriods } = load('predictions');
const labels = () => ({
  predictionTitles: { year: 'Yearly Prediction', month: 'Monthly Prediction', day: 'Daily Prediction', generation: '9-Year Prediction', epoch: '81-Year Prediction', hour: 'Hourly Prediction' },
  periods: { year: 'Year', month: 'Month', day: 'Day', generation: 'Generation', epoch: 'Epoch', hour: 'Hour' },
  scopes: { personal: 'Personal Houses', lunar: 'Personal Lunar View', global: 'Global Ki' },
  groups: { primary: 'Primary Cycles', additional: 'Additional Cycles', global: 'Global Cycles', extendedGlobal: 'Extended Global Cycles' },
  cycleTitles: { year: 'Yearly Ki', month: 'Monthly Ki', day: 'Daily Ki', generation: 'Nine-Yearly Ki', epoch: '81-Yearly Ki', hour: 'Hourly Ki' },
});
const cycle = (number, title, description = '<h5>Reading</h5><p>A <strong>new</strong> beginning.</p>') => ({
  energy: { number, name: 'API energy name', element: 'API element', title: 'API full energy title',
    artworkId: 'returned.artwork.id', imageUrl: 'https://media.example.test/image.png?v=revision',
    description: '<p>Natal prose must not be used as a cycle reading.</p>' },
  cycleDescriptiveName: title, description, houseName: 'Server-authored house caption',
});

test('page labels preserve API translations in full/free without granting extra periods', () => {
  const pageLabels = { yourPredictions: 'Vos prévisions', housesYouCurrentlyOccupy: 'Maisons actuellement occupées' };
  const full = parsePredictions({ labels: pageLabels, personal: { year: cycle(1, 'API title') } }, 'full');
  const free = parsePredictions({ labels: pageLabels, year: { number: 1, title: 'API title' } }, 'free');
  for (const parsed of [full, free]) {
    assert.equal(parsed.labels.yourPredictions, pageLabels.yourPredictions);
    assert.equal(parsed.labels.housesYouCurrentlyOccupy, pageLabels.housesYouCurrentlyOccupy);
    assert.equal(parsed.scopes.personal.month, undefined);
  }
  const older = parsePredictions({ personal: { year: cycle(1, 'API title') } }, 'full');
  assert.equal(older.labels.yourPredictions, '');
  assert.equal(older.labels.housesYouCurrentlyOccupy, '');
});

test('full predictions preserve scopes, API reading titles, artwork and rich cycle prose', () => {
  const input = { labels: labels(), profile: { person: { name: 'Person' } }, personal: { year: cycle(1, 'Hibernation'), month: cycle(2, 'Planning'), day: cycle(3, 'Sprouting') },
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
  const result = parsePredictions({ labels: labels(), year: { number: 1, title: 'Hibernation', description: '<p>Granted.</p>', houseName: '1 Water House' },
    lunarYear: { number: 2, title: 'Planning', description: '<p>Lunar granted.</p>' },
    globalYear: { number: 3, title: 'Sprouting', description: '<p>Global supplied text.</p>' },
    personal: { day: cycle(8, 'Not granted') }, profile: { energies: { core: cycle(9, 'Not granted') } } }, 'free');
  assert.equal(result.scopes.personal.year.reading.body, 'Granted.');
  assert.equal(result.scopes.personal.day, undefined);
  assert.equal(result.labels.periods.day, 'Day');
  assert.equal(result.labels.predictionTitles.year, 'Yearly Prediction');
  assert.equal(result.labels.cycleTitles.month, 'Monthly Ki');
  assert.equal(result.labels.groups.extendedGlobal, 'Extended Global Cycles');
  assert.equal(result.scopes.personal.month, undefined);
  assert.equal(result.scopes.personal.hour, undefined);
  assert.equal(result.scopes.personal.year.houseName, '1 Water House');
  assert.equal(result.scopes.personal.year.energy.artworkId, undefined);
  assert.equal(result.scopes.personal.year.energy.descriptionBlocks.length, 0);
  assert.equal(predictionCycle(result, 'epoch'), undefined);
});

test('explicit global selection never silently falls back to personal prose', () => {
  const result = parsePredictions({ personal: { epoch: cycle(1, 'Personal epoch'), year: cycle(2, 'Planning') },
    global: { epoch: cycle(9, 'Global epoch') } }, 'full');
  assert.equal(predictionCycle(result, 'epoch', 'global').reading.title, 'Global epoch');
  delete result.scopes.global.epoch;
  assert.equal(predictionCycle(result, 'epoch', 'global'), undefined);
  assert.equal(predictionCycle(result, 'epoch', 'personal').reading.title, 'Personal epoch');
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

test('period, scope, group, card and house labels remain distinct from help and reading titles', () => {
  const result = parsePredictions({ labels: labels(), personal: { year: {
    ...cycle(7, 'Harvest / Abundance and Celebration'), houseName: '7 Metal House',
  } }, help: { year: { title: 'About Yearly Predictions', culture: 'en-GB', htmlBody: '<h5>Year introduction</h5><p>Generic.</p>' } } }, 'full');
  assert.equal(result.labels.periods.year, 'Year');
  assert.deepEqual({ ...result.labels.predictionTitles }, labels().predictionTitles);
  assert.equal(result.labels.cycleTitles.year, 'Yearly Ki');
  assert.equal(result.labels.groups.primary, 'Primary Cycles');
  assert.equal(result.labels.groups.additional, 'Additional Cycles');
  assert.equal(result.labels.groups.global, 'Global Cycles');
  assert.equal(result.labels.groups.extendedGlobal, 'Extended Global Cycles');
  assert.equal(result.labels.scopes.global, 'Global Ki');
  assert.equal(result.scopes.personal.year.houseName, '7 Metal House');
  assert.equal(result.scopes.personal.year.reading.title, 'Harvest / Abundance and Celebration');
  assert.equal(result.help.year.title, 'About Yearly Predictions');
});

test('localized labels and house captions are preserved rather than rebuilt from English or enum metadata', () => {
  const translated = labels();
  translated.periods.year = 'Année';
  translated.predictionTitles.year = 'Prévision annuelle';
  translated.cycleTitles.year = 'Ki annuel';
  translated.groups.primary = 'Cycles principaux';
  translated.groups.extendedGlobal = 'Cycles mondiaux étendus';
  translated.scopes.personal = 'Maisons personnelles';
  const input = { labels: translated, personal: { year: { ...cycle(7, 'Récolte'), houseName: 'Maison du Métal 7' } },
    houseDisplays: [{ value: 'SolarHouse', label: 'Wrong form label' }] };
  const result = parsePredictions(input, 'full');
  assert.equal(result.labels.periods.year, 'Année');
  assert.equal(result.labels.predictionTitles.year, 'Prévision annuelle');
  assert.equal(result.labels.cycleTitles.year, 'Ki annuel');
  assert.equal(result.labels.groups.primary, 'Cycles principaux');
  assert.equal(result.labels.groups.extendedGlobal, 'Cycles mondiaux étendus');
  assert.equal(result.labels.scopes.personal, 'Maisons personnelles');
  assert.equal(result.scopes.personal.year.houseName, 'Maison du Métal 7');
  assert.equal(input.labels, translated);
});

test('older/malformed labels and house captions stay absent without invented replacements', () => {
  for (const raw of [undefined, null, [], 'labels', { periods: { year: 7 }, predictionTitles: { year: 7 }, groups: null, cycleTitles: [] }]) {
    const entry = cycle(7, 'Harvest');
    delete entry.houseName;
    const result = parsePredictions({ labels: raw, personal: { year: entry } }, 'full');
    assert.equal(result.labels.periods.year, '');
    assert.equal(result.labels.predictionTitles.year, '');
    assert.equal(result.labels.cycleTitles.year, '');
    assert.equal(result.labels.scopes.personal, '');
    assert.equal(result.labels.groups.primary, '');
    assert.equal(result.labels.groups.global, '');
    assert.equal(result.labels.groups.extendedGlobal, '');
    assert.equal(result.scopes.personal.year.houseName, '');
    assert.equal(result.scopes.personal.year.reading.title, 'Harvest');
  }
});

test('separate global cards preserve global titles, house, artwork and prose for every displayed period', () => {
  const periods = [...primaryPeriods, ...globalAdditionalPeriods];
  const input = { labels: labels(),
    personal: Object.fromEntries(periods.map(period => [period, cycle(1, `Personal ${period}`, '<p>Personal only.</p>')])),
    lunar: { year: cycle(2, 'Lunar only') },
    global: Object.fromEntries(periods.map(period => [period, {
      ...cycle(9, `Global ${period}`, '<p>Collective only.</p>'), houseName: 'Global house',
      energy: { ...cycle(9, '').energy, artworkId: 'global.artwork' },
    }])),
  };
  const result = parsePredictions(input, 'full');
  for (const period of periods) {
    const global = predictionCycle(result, period, 'global');
    assert.equal(global.reading.title, `Global ${period}`);
    assert.equal(global.reading.body, 'Collective only.');
    assert.equal(global.houseName, 'Global house');
    assert.equal(global.energy.artworkId, 'global.artwork');
    assert.equal(predictionCycle(result, period).reading.body, 'Personal only.');
  }
  assert.deepEqual(Array.from(personalAdditionalPeriods), ['generation', 'hour']);
  assert.deepEqual(Array.from(globalAdditionalPeriods), ['epoch', 'generation']);
});

test('public introductions preserve authored HTML and do not grant global periods to free users', () => {
  const introduction = (title) => ({ title, culture: 'en-GB', htmlBody: '<h5>Introduction</h5><p>A <strong>collective</strong> influence.</p>' });
  const result = parsePredictions({ labels: labels(),
    year: { number: 1, title: 'Personal', description: '<p>Personal.</p>' },
    globalYear: { number: 7, title: 'Global harvest', description: '<p>Global.</p>' },
    global: { month: cycle(5, 'Not granted'), epoch: cycle(9, 'Not granted') },
    help: { overview: introduction('Predictions'), globalKi: introduction('About Global Ki'),
      moreOnCycles: introduction('Supplementary'), globalKiWarning: introduction('Epoch warning') },
  }, 'free');
  assert.equal(result.help.overview.title, 'Predictions');
  assert.equal(result.help.globalKi.title, 'About Global Ki');
  assert.equal(result.help.globalKi.blocks[0].kind, 'heading');
  assert.ok(result.help.globalKi.blocks[1].spans.some(span => span.bold && span.text === 'collective'));
  assert.equal(result.help.moreOnCycles.title, 'Supplementary');
  assert.equal(result.help.globalKiWarning.title, 'Epoch warning');
  assert.equal(predictionCycle(result, 'year', 'global').reading.title, 'Global harvest');
  for (const period of ['month', 'day', 'epoch', 'generation', 'hour']) {
    assert.equal(predictionCycle(result, period, 'global'), undefined);
  }
});
