import type { ChartReading } from './personal-chart';
import type { ReadingBlock } from './reading-text';

export function readingPresentation(reading: ChartReading, full = false) {
  const hasSummary = reading.summaryBlocks.length > 0;
  return {
    canToggle: hasSummary && reading.bodyBlocks.length > 0 && reading.summary !== reading.body,
    blocks: hasSummary && !full ? reading.summaryBlocks : reading.bodyBlocks.length ? reading.bodyBlocks : reading.summaryBlocks,
  };
}

export function summaryPreview(blocks: ReadingBlock[]): { blocks: ReadingBlock[]; shortened: boolean } {
  let remaining = 320;
  const preview: ReadingBlock[] = [];
  for (const block of blocks) {
    if (remaining <= 0) break;
    if (block.text.length <= remaining) {
      preview.push(block);
      remaining -= block.text.length;
    } else {
      const candidate = block.text.slice(0, remaining);
      const boundary = candidate.lastIndexOf(' ');
      const clipped = candidate.slice(0, boundary > 0 ? boundary : remaining).trimEnd();
      let spanLength = clipped.length;
      const spans = block.spans?.flatMap((span) => {
        const text = span.text.slice(0, Math.max(0, spanLength));
        spanLength -= text.length;
        return text ? [{ ...span, text }] : [];
      });
      preview.push({ ...block, text: `${clipped}…`,
        ...(spans ? { spans: [...spans, { text: '…', bold: false }] } : {}) });
      return { blocks: preview, shortened: true };
    }
  }
  return { blocks: preview, shortened: preview.length < blocks.length };
}
