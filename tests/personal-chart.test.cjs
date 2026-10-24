const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function moduleFromSource(name, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib', `${name}.ts`), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (key) => imports[key] });
  return exports;
}
const text = moduleFromSource('reading-text');
const { parsePersonalChart } = moduleFromSource('personal-chart', { './reading-text': text });

test('authored markup becomes inert text with paragraphs, bullets and entities', () => {
  assert.equal(text.readingText('<p>Calm &amp; clear</p><ul><li>Listen</li><li>Reflect</li></ul><script>bad()</script>'),
    'Calm & clear\n\n• Listen\n• Reflect');
  assert.equal(text.readingText('&#x2014; &#39; &#999999999;'), "— '");
  assert.equal(text.readingText('<img src="https://example.test/tracker">Text'), 'Text');
});

test('reading blocks retain website headings and remove source-formatting blank lines', () => {
  const source = `
    <h5 class="dark">Gifts</h5>
    <ul>
      <li>Calm &amp; clear.</li>
      <li>Kind and thoughtful.</li>
    </ul>

    <h4>Finding Balance</h4>
    <p>
      Take time to pause
      and reflect.
    </p>
    <p>Return to your natural rhythm.</p>
  `;
  const blocks = text.readingBlocks(source);
  assert.deepEqual(Array.from(blocks, ({ kind, text }) => [kind, text]), [
    ['heading', 'Gifts'], ['list-item', 'Calm & clear.'], ['list-item', 'Kind and thoughtful.'],
    ['heading', 'Finding Balance'], ['paragraph', 'Take time to pause and reflect.'],
    ['paragraph', 'Return to your natural rhythm.'],
  ]);
  assert.ok(blocks.every((block) => !block.text.includes('\n\n')));
});

test('structured readings remain inert and preserve explicit breaks and plain paragraphs', () => {
  const blocks = text.readingBlocks('<script><h5>Hidden</h5></script><style>bad</style><!--hidden--><h5>Gifts</h5><p>One<br>Two <img src="https://example.test/tracker"></p>');
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].text, 'Gifts');
  assert.equal(blocks[1].text, 'One\nTwo');
  assert.equal(text.readingBlocks('First paragraph.\r\n\r\nSecond paragraph.').length, 2);
});

test('full chart uses server numbers, labels and only HTTPS artwork', () => {
  const data = {
    person: { name: 'Test account' }, summary: '<p>Narrative summary</p>', overview: '<h5>Gifts</h5><ul><li>Traits</li></ul>',
    energies: {
      core: { number: 9, name: 'Fire', element: 'Fire', imageUrl: 'https://example.test/fire.png' },
      character: { number: 1 }, socialExpression: { number: 4, imageUrl: 'http://example.test/wood.png' },
    },
    sections: { core: { summary: 'Summary', body: '<p>Full reading</p>' } },
  };
  const chart = parsePersonalChart(data, 'full');
  assert.equal(chart.name, 'Test account');
  assert.equal(chart.energies[0].number, 9);
  assert.equal(chart.energies[0].imageUrl, 'https://example.test/fire.png');
  assert.equal(chart.energies[2].imageUrl, undefined);
  assert.equal(chart.readings[0].body, 'Full reading');
  assert.equal(chart.readings[0].bodyBlocks[0].kind, 'paragraph');
  assert.equal(chart.summary, 'Narrative summary');
  assert.equal(chart.summaryBlocks[0].text, 'Narrative summary');
});

test('free chart handles its distinct schema without inventing full sections', () => {
  const chart = parsePersonalChart({
    core: 2, character: 5, socialExpression: 8,
    sections: { core: { body: 'Included' }, character: null },
  }, 'free');
  assert.equal(chart.energies[0].number, 2);
  assert.equal(chart.energies[0].name, '');
  assert.equal(chart.readings.length, 3);
  const social = chart.readings.find((reading) => reading.key === 'socialExpression');
  assert.equal(social.body, '');
  assert.equal(social.bodyBlocks.length, 0);
  assert.ok(social.unavailableMessage.includes('not included'));
  assert.equal(chart.access, 'free');
});

test('chart summary uses narrative text on free charts and never substitutes the traits overview', () => {
  const data = { core: 2, character: 5, socialExpression: 8,
    summary: '<p>Your combined energies bring a distinctive perspective.</p>',
    overview: '<h5>Gifts</h5><ul><li>A main-energy trait.</li></ul>' };
  const chart = parsePersonalChart(data, 'free');
  assert.equal(chart.summaryBlocks.length, 1);
  assert.equal(chart.summaryBlocks[0].kind, 'paragraph');
  assert.equal(chart.summary, 'Your combined energies bring a distinctive perspective.');
  const missing = parsePersonalChart({ ...data, summary: null }, 'free');
  assert.equal(missing.summary, '');
  assert.equal(missing.summaryBlocks.length, 0);
});

test('third energy has its own server-authored reading and primary panel position', () => {
  const chart = parsePersonalChart({ energies: {
    core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 },
  }, sections: { socialExpression: { summary: '<h5>Social Expression</h5><p>Your outer presence.</p>',
    body: '<h4>How Others See You</h4><p>Server-authored detail.</p>' } } }, 'full');
  assert.equal(chart.readings[2].key, 'socialExpression');
  assert.equal(chart.readings[2].unavailableMessage, undefined);
  assert.equal(chart.readings[2].bodyBlocks[0].kind, 'heading');
  assert.equal(chart.readings[2].bodyBlocks[1].text, 'Server-authored detail.');
});

test('missing full third-energy reading gets an unavailable panel without copied interpretation', () => {
  const chart = parsePersonalChart({ energies: {
    core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 },
  }, sections: { core: { body: 'Core-only interpretation.' } } }, 'full');
  const social = chart.readings[2];
  assert.equal(social.key, 'socialExpression');
  assert.equal(social.body, '');
  assert.ok(social.unavailableMessage.includes('temporarily unavailable'));
});

test('extended profile follows the website order and uses only returned full-chart data', () => {
  const chart = parsePersonalChart({ energies: {
    core: { number: 1 }, character: { number: 2 }, socialExpression: { number: 3 },
    epoch: { number: 9, name: 'Fire' }, generation: { number: 6, name: 'Heaven' },
    dayStar: { number: 4, imageUrl: 'https://example.test/wind.png',
      description: '<h5>Day Star</h5><p>Server-authored extended reading.</p>' }, hour: { number: 5 },
  } }, 'full');
  assert.deepEqual(Array.from(chart.extendedEnergies, (energy) => energy.key), ['dayStar', 'generation', 'epoch']);
  assert.deepEqual(Array.from(chart.extendedEnergies, (energy) => energy.number), [4, 6, 9]);
  assert.equal(chart.extendedEnergies[0].descriptionBlocks[1].text, 'Server-authored extended reading.');
  assert.equal(chart.extendedEnergies[0].imageUrl, 'https://example.test/wind.png');
});

test('numbers-only free extended profile does not invent or import full-chart descriptions', () => {
  const chart = parsePersonalChart({ core: 1, character: 2, socialExpression: 3,
    dayStar: 4, generation: 5, epoch: 6,
    energies: { dayStar: { number: 9, description: 'Must not become a free interpretation.' } },
  }, 'free');
  assert.equal(chart.extendedEnergies[0].number, 4);
  assert.equal(chart.extendedEnergies[0].descriptionBlocks.length, 0);
});

test('missing or invalid optional extended numbers do not break the main chart', () => {
  const chart = parsePersonalChart({ core: 1, character: 2, socialExpression: 3,
    dayStar: null, generation: 10, epoch: 2.5 }, 'free');
  assert.equal(chart.energies.length, 3);
  assert.equal(chart.extendedEnergies.length, 0);
});

test('malformed chart data fails rather than displaying fabricated numbers', () => {
  for (const core of [null, 0, 10, 2.5, '9']) {
    assert.throws(() => parsePersonalChart({ core, character: 2, socialExpression: 3 }, 'free'));
  }
});
