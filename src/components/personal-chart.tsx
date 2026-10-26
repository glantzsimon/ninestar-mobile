import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChartDetails } from '@/components/chart-details';
import { EnergyCards } from '@/components/energy-cards';
import { ContextualHelp } from '@/components/contextual-help';
import { ThemedText } from '@/components/themed-text';
import { ReadingGroups } from '@/components/reading-groups';
import { AppModal } from '@/components/ui/app-modal';
import { Spacing } from '@/constants/theme';
import { energyRoleTitle, selectChartDetail } from '@/lib/chart-sections';
import type { ChartEnergy, PersonalChart as Chart } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

// Reusable chart presentation: selection uses only the supplied chart data.
export function PersonalChart({ chart, title }: { chart: Chart; title?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? selectChartDetail(chart, selected) : null;

  function energyCards(energies: ChartEnergy[], additional = false) {
    const roles = additional ? ['dayStar', 'generation', 'epoch'] : ['core', 'character', 'socialExpression'];
    return <EnergyCards additional={additional} items={energies.map((energy) => ({
      key: energy.key, energy, title: energyRoleTitle(energy), rank: roles.indexOf(energy.key),
      subtitle: energy.element ? `${energy.number} ${energy.element}` : undefined,
      caption: energy.name, selected: selected === energy.key, onPress: () => setSelected(energy.key),
    }))} />;
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.intro}>
          <ThemedText type="title" accessibilityRole="header">{title ?? uiCopy.personalChart}</ThemedText>
          {!!chart.name && <ThemedText type="subtitle">{chart.name}</ThemedText>}
          <ThemedText themeColor="textSecondary">{uiCopy.chartGuidance}</ThemedText>
        </View>
        <ReadingGroups primaryTitle={uiCopy.coreEnergies} additionalTitle={uiCopy.extendedProfile}
          primary={energyCards(chart.energies)}
          between={!!chart.summary && <ContextualHelp help={{ title: uiCopy.summary,
            culture: chart.help?.overview?.culture ?? '', blocks: chart.summaryBlocks }} />}
          additional={chart.extendedEnergies.length ? energyCards(chart.extendedEnergies, true)
            : <ThemedText>{uiCopy.extendedUnavailable}</ThemedText>} />
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
