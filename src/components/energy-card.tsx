import { useUiLabels } from '@/hooks/use-ui-labels';
import { ArtworkImage } from '@/components/artwork-image';
import { type ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ChartEnergy } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

export function EnergyCard({ energy, title, hint, compact = false, selected = false, onPress,
  artworkSize, artworkFrameSize, subtitle, caption, artwork, disabled = false, prominent = false,
  bottomAction, showChevron = true, fitTitle = false }: {
  energy: ChartEnergy; title: string; hint: string; compact?: boolean;
  selected?: boolean; onPress?: () => void;
  artworkSize?: number; subtitle?: string; caption?: string;
  artworkFrameSize?: number;
  artwork?: ReactNode;
  disabled?: boolean;
  prominent?: boolean; bottomAction?: ReactNode; showChevron?: boolean; fitTitle?: boolean;
}) {
  useUiLabels();
  const theme = useTheme();
  const secondary = subtitle !== undefined ? subtitle
    : energy.name ? `${energy.name}${energy.element ? ` · ${energy.element}` : ''}` : '';
  const cardStyle = [styles.card, compact && styles.compact, {
    backgroundColor: selected ? theme.backgroundSelected : theme.panelHeader,
    borderColor: selected ? theme.primary : 'transparent',
  }];
  const cardContent = <>
    <View style={[styles.artworkFrame, artworkFrameSize !== undefined && { width: artworkFrameSize, height: artworkFrameSize }]}>
      {artwork ? <View style={[styles.art, compact && styles.compactArt,
        artworkSize !== undefined && { width: artworkSize, height: artworkSize }]}>{artwork}</View>
        : <ArtworkImage artworkId={energy.artworkId} legacyUrl={energy.imageUrl} fallback={EnergyArtwork[energy.number]}
      style={[styles.art, compact && styles.compactArt, artworkSize !== undefined && { width: artworkSize, height: artworkSize }]}
      contentFit="contain" accessible={false} />}
    </View>
    <View style={styles.text}>
      {!!title && <ThemedText type={prominent ? 'sectionTitle' : 'smallBold'}
        numberOfLines={fitTitle ? 1 : undefined} adjustsFontSizeToFit={fitTitle}>{title}</ThemedText>}
      {!!secondary && <ThemedText>{secondary}</ThemedText>}
      {!!caption && <ThemedText type="small" themeColor="textSecondary">{caption}</ThemedText>}
      {!!hint && <ThemedText type="small" themeColor="textSecondary">{hint}</ThemedText>}
    </View>
  </>;
  if (bottomAction) return <View style={[cardStyle, styles.cardColumn]}>
    <Pressable accessible accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, secondary || String(energy.number), caption].filter(Boolean).join(', ')}
      accessibilityHint={onPress ? uiCopy.energyDetailsHint : undefined}
      accessibilityState={onPress ? { selected, disabled } : undefined}
      disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => [styles.cardContent, styles.cardContentColumn,
        pressed && { backgroundColor: theme.backgroundSelected }]}>
      {cardContent}
    </Pressable>
    <View style={styles.bottomAction}>{bottomAction}</View>
  </View>;
  return (
    <Pressable accessible accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, secondary || String(energy.number), caption].filter(Boolean).join(', ')}
      accessibilityHint={onPress ? uiCopy.energyDetailsHint : undefined}
      accessibilityState={onPress ? { selected, disabled } : undefined}
      disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => [cardStyle,
        pressed && { backgroundColor: theme.backgroundSelected }]}>
      {cardContent}
      {!!onPress && showChevron && <View style={styles.chevron} pointerEvents="none" accessible={false}
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
  cardContent: { flex: 1, minWidth: 0, flexDirection: 'row', gap: Spacing.three, alignItems: 'center',
    padding: Spacing.two, borderRadius: Radius.control },
  compact: { minHeight: 72 },
  art: { width: 80, height: 80 },
  compactArt: { width: 56, height: 56 },
  text: { flex: 1, minWidth: 0 },
  artworkFrame: { alignItems: 'center', justifyContent: 'center' },
  chevron: { alignSelf: 'center', flexShrink: 0, marginRight: Spacing.one },
  cardColumn: { flexDirection: 'column', alignItems: 'stretch', gap: 0, padding: 0 },
  cardContentColumn: { flex: 0, alignSelf: 'stretch', paddingTop: Spacing.one, paddingBottom: 0, paddingHorizontal: Spacing.two },
  bottomAction: { alignItems: 'flex-end', paddingRight: Spacing.two, paddingBottom: Spacing.one + Spacing.two },
});
