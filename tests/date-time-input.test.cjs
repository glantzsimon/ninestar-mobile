const assert = require('node:assert/strict');
const test = require('node:test');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const load = require('./load-library.cjs')();
const { pickerDate, pickerValue } = load('date-time-input');

test('native date bridge preserves date-only leap days, bounds and local calendar components', () => {
  for (const value of ['1800-01-01', '1984-02-29', '2000-02-29', '2026-10-27', '2200-12-31']) {
    const date = pickerDate(value, 'date');
    assert.equal(pickerValue(date, 'date'), value);
    assert.equal(date.getHours(), 12);
  }
  for (const value of ['', '1900-02-29', '2026-02-30', '1799-01-01', '2201-01-01', '2026-13-01']) {
    assert.equal(pickerValue(pickerDate(value, 'date', new Date(2026, 9, 27)), 'date'), '2026-10-27');
  }
});

test('time bridge retains local hours/minutes independently of current-day DST, and accepts server seconds', () => {
  for (const value of ['00:00', '02:30', '12:34:56', '23:59:59.1234567']) {
    const date = pickerDate(value, 'time', new Date(2026, 2, 29));
    assert.equal(pickerValue(date, 'time'), value.slice(0, 5));
    assert.equal(date.getFullYear(), 2000);
    assert.equal(date.getMonth(), 0);
    assert.equal(date.getDate(), 15);
  }
  assert.equal(pickerValue(pickerDate('24:00', 'time'), 'time'), '00:00');
});

test('picker round trips do not shift date/time in eastern or western device zones', () => {
  const loader = path.join(__dirname, 'load-library.cjs');
  const script = `const {pickerDate,pickerValue}=require(${JSON.stringify(loader)})()('date-time-input');
    for(const [value,mode] of [['1984-02-29','date'],['2026-03-29','date'],['00:00','time'],['02:30','time'],['23:59','time']]){
      if(pickerValue(pickerDate(value,mode),mode)!==value)process.exit(1);
    }`;
  for (const TZ of ['Europe/London', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney']) {
    const result = spawnSync(process.execPath, ['-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(result.status, 0, `${TZ}: ${result.stderr}`);
  }
});
