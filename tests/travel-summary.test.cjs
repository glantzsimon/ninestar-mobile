const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parseTravelSummary } = load('travel-summary');
const { parsePredictionControls } = load('prediction-controls');
const { parsePredictions } = load('predictions');
const direction = (label = 'API North') => ({ key: 'North', label, displayDirection: 'South', endX: 0.5, endY: 1, isCentre: false });
const summary = () => ({ title: 'API directions summary', periods: ['year', 'month', 'day'],
  instructions: '<p>API <strong>instructions</strong>.</p>', labels: { direction: 'API direction', score: 'API score', guidance: 'API guidance' },
  rows: [{ score: 10, severity: 'red-warning', color: '#cc0000', showWarning: true,
    guidance: '<p>API <strong>resolved</strong> guidance.</p>', directions: [direction(), direction('API other label')] },
  { score: 0, severity: 'green', color: '#90ee90', showWarning: false, guidance: 'API zero-score guidance', directions: [direction()] }] });
const controls = { display: 'Affichage API', advancedOptions: 'Options API', directionology: 'Directionologie API', showDirections: 'Flèches API' };
const options = [{ value: 'Graphical', number: 0, label: 'Images API' }, { value: 'MagicSquare', number: 1, label: 'Carré API' }];

test('three-period travel summary preserves API ordering, endpoints, scores, warnings, colours and HTML', () => {
  const data = summary(), before = JSON.stringify(data), parsed = parseTravelSummary(data, 'full');
  assert.equal(parsed.title, 'API directions summary');
  assert.equal(parsed.labels.guidance, 'API guidance');
  assert.equal(parsed.rows.map(row => row.score).join(','), '10,0');
  assert.equal(parsed.rows[0].directions.length, 2);
  assert.equal(parsed.rows[0].directions[0].endY, 1);
  assert.equal(parsed.rows[0].color, '#cc0000');
  assert.equal(parsed.rows[0].showWarning, true);
  assert.equal(parsed.rows[1].guidance[0].text, 'API zero-score guidance');
  assert.ok(parsed.rows[0].guidance[0].spans.some(span => span.bold && span.text === 'resolved'));
  assert.equal(JSON.stringify(data), before);
});

test('hourly, unspecified or duplicate summary periods are rejected rather than rescored', () => {
  for (const periods of [undefined, [], ['year', 'month', 'day', 'hour'], ['year', 'month', 'hour'], ['year', 'year', 'day']])
    assert.equal(parseTravelSummary({ ...summary(), periods }, 'full'), null);
  assert.ok(parseTravelSummary({ ...summary(), periods: ['day', 'year', 'month'] }, 'full'));
  assert.equal(parseTravelSummary(summary(), 'free'), null);
});

test('malformed summary groups fail as a whole, without silently dropping a dangerous direction', () => {
  for (const change of [row => { row.score = NaN; }, row => { row.score = -1; }, row => { row.color = 'url(bad)'; },
    row => { row.directions[0].endY = 2; }, row => { row.guidance = ''; }, row => { row.showWarning = 'true'; }]) {
    const data = summary(); change(data.rows[0]); assert.equal(parseTravelSummary(data, 'full'), null);
  }
  assert.equal(parseTravelSummary({ ...summary(), labels: {} }, 'full'), null);
  assert.equal(parseTravelSummary({ ...summary(), rows: [] }, 'full'), null);
});

test('both documented label sources retain API translations and protocol values without key-derived labels', () => {
  const reading = parsePredictionControls({ controls, displayOptions: options });
  const metadata = parsePredictionControls({ predictionControls: controls, energyDisplays: options }, 'metadata');
  assert.equal(JSON.stringify(reading), JSON.stringify(metadata));
  assert.equal(reading.controls.directionology, 'Directionologie API');
  assert.equal(reading.displayOptions[0].label, 'Images API');
  assert.equal(reading.displayOptions[1].value, 'MagicSquare');
  const older = parsePredictionControls({ displayOptions: [{ value: 'Graphical' }, { value: 'Unknown', label: 'Unknown API' }] });
  assert.equal(older.displayOptions.length, 0);
  assert.equal(older.controls.directionology, '');
});

test('display labels on free or restricted Predictions never grant square or summary access', () => {
  const labels = { controls, displayOptions: options };
  const free = parsePredictions({ labels, year: { number: 1 }, magicSquares: {}, travelSummary: summary() }, 'free');
  assert.equal(free.labels.controls.directionology, controls.directionology);
  assert.equal(free.magicSquares, null);
  assert.equal(free.travelSummary, null);
  const older = parsePredictions({ personal: { year: { energy: { number: 1 } } }, labels }, 'full');
  assert.equal(older.travelSummary, null);
  assert.equal(older.magicSquares, null);
  const full = parsePredictions({ personal: { year: { energy: { number: 1 } } }, labels, travelSummary: summary() }, 'full');
  assert.equal(full.travelSummary.rows[0].score, 10);
});
