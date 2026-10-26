import { ArtworkImage } from '@/components/artwork-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ChartEnergy } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

export function EnergyCard({ energy, title, hint, compact = false, selected = false, onPress, actionLabel = uiCopy.findOutMore,
  stacked = false, artworkSize, subtitle, caption, headingHeight, onHeadingHeight }: {
  energy: ChartEnergy; title: string; hint: string; compact?: boolean;
  selected?: boolean; onPress?: () => void; actionLabel?: string;
  stacked?: boolean; artworkSize?: number; subtitle?: string; caption?: string;
  headingHeight?: number; onHeadingHeight?: (height: number) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable accessible accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, subtitle || String(energy.number), caption || energy.name].filter(Boolean).join(', ')}
      accessibilityHint={onPress ? uiCopy.energyDetailsHint : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress} onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, stacked && styles.stacked, {
        backgroundColor: pressed || selected ? theme.backgroundSelected : theme.panelHeader,
        borderColor: selected ? theme.primary : 'transparent',
      }]}>
      {stacked && <View style={[styles.headingSlot, { minHeight: headingHeight }]}>
        <View style={styles.heading} onLayout={({ nativeEvent }) => onHeadingHeight?.(nativeEvent.layout.height)}>
          {!!title && <ThemedText type="smallBold" style={styles.centred}>{title}</ThemedText>}
          {!!subtitle && <ThemedText type="small" style={styles.centred}>{subtitle}</ThemedText>}
        </View>
      </View>}
      <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl} fallback={EnergyArtwork[energy.number]}
        style={[styles.art, compact && styles.compactArt, artworkSize !== undefined && { width: artworkSize, height: artworkSize }]}
        contentFit="contain" accessible={false} />
      {stacked ? <>
        {!!caption && <ThemedText type="small" style={styles.centred}>{caption}</ThemedText>}
        {!!hint && <ThemedText type="small" themeColor="textSecondary" style={styles.centred}>{hint}</ThemedText>}
      </> : <View style={styles.text}>
        {!!title && <ThemedText type="smallBold">{title}</ThemedText>}
        {!!energy.name && <ThemedText>{energy.name}{energy.element ? ` · ${energy.element}` : ''}</ThemedText>}
        {!!hint && <ThemedText type="small" themeColor="textSecondary">{hint}</ThemedText>}
        {!!onPress && <ThemedText type="small" themeColor="primary">{actionLabel}</ThemedText>}
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
  stacked: { flexDirection: 'column', justifyContent: 'flex-start', gap: Spacing.two, minHeight: ControlHeight },
  headingSlot: { width: '100%' },
  heading: { width: '100%', gap: Spacing.one },
  centred: { textAlign: 'center' },
});
