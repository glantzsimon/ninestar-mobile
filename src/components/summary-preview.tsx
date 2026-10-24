import { useState } from 'react';
import { ReadingContent } from '@/components/reading-content';
import { AppButton } from '@/components/ui/app-button';
import type { ReadingBlock } from '@/lib/reading-text';
import { summaryPreview } from '@/lib/reading-presentation';

export function SummaryPreview({ blocks, onExpand }: { blocks: ReadingBlock[]; onExpand?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const preview = summaryPreview(blocks);
  return <>
    <ReadingContent blocks={expanded ? blocks : preview.blocks} />
    {preview.shortened && <AppButton variant="secondary" title={expanded ? 'Show Less' : 'Read More'}
      accessibilityState={{ expanded }} onPress={() => onExpand ? onExpand() : setExpanded(!expanded)} />}
  </>;
}
