const assert = require('node:assert/strict');
const test = require('node:test');
const { parseCalendarMonth, calendarSelection, adjacentCalendarMonth, calendarSubscriptionUrl,
  calendarDateLabel, calendarWeekdays, validCalendarDate } = require('./load-library.cjs')({ URL })('personal-calendar');

function month(year = 2026, value = 10) {
  const prefix = `${year}-${String(value).padStart(2, '0')}-`;
  return { year, month: value, title: 'Server month title', today: `${prefix}15`,
    offset: (new Date(Date.UTC(year, value - 1, 1)).getUTCDay() + 6) % 7,
    entries: Array.from({ length: new Date(Date.UTC(year, value, 0)).getUTCDate() }, (_, index) => ({
      date: `${prefix}${String(index + 1).padStart(2, '0')}`, yearHouse: 7, monthHouse: 8, dayHouse: 4,
      afternoonDayHouse: 9, summary: 'API event summary', description: '<p>A <strong>supplied</strong> reading.</p>',
    })), help: { overview: { title: 'API calendar help', htmlBody: '<p>Introduction.</p>', culture: 'en-GB' },
      subscription: { title: 'API feed help', htmlBody: '<p>Google Calendar instructions.</p>', culture: 'en-GB' } } };
}

test('calendar month uses supplied houses, descriptions and help without recalculating cycles', () => {
  const parsed = parseCalendarMonth(month());
  assert.equal(parsed.title, 'Server month title');
  assert.equal(parsed.offset, 3);
  assert.equal(parsed.entries.length, 31);
  assert.equal(parsed.entries[0].afternoonDayHouse, 9);
  assert.ok(parsed.entries[0].blocks[0].spans.some(span => span.bold && span.text === 'supplied'));
  assert.equal(parsed.help.subscription.title, 'API feed help');
  assert.equal(calendarSelection(parsed).date, '2026-10-15');
  assert.equal(calendarSelection(parsed, '2026-10-02').day, 2);
  parsed.today = '2026-11-15';
  assert.equal(calendarSelection(parsed, '2026-09-01').day, 1);
});

test('calendar presentation preserves Dictionary labels, ISO weekday order and returned artwork IDs', () => {
  const data = month();
  data.labels = { title: 'Calendrier personnel', today: 'Aujourd’hui', copyCalendarLink: 'Copier le lien',
    weekdays: Array.from({ length: 7 }, (_, index) => ({ dayOfWeek: 7 - index, label: `Jour ${7 - index}`, shortLabel: `J${7 - index}` })) };
  Object.assign(data.entries[0], { day: 1, dateLabel: 'Date fournie', houses: 'Maisons fournies', energyName: 'Énergie fournie',
    yearHouseLabel: 'Année fournie', monthHouseLabel: 'Mois fourni', dayHouseLabel: 'Jour fourni',
    artworkId: 'api.day.artwork', yearArtworkId: 'api.year.artwork', monthArtworkId: 'api.month.artwork',
    afternoonDayHouseLabel: 'Après-midi fourni', afternoonArtworkId: 'api.afternoon.artwork' });
  const parsed = parseCalendarMonth(data);
  assert.equal(parsed.labels.copyCalendarLink, 'Copier le lien');
  assert.equal(parsed.labels.title, 'Calendrier personnel');
  assert.equal(parsed.labels.weekdays[0].dayOfWeek, 1);
  assert.equal(parsed.labels.weekdays[0].shortLabel, 'J1');
  assert.equal(parsed.entries[0].houses, 'Maisons fournies');
  assert.equal(parsed.entries[0].dateLabel, 'Date fournie');
  assert.equal(parsed.entries[0].artworkId, 'api.day.artwork');
  assert.equal(parsed.entries[0].afternoonArtworkId, 'api.afternoon.artwork');
});

test('older presentation metadata stays absent and missing afternoon does not create an image or label', () => {
  const data = month();
  Object.assign(data.entries[0], { afternoonDayHouse: null, afternoonDayHouseLabel: 'Ignore label', afternoonArtworkId: 'ignore.artwork' });
  data.labels = { today: 123, weekdays: [{ dayOfWeek: 0, label: 'Wrong numbering', shortLabel: 'X' }] };
  const parsed = parseCalendarMonth(data);
  assert.equal(parsed.labels.today, '');
  assert.equal(parsed.labels.weekdays.length, 0);
  assert.equal(parsed.entries[0].dateLabel, '');
  assert.equal(parsed.entries[0].artworkId, undefined);
  assert.equal(parsed.entries[0].afternoonArtworkId, undefined);
  assert.equal(parsed.entries[0].afternoonDayHouseLabel, '');
});

test('date-only grids retain leap days and validate complete contiguous month coverage', () => {
  assert.equal(parseCalendarMonth(month(2024, 2)).entries.length, 29);
  assert.equal(parseCalendarMonth(month(2100, 2)).entries.length, 28);
  assert.equal(validCalendarDate('2026-02-29'), false);
  assert.equal(validCalendarDate('2024-02-29'), true);
  assert.equal(validCalendarDate('2026-10-26T00:00:00Z'), false);
  for (const mutate of [data => data.entries.pop(), data => data.entries.reverse(),
    data => { data.offset = 7; }, data => { data.month = 13; },
    data => { data.entries[0].dayHouse = 10; }, data => { data.entries[0].afternoonDayHouse = 0; },
    data => { data.entries[0].date = '2026-10-00'; }]) {
    const data = month(); mutate(data);
    assert.throws(() => parseCalendarMonth(data));
  }
});

test('month navigation respects API bounds and crosses years without timezone conversion', () => {
  assert.equal(adjacentCalendarMonth(1900, 1, -1), null);
  assert.equal(adjacentCalendarMonth(2100, 12, 1), null);
  assert.deepEqual({ ...adjacentCalendarMonth(2026, 12, 1) }, { year: 2027, month: 1 });
  assert.deepEqual({ ...adjacentCalendarMonth(2026, 1, -1) }, { year: 2025, month: 12 });
  assert.equal(calendarWeekdays('en-GB')[0], 'Mon');
  assert.equal(calendarWeekdays('en-GB')[6], 'Sun');
  assert.match(calendarDateLabel('2026-10-26', 'en-GB'), /Monday.*26.*October.*2026/);
  assert.equal(calendarWeekdays('bad_culture').length, 7);
});

test('private feed URL preserves case and escaping and rejects other hosts/protocols/credentials', () => {
  const base = 'https://int.example.test/api/mobile/v1';
  const exact = 'https://int.example.test/personal-calendar/feed?token=CaseSensitive%2BExample';
  assert.equal(calendarSubscriptionUrl(exact, base), exact);
  for (const value of ['http://int.example.test/personal-calendar/feed?token=x',
    'https://evil.test/personal-calendar/feed?token=x', 'https://int.example.test/other?token=x',
    'https://user:password@int.example.test/personal-calendar/feed?token=x',
    'https://int.example.test/personal-calendar/feed', `${exact}#fragment`, null, 'invalid']) {
    assert.throws(() => calendarSubscriptionUrl(value, base));
  }
});
