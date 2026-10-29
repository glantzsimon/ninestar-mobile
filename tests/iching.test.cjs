const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parseIChing, hexagramLineStyle } = load('iching');
const hexagram = () => ({ number: 46, name: 'API Pushing Upward',
  lines: ['ChangingYin', 'ChangingYin', 'ChangingYin', 'Yang', 'Yang', 'Yin'],
  info: { name: 'API reading name', stage: 'API growth stage', title: '<p>API <strong>short title</strong>.</p>',
    summary: '<p>API summary.</p>', details: '<h3>API detail heading</h3><p>Long interpretation.</p>',
    changingLinesInterpretation: '<h5>API changing line 1</h5><p>First line reading.</p><h5>API changing line 2</h5><p>Second line reading.</p>' } });

test('server-formatted hexagram heading is retained without reconstructing a local prefix', () => {
  const primary = { ...hexagram(), heading: 'Hexagramme 46 : Monter' };
  assert.equal(parseIChing({ primary }).primary.heading, primary.heading);
  assert.equal(parseIChing({ primary: hexagram() }).primary.heading, undefined);
});

test('single hexagram retains API order, reading fields, help and HTML without mutating its input', () => {
  const data = { primary: hexagram(), transformed: null,
    help: { overview: { title: 'API I Ching help', htmlBody: '<p>Generic introduction.</p>', culture: 'en-GB' } } };
  const before = JSON.stringify(data), parsed = parseIChing(data);
  assert.equal(parsed.transformed, null);
  assert.equal(parsed.primary.lines.join(','), data.primary.lines.join(','));
  assert.equal(parsed.primary.name, 'API Pushing Upward');
  assert.equal(parsed.primary.readingName, 'API reading name');
  assert.equal(parsed.primary.stage, 'API growth stage');
  assert.ok(parsed.primary.title[0].spans.some(span => span.bold && span.text === 'short title'));
  assert.equal(parsed.primary.details[0].kind, 'heading');
  assert.equal(parsed.primary.changingLines.filter(block => block.kind === 'heading').length, 2);
  assert.equal(parsed.help.overview.title, 'API I Ching help');
  assert.equal(JSON.stringify(data), before);
});

test('transformed hexagram is independently supplied by the server, never computed from line flags', () => {
  const transformed = { ...hexagram(), number: 1, name: 'API transformed', lines: Array(6).fill('Yang') };
  const parsed = parseIChing({ primary: hexagram(), transformed });
  assert.equal(parsed.primary.number, 46);
  assert.equal(parsed.transformed.number, 1);
  assert.equal(parsed.transformed.name, 'API transformed');
  assert.equal(parsed.transformed.lines.join(','), transformed.lines.join(','));
  assert.equal(parseIChing({ primary: hexagram() }).transformed, null);
});

test('malformed diagrams fail instead of producing an incomplete or invented reading', () => {
  for (const patch of [{ number: 0 }, { number: 65 }, { number: '46' }, { name: '' },
    { lines: ['Yin'] }, { lines: Array(6).fill('Unknown') }, { lines: Array(6).fill(1) }]) {
    assert.throws(() => parseIChing({ primary: { ...hexagram(), ...patch } }));
  }
  assert.throws(() => parseIChing({ primary: hexagram(), transformed: {} }));
  assert.throws(() => parseIChing({}));
});

test('missing optional prose/help stays absent while the supplied diagram remains valid', () => {
  const parsed = parseIChing({ primary: { ...hexagram(), info: null } });
  assert.equal(parsed.primary.lines.length, 6);
  assert.equal(parsed.primary.details.length, 0);
  assert.equal(parsed.primary.changingLines.length, 0);
  assert.equal(Object.keys(parsed.help).length, 0);
});

test('all four server line types map to solid/broken and changing appearance only', () => {
  for (const [line, broken, changing] of [['Yin', true, false], ['Yang', false, false],
    ['ChangingYin', true, true], ['ChangingYang', false, true]]) {
    const style = hexagramLineStyle(line);
    assert.equal(style.broken, broken);
    assert.equal(style.changing, changing);
  }
});
