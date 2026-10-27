import { StyleSheet, View } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ThemedText } from '@/components/themed-text';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChartEnergy } from '@/lib/personal-chart';

// Shared identity banner for every energy detail and future calculator results.
export function EnergyBanner({ energy, title = energy.title }: { energy: ChartEnergy; title?: string }) {
  const theme = useTheme();
  return <View style={[styles.banner, { backgroundColor: theme.panelHeader, borderColor: theme.border }]}>
    <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl}
      fallback={EnergyArtwork[energy.number]} style={styles.image} contentFit="contain" accessible={false} />
    {!!title && <ThemedText type="sectionTitle" accessibilityRole="header" style={styles.title}>
      {title}
    </ThemedText>}
  </View>;
}

const styles = StyleSheet.create({
  banner: { width: '100%', padding: Spacing.three, gap: Spacing.three,
    borderRadius: Radius.panel, borderWidth: 1, alignItems: 'center' },
  image: { width: 88, height: 88 }, title: { textAlign: 'center' },
});
