import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ArtworkImage } from '@/components/artwork-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EnergyArtwork } from '@/constants/energy-artwork';
import type { ImageSource } from 'expo-image';
import type { ChartEnergy } from '@/lib/personal-chart';

// Stable public UI identifiers; URLs always come from the catalogue.
const icons: Record<string, string> = {
  essence: 'ui.fundamental-nature', energyFacts: 'ui.overview',
  'Your Nature': 'ui.fundamental-nature', 'People and Relationships': 'ui.relationships',
  'Work and Direction': 'ui.career', 'Wellbeing and Balance': 'ui.health',
  character: 'ui.fundamental-nature', childNature: 'ui.inner-child',
  adultChildRelationship: 'ui.adult-child-relationship', stressResponse: 'ui.stress-response',
  intellectualQualities: 'ui.intellectual-qualities', interpersonalQualities: 'ui.interpersonal-qualities',
  emotionalLandscape: 'ui.emotional-energy', relationships: 'ui.relationships',
  career: 'ui.career', finances: 'ui.finances', health: 'ui.health', spirituality: 'ui.spirituality',
};

export function SectionWidgets({ items, selected, onSelect, energy, disabled = false }: {
  items: { key: string; title: string; artworkId?: string; hint?: string; fallbackArtwork?: ImageSource }[];
  selected: string; onSelect: (key: string) => void; energy?: ChartEnergy; disabled?: boolean;
}) {
  const theme = useTheme();
  return <View style={styles.grid}>{items.map((item) => <Pressable key={item.key}
    accessibilityRole="button" accessibilityLabel={item.title}
    accessibilityHint={item.hint} disabled={disabled}
    accessibilityState={{ selected: selected === item.key, disabled }} onPress={() => onSelect(item.key)}
    style={({ pressed }) => [styles.item, {
      backgroundColor: pressed || selected === item.key ? theme.backgroundSelected : theme.panelHeader,
      borderColor: selected === item.key ? theme.primary : theme.border,
    }]}>
    {(item.key === 'personality' || item.key === 'character') && energy ? <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl}
      fallback={EnergyArtwork[energy.number]} style={styles.icon} contentFit="contain" accessible={false} />
      : (item.artworkId || icons[item.key] || item.fallbackArtwork) && <ArtworkImage artworkId={item.artworkId ?? icons[item.key]}
        fallback={item.fallbackArtwork}
        style={styles.icon} contentFit="contain" accessible={false} />}
    <ThemedText type="smallBold" style={styles.label}>{item.title}</ThemedText>
    {!!item.hint && <ThemedText type="small" themeColor="textSecondary" style={styles.label}>{item.hint}</ThemedText>}
  </Pressable>)}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  item: { flexGrow: 1, flexBasis: '45%', minHeight: 144, alignItems: 'center',
    justifyContent: 'flex-start', gap: Spacing.three, padding: Spacing.three,
    borderRadius: Radius.panel, borderWidth: 1 },
  label: { textAlign: 'center', lineHeight: 20 },
  icon: { width: 72, height: 72 },
});
