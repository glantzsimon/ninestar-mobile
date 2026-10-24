import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChartDetails } from '@/components/chart-details';
import { EnergyCard } from '@/components/energy-card';
import { SummaryPreview } from '@/components/summary-preview';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppPanel } from '@/components/ui/app-panel';
import { useScreenScroll, type ScreenScrollTarget } from '@/components/ui/app-screen';
import { Spacing } from '@/constants/theme';
import { ChartEnergyLabels, selectChartDetail } from '@/lib/chart-sections';
import type { ChartEnergy, PersonalChart as Chart } from '@/lib/personal-chart';

// Reusable chart presentation: selection uses only the supplied chart data.
export function PersonalChart({ chart, title = 'Your Personal Chart' }: { chart: Chart; title?: string }) {
  const scrollToView = useScreenScroll();
  const header = useRef<ScreenScrollTarget>(null);
  const detailView = useRef<ScreenScrollTarget>(null);
  const pendingScroll = useRef<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? selectChartDetail(chart, selected) : null;

  function select(key: string) {
    if (selected === key) {
      if (detailView.current) scrollToView(detailView.current);
      return;
    }
    pendingScroll.current = key;
    setSelected(key);
  }
  function back() { if (header.current) scrollToView(header.current); }
  function energyCard(energy: ChartEnergy, compact = false) {
    return <EnergyCard key={energy.key} energy={energy} {...ChartEnergyLabels[energy.key]} compact={compact}
      selected={selected === energy.key} onPress={() => select(energy.key)}
      actionLabel={selected === energy.key ? 'Viewing details ↓' : 'Find out more ↓'} />;
  }

  return (
    <>
      <View ref={header} collapsable={false} style={styles.header}>
        <View style={styles.intro}>
          <ThemedText type="title" accessibilityRole="header">{title}</ThemedText>
          {!!chart.name && <ThemedText type="subtitle">{chart.name}</ThemedText>}
          <ThemedText themeColor="textSecondary">Choose an energy to explore its meaning, one section at a time.</ThemedText>
        </View>
        <View style={styles.profile}>
          <AppPanel title="Your Core Energies">
            {chart.energies.map((energy) => energyCard(energy))}
          </AppPanel>
          <AppDisclosure title="Extended Profile" subtitle="Day Star · Generation · Epoch">
            {chart.extendedEnergies.length ? chart.extendedEnergies.map((energy) => energyCard(energy, true))
              : <ThemedText>Your extended energies are not available for this chart yet.</ThemedText>}
          </AppDisclosure>
        </View>
        {!!chart.summary && <AppPanel title="Your Summary"><SummaryPreview blocks={chart.summaryBlocks} /></AppPanel>}
      </View>
      {detail ? (
        <View key={detail.key} ref={detailView} collapsable={false} onLayout={() => {
          if (pendingScroll.current === detail.key) {
            pendingScroll.current = null;
            if (detailView.current) scrollToView(detailView.current);
          }
        }}>
          <ChartDetails detail={detail} onBack={back} />
        </View>
      ) : <ThemedText themeColor="textSecondary">Select an energy above to see its details here.</ThemedText>}
      {chart.access === 'free' && (
        <ThemedText type="small" themeColor="textSecondary">You are viewing the chart sections included with your account.</ThemedText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.two },
  header: { gap: Spacing.four },
  profile: { gap: Spacing.four },
});
