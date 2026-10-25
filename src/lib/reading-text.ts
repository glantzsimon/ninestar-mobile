// Readings are displayed as native text, never interpreted as HTML or JavaScript.
// Preserve paragraphs/lists; links and decorative HTML are deliberately not interactive.
export function readingText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const entities: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
    hellip: '…', bull: '•', copy: '©', reg: '®',
  };
  const cleaned = value.replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  // HTML source indentation is not a visual line break. Only structural tags
  // create breaks; plain-text responses retain their authored newlines.
  const source = /<\/?[a-z][^>]*>/i.test(cleaned) ? cleaned.replace(/\s+/g, ' ') : cleaned;
  return source
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|h[1-6]|ul|ol|section|blockquote)\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity] ?? original;
      const number = entity[1].toLowerCase() === 'x'
        ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
        ? String.fromCodePoint(number) : '';
    })
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type ReadingSpan = { text: string; bold: boolean };
export type ReadingBlock = { kind: 'heading' | 'paragraph' | 'list-item'; text: string; spans?: ReadingSpan[] };

export function readingBlocks(value: unknown): ReadingBlock[] {
  if (typeof value !== 'string') return [];
  const source = value.replace(/[\uE000\uE001]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(\/?)(?:strong|b)\b[^>]*>/gi, (_tag, closing) => closing ? '\uE001' : '\uE000');
  const blocks: ReadingBlock[] = [];
  let boldDepth = 0;
  function append(kind: ReadingBlock['kind'], marked: string) {
    const spans: ReadingSpan[] = [];
    for (const part of marked.split(/([\uE000\uE001])/)) {
      if (part === '\uE000') boldDepth++;
      else if (part === '\uE001') boldDepth = Math.max(0, boldDepth - 1);
      else if (part) {
        const bold = boldDepth > 0;
        const last = spans[spans.length - 1];
        if (last?.bold === bold) last.text += part;
        else spans.push({ text: part, bold });
      }
    }
    if (spans.length) { spans[0].text = spans[0].text.trimStart(); spans[spans.length - 1].text = spans[spans.length - 1].text.trimEnd(); }
    const nonempty = spans.filter((span) => span.text);
    const text = nonempty.map((span) => span.text).join('');
    if (text) blocks.push({ kind, text, ...(nonempty.some((span) => span.bold) ? { spans: nonempty } : {}) });
  }
  function appendBody(html: string) {
    for (const paragraph of readingText(html).split(/\n{2,}/).filter(Boolean)) {
      // Keep each bullet compact without inserting blank native text lines.
      if (paragraph.startsWith('• ')) {
        for (const item of paragraph.split(/\n(?=• )/)) {
          append('list-item', item.replace(/^• /, '').trim());
        }
      } else append('paragraph', paragraph);
    }
  }
  const headings = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = headings.exec(source)) !== null) {
    appendBody(source.slice(cursor, match.index));
    const text = readingText(match[2]).replace(/\s+/g, ' ').trim();
    if (text) append('heading', text);
    cursor = headings.lastIndex;
  }
  appendBody(source.slice(cursor));
  return blocks;
}
