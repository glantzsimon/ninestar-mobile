const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')();
const { uiLabelBootstrap } = load('ui-label-bootstrap');
const { parseUiLabels, createUiLabelStore, uiLabelStore } = load('ui-labels');
const { uiCopy } = load('ui-copy');
const clone = value => JSON.parse(JSON.stringify(value));

test('complete Dictionary catalogue preserves casing and rejects partial/version/protocol changes', () => {
  assert.ok(parseUiLabels(clone(uiLabelBootstrap)));
  const translated = clone(uiLabelBootstrap);
  translated.culture = 'fr-FR';
  translated.shared.calculator.fields.currentTimeZone = 'Fuseau horaire actuel';
  assert.equal(parseUiLabels(translated).shared.calculator.fields.currentTimeZone, 'Fuseau horaire actuel');
  for (const mutate of [v => { delete v.screens.account; }, v => { v.version = 2; },
    v => { v.shared.actions.yes = ''; }, v => { v.shared.calculator.displayDataForPeriods[0].value = 'invented'; }]) {
    const invalid = clone(uiLabelBootstrap); mutate(invalid);
    assert.equal(parseUiLabels(invalid), null);
  }
});

test('failed/partial refresh retains last good labels; environments have independent stores', () => {
  const integration = createUiLabelStore('integration'), production = createUiLabelStore('production');
  let notifications = 0;
  const unsubscribe = integration.subscribe(() => notifications++);
  const next = clone(uiLabelBootstrap); next.culture = 'fr'; next.shared.actions.calculate = 'Calculer';
  integration.accept(next);
  next.shared.actions.calculate = 'Mutated externally';
  assert.equal(integration.getCatalogue().shared.actions.calculate, 'Calculer');
  assert.equal(production.getCatalogue().shared.actions.calculate, uiLabelBootstrap.shared.actions.calculate);
  const revision = integration.getSnapshot();
  assert.equal(integration.accept({ version: 1, culture: 'en-GB' }), false);
  assert.equal(integration.getSnapshot(), revision);
  assert.equal(integration.getCatalogue().culture, 'fr');
  assert.equal(notifications, 1); unsubscribe();
});

test('all 173 legacy copy entries are API projections and captured groups stay live', () => {
  const copy = uiCopy.calculator;
  function leaves(value) { return Object.values(value).flatMap(v => typeof v === 'object' ? leaves(v) : [v]); }
  const values = leaves(uiCopy);
  assert.equal(values.length, 173);
  assert.ok(values.every(v => typeof v === 'string' && v.length));
  const next = clone(uiLabelBootstrap); next.shared.calculator.fields.currentTimeZone = 'CURRENT server CaSe';
  uiLabelStore.accept(next);
  assert.equal(copy.currentTimezone, 'CURRENT server CaSe');
  uiLabelStore.accept(uiLabelBootstrap);
});

test('energy fact identifiers survive translated labels and module-level navigation titles refresh', () => {
  const { parsePersonalChart } = load('personal-chart');
  const { exploreFeatures } = load('explore-features');
  const energies = Object.fromEntries(['core', 'character', 'socialExpression'].map(key => [key, { number: 3, yinYang: 'Yang', season: 'Spring' }]));
  const chart = parsePersonalChart({ energies }, 'full');
  const next = clone(uiLabelBootstrap);
  next.screens.personalChart.facts.yinYang = 'Polarité';
  next.screens.personalChart.facts.season = 'Saison';
  next.navigation.aiAstrologer = 'Astrologue IA';
  uiLabelStore.accept(next);
  assert.equal(chart.energies[0].facts.find(f => f.key === 'yinYang').label, 'Polarité');
  assert.equal(chart.energies[0].facts.find(f => f.key === 'season').label, 'Saison');
  assert.equal(exploreFeatures.find(f => f.key === 'ai').title, 'Astrologue IA');
  uiLabelStore.accept(uiLabelBootstrap);
});

test('culture may be invariant and no labelled metadata implies membership access', () => {
  const invariant = clone(uiLabelBootstrap); invariant.culture = '';
  assert.ok(parseUiLabels(invariant));
  assert.equal(invariant.entitlements, undefined);
  assert.equal(invariant.membership, undefined);
});
