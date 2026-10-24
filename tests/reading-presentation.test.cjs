const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readingPresentation, summaryPreview } = require('./load-library.cjs')()('reading-presentation');
const summaryBlocks = [{ kind: 'paragraph', text: 'Short summary' }];
const bodyBlocks = [{ kind: 'paragraph', text: 'Full reading' }];
const reading = { summary: 'Short summary', body: 'Full reading', summaryBlocks, bodyBlocks };

test('summary is the default and full text replaces it rather than appending', () => {
  assert.equal(readingPresentation(reading).blocks, summaryBlocks);
  assert.equal(readingPresentation(reading, true).blocks, bodyBlocks);
  assert.equal(readingPresentation(reading).canToggle, true);
});
test('missing summary uses available full text without a misleading toggle', () => {
  const result = readingPresentation({ ...reading, summary: '', summaryBlocks: [] });
  assert.equal(result.blocks, bodyBlocks);
  assert.equal(result.canToggle, false);
});
test('identical summary and body do not offer a redundant toggle', () => {
  assert.equal(readingPresentation({ ...reading, body: reading.summary }).canToggle, false);
});
test('long summary preview leaves the source intact for expansion', () => {
  const blocks = [{ kind: 'paragraph', text: 'A sentence. '.repeat(60) }];
  const original = blocks[0].text;
  const result = summaryPreview(blocks);
  assert.equal(result.shortened, true);
  assert.ok(result.blocks[0].text.endsWith('…'));
  assert.ok(result.blocks[0].text.length <= 321);
  assert.equal(blocks[0].text, original);
});
test('short summaries remain complete without expansion', () => {
  assert.equal(summaryPreview(summaryBlocks).shortened, false);
});
