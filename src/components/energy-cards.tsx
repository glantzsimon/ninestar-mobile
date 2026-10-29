import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { EnergyCard } from '@/components/energy-card';
import { EnergyInfluenceScale, Spacing } from '@/constants/theme';
import type { ChartEnergy } from '@/lib/personal-chart';

export type EnergyCardItem = {
  key: string; energy: ChartEnergy; title: string; subtitle?: string; caption?: string;
  rank: number; selected?: boolean; onPress: () => void; disabled?: boolean;
  artwork?: ReactNode;
};

// Keep one full-width card per row on every screen. Influence changes artwork
// size only; it must never switch the list into a horizontal grid.
export function EnergyCards({ items, additional = false, disabled = false }: {
  items: EnergyCardItem[]; additional?: boolean; disabled?: boolean;
}) {
  const baseSize = 80;
  const ratios = EnergyInfluenceScale[additional ? 'additional' : 'primary'];
  return <View style={styles.list}>
    {items.map((item) => <EnergyCard key={item.key} energy={item.energy} title={item.title} subtitle={item.subtitle} caption={item.caption}
        selected={item.selected} onPress={item.onPress} hint="" compact={additional} disabled={disabled || item.disabled}
        artworkSize={Math.round(baseSize * (ratios[item.rank] ?? ratios[2]))}
        artworkFrameSize={Math.round(baseSize * ratios[0])} artwork={item.artwork} />)}
  </View>;
}

const styles = StyleSheet.create({ list: { width: '100%', gap: Spacing.two } });
