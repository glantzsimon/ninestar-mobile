const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')();
const { parseContextualHelp, helpPreview } = load('contextual-help');
const { parsePersonalChart } = load('personal-chart');
const { selectChartDetail } = load('chart-sections');
const introduction = { title: 'Constitution', culture: 'en-GB',
  htmlBody: '<h5>Our Core Energy</h5><p>The <strong>foundation</strong> of our adult self.</p><p>More explanation.</p>' };
test('free chart help is separate from personal content and does not grant missing readings', () => {
  const chart = parsePersonalChart({ core: 3, character: 4, socialExpression: 5, roleLabels: { core: 'Constitution' },
    help: { core: introduction }, sections: { core: { body: 'Personal reading.' } } }, 'free');
  const detail = selectChartDetail(chart, 'core');
  assert.equal(detail.title, 'Constitution');
  assert.equal(detail.help.culture, 'en-GB');
  assert.equal(detail.help.blocks[0].kind, 'heading');
  assert.ok(detail.help.blocks[1].spans.some((span) => span.bold && span.text === 'foundation'));
  assert.equal(detail.reading.body, 'Personal reading.');
  assert.equal(chart.readings.find((item) => item.key === 'socialExpression').body, '');
});
test('preview keeps opening heading/paragraph and expansion supplies remaining authored blocks', () => {
  const parsed = parseContextualHelp({ core: introduction }).core;
  const split = helpPreview(parsed.blocks);
  assert.equal(split.preview.length, 2);
  assert.equal(split.remainder.length, 1);
  assert.equal([...split.preview, ...split.remainder].map((block) => block.text).join('|'), parsed.blocks.map((block) => block.text).join('|'));
});
test('missing role labels stay absent and localized help never becomes a role label', () => {
  const input = { core: 3, character: 4, socialExpression: 5 };
  assert.equal(selectChartDetail(parsePersonalChart(input, 'free'), 'core').help, undefined);
  assert.equal(selectChartDetail(parsePersonalChart(input, 'free'), 'core').title, '');
  const chart = parsePersonalChart({ ...input, help: { core: { ...introduction, title: 'Constitución', culture: 'es' } } }, 'free');
  assert.equal(selectChartDetail(chart, 'core').title, '');
  assert.equal(selectChartDetail(chart, 'core').help.title, 'Constitución');
});

test('API role labels name main energy modals and shared cards, separate from About help', () => {
  const chart = parsePersonalChart({ core: 3, character: 4, socialExpression: 5,
    roleLabels: { core: 'Constitution', character: 'Character Nature / Inner Child', socialExpression: 'Social Expression' },
    help: Object.fromEntries(['core', 'character', 'socialExpression'].map((key) =>
      [key, { ...introduction, title: `About ${key}` }])) }, 'free');
  const { energyRoleTitle } = load('chart-sections');
  for (const [key, title] of [['core', 'Constitution'], ['character', 'Character Nature / Inner Child'],
    ['socialExpression', 'Social Expression']]) {
    const detail = selectChartDetail(chart, key);
    assert.equal(detail.title, title);
    assert.equal(energyRoleTitle(detail.energy), title);
    assert.equal(detail.help.title, `About ${key}`);
  }
});
test('absent/null/malformed/empty help is omitted and scripts do not execute', () => {
  for (const raw of [undefined, null, [], 'help', { core: null }, { core: {} },
    { core: { ...introduction, htmlBody: '<script>bad()</script>' } }]) {
    assert.equal(Object.keys(parseContextualHelp(raw)).length, 0);
  }
  const parsed = parseContextualHelp({ core: { ...introduction, htmlBody: '<p><b>Safe</b><img src="tracker"></p><script>bad()</script>' } }).core;
  assert.equal(parsed.blocks[0].text, 'Safe');
});

test('relationships help is retained separately with its Dictionary-backed title', () => {
  const chart = parsePersonalChart({ core: 3, character: 4, socialExpression: 5, roleLabels: { core: 'Constitution' },
    help: { core: introduction, relationships: { title: 'Relaciones', culture: 'es', htmlBody: '<p>Generic introduction.</p>' } } }, 'free');
  const detail = selectChartDetail(chart, 'core');
  assert.equal(detail.title, 'Constitution');
  assert.equal(detail.contextualHelp.relationships.title, 'Relaciones');
  assert.equal(detail.reading.body, '');
  assert.ok(detail.reading.unavailableMessage);
});
test('Character Essence uses its own introduction, separate from Constitution and its personal reading', () => {
  const chart = parsePersonalChart({ core: 3, character: 4, socialExpression: 5,
    help: { core: introduction, character: { title: 'Character Nature', culture: 'en-GB', htmlBody: '<p>Your <b>inner nature</b>.</p>' } },
    sections: { character: { body: 'Personal character reading.' } } }, 'free');
  const detail = selectChartDetail(chart, 'character');
  assert.equal(detail.help.title, 'Character Nature');
  assert.equal(detail.help.blocks[0].text, 'Your inner nature.');
  assert.ok(detail.help.blocks[0].spans.some((span) => span.bold));
  assert.equal(detail.reading.body, 'Personal character reading.');
  assert.equal(selectChartDetail(chart, 'core').help.title, 'Constitution');
});
