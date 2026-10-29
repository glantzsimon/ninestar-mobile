const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { ownPlannerCalculation, plannerRequest, plannerPeriodAnchor, plannerViewOptions, parsePlannerOverview,
  rememberCalendarPage, backCalendarPage, calendarPageUp, localPlannerDate, plannerItemAnchor, plannerRangeLabel } = load('calendar-planner');

const cycle = number => ({ energy: { number, name: 'API energy', artworkId: `api.energy.${number}` },
  houseName: 'API House', cycleDescriptiveName: 'API cycle title', description: '<p>API reading <strong>emphasis</strong>.</p>' });
const fixture = () => ({ view: 'Year', display: 'PersonalKi', selectedDateTime: '2026-10-29T12:00:00',
  periodStartsOn: '2026-02-04T07:20:00', periodEndsOn: '2027-02-04T09:10:00', childView: 'Month', nextViewUp: 'NineYear',
  energy: cycle(7), secondEnergy: cycle(8), combined: { description: '<h3>API combined</h3><p>Combined parent.</p>' },
  items: [
    { energyStartsOn: '2026-02-04T07:20:00', energyEndsOn: '2026-03-06T05:11:00', isActive: false, childView: 'Month',
      energy: cycle(2), secondEnergy: cycle(3), combined: { description: '<p>API child combined.</p>' } },
    { energyStartsOn: '2026-03-06T05:11:00', energyEndsOn: '2026-04-05T10:05:00', isActive: true, childView: 'Month', energy: cycle(4) },
  ] });
const account = () => ({ emailAddress: 'unused-account-marker', calculation: {
  person: { name: 'API person', dateOfBirth: '1984-02-29T00:00:00', timeOfBirth: '06:07:00', timeOfBirthKnown: true,
    gender: 'Female', birthTimeZoneId: 'Tokyo Standard Time', ignored: 'DO_NOT_COPY' },
  selectedDateTime: '2020-01-01T00:00:00', userTimeZoneId: 'Europe/London', calculationMethod: 'Traditional',
  calculatorType: 'Simple', housesDisplay: 'SolarHouse', invertDailyAndHourlyKiForSouthernHemisphere: true,
  invertDailyAndHourlyCycleKiForSouthernHemisphere: false, ignored: 'DO_NOT_COPY' } });

test('planner reuses saved calculation fields and calculator type, without adding birth time twice', () => {
  const context = ownPlannerCalculation(account());
  assert.equal(context.person.dateOfBirth, '1984-02-29');
  assert.equal(context.person.timeOfBirth, '06:07:00');
  assert.equal(context.person.birthTimeZoneId, 'Tokyo Standard Time');
  assert.equal(context.userTimeZoneId, 'Europe/London');
  assert.equal(context.calculatorType, 'Simple');
  const advanced = account(); advanced.calculation.calculatorType = 'Advanced';
  assert.equal(ownPlannerCalculation(advanced).calculatorType, 'Advanced');
  assert.equal(context.calculationMethod, 'Traditional');
  assert.equal(context.invertDailyAndHourlyKiForSouthernHemisphere, true);
  assert.equal(context.invertDailyAndHourlyCycleKiForSouthernHemisphere, false);
  assert.equal(JSON.stringify(context).includes('DO_NOT_COPY'), false);
  for (const direction of ['None', 'Back', 'Forward']) {
    const body = plannerRequest(context, 'NineYear', '2026-10-29T12:00:00', direction);
    assert.equal(body.selectedDateTime, '2026-10-29T12:00:00');
    assert.equal(body.navigationDirection, direction);
    assert.equal(body.display, 'PersonalKi');
    assert.equal(body.includeMoonPhases, false);
  }
  assert.throws(() => ownPlannerCalculation({ calculation: {} }));
  assert.throws(() => plannerRequest(context, 'Year', '2026-10-29T12:00:00Z'));
  assert.throws(() => plannerRequest(context, 'Month', '2026-10-29T12:00:00'));
  assert.throws(() => plannerRequest(context, 'Year', '2300-01-01T12:00:00'));
});

test('safe local anchors preserve interior selections and use actual solar boundaries rather than January', () => {
  const start = '2026-02-04T07:20:00', end = '2026-03-06T05:11:00';
  assert.equal(plannerPeriodAnchor(start, end, '2026-02-17T12:00:00'), '2026-02-17T12:00:00');
  const anchor = plannerPeriodAnchor(start, end, '2026-01-01T12:00:00');
  assert.ok(anchor > start && anchor < end);
  assert.ok(anchor.startsWith('2026-02-'));
  assert.equal(/[Z+]/.test(anchor), false);
  const item = parsePlannerOverview(fixture(), 'Year').items[0];
  const day = plannerItemAnchor(item, '2026-10-29');
  assert.equal(day.slice(0, 7), '2026-02'); // Gregorian month containing the safe selected date.
  assert.equal(localPlannerDate('2024-02-29'), '2024-02-29T12:00:00');
  assert.throws(() => localPlannerDate('2026-02-29'));
});

test('offset-bearing bounds yield a new civil noon strictly interior across extreme zones and DST', () => {
  const start = '2026-03-08T07:00:00Z', end = '2026-04-05T09:00:00Z';
  const result = plannerPeriodAnchor(start, end);
  assert.match(result, /^2026-\d\d-\d\dT12:00:00$/);
  for (const offset of ['-12:00', '+14:00', '-04:00', '+01:00']) {
    const instant = Date.parse(result + offset);
    assert.ok(instant > Date.parse(start) && instant < Date.parse(end));
  }
  assert.equal(plannerRangeLabel(start, end, 'en-GB', 'Windows Alias Unknown'), `${start} – ${end}`);
  assert.throws(() => plannerPeriodAnchor(start, '2026-04-05T09:00:00'));
  assert.throws(() => plannerPeriodAnchor(start, '2026-03-08T08:00:00Z'));
  assert.throws(() => plannerPeriodAnchor('2026-02-30T00:00:00', end));
});

test('planner parsing retains server boundaries, split energies, combined HTML and navigation at every overview', () => {
  const raw = fixture(), before = JSON.stringify(raw);
  const parsed = parsePlannerOverview(raw, 'Year');
  assert.equal(parsed.startsOn, raw.periodStartsOn);
  assert.equal(parsed.endsOn, raw.periodEndsOn);
  assert.equal(parsed.anchor, raw.selectedDateTime);
  assert.equal(parsed.items[0].secondEnergy.energy.number, 3);
  assert.equal(parsed.items[0].energy.energy.artworkId, 'api.energy.2');
  assert.equal(parsed.items[0].blocks[0].text, 'API child combined.');
  assert.equal(parsed.blocks[0].kind, 'heading');
  assert.equal(parsed.items[1].active, true);
  assert.equal(JSON.stringify(raw), before);
  for (const [view, child, upper] of [['NineYear', 'Year', 'EightyOneYear'], ['EightyOneYear', 'NineYear', 'EightyOneYear']]) {
    const next = fixture(); next.view = view; next.childView = child; next.nextViewUp = upper;
    next.items = next.items.map(item => ({ ...item, childView: child }));
    assert.equal(parsePlannerOverview(next, view).childView, child);
  }
  for (const patch of [{ view: 'Month' }, { nextViewUp: 'Year' }, { childView: 'Day' }, { items: [] },
    { energy: { energy: { number: 10 } } }, { display: 'GlobalKi' }]) {
    assert.throws(() => parsePlannerOverview({ ...fixture(), ...patch }, 'Year'));
  }
});

test('metadata view labels remain exact and absent labels are never manufactured from identifiers', () => {
  const result = plannerViewOptions([{ value: 'Year', label: 'ANNÉE' }, { value: 'Year', label: 'duplicate' },
    { value: 'Month', label: '' }, { value: 'Day', label: 'unsupported' }, { value: 'NineYear', label: 'Nine-year API caption' }]);
  assert.equal(result.length, 2);
  assert.equal(result[0].label, 'ANNÉE');
  assert.equal(result[1].value, 'NineYear');
});

test('Back restores cached views and their exact selected days without touching prior snapshots', () => {
  const month = { kind: 'Month', calendar: { year: 2026, month: 10 }, selectedDate: '2026-10-29' };
  const year = { kind: 'Year', planner: parsePlannerOverview(fixture(), 'Year'), selectedDate: month.selectedDate };
  let state = { current: null, previous: [] };
  state = rememberCalendarPage(state, month);
  state = rememberCalendarPage(state, year);
  state = rememberCalendarPage(state, { ...year, kind: 'NineYear', selectedDate: '2027-03-08' });
  state = backCalendarPage(state);
  assert.equal(state.current, year);
  assert.equal(state.current.selectedDate, '2026-10-29');
  state = backCalendarPage(state);
  assert.equal(state.current, month);
  assert.equal(calendarPageUp(month), 'Year');
  assert.equal(calendarPageUp(year), 'NineYear');
  assert.equal(calendarPageUp({ kind: 'EightyOneYear' }), null);
  assert.equal(backCalendarPage(state), state);
  for (let i = 0; i < 40; i++) state = rememberCalendarPage(state, year);
  assert.equal(state.previous.length, 24);
});

test('month drilling honours the existing Gregorian API range without hiding server overview items', () => {
  const item = parsePlannerOverview(fixture(), 'Year').items[0];
  const future = { ...item, startsOn: '2101-02-04T00:00:00', endsOn: '2101-03-06T00:00:00' };
  assert.equal(plannerItemAnchor(future, '2026-10-29'), null);
  assert.ok(plannerItemAnchor({ ...future, childView: 'Year' }, '2026-10-29'));
});
