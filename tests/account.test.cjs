const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/account.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsForTest = {};
vm.runInNewContext(compiled, { exports: exportsForTest });
const { accountDraft, accountOptions, buildAccountUpdate } = exportsForTest;
const option = (value) => ({ value, label: value });
const options = {
  genders: [option('Female')], timezones: [option('Europe/London'), option('Tokyo Standard Time')],
  calculationMethods: [option('Chinese')], calculatorTypes: [option('Advanced')],
  houseDisplays: [option('SolarHouse')],
};
function savedAccount() {
  return {
    firstName: 'Test', lastName: 'Person', emailAddress: 'test@example.test', phoneNumber: '',
    birthDate: '1984-02-29', gender: 'Female', allowMarketingEmails: true,
    birthDetails: { timeOfBirth: '00:00:00', birthTimeZoneId: 'Tokyo Standard Time' },
    calculation: {
      person: { timeOfBirth: '00:00:00', timeOfBirthKnown: true, birthTimeZoneId: 'Tokyo Standard Time' },
      userTimeZoneId: 'Europe/London', calculationMethod: 'Chinese', calculatorType: 'Advanced',
      housesDisplay: 'SolarHouse', invertDailyAndHourlyKiForSouthernHemisphere: true,
      invertDailyAndHourlyCycleKiForSouthernHemisphere: false,
    },
  };
}

test('round trip preserves real midnight, independent zones, preferences and marketing choice', () => {
  const update = buildAccountUpdate(accountDraft(savedAccount()), options);
  assert.equal(update.settings.person.dateOfBirth, '1984-02-29');
  assert.equal(update.settings.person.timeOfBirth, '00:00:00');
  assert.equal(update.settings.person.timeOfBirthKnown, true);
  assert.equal(update.settings.person.birthTimeZoneId, 'Tokyo Standard Time');
  assert.equal(update.settings.userTimeZoneId, 'Europe/London');
  assert.equal(update.settings.calculatorType, 'Advanced');
  assert.equal(update.settings.invertDailyAndHourlyKiForSouthernHemisphere, true);
  assert.equal(update.settings.invertDailyAndHourlyCycleKiForSouthernHemisphere, false);
  assert.equal(update.allowMarketingEmails, true);
  assert.equal(update.settings.selectedDateTime, null);
  assert.equal(update.userId, undefined);
  assert.equal(update.membership, undefined);
});

test('missing calculation data remains explicit rather than inventing preferences', () => {
  const account = savedAccount();
  account.calculation = null;
  account.birthDate = '0001-01-01';
  const draft = accountDraft(account);
  assert.equal(draft.dateOfBirth, '');
  assert.equal(draft.birthTimeZoneId, 'Tokyo Standard Time');
  assert.equal(draft.timeOfBirthKnown, '');
  assert.equal(draft.calculatorType, '');
  assert.equal(draft.invertNatal, '');
  assert.throws(() => buildAccountUpdate(draft, options));
});

test('invalid dates fail without timezone conversion; valid date-only stays unchanged', () => {
  const draft = accountDraft(savedAccount());
  for (const dateOfBirth of ['1983-02-29', '1984-02-30', '2020-13-01', '1984-02-29T00:00:00Z']) {
    assert.throws(() => buildAccountUpdate({ ...draft, dateOfBirth }, options));
  }
  assert.equal(buildAccountUpdate(draft, options).settings.person.dateOfBirth, '1984-02-29');
});

test('birth time converts HH:mm once and retains seconds or fractional seconds', () => {
  const draft = accountDraft(savedAccount());
  assert.equal(buildAccountUpdate({ ...draft, timeOfBirth: '14:35' }, options).settings.person.timeOfBirth, '14:35:00');
  assert.equal(buildAccountUpdate({ ...draft, timeOfBirth: '14:35:12.123' }, options).settings.person.timeOfBirth, '14:35:12.123');
  assert.throws(() => buildAccountUpdate({ ...draft, timeOfBirth: '24:00' }, options));
  assert.throws(() => buildAccountUpdate({ ...draft, timeOfBirth: '' }, options));
  const unknown = buildAccountUpdate({ ...draft, timeOfBirth: '', timeOfBirthKnown: 'false' }, options);
  assert.equal(unknown.settings.person.timeOfBirth, '00:00:00');
  assert.equal(unknown.settings.person.timeOfBirthKnown, false);
});

test('option values must match metadata; saved aliases can be retained', () => {
  const draft = accountDraft(savedAccount());
  assert.throws(() => buildAccountUpdate({ ...draft, gender: 'invented' }, options));
  assert.throws(() => buildAccountUpdate({ ...draft, userTimeZoneId: 'Not/AZone' }, options));
  const metadata = {
    genders: [{ value: 'Female', label: 'Female', number: 2 }],
    calculationMethods: [{ value: 'Chinese', label: 'Chinese' }],
    calculatorTypes: [{ value: 'Advanced', label: 'Advanced' }],
    houseDisplays: [{ value: 'SolarHouse', label: 'Solar house' }],
  };
  const choices = accountOptions(metadata, options.timezones);
  assert.equal(choices.genders[0].value, 'Female');
  assert.equal(buildAccountUpdate(draft, choices).settings.person.gender, 'Female');
});
