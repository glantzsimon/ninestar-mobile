const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')();
const { parseChartHealth } = load('chart-health');
const { parsePersonalChart } = load('personal-chart');
const { selectChartDetail } = load('chart-sections');
function fixture() {
  return { energies: { core: { number: 3, yinYangExpansionTitle: 'Groupe en expansion',
    yinYangExpansionDescription: '<p><strong>Expansif</strong> et dynamique.</p>' },
    character: { number: 4 }, socialExpression: { number: 5 } },
    health: {
      strongOrgans: { title: 'Organes forts', htmlBody: '<p style="color:red"><b>Introduction</b> du site.</p>',
        yinOrgans: [{ value: 'Liver', label: 'Foie', artworkId: 'ninestar.organs.liver' }],
        yangOrgans: [{ value: 'Gallbladder', label: 'Vésicule biliaire', artworkId: 'ninestar.organs.gallbladder' }] },
      weakOrgans: { title: 'Organes faibles', htmlBody: '<ul><li>Premier</li><li>Second</li></ul>',
        yinOrgans: [{ value: 'Heart', label: 'Cœur', artworkId: null }], yangOrgans: [] },
    }, sections: { health: { summary: 'Summary', body: 'Full reading' }, illnesses: { body: 'Challenges' } } };
}
test('full health retains Dictionary titles, translated labels, artwork IDs and organ order', () => {
  const parsed = parseChartHealth(fixture(), 'full');
  assert.equal(parsed.expansion.title, 'Groupe en expansion');
  assert.equal(parsed.strongOrgans.title, 'Organes forts');
  assert.equal(parsed.strongOrgans.yinOrgans[0].value, 'Liver');
  assert.equal(parsed.strongOrgans.yinOrgans[0].label, 'Foie');
  assert.equal(parsed.strongOrgans.yinOrgans[0].artworkId, 'ninestar.organs.liver');
  assert.equal(parsed.strongOrgans.yangOrgans[0].label, 'Vésicule biliaire');
  assert.equal(parsed.weakOrgans.yinOrgans[0].artworkId, undefined);
});
test('HTML keeps emphasis and bullet structure, ignores inline colour and executable content', () => {
  const data = fixture();
  data.health.strongOrgans.htmlBody += '<script>bad()</script><img src="tracker">';
  const parsed = parseChartHealth(data, 'full');
  assert.equal(parsed.strongOrgans.blocks[0].text, 'Introduction du site.');
  assert.equal(parsed.strongOrgans.blocks[0].spans[0].bold, true);
  assert.equal(parsed.weakOrgans.blocks.length, 2);
  assert.equal(parsed.weakOrgans.blocks[0].kind, 'list-item');
});
test('free projection never imports full Health additions', () => {
  const data = fixture();
  assert.equal(parseChartHealth(data, 'free'), undefined);
  const chart = parsePersonalChart({ ...data, core: 3, character: 4, socialExpression: 5 }, 'free');
  assert.equal(chart.health, undefined);
  assert.equal(selectChartDetail(chart, 'core').health, undefined);
});
test('older/null fields and malformed panels/organs degrade without invented titles or enum labels', () => {
  const parsed = parseChartHealth({ health: { strongOrgans: { title: '', htmlBody: 'Text' },
    weakOrgans: { title: 'Weak', htmlBody: '', yinOrgans: [{ value: 'Liver' }, null], yangOrgans: null } } }, 'full');
  assert.equal(parsed.strongOrgans, undefined);
  assert.equal(parsed.expansion, undefined);
  assert.equal(parsed.weakOrgans.yinOrgans.length, 0);
  assert.equal(parsed.weakOrgans.yangOrgans.length, 0);
  assert.equal(parseChartHealth({}, 'full').weakOrgans, undefined);
});
test('full Core selection carries new health alongside unchanged existing reading sections', () => {
  const chart = parsePersonalChart(fixture(), 'full');
  const detail = selectChartDetail(chart, 'core');
  assert.equal(detail.health.strongOrgans.title, 'Organes forts');
  assert.equal(detail.groups.flatMap((group) => group.readings).find((r) => r.key === 'health').summary, 'Summary');
  assert.equal(detail.groups.flatMap((group) => group.readings).find((r) => r.key === 'illnesses').body, 'Challenges');
  assert.equal(selectChartDetail(chart, 'character').health, undefined);
});
