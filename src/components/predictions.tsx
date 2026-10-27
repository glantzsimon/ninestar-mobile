import { useState } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { EnergyCards } from '@/components/energy-cards';
import { ChartReading } from '@/components/chart-reading';
import { ReadingGroups } from '@/components/reading-groups';
import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { globalAdditionalPeriods, personalAdditionalPeriods, primaryPeriods, predictionCycle, type PredictionPeriod, type Predictions as Reading } from '@/lib/predictions';
import { uiCopy } from '@/lib/ui-copy';

// Own and future calculator hosts share the API-authored labels and presentation.
export function Predictions({ predictions, title = uiCopy.predictions.title }: {
  predictions: Reading; title?: string;
}) {
  const [selected, setSelected] = useState<{ period: PredictionPeriod; scope: 'personal' | 'global' } | null>(null);
  const detail = selected ? predictionCycle(predictions, selected.period, selected.scope) : undefined;
  const { labels } = predictions;
  const scopeLabels = labels.scopes;
  function cards(periods: readonly PredictionPeriod[], additional = false, scope: 'personal' | 'global' = 'personal') {
    return <EnergyCards additional={additional} items={periods.flatMap((period, rank) => {
      const cycle = predictionCycle(predictions, period, scope);
      return cycle ? [{ key: period, rank, energy: cycle.energy,
        title: labels.cycleTitles[period], subtitle: cycle.houseName,
        caption: additional ? undefined : cycle.reading.title,
        selected: selected?.period === period && selected.scope === scope, onPress: () => setSelected({ period, scope }),
      }] : [];
    })} />;
  }
  return <>
    <ThemedText type="title" accessibilityRole="header">{title}</ThemedText>
    {predictions.help.overview && <ContextualHelp help={predictions.help.overview} />}
    <ThemedText type="sectionTitle" accessibilityRole="header">{labels.housesYouCurrentlyOccupy || uiCopy.predictions.housesHeading}</ThemedText>
    <ReadingGroups primaryTitle={labels.groups.primary} additionalTitle={labels.groups.additional}
      primary={cards(primaryPeriods)}
      additional={personalAdditionalPeriods.some((period) => predictionCycle(predictions, period))
        ? cards(personalAdditionalPeriods, true) : <ThemedText>{uiCopy.predictions.additionalUnavailable}</ThemedText>} />
    {(primaryPeriods.some((period) => predictionCycle(predictions, period, 'global'))
      || globalAdditionalPeriods.some((period) => predictionCycle(predictions, period, 'global'))) &&
      <ReadingGroups primaryTitle={labels.groups.global} additionalTitle={labels.groups.extendedGlobal}
        primary={primaryPeriods.some((period) => predictionCycle(predictions, period, 'global'))
          ? cards(primaryPeriods, false, 'global') : undefined}
        additional={globalAdditionalPeriods.some((period) => predictionCycle(predictions, period, 'global'))
          ? cards(globalAdditionalPeriods, true, 'global') : undefined} />}
    {predictions.access === 'free' && <ThemedText type="small" themeColor="textSecondary">{uiCopy.accessNotice}</ThemedText>}
    {selected && detail && <AppModal title={labels.predictionTitles[selected.period] || labels.periods[selected.period]} onClose={() => setSelected(null)}>
      {selected.scope === 'global' && predictions.help.globalKi && <ContextualHelp help={predictions.help.globalKi} />}
      {selected.scope === 'personal' && predictions.help[selected.period] && <ContextualHelp help={predictions.help[selected.period]} />}
      {selected.period === 'epoch' && predictions.help.globalKiWarning && <ContextualHelp help={predictions.help.globalKiWarning} />}
      <ChartReading key={`${selected.scope}:${selected.period}`} energy={detail.energy}
        reading={detail.reading} title={detail.reading.title ?? ''} />
      {selected.scope === 'personal' && scopeLabels.lunar && predictions.scopes.lunar[selected.period] &&
        <AppDisclosure title={scopeLabels.lunar}>
          <ChartReading reading={predictions.scopes.lunar[selected.period].reading}
            title={predictions.scopes.lunar[selected.period].reading.title ?? ''} />
        </AppDisclosure>}
    </AppModal>}
  </>;
}
