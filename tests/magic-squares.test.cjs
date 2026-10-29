const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parseMagicSquare, parseMagicSquares, squareArrowGeometry } = load('magic-squares');
const { createEnergyDisplay } = load('energy-display');
const { parsePredictions } = load('predictions');
const houses = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const numbers = [1, 6, 8, 9, 2, 4, 5, 7, 3];
const direction = (patch = {}) => ({ key: 'North', label: 'API North', displayDirection: 'South', endX: 0.5, endY: 1, isCentre: false, ...patch });
const square = (patch = {}) => ({ title: 'API Yearly Ki', houseName: 'API house label', secondaryHouseName: '',
  globalNumber: 2, personalHouse: 4, isGlobal: false, isSplit: false, isDualView: false, showDirections: true,
  artworkId: 'server.magic-square-plate', cells: houses.map((house, index) => ({ row: Math.floor(index / 3), column: index % 3,
    house, number: numbers[index], color: '#ffffff', isActive: house === 4, isLunarActive: false })),
  arrows: [{ key: 'self-life-killing', title: 'API arrow title', color: '#ff0000', score: 5,
    description: '<p>API <strong>resolved</strong> direction description.</p>', direction: direction() }], secondary: null, ...patch });

test('server cells, highlights and colours are preserved without deriving numbers or active houses', () => {
  const raw = square(), before = JSON.stringify(raw), parsed = parseMagicSquare(raw);
  assert.equal(parsed.cells.map(cell => cell.number).join(','), '1,6,8,9,2,4,5,7,3');
  assert.equal(parsed.cells[0].isActive, true);
  assert.equal(parsed.cells[0].number, 1); // Occupied house is 4, not displayed number 4.
  assert.equal(parsed.cells[4].number, 2);
  assert.equal(parsed.artworkId, 'server.magic-square-plate');
  assert.ok(parsed.arrows[0].blocks[0].spans.some(span => span.bold && span.text === 'resolved'));
  assert.equal(JSON.stringify(raw), before);
});

test('south-up endpoints are used directly, independent of compass keys or display-side names', () => {
  const north = squareArrowGeometry(direction());
  assert.equal(north.endX, 50); assert.equal(north.endY, 100);
  const east = squareArrowGeometry(direction({ key: 'East', endX: 0, endY: 0.5 }));
  assert.equal(east.endX, 0); assert.equal(east.endY, 50);
  const custom = squareArrowGeometry(direction({ key: 'South', displayDirection: 'Ignored', endX: 0.25, endY: 0.75 }));
  assert.equal(custom.endX, 25); assert.equal(custom.endY, 75);
  assert.equal(squareArrowGeometry(direction({ isCentre: true, endX: 0.5, endY: 0.5 })).ring, true);
});

test('dual highlights share one grid while split days preserve an independently supplied secondary grid', () => {
  const raw = square({ isDualView: true, secondaryHouseName: 'API lunar house', secondary: square() });
  raw.cells[1].isLunarActive = true;
  const dual = parseMagicSquare(raw);
  assert.equal(dual.cells[1].isLunarActive, true);
  assert.equal(dual.secondary, null);
  const split = parseMagicSquare(square({ isSplit: true, secondaryHouseName: 'API afternoon',
    secondary: square({ title: 'API afternoon', globalNumber: 8 }) }));
  assert.equal(split.secondary.globalNumber, 8);
  assert.equal(split.secondary.title, 'API afternoon');
  assert.equal(parseMagicSquare(square({ isSplit: true })), null);
});

test('overlapping arrows remain separate; global and explicitly disabled arrows are hidden', () => {
  const raw = square(); raw.arrows.push({ ...raw.arrows[0], key: 'target-killing', color: '#0000ff' });
  assert.equal(parseMagicSquare(raw).arrows.length, 2);
  assert.equal(parseMagicSquare({ ...raw, isGlobal: true }).arrows.length, 0);
  assert.equal(parseMagicSquare({ ...raw, showDirections: false }).arrows.length, 0);
});

test('malformed grids and invalid endpoints fail safely instead of inventing missing values', () => {
  for (const patch of [{ title: '' }, { globalNumber: 10 }, { personalHouse: 0 }, { cells: [] }])
    assert.equal(parseMagicSquare(square(patch)), null);
  const duplicate = square(); duplicate.cells[1] = { ...duplicate.cells[0] };
  assert.equal(parseMagicSquare(duplicate), null);
  const badDirection = square(); badDirection.arrows[0].direction.endX = NaN;
  assert.equal(parseMagicSquare(badDirection).arrows.length, 0);
  const badColor = square(); badColor.cells[0].color = 'url(untrusted)';
  assert.equal(parseMagicSquare(badColor), null);
});

test('full-only parsing retains available periods and ignores unexpected free-response payloads', () => {
  const data = { personal: { year: square(), hour: square(), unknown: square() }, global: { year: square({ isGlobal: true }) } };
  const parsed = parseMagicSquares(data, 'full');
  assert.equal(Object.keys(parsed.personal).join(','), 'year,hour');
  assert.equal(parsed.global.year.isGlobal, true);
  assert.equal(parseMagicSquares(data, 'free'), null);
  assert.equal(parseMagicSquares(null, 'full'), null);
  assert.equal(parseMagicSquares({ personal: { year: {} } }, 'full'), null);
});

test('Predictions stays usable on old/restricted servers; hourly travelSummary is not treated as three-period guidance', () => {
  const cycle = { energy: { number: 2 }, description: '<p>Existing reading.</p>' };
  const old = parsePredictions({ personal: { year: cycle } }, 'full');
  assert.equal(old.magicSquares, null);
  assert.equal(old.scopes.personal.year.energy.number, 2);
  const next = parsePredictions({ personal: { year: cycle }, magicSquares: { personal: { year: square() } },
    travelSummary: { title: 'Four-period summary', rows: [{ score: 11 }] } }, 'full');
  assert.ok(next.magicSquares.personal.year);
  assert.equal(next.travelSummary, null); // Missing three-period evidence: deliberately not displayed.
  const free = parsePredictions({ year: { number: 2 }, magicSquares: { personal: { year: square() } } }, 'free');
  assert.equal(free.magicSquares, null);
});

test('display choice shares only a session presentation value and reset restores Graphical', () => {
  const store = createEnergyDisplay(); let calls = 0;
  const unsubscribe = store.subscribe(() => calls++);
  assert.equal(store.get(), 'Graphical');
  store.set('MagicSquare'); assert.equal(store.get(), 'MagicSquare'); assert.equal(calls, 1);
  store.set('MagicSquare'); store.set('invalid'); assert.equal(calls, 1);
  store.reset(); assert.equal(store.get(), 'Graphical'); assert.equal(calls, 2);
  unsubscribe(); store.set('MagicSquare'); assert.equal(calls, 2);
});
