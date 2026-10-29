import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ReadingContent } from '@/components/reading-content';
import { AppButton } from '@/components/ui/app-button';
import type { ReadingBlock } from '@/lib/reading-text';
import { summaryPreview } from '@/lib/reading-presentation';
import { uiCopy } from '@/lib/ui-copy';

export function SummaryPreview({ blocks, onExpand }: { blocks: ReadingBlock[]; onExpand?: () => void }) {
  useUiLabels();
  const [expanded, setExpanded] = useState(false);
  const preview = summaryPreview(blocks);
  const visibleBlocks = expanded ? blocks : preview.blocks;
  const toggle = () => onExpand ? onExpand() : setExpanded((current) => !current);
  const content = <ReadingContent blocks={visibleBlocks} />;
  return <>
    {preview.shortened ? <Pressable onPress={toggle} accessibilityRole="button"
      accessibilityState={{ expanded }} accessibilityLabel={`${expanded ? uiCopy.showLess : uiCopy.readMore}. ${visibleBlocks.map((block) => block.text).join('\n\n')}`}>
      {content}
    </Pressable> : content}
    {preview.shortened && <AppButton variant="secondary" title={expanded ? uiCopy.showLess : uiCopy.readMore}
      accessibilityState={{ expanded }} onPress={toggle} />}
  </>;
}
