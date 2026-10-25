import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type ContextualHelp = { title: string; culture: string; blocks: ReadingBlock[] };
export function parseContextualHelp(value: unknown): Record<string, ContextualHelp> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, raw]) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const item = raw as Record<string, unknown>;
    if (typeof item.title !== 'string' || typeof item.htmlBody !== 'string' || typeof item.culture !== 'string') return [];
    const title = readingText(item.title);
    const blocks = readingBlocks(item.htmlBody);
    return title && blocks.length ? [[key, { title, blocks, culture: item.culture }]] : [];
  }));
}

// Preview the authored opening paragraph (and any heading before it), retaining
// formatting and splitting at a real block boundary rather than duplicating prose.
export function helpPreview(blocks: ReadingBlock[]) {
  const paragraph = blocks.findIndex((block) => block.kind === 'paragraph');
  const end = paragraph >= 0 ? paragraph + 1 : Math.min(1, blocks.length);
  return { preview: blocks.slice(0, end), remainder: blocks.slice(end) };
}
