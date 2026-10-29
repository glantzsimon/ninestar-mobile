const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { buildCompatibility, parseCompatibility, compatibilityMenu, parseCompatibilityGauges, gaugePosition } = load('compatibility');
const { calculationDraft } = load('calculation');
const option = value => ({ value, label: value });
const options = { genders: [option('Female')], timezones: [option('Europe/London'), option('Tokyo Standard Time')],
  calculationMethods: [option('Chinese'), option('Traditional')], calculatorTypes: [option('Advanced')], houseDisplays: [option('SolarHouse')] };
const draft = () => ({ ...calculationDraft({}, options.genders, new Date(2026, 9, 27), () => 0),
  calculationMethod: 'Chinese', birthTimeZoneId: 'Europe/London' });
const profile = (adult = true) => ({ person: { isSixteenOrOver: adult },
  roleLabels: { core: 'API Constitution', character: 'API Character', socialExpression: 'API Social' },
  energies: { core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 } },
  sections: { core: { body: '<p>API chart reading.</p>' } } });
const response = (firstAge = true, secondAge = true) => ({ firstPerson: profile(firstAge), secondPerson: profile(secondAge),
  help: { overview: { title: 'API help', htmlBody: '<p>Generic introduction.</p>', culture: 'en-GB' } },
  fundamentalEnergiesCompatibility: '<h4>API heading</h4><p>A <strong>supplied</strong> overview.</p>',
  sexualChemistryDetails: '<p>CHEMISTRY_CONTENT</p>', details: {
    elements: { fundamentalElementsTransformationDetails: '<p>Core transformation.</p>',
      fundamentalElementsCompatibilityDetails: '<p>Core analysis.</p>', characterElementsTransformationDetails: '<p>Character transformation.</p>',
      characterElementsCompatibilityDetails: '<p>Character analysis.</p>', allOtherElementsCompatibility: '<p>Other elements.</p>' },
    birthMonthDescription: '<p>Birth month.</p>', gender: { isBothGenderSame: true },
    score: { harmonyScore: 'VeryHigh', sexualChemistryScore: 'OffTheCharts' } } });

test('compatibility sends two independent people and shared Advanced settings without unrelated preferences', () => {
  const first = draft(), second = { ...draft(), dateOfBirth: '1984-02-29', birthTimeZoneId: 'Tokyo Standard Time',
    timeOfBirthKnown: 'true', timeOfBirth: '12:34', calculationMethod: 'Ignored second method' };
  first.calculationMethod = 'Traditional';
  const before = JSON.stringify([first, second]);
  const body = buildCompatibility(first, second, options, true);
  assert.equal(body.firstPerson.dateOfBirth, '2004-10-27');
  assert.equal(body.secondPerson.dateOfBirth, '1984-02-29');
  assert.equal(body.secondPerson.timeOfBirth, '12:34:00');
  assert.equal(body.secondPerson.birthTimeZoneId, 'Tokyo Standard Time');
  assert.equal(body.calculationMethod, 'Traditional');
  assert.equal(body.calculatorType, 'Advanced');
  assert.equal(body.hideSexualChemistry, true);
  assert.equal(body.userTimeZoneId, undefined);
  assert.equal(body.selectedDateTime, undefined);
  assert.equal(body.housesDisplay, undefined);
  assert.equal(body.userId, undefined);
  assert.equal(JSON.stringify([first, second]), before);
});

test('both people, method, supported mode and explicit privacy choice are validated before requests', () => {
  const first = draft();
  for (const patch of [{ dateOfBirth: '1983-02-29' }, { timeOfBirth: '24:00' }, { birthTimeZoneId: 'Unknown' }, { gender: '' }]) {
    assert.throws(() => buildCompatibility(first, { ...draft(), ...patch }, options, true));
  }
  assert.throws(() => buildCompatibility({ ...first, calculationMethod: 'Unknown' }, draft(), options, true));
  assert.throws(() => buildCompatibility(first, draft(), options, 'false'));
  assert.throws(() => buildCompatibility(first, draft(), { ...options, calculatorTypes: [option('Simple')] }, true));
});

test('compatibility field errors identify the correct person or shared preference', () => {
  const first = draft(), second = draft();
  assert.throws(() => buildCompatibility({ ...first, dateOfBirth: '' }, second, options, true), error => error.field === 'first.dateOfBirth');
  assert.throws(() => buildCompatibility(first, { ...second, dateOfBirth: '' }, options, true), error => error.field === 'second.dateOfBirth');
  assert.throws(() => buildCompatibility(first, { ...second, birthTimeZoneId: '' }, options, true), error => error.field === 'second.birthTimeZoneId');
  assert.throws(() => buildCompatibility({ ...first, calculationMethod: '' }, second, options, true), error => error.field === 'calculationMethod');
});

test('full compatibility preserves returned charts, overview and reading order with safe rich formatting', () => {
  const parsed = parseCompatibility(response());
  assert.equal(parsed.first.energies[0].roleLabel, 'API Constitution');
  assert.equal(parsed.second.readings[0].body, 'API chart reading.');
  assert.equal(parsed.help.overview.title, 'API help');
  assert.equal(parsed.overview[0].kind, 'heading');
  assert.ok(parsed.overview[1].spans.some(span => span.bold && span.text === 'supplied'));
  assert.equal(parsed.details.map(section => section.key).join(','), 'fundamental,character,elements,birthMonth');
  assert.equal(parsed.details[0].blocks.map(block => block.text).join('|'), 'Core transformation.|Core analysis.');
  assert.equal(JSON.stringify(parsed).includes('VeryHigh'), false);
  assert.equal(JSON.stringify(parsed).includes('isBothGenderSame'), false);
});

test('chemistry requires explicit inclusion and affirmative age flags for both people', () => {
  assert.equal(JSON.stringify(parseCompatibility(response(), true)).includes('CHEMISTRY_CONTENT'), false);
  for (const ages of [[false, true], [true, false], [undefined, true], [true, undefined]]) {
    const data = response();
    data.firstPerson.person.isSixteenOrOver = ages[0];
    data.secondPerson.person.isSixteenOrOver = ages[1];
    assert.equal(JSON.stringify(parseCompatibility(data, false)).includes('CHEMISTRY_CONTENT'), false);
  }
  assert.equal(parseCompatibility(response(), false).details.at(-1).key, 'chemistry');
  const missing = response(); missing.sexualChemistryDetails = null;
  assert.equal(parseCompatibility(missing, false).details.some(section => section.key === 'chemistry'), false);
});

test('missing prose stays absent and numeric complementary charts cannot masquerade as full profiles', () => {
  const data = response(); data.details = null; data.fundamentalEnergiesCompatibility = null; data.help = null;
  const parsed = parseCompatibility(data);
  assert.equal(parsed.overview.length, 0);
  assert.equal(parsed.details.length, 0);
  assert.equal(Object.keys(parsed.help).length, 0);
  assert.throws(() => parseCompatibility({ firstPerson: { core: 1, character: 2, socialExpression: 3 }, secondPerson: profile() }));
});

const gauge = (key, value = 7, maxValue = 9, isInverted = false) => ({ key, label: `API ${key}`,
  value, minValue: 0, maxValue, isInverted });

test('gauges preserve API order and scales; conflict only reverses colour desirability', () => {
  const parsed = parseCompatibilityGauges([gauge('conflict', 7, 9, true), gauge('harmony'), gauge('sexualChemistry', 12, 15)], true);
  assert.equal(parsed.map(item => item.key).join(','), 'conflict,harmony,sexualChemistry');
  assert.equal(parsed[0].label, 'API conflict');
  assert.equal(gaugePosition(parsed[0]).position, 7 / 9);
  assert.equal(gaugePosition(parsed[0]).desirability, 1 - 7 / 9);
  assert.equal(gaugePosition(parsed[1]).desirability, 7 / 9);
  assert.equal(gaugePosition(parsed[2]).position, 12 / 15);
  assert.equal(gaugePosition(gauge('harmony', 0)).position, 0);
  assert.equal(gaugePosition(gauge('harmony', 9)).position, 1);
});

test('invalid, absent and duplicate gauges are omitted, never fabricated as zero', () => {
  assert.equal(parseCompatibilityGauges(null, true).length, 0);
  const valid = gauge('harmony');
  for (const patch of [{ value: 'VeryHigh' }, { value: -1 }, { value: 10 }, { value: NaN }, { maxValue: Infinity },
    { maxValue: 0 }, { minValue: 10 }, { label: '' }, { isInverted: 'false' }, { key: 'unknown' }]) {
    assert.equal(parseCompatibilityGauges([{ ...valid, ...patch }], true).length, 0);
  }
  assert.equal(parseCompatibilityGauges([valid, valid], true).length, 1);
});

test('chemistry gauge, label, prose and menu all obey privacy and affirmative age gates', () => {
  for (const [hide, age1, age2] of [[true, true, true], [false, false, true], [false, true, undefined]]) {
    const data = response(); data.firstPerson.person.isSixteenOrOver = age1; data.secondPerson.person.isSixteenOrOver = age2;
    data.gauges = [gauge('harmony'), gauge('sexualChemistry', 12, 15)];
    data.labels = { sections: { sexualChemistry: { title: 'Private', navigationTitle: 'Private nav' } } };
    const parsed = parseCompatibility(data, hide);
    assert.equal(parsed.gauges.length, 1);
    assert.equal(parsed.labels.sections.sexualChemistry, undefined);
    assert.equal(compatibilityMenu(parsed).some(item => item.key === 'sexualChemistry'), false);
  }
  const data = response(); data.gauges = [gauge('sexualChemistry', 15, 15)];
  assert.equal(parseCompatibility(data, false).gauges[0].value, 15);
});

test('menu uses exact navigation/panel labels, authored subtitle and Yin/Yang HTML without interpreting flags', () => {
  const data = response();
  data.gauges = [gauge('harmony')];
  data.labels = { results: 'API results', firstPerson: 'API first', secondPerson: 'API second', sections: {
    overview: { title: 'API overview heading', navigationTitle: 'API overview nav' },
    strengthsAndChallenges: { title: 'API strengths label', navigationTitle: 'API gifts nav' },
    yinYang: { title: 'API polarity heading', navigationTitle: 'API polarity nav' },
    sexualChemistry: { title: 'NO ACCESS', navigationTitle: 'NO ACCESS' },
    birthMonth: { title: 'No navigation label' },
  } };
  data.sections = { strengthsAndChallenges: { title: 'API strengths panel', subtitle: 'API short personalised subtitle', body: '<p>Different supplied reading.</p>' } };
  data.details.gender.description = '<p>Authored <strong>Yin / Yang</strong> explanation.</p>';
  const parsed = parseCompatibility(data), menu = compatibilityMenu(parsed);
  assert.equal(menu.map(item => item.key).join(','), 'overview,strengthsAndChallenges,yinYang');
  assert.equal(menu[0].navigationTitle, 'API overview nav');
  assert.equal(menu[0].title, 'API overview heading');
  assert.equal(menu[1].title, 'API strengths panel');
  assert.equal(menu[1].subtitle, 'API short personalised subtitle');
  assert.equal(menu[1].blocks[0].text, 'Different supplied reading.');
  assert.ok(menu[2].blocks[0].spans.some(span => span.bold && span.text === 'Yin / Yang'));
  assert.equal(parsed.labels.results, 'API results');
  assert.equal(parsed.labels.firstPerson, 'API first');
  const older = parseCompatibility(response());
  assert.equal(compatibilityMenu(older).length, 0);
  assert.equal(older.overview.length > 0, true);
});

test('transformation diagrams use independent API artwork IDs and retain rich text around embedded HTML images', () => {
  const data = response();
  data.details.elements.fundamentalTransformation = { type: 'Controls', kind: 'challenging', artworkId: 'ninestar.transformations.transformation-challenging' };
  data.details.elements.characterTransformation = { type: 'Sibling', kind: 'same', artworkId: 'ninestar.transformations.transformation-same' };
  data.details.elements.fundamentalElementsTransformationDetails = '<h4>API transformation</h4><img src="https://example.test/duplicate.png"><p>After <strong>diagram</strong>.</p>';
  data.labels = { sections: {
    solarElements: { title: 'API solar heading', navigationTitle: 'API solar nav' },
    lunarElements: { title: 'API lunar heading', navigationTitle: 'API lunar nav' },
  } };
  const parsed = parseCompatibility(data), menu = compatibilityMenu(parsed);
  assert.equal(parsed.visuals.fundamental.artworkId, 'ninestar.transformations.transformation-challenging');
  assert.equal(parsed.visuals.character.artworkId, 'ninestar.transformations.transformation-same');
  assert.equal(parsed.visuals.fundamental.before[0].text, 'API transformation');
  assert.equal(parsed.visuals.fundamental.after[0].text, 'After diagram.');
  assert.ok(parsed.visuals.fundamental.after[0].spans.some(span => span.bold && span.text === 'diagram'));
  assert.equal(parsed.visuals.fundamental.after.at(-1).text, 'Core analysis.');
  assert.equal(JSON.stringify(parsed.visuals).includes('duplicate.png'), false);
  assert.equal(menu[0].diagram.artworkId, parsed.visuals.fundamental.artworkId);
  assert.equal(menu[1].diagram.artworkId, parsed.visuals.character.artworkId);
});

test('visual-only labelled sections remain available; missing visuals never fabricate an artwork choice', () => {
  const data = response(); data.details.elements = { fundamentalTransformation: { artworkId: 'ninestar.transformations.transformation-supportive' },
    characterTransformation: { type: 'Controls', kind: 'challenging' }, breakdown: [
      { key: 'supportive', label: 'API supportive', percentage: 33.333, value: 33, color: '#22BB44' },
      { key: 'sibling', label: 'API sibling', percentage: 11.111, value: 11, color: '#0074E4' },
      { key: 'challenging', label: 'API challenging', percentage: 55.556, value: 55, color: 'red' },
    ] };
  data.labels = { sections: { solarElements: { title: 'Solar', navigationTitle: 'Solar nav' },
    allElements: { title: 'All', navigationTitle: 'All nav' } } };
  const parsed = parseCompatibility(data), menu = compatibilityMenu(parsed);
  assert.equal(menu.map(item => item.key).join(','), 'solarElements,allElements');
  assert.equal(menu[1].breakdown[2].value, 55);
  assert.equal(parsed.visuals.character, null);
  const older = parseCompatibility(response());
  assert.equal(older.visuals.fundamental, null);
  assert.equal(older.visuals.character, null);
  assert.equal(older.visuals.breakdown.length, 0);
  assert.equal(older.details[0].blocks[0].text, 'Core transformation.');
});
