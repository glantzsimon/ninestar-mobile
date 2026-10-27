import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { FadeView } from '@/components/ui/fade-view';
import { EnergyArtwork } from '@/constants/energy-artwork';
import type { ChartEnergy, ChartReading as Reading } from '@/lib/personal-chart';
import { readingPresentation } from '@/lib/reading-presentation';

export function ChartReading({ reading, title, energy, initialFull = false }: {
  reading: Reading; title: string; energy?: ChartEnergy; initialFull?: boolean;
}) {
  const [full, setFull] = useState(initialFull);
  const presentation = readingPresentation(reading, full);
  return <AppPanel title={title} headerAction={presentation.canToggle ? {
    title: full ? 'View Summary' : 'View Full Text', expanded: full, onPress: () => setFull(!full),
    icon: full ? 'summary' : 'fullText',
  } : undefined}>
    {energy && <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl}
      fallback={EnergyArtwork[energy.number]} style={styles.image} contentFit="contain" accessible={false} />}
    {!!reading.unavailableMessage && <ThemedText>{reading.unavailableMessage}</ThemedText>}
    <FadeView key={full ? 'full' : 'summary'}><ReadingContent blocks={presentation.blocks} /></FadeView>
  </AppPanel>;
}

const styles = StyleSheet.create({ image: { width: 88, height: 88, alignSelf: 'center' } });
