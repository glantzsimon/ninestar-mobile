import { useState } from 'react';
import { ReadingContent } from '@/components/reading-content';
import { AppButton } from '@/components/ui/app-button';
import type { ReadingBlock } from '@/lib/reading-text';
import { summaryPreview } from '@/lib/reading-presentation';

export function SummaryPreview({ blocks }: { blocks: ReadingBlock[] }) {
  const [expanded, setExpanded] = useState(false);
  const preview = summaryPreview(blocks);
  return <>
    <ReadingContent blocks={expanded ? blocks : preview.blocks} />
    {preview.shortened && <AppButton variant="secondary" title={expanded ? 'Show Less' : 'Read More'}
      accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} />}
  </>;
}
