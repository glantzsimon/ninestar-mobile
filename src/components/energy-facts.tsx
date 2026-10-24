import { StyleSheet, View } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { Spacing } from '@/constants/theme';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { useTheme } from '@/hooks/use-theme';
import type { ChartEnergy } from '@/lib/personal-chart';

export function EnergyFacts({ energy }: { energy: ChartEnergy }) {
  const theme = useTheme();
  const symbols = ['Yin / Yang', 'Element', 'Group', 'Trigram'].flatMap((label) => {
    const fact = energy.facts?.find((item) => item.label === label);
    return fact ? [fact] : [];
  });
  const facts = energy.facts?.filter((fact) => !symbols.includes(fact)) ?? [];
  const columns = [{ label: 'Energy', value: energy.name || `${energy.number}`, artworkId: energy.artworkId,
    legacyUrl: energy.imageUrl, fallback: EnergyArtwork[energy.number] },
    ...symbols.map((fact) => ({ ...fact, label: fact.label === 'Yin / Yang' ? 'Yin/Yang' : fact.label,
      legacyUrl: undefined, fallback: undefined }))];
  return <View style={styles.rows}>
    {symbols.length < 4 && <ThemedText type="small" themeColor="textSecondary">
      Additional energy information is not available yet.
    </ThemedText>}
    <View style={styles.grid}>
      <View style={styles.symbols}>{columns.map((column) => <View key={column.label} style={styles.symbol}>
        <ThemedText type="smallBold" style={styles.label}>{column.label}</ThemedText>
      </View>)}</View>
      <View style={styles.symbols}>{columns.map((column) => <View key={column.label} style={styles.symbol}>
        <ThemedText type="small" style={styles.label}>{column.value}</ThemedText>
      </View>)}</View>
      <View style={styles.symbols}>{columns.map((column) => <View key={column.label} style={styles.symbol}>
        <ArtworkImage artworkId={column.artworkId} legacyUrl={column.legacyUrl} fallback={column.fallback}
          style={styles.image} contentFit="contain" accessible={false} />
      </View>)}</View>
    </View>
    {!!facts.length && <AppDisclosure title="More Details">
      <View style={[styles.table, { borderColor: theme.border }]}>
      {facts.map((fact, index) => <View key={fact.label} style={[styles.row, {
        borderColor: theme.border, borderTopWidth: index ? 1 : 0,
      }]}>
        <ThemedText type="smallBold" style={styles.text}>{fact.label}</ThemedText>
        <ThemedText style={styles.text}>{fact.value}</ThemedText>
      </View>)}
      </View>
    </AppDisclosure>}
  </View>;
}
const styles = StyleSheet.create({
  rows: { gap: Spacing.four },
  grid: { gap: Spacing.two },
  symbols: { flexDirection: 'row', gap: Spacing.one },
  symbol: { flex: 1, minWidth: 0, alignItems: 'center' },
  label: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.two },
  table: { borderWidth: 1 }, image: { width: '100%', aspectRatio: 1 }, text: { flex: 1, minWidth: 0 },
});
