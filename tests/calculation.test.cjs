const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { calculationDraft, buildCalculation, calculationVisibility } = load('calculation');
const { FieldValidationError } = load('field-validation');
const option = (value) => ({ value, label: value });
const options = {
  genders: [option('Female')], timezones: [option('Europe/London'), option('Tokyo Standard Time')],
  calculationMethods: [option('Chinese')], calculatorTypes: [option('Advanced')],
  houseDisplays: [option('SolarHouse')],
};
const saved = () => ({ birthDate: '1984-02-29', calculation: {
  person: { name: ' Test Person ', dateOfBirth: '1984-02-29T00:00:00', timeOfBirth: '00:00:00',
    timeOfBirthKnown: true, gender: 'Female', birthTimeZoneId: 'Tokyo Standard Time' },
  userTimeZoneId: 'Europe/London', calculationMethod: 'Chinese', calculatorType: 'Advanced',
  housesDisplay: 'SolarHouse', invertDailyAndHourlyKiForSouthernHemisphere: true,
  invertDailyAndHourlyCycleKiForSouthernHemisphere: false,
} });
const initial = (account = saved(), genders = options.genders, today = new Date(2026, 9, 25), random = () => 0) =>
  calculationDraft(account, genders, today, random);

test('calculator validation identifies each input including a partially specified prediction date/time', () => {
  for (const [field, value] of [['name', 'a'.repeat(201)], ['dateOfBirth', '1900-02-29'], ['timeOfBirthKnown', ''],
    ['timeOfBirth', '24:00'], ['gender', ''], ['birthTimeZoneId', ''], ['userTimeZoneId', ''],
    ['calculationMethod', ''], ['housesDisplay', ''], ['invertNatal', ''], ['invertCycles', '']]) {
    assert.throws(() => buildCalculation({ ...initial(), [field]: value }, options),
      error => error instanceof FieldValidationError && error.field === field);
  }
  assert.throws(() => buildCalculation({ ...initial(), selectedTime: '12:00' }, options, true), error => error.field === 'selectedDate');
  assert.throws(() => buildCalculation({ ...initial(), selectedDate: '2026-10-27' }, options, true), error => error.field === 'selectedTime');
});

test('first use does not copy account personal details; uses local today minus 22 calendar years', () => {
  const account = saved();
  const draft = initial(account);
  const body = buildCalculation(draft, options);
  assert.equal(draft.name, '');
  assert.equal(body.person.name, '');
  assert.equal(body.person.dateOfBirth, '2004-10-25');
  assert.equal(draft.timeOfBirth, '00:00');
  assert.equal(body.person.timeOfBirth, '00:00:00');
  assert.equal(body.person.timeOfBirthKnown, false);
  assert.equal(body.person.birthTimeZoneId, 'Europe/London');
  assert.equal(body.userTimeZoneId, 'Europe/London');
  assert.equal(body.invertDailyAndHourlyKiForSouthernHemisphere, true);
  assert.equal(body.invertDailyAndHourlyCycleKiForSouthernHemisphere, false);
  assert.equal(body.selectedDateTime, null);
  assert.equal(body.settings, undefined);
  assert.equal(body.userId, undefined);
  draft.name = 'Another Person';
  assert.equal(account.calculation.person.name, ' Test Person ');
});

test('leap-day defaults clamp to February 28 and gender uses metadata choices randomly', () => {
  const genders = [option('Female'), option('Male'), option('Other')];
  const draft = initial(saved(), genders, new Date(2024, 1, 29), () => 0.5);
  assert.equal(draft.dateOfBirth, '2002-02-28');
  assert.equal(draft.gender, 'Male');
  assert.equal(initial(saved(), genders, new Date(2026, 0, 1), () => 0.99).gender, 'Other');
  assert.equal(initial(saved(), []).gender, '');
});

test('unknown time allows blank; midnight remains a known time when selected', () => {
  const draft = initial();
  draft.timeOfBirthKnown = 'true';
  draft.timeOfBirth = '';
  assert.throws(() => buildCalculation(draft, options));
  draft.timeOfBirthKnown = 'false';
  assert.equal(buildCalculation(draft, options).person.timeOfBirth, '00:00:00');
  draft.timeOfBirth = '12:34';
  assert.equal(buildCalculation(draft, options).person.timeOfBirth, '12:34:00');
});

test('calculator rejects nonexistent dates, times, zones and unsupported preferences', () => {
  const draft = initial();
  for (const [key, values] of Object.entries({ dateOfBirth: ['1900-02-29', '1984-04-31', '1799-12-31', '2201-01-01', '1984-02-29T00:00:00Z'],
    timeOfBirth: ['24:00', '09:60', '12:00Z'], birthTimeZoneId: ['Made-up Zone'], userTimeZoneId: [''],
    gender: ['Unknown'], calculationMethod: ['Unsupported'], housesDisplay: [''],
    invertNatal: [''], invertCycles: [''], timeOfBirthKnown: [''], name: ['x'.repeat(201)] })) {
    for (const value of values) assert.throws(() => buildCalculation({ ...draft, [key]: value }, options), `${key}: ${value}`);
  }
});

test('missing server preferences remain unselected, never defaulted or inferred', () => {
  const draft = initial({ birthDate: '0001-01-01', gender: 'Female' });
  assert.equal(draft.dateOfBirth, '2004-10-25');
  assert.equal(draft.calculationMethod, '');
  assert.equal(draft.timeOfBirthKnown, 'false');
  assert.equal(draft.invertCycles, '');
  assert.throws(() => buildCalculation(draft, options));
});

test('future selected-date extension sends a local timestamp with no UTC suffix', () => {
  const draft = { ...initial(), selectedDate: '2028-02-29', selectedTime: '14:30' };
  assert.equal(buildCalculation(draft, options, true).selectedDateTime, '2028-02-29T14:30:00');
  for (const selectedDate of ['2027-02-29', '2028-02-29Z']) {
    assert.throws(() => buildCalculation({ ...draft, selectedDate }, options, true));
  }
  assert.throws(() => buildCalculation({ ...draft, selectedTime: '' }, options, true));
});

test('mobile always uses Advanced visibility while preserving time and method-dependent inputs', () => {
  const draft = { ...initial(), calculatorType: 'Simple', calculationMethod: 'Traditional',
    timeOfBirthKnown: 'false', timeOfBirth: '12:34', invertNatal: 'true' };
  const before = JSON.stringify(draft);
  let visible = calculationVisibility(draft);
  assert.equal(visible.gender, false);
  assert.equal(visible.birthTime, false);
  assert.equal(visible.natalHemisphere, true);
  assert.equal(visible.predictionSettings, false);
  assert.equal(JSON.stringify(draft), before);
  visible = calculationVisibility({ ...draft, calculatorType: 'Advanced', timeOfBirthKnown: 'true' });
  assert.equal(visible.gender, false);
  assert.equal(visible.birthTime, true);
  assert.equal(visible.natalHemisphere, true);
  assert.equal(visible.cycleHemisphere, false);
  assert.equal(calculationVisibility({ ...draft, calculatorType: 'Advanced', calculationMethod: 'Chinese' }).gender, true);
  assert.equal(calculationVisibility({ ...draft, calculatorType: 'Localized display wording' }).gender, false);
});

test('prediction date and options apply even to remembered website Simple-mode drafts', () => {
  const draft = { ...initial(), selectedDate: '2028-02-29', selectedTime: '14:30' };
  const choices = { ...options, calculatorTypes: [option('Simple'), option('Advanced')] };
  let visible = calculationVisibility(draft, true);
  assert.equal(visible.predictionSettings, true);
  assert.equal(visible.cycleHemisphere, true);
  assert.equal(visible.natalHemisphere, false);
  assert.equal(buildCalculation(draft, choices, true).selectedDateTime, '2028-02-29T14:30:00');
  draft.calculatorType = 'Simple';
  visible = calculationVisibility(draft, true);
  assert.equal(visible.predictionSettings, true);
  assert.equal(buildCalculation(draft, choices, true).selectedDateTime, '2028-02-29T14:30:00');
  assert.equal(buildCalculation(draft, choices, true).calculatorType, 'Advanced');
  assert.equal(buildCalculation({ ...draft, selectedDate: '', selectedTime: '' }, choices, true).selectedDateTime, null);
  draft.calculatorType = 'Advanced';
  assert.equal(buildCalculation(draft, choices, true).selectedDateTime, '2028-02-29T14:30:00');
  assert.equal(draft.timeOfBirth, '00:00');
  assert.equal(draft.birthTimeZoneId, 'Europe/London');
});

test('predictions default to server current time; a custom local date requires both fields', () => {
  const draft = initial();
  const original = JSON.stringify(draft);
  const body = buildCalculation(draft, options, true);
  assert.equal(body.selectedDateTime, null);
  assert.equal(body.userTimeZoneId, 'Europe/London');
  assert.equal(body.calculatorType, 'Advanced');
  assert.equal(JSON.stringify(draft), original);
  assert.throws(() => buildCalculation({ ...draft, selectedDate: '2028-02-29' }, options, true));
  assert.throws(() => buildCalculation({ ...draft, selectedTime: '12:34' }, options, true));
  assert.equal(buildCalculation({ ...draft, selectedDate: '2028-02-29', selectedTime: '12:34' }, options, true)
    .selectedDateTime, '2028-02-29T12:34:00');
});

test('hidden inputs retain API validation and are not erased or inferred from visibility', () => {
  const draft = { ...initial(), calculatorType: 'Simple', timeOfBirthKnown: 'false' };
  const choices = { ...options, calculatorTypes: [option('Simple'), option('Advanced')] };
  const body = buildCalculation(draft, choices);
  assert.equal(body.person.birthTimeZoneId, draft.birthTimeZoneId);
  assert.equal(body.invertDailyAndHourlyKiForSouthernHemisphere, true);
  assert.equal(body.calculatorType, 'Advanced');
  assert.equal(body.selectedDateTime, null);
  assert.throws(() => buildCalculation(draft, { ...choices, calculatorTypes: [option('Simple')] }));
  assert.throws(() => buildCalculation({ ...draft, birthTimeZoneId: '' }, choices));
  assert.throws(() => buildCalculation({ ...draft, userTimeZoneId: '' }, choices));
});
