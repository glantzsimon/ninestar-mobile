const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')();
const { readingBlocks } = load('reading-text');
const { summaryPreview } = load('reading-presentation');
test('bold phrase stays inline with normal dash and following prose', () => {
  const [block] = readingBlocks('<p><strong>Bold, dynamic, and full of vitality</strong> &mdash; other text.</p>');
  assert.equal(block.text, 'Bold, dynamic, and full of vitality — other text.');
  assert.equal(JSON.stringify(block.spans), JSON.stringify([
    { text: 'Bold, dynamic, and full of vitality', bold: true }, { text: ' — other text.', bold: false },
  ]));
});
test('nested b/strong and formatting across paragraph boundaries preserve emphasis', () => {
  const blocks = readingBlocks('<strong><p>First <b>nested</b> phrase.</p><p>Second.</p></strong><p>Normal.</p>');
  assert.equal(blocks[0].spans[0].text, 'First nested phrase.');
  assert.equal(blocks[1].spans[0].bold, true);
  assert.equal(blocks[2].spans, undefined);
});
test('list items preserve bold without losing bullet structure', () => {
  const blocks = readingBlocks('<h5>Gifts</h5><ul><li><b>Inventive</b> and inspired</li><li>Normal</li></ul>');
  assert.equal(blocks[0].kind, 'heading');
  assert.equal(blocks[1].kind, 'list-item');
  assert.equal(blocks[1].spans[0].text, 'Inventive');
  assert.equal(blocks[1].spans[1].bold, false);
  assert.equal(blocks[2].spans, undefined);
});
test('HTML attributes/scripts/styles/images remain inert and escaped tags stay literal', () => {
  const blocks = readingBlocks('<script><b>hidden</b></script><style>hidden</style><p><b onclick="bad()">Visible</b><img src="tracker"> &lt;b&gt;literal&lt;/b&gt;</p>');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].text, 'Visible <b>literal</b>');
  assert.equal(blocks[0].spans[1].bold, false);
});
test('rich summary preview clips spans too and preserves original source', () => {
  const blocks = readingBlocks(`<p><strong>${'Bold words. '.repeat(60)}</strong> normal end.</p>`);
  const original = blocks[0].text;
  const result = summaryPreview(blocks);
  assert.equal(result.shortened, true);
  assert.equal(result.blocks[0].spans.map((span) => span.text).join(''), result.blocks[0].text);
  assert.ok(result.blocks[0].text.length <= 321);
  assert.equal(blocks[0].text, original);
});
