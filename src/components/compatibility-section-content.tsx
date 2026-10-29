import { ArtworkDiagram } from '@/components/artwork-diagram';
import { ElementBreakdown } from '@/components/element-breakdown';
import { ReadingContent } from '@/components/reading-content';
import type { CompatibilityDiagram } from '@/lib/compatibility';
import type { ElementSegment } from '@/lib/element-breakdown';
import type { ReadingBlock } from '@/lib/reading-text';

export function CompatibilitySectionContent({ blocks, diagram, breakdown = [] }: {
  blocks: ReadingBlock[]; diagram?: CompatibilityDiagram | null; breakdown?: ElementSegment[];
}) {
  return <>
    <ElementBreakdown segments={breakdown} />
    {diagram ? <>
      <ReadingContent blocks={diagram.before} />
      <ArtworkDiagram artworkId={diagram.artworkId} />
      <ReadingContent blocks={diagram.after} />
    </> : <ReadingContent blocks={blocks} />}
  </>;
}
