import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChartDetails } from '@/components/chart-details';
import { EnergyCard } from '@/components/energy-card';
import { ContextualHelp } from '@/components/contextual-help';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppPanel } from '@/components/ui/app-panel';
import { AppModal } from '@/components/ui/app-modal';
import { Spacing } from '@/constants/theme';
import { selectChartDetail } from '@/lib/chart-sections';
import type { ChartEnergy, PersonalChart as Chart } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

// Reusable chart presentation: selection uses only the supplied chart data.
export function PersonalChart({ chart, title }: { chart: Chart; title?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? selectChartDetail(chart, selected) : null;

  function energyCard(energy: ChartEnergy, compact = false) {
    return <EnergyCard key={energy.key} energy={energy}
      title={chart.help?.[energy.key]?.title ?? energy.name} hint="" compact={compact}
      selected={selected === energy.key} onPress={() => setSelected(energy.key)}
      actionLabel={uiCopy.findOutMore} />;
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.intro}>
          <ThemedText type="title" accessibilityRole="header">{title ?? chart.help?.overview?.title}</ThemedText>
          {!!chart.name && <ThemedText type="subtitle">{chart.name}</ThemedText>}
          <ThemedText themeColor="textSecondary">{uiCopy.chartGuidance}</ThemedText>
        </View>
        <AppPanel title={uiCopy.coreEnergies}>
          {chart.energies.map((energy) => energyCard(energy))}
        </AppPanel>
        {!!chart.summary && <ContextualHelp help={{ title: uiCopy.yourSummary,
          culture: chart.help?.overview?.culture ?? '', blocks: chart.summaryBlocks }} />}
        <AppDisclosure title={uiCopy.extendedProfile} defaultExpanded>
          {chart.extendedEnergies.length ? chart.extendedEnergies.map((energy) => energyCard(energy, true))
            : <ThemedText>{uiCopy.extendedUnavailable}</ThemedText>}
        </AppDisclosure>
      </View>
      {detail && <AppModal key={detail.key} title={detail.title} backToTopLabel={uiCopy.backToMenu} onClose={() => setSelected(null)}>
        <ChartDetails detail={detail} />
      </AppModal>}
      {chart.access === 'free' && (
        <ThemedText type="small" themeColor="textSecondary">{uiCopy.accessNotice}</ThemedText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.two },
  header: { gap: Spacing.four },
});
