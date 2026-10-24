import { ArtworkImage } from '@/components/artwork-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ChartEnergy } from '@/lib/personal-chart';

export function EnergyCard({ energy, title, hint, compact = false, selected = false, onPress, actionLabel = 'Find out more' }: {
  energy: ChartEnergy; title: string; hint: string; compact?: boolean;
  selected?: boolean; onPress?: () => void; actionLabel?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable accessible accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${title}, ${energy.number}${energy.name ? `, ${energy.name}` : ''}`}
      accessibilityHint={onPress ? 'Opens the details for this energy' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress} onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, {
        backgroundColor: pressed || selected ? theme.backgroundSelected : theme.panelHeader,
        borderColor: selected ? theme.primary : 'transparent',
      }]}>
      <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl} fallback={EnergyArtwork[energy.number]}
        style={[styles.art, compact && styles.compactArt]}
        contentFit="contain" accessible={false} />
      <View style={styles.text}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {!!energy.name && <ThemedText>{energy.name}{energy.element ? ` · ${energy.element}` : ''}</ThemedText>}
        <ThemedText type="small" themeColor="textSecondary">{hint}</ThemedText>
        {!!onPress && <ThemedText type="small" themeColor="primary">{actionLabel}</ThemedText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center', padding: Spacing.two,
    borderRadius: Radius.control, borderWidth: 1, minHeight: 96 },
  compact: { minHeight: 72 },
  art: { width: 80, height: 80 },
  compactArt: { width: 56, height: 56 },
  text: { flex: 1, minWidth: 0 },
});
