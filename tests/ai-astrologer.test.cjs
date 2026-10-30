const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')({ URL });
const { parseAiAstrologerContent } = load('ai-astrologer');

test('AI Astrologer content preserves API title and formatted introduction and accepts its HTTPS URL', () => {
  const content = parseAiAstrologerContent({ title: 'About AI Astrologer', culture: 'en-GB',
    htmlBody: '<p>Ask <strong>your question</strong>.</p>',
    externalUrl: 'https://example.com/astrologer?source=app' });
  assert.equal(content.help.title, 'About AI Astrologer');
  assert.equal(content.help.culture, 'en-GB');
  assert.ok(content.help.blocks[0].spans.some(span => span.bold && span.text === 'your question'));
  assert.equal(content.externalUrl, 'https://example.com/astrologer?source=app');
});

test('null, malformed and non-web destinations hide launch while retaining valid help', () => {
  const base = { title: 'Astrologer', culture: 'en-GB', htmlBody: '<p>Information.</p>' };
  for (const externalUrl of [null, '', 'not a URL', 'javascript:alert(1)']) {
    const content = parseAiAstrologerContent({ ...base, externalUrl });
    assert.equal(content.help.title, 'Astrologer');
    assert.equal(content.externalUrl, null);
  }
});

test('invalid or absent informational content is omitted without affecting a valid launch URL', () => {
  const content = parseAiAstrologerContent({ externalUrl: 'https://example.com', title: 'missing body' });
  assert.equal(content.help, null);
  assert.equal(content.externalUrl, 'https://example.com/');
});
