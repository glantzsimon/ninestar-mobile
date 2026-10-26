import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { EnergyCard } from '@/components/energy-card';
import { EnergyInfluenceScale, Spacing } from '@/constants/theme';
import type { ChartEnergy } from '@/lib/personal-chart';

export type EnergyCardItem = {
  key: string; energy: ChartEnergy; title: string; subtitle?: string; caption?: string;
  rank: number; selected?: boolean; onPress: () => void;
};

// Shared chart/prediction/calculator header widgets. Scale artwork, never labels
// or tap targets. Measure actual headings so translated/scaled text stays intact
// and all artwork starts at the same vertical position.
export function EnergyCards({ items, additional = false }: { items: EnergyCardItem[]; additional?: boolean }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [headings, setHeadings] = useState<Record<string, number>>({});
  const columns = width >= 280 && fontScale <= 1.3 ? Math.min(3, Math.max(1, items.length)) : 1;
  const cardWidth = Math.max(0, (width - Spacing.two * (columns - 1)) / columns);
  const baseSize = columns === 1 ? 112 : Math.max(48, Math.min(160, cardWidth - Spacing.two * 2 - 2));
  const ratios = EnergyInfluenceScale[additional ? 'additional' : 'primary'];
  const headingHeight = Math.max(0, ...items.map((item) => headings[item.key] ?? 0));
  return <View style={styles.grid} onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}>
    {items.map((item) => <View key={item.key} style={{ width: columns === 1 ? '100%' : cardWidth }}>
      <EnergyCard energy={item.energy} title={item.title} subtitle={item.subtitle} caption={item.caption}
        selected={item.selected} onPress={item.onPress} hint="" compact={additional} stacked
        artworkSize={Math.round(baseSize * (ratios[item.rank] ?? ratios[2]))}
        headingHeight={headingHeight} onHeadingHeight={(height) => setHeadings((current) =>
          current[item.key] === height ? current : { ...current, [item.key]: height })} />
    </View>)}
  </View>;
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: Spacing.two } });
