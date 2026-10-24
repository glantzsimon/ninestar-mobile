import { useState } from 'react';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { FadeView } from '@/components/ui/fade-view';
import type { ChartReading as Reading } from '@/lib/personal-chart';
import { readingPresentation } from '@/lib/reading-presentation';

export function ChartReading({ reading, title }: { reading: Reading; title: string }) {
  const [full, setFull] = useState(false);
  const presentation = readingPresentation(reading, full);
  return <AppPanel title={title} headerAction={presentation.canToggle ? {
    title: full ? 'View Summary' : 'View Full Text', expanded: full, onPress: () => setFull(!full),
    icon: full ? 'summary' : 'fullText',
  } : undefined}>
    {!!reading.unavailableMessage && <ThemedText>{reading.unavailableMessage}</ThemedText>}
    <FadeView key={full ? 'full' : 'summary'}><ReadingContent blocks={presentation.blocks} /></FadeView>
  </AppPanel>;
}
