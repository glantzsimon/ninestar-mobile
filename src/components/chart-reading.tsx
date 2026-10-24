import { useState } from 'react';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import type { ChartReading as Reading } from '@/lib/personal-chart';
import { readingPresentation } from '@/lib/reading-presentation';

export function ChartReading({ reading }: { reading: Reading }) {
  const [full, setFull] = useState(false);
  const presentation = readingPresentation(reading, full);
  return <>
    {!!reading.unavailableMessage && <ThemedText>{reading.unavailableMessage}</ThemedText>}
    {presentation.canToggle && <AppButton variant="secondary" title={full ? 'View Summary' : 'View Full Text'}
      accessibilityState={{ expanded: full }} onPress={() => setFull(!full)} />}
    <ReadingContent blocks={presentation.blocks} />
  </>;
}
