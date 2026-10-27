import { ArtworkImage } from '@/components/artwork-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ChartEnergy } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

export function EnergyCard({ energy, title, hint, compact = false, selected = false, onPress,
  artworkSize, artworkFrameSize, subtitle, caption }: {
  energy: ChartEnergy; title: string; hint: string; compact?: boolean;
  selected?: boolean; onPress?: () => void;
  artworkSize?: number; subtitle?: string; caption?: string;
  artworkFrameSize?: number;
}) {
  const theme = useTheme();
  const secondary = subtitle !== undefined ? subtitle
    : energy.name ? `${energy.name}${energy.element ? ` · ${energy.element}` : ''}` : '';
  return (
    <Pressable accessible accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, secondary || String(energy.number), caption].filter(Boolean).join(', ')}
      accessibilityHint={onPress ? uiCopy.energyDetailsHint : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress} onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, {
        backgroundColor: pressed || selected ? theme.backgroundSelected : theme.panelHeader,
        borderColor: selected ? theme.primary : 'transparent',
      }]}>
      <View style={[styles.artworkFrame, artworkFrameSize !== undefined && { width: artworkFrameSize, height: artworkFrameSize }]}>
        <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl} fallback={EnergyArtwork[energy.number]}
        style={[styles.art, compact && styles.compactArt, artworkSize !== undefined && { width: artworkSize, height: artworkSize }]}
        contentFit="contain" accessible={false} />
      </View>
      <View style={styles.text}>
        {!!title && <ThemedText type="smallBold">{title}</ThemedText>}
        {!!secondary && <ThemedText>{secondary}</ThemedText>}
        {!!caption && <ThemedText type="small" themeColor="textSecondary">{caption}</ThemedText>}
        {!!hint && <ThemedText type="small" themeColor="textSecondary">{hint}</ThemedText>}
      </View>
      {!!onPress && <View style={styles.chevron} pointerEvents="none" accessible={false}
        accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={20} weight="semibold" tintColor={theme.primary} />
      </View>}
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
  artworkFrame: { alignItems: 'center', justifyContent: 'center' },
  chevron: { alignSelf: 'center', flexShrink: 0, marginRight: Spacing.one },
});
