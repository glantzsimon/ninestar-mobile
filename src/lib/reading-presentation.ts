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
      preview.push({ ...block, text: `${candidate.slice(0, boundary > 0 ? boundary : remaining).trimEnd()}…` });
      return { blocks: preview, shortened: true };
    }
  }
  return { blocks: preview, shortened: preview.length < blocks.length };
}
