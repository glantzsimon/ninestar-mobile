import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ArtworkImage } from '@/components/artwork-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { FeatureArtwork } from '@/constants/feature-artwork';
import type { ImageSource } from 'expo-image';
import type { ChartEnergy } from '@/lib/personal-chart';

// Stable public UI identifiers; URLs always come from the catalogue.
const icons: Record<string, string> = {
  essence: FeatureArtwork.essence, energyFacts: 'ui.overview',
  'Your Nature': FeatureArtwork.essence, 'People and Relationships': 'ui.relationships',
  'Work and Direction': 'ui.career', 'Wellbeing and Balance': 'ui.health',
  constitution: FeatureArtwork.constitution, core: FeatureArtwork.constitution,
  character: FeatureArtwork.character, childNature: 'ui.inner-child',
  adultChildRelationship: 'ui.adult-child-relationship', stressResponse: 'ui.stress-response',
  intellectualQualities: 'ui.intellectual-qualities', interpersonalQualities: 'ui.interpersonal-qualities',
  emotionalLandscape: 'ui.emotional-energy', relationships: 'ui.relationships',
  career: 'ui.career', finances: 'ui.finances', health: 'ui.health', spirituality: 'ui.spirituality',
};

export function SectionWidgets({ items, selected, onSelect, energy, disabled = false }: {
  items: { key: string; title: string; artworkId?: string; icon?: ReactNode; hint?: string; fallbackArtwork?: ImageSource }[];
  selected: string; onSelect: (key: string) => void; energy?: ChartEnergy; disabled?: boolean;
}) {
  const theme = useTheme();
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, index) => items.slice(index * 2, index * 2 + 2));
  return <View style={styles.grid}>{rows.map(row => {
    const centred = items.length > 1 && row.length === 1;
    return <View key={row[0].key} style={[styles.row, centred && styles.centredRow]}>
    {centred && <View style={styles.halfCell} accessible={false} />}
    {row.map((item) => <View key={item.key} style={styles.cell}><Pressable
    accessibilityRole="button" accessibilityLabel={item.title}
    accessibilityHint={item.hint} disabled={disabled}
    accessibilityState={{ selected: selected === item.key, disabled }} onPress={() => onSelect(item.key)}
    style={({ pressed }) => [styles.item, {
      backgroundColor: pressed || selected === item.key ? theme.backgroundSelected : theme.panelHeader,
      borderColor: selected === item.key ? theme.primary : theme.border,
    }]}>
    {item.icon ? <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{item.icon}</View>
      : (item.key === 'personality' || item.key === 'character') && energy ? <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl}
      fallback={EnergyArtwork[energy.number]} style={styles.icon} contentFit="contain" accessible={false} />
      : (item.artworkId || icons[item.key] || item.fallbackArtwork) && <ArtworkImage artworkId={item.artworkId ?? icons[item.key]}
        fallback={item.fallbackArtwork}
        style={styles.icon} contentFit="contain" accessible={false} />}
    <ThemedText type="smallBold" style={styles.label}>{item.title}</ThemedText>
    {!!item.hint && <ThemedText type="small" themeColor="textSecondary" style={styles.label}>{item.hint}</ThemedText>}
    </Pressable></View>)}
    {centred && <View style={styles.halfCell} accessible={false} />}
    </View>;
  })}</View>;
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  // Two half-width spacers plus half gaps preserve the exact paired-card width.
  centredRow: { gap: Spacing.two / 2 },
  halfCell: { flex: 0.5 },
  cell: { flex: 1, minWidth: 0 },
  item: { flex: 1, minWidth: 0, minHeight: 144, alignItems: 'center',
    justifyContent: 'flex-start', gap: Spacing.three, padding: Spacing.three,
    borderRadius: Radius.panel, borderWidth: 1 },
  label: { textAlign: 'center', lineHeight: 20 },
  icon: { width: 72, height: 72 },
});
