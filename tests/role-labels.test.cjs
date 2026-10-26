const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { parsePersonalChart } = load('personal-chart');
const { energyRoleTitle, selectChartDetail } = load('chart-sections');
const roles = ['core', 'character', 'socialExpression', 'dayStar', 'generation', 'epoch'];

test('all six API role labels match card and destination titles in full/free charts', () => {
  const labels = ['Constitución', 'Carácter', 'Expresión social', 'Estrella del día', 'Generación', 'Época'];
  for (const access of ['full', 'free']) {
    const data = {
      ...Object.fromEntries(roles.map((key, index) => [key, index + 1])),
      roleLabels: Object.fromEntries(roles.map((key, index) => [key, labels[index]])),
      energies: Object.fromEntries(roles.map((key, index) => [key,
        { number: index + 1, title: `Full energy ${index}`, name: `Energy ${index}` }])),
      help: Object.fromEntries(roles.map((key) => [key,
        { title: `About ${key}`, htmlBody: '<p>Introduction.</p>', culture: 'es' }])),
    };
    const before = JSON.stringify(data);
    const chart = parsePersonalChart(data, access);
    for (const [index, role] of roles.entries()) {
      const detail = selectChartDetail(chart, role);
      assert.equal(detail.title, labels[index]);
      assert.equal(energyRoleTitle(detail.energy), labels[index]);
      assert.equal(detail.energy.title, `Full energy ${index}`);
      assert.equal(detail.help.title, `About ${role}`);
    }
    assert.equal(JSON.stringify(data), before);
  }
});

test('older or malformed role labels never fall back to help, energy names or protocol keys', () => {
  for (const roleLabels of [undefined, null, [], 'labels', {}, { core: 42 }, { core: {} }, { core: '  ' }]) {
    const chart = parsePersonalChart({ core: 1, character: 2, socialExpression: 3, roleLabels,
      energies: { core: { name: 'Water', title: '1 Water' } },
      help: { core: { title: 'About Constitution', htmlBody: '<p>Help</p>', culture: 'en' } } }, 'free');
    assert.equal(selectChartDetail(chart, 'core').title, '');
    assert.equal(energyRoleTitle(chart.energies[0]), '');
    assert.equal(chart.energies[0].name, 'Water');
  }
});
