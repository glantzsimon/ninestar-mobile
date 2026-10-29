const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-library.cjs')({ URL });
const { parseKnowledgeBase } = load('knowledge-base');
const { websiteLinks } = load('website-links');
const help = title => ({ title, htmlBody: '<h3>Authored heading</h3><p>A <strong>formatted</strong> explanation.</p>', culture: 'en-GB' });

test('knowledge articles follow website content order using only returned titles and bodies', () => {
  const data = { help: { sexuality: help('Server sexuality'), month: help('Server month'),
    earth: help('Server earth'), origins: help('Server origins'), modalities: help('Server groups'),
    lightAndDark: help('Server light'), year: help('Server year'), elements: help('Server elements'),
    futureSection: help('Future section') } };
  const before = JSON.stringify(data), parsed = parseKnowledgeBase(data);
  assert.equal(parsed.map(item => item.key).join(','), 'origins,lightAndDark,modalities,elements,year,month');
  assert.equal(parsed.find(item => item.key === 'elements').children.map(item => item.key).join(','), 'earth');
  assert.equal(parsed[0].title, 'Server origins');
  assert.equal(parsed[0].blocks[0].kind, 'heading');
  assert.ok(parsed[0].blocks[1].spans.some(span => span.bold && span.text === 'formatted'));
  assert.equal(JSON.stringify(data), before);
});

test('missing or gated article titles never acquire local headings or surface orphaned arrays', () => {
  const data = { mainEnergies: [{ title: 'Existing reference', description: '<p>Reference.</p>' }],
    help: { origins: help('Server origins'), elements: { ...help(''), title: '' },
      mainEnergies: { htmlBody: '<p>Missing title.</p>', culture: 'en-GB' } } };
  assert.equal(parseKnowledgeBase(data).map(item => item.key).join(','), 'origins');
  assert.equal(parseKnowledgeBase({}).length, 0);
  for (const invalid of [null, [], 'HTML error response']) assert.throws(() => parseKnowledgeBase(invalid));
});

test('reference and cycle sections preserve independently supplied artwork and reading prose', () => {
  const parsed = parseKnowledgeBase({ help: { modalities: help('Groups'), mainEnergies: help('Core references'),
    characterEnergies: help('Character references'), year: help('Year readings'), month: help('Month readings') },
    modalities: [{ title: 'API group', body: '<p>Group explanation.</p>' }],
    mainEnergies: [{ title: 'API core', description: '<p>Core prose.</p>', artworkId: 'server.core' }, { title: '', description: 'No title' }],
    characterEnergies: [{ title: 'API character', description: '<p>Character prose.</p>', artworkId: 'server.character' }],
    yearCycles: [{ cycleDescriptiveName: 'API harvest', description: '<p>Year prose.</p>', energy: { artworkId: 'server.year' } }],
    monthCycles: [{ cycleDescriptiveName: 'API growth', description: '<p>Month prose.</p>', energy: { artworkId: 'server.month' } }],
    dayCycles: [{ cycleDescriptiveName: 'Not a website section', description: 'Not promoted' }] });
  assert.equal(parsed.map(section => section.children[0].title).join(','), 'API group,API core,API character,API harvest,API growth');
  assert.equal(parsed.slice(1).map(section => section.children[0].artworkId).join(','), 'server.core,server.character,server.year,server.month');
  assert.equal(parsed[1].children.length, 1);
});

test('Articles follows API environment and uses the real website blog route without API query data', () => {
  assert.equal(websiteLinks('https://int.9starkiastrology.com/api/mobile/v1').articles, 'https://int.9starkiastrology.com/latest-articles');
  assert.equal(websiteLinks('https://9starkiastrology.com/api/mobile/v1').articles, 'https://9starkiastrology.com/latest-articles');
});

test('elements and transformations appear only inside their group, preserving resource labels and order', () => {
  const parsed = parseKnowledgeBase({ help: { elements: help('API five elements'),
    fire: help('API fire'), earth: help('API earth'), metal: help('API metal'),
    water: help('API water'), tree: help('API tree'), transformations: help('API transformations') } });
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].isGroup, true);
  assert.equal(parsed[0].children.map(item => item.key).join(','), 'fire,earth,metal,water,tree,transformations');
  assert.equal(parsed[0].children[5].title, 'API transformations');
  assert.equal(parsed[0].children[5].artworkId, 'ninestar.elements.cycle-five');
  assert.equal(parsed[0].introduction.title, 'API five elements');
});

test('relationships keeps its introduction, separate intimacy reading and transformation destination', () => {
  const parsed = parseKnowledgeBase({ help: { relationships: help('API Relationships'),
    sexuality: { ...help('API Relationships and Intimacy'), htmlBody: '<p>Separate <strong>intimacy</strong> reading.</p>' },
    elements: help('API Elements'), transformations: help('API Five Transformations') } });
  assert.equal(parsed.map(item => item.key).join(','), 'elements,relationships');
  const relationships = parsed.find(item => item.key === 'relationships');
  assert.equal(relationships.isGroup, true);
  assert.equal(relationships.introduction.title, 'API Relationships');
  assert.equal(relationships.inline.length, 1);
  assert.equal(relationships.inline[0].title, 'API Relationships and Intimacy');
  assert.ok(relationships.inline[0].blocks[0].spans.some(span => span.bold && span.text === 'intimacy'));
  assert.equal(relationships.children[0].key, 'transformations');
  assert.equal(relationships.children[0].blocks[0].text, parsed[0].children[0].blocks[0].text);
  const publicOnly = parseKnowledgeBase({ help: { relationships: help('API Relationships') } })[0];
  assert.equal(publicOnly.inline.length, 0);
  assert.equal(publicOnly.children.length, 0);
});

test('group artwork uses the existing website UI and modality references, not translated names', () => {
  const sections = parseKnowledgeBase({ help: Object.fromEntries(['origins', 'modalities', 'elements',
    'mainEnergies', 'characterEnergies', 'year', 'month', 'personalChart', 'relationships'].map(key => [key, help(`Translated ${key}`)])),
    modalities: [{ title: 'Translated Dynamic', numbers: [3, 6, 9], body: 'API group body' }],
    mainEnergies: [{ number: 3, modalityArtworkId: 'server.dynamic', title: 'API three', description: 'API description' }] });
  const byKey = Object.fromEntries(sections.map(item => [item.key, item]));
  assert.equal(byKey.origins.artworkId, 'ui.origins');
  assert.equal(byKey.modalities.artworkId, 'ninestar.modalities.dynamic');
  assert.equal(byKey.modalities.children[0].artworkId, 'server.dynamic');
  assert.equal(byKey.elements.artworkId, 'ninestar.elements.cycle-five');
  assert.equal(byKey.mainEnergies.artworkId, 'ui.nine-core-energies');
  assert.equal(byKey.characterEnergies.artworkId, 'ui.nine-character-energies');
  assert.equal(byKey.year.artworkId, 'ui.sun');
  assert.equal(byKey.month.artworkId, 'ui.moon');
  assert.equal(byKey.personalChart.artworkId, 'ui.personal-chart');
  assert.equal(byKey.relationships.artworkId, 'ui.relationships');
});
