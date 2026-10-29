import { useState } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { EnergyCards } from '@/components/energy-cards';
import { ChartReading } from '@/components/chart-reading';
import { ReadingGroups } from '@/components/reading-groups';
import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppSelect } from '@/components/ui/app-select';
import { SectionWidgets } from '@/components/section-widgets';
import { MagicSquare, MagicSquareReading } from '@/components/magic-square';
import { useEnergyDisplay } from '@/hooks/use-energy-display';
import { TravelSummary } from '@/components/travel-summary';
import { globalAdditionalPeriods, personalAdditionalPeriods, primaryPeriods, predictionCycle, type PredictionPeriod, type Predictions as Reading } from '@/lib/predictions';
import { uiCopy } from '@/lib/ui-copy';

// Own and future calculator hosts share the API-authored labels and presentation.
export function Predictions({ predictions, title = uiCopy.predictions.title }: {
  predictions: Reading; title?: string;
}) {
  const [selected, setSelected] = useState<{ period: PredictionPeriod; scope: 'personal' | 'global' } | null>(null);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const { mode, setMode } = useEnergyDisplay();
  const squares = predictions.magicSquares;
  const { controls, displayOptions } = predictions.labels;
  const displayControlsAvailable = !!squares && !!controls.advancedOptions && !!controls.display && displayOptions.length === 2;
  const displayMode = displayControlsAvailable ? mode : 'Graphical';
  const directionologyAvailable = !!controls.directionology && (!!predictions.travelSummary || !!squares && primaryPeriods.some(period => squares.personal[period]));
  const detail = selected ? predictionCycle(predictions, selected.period, selected.scope) : undefined;
  const { labels } = predictions;
  const scopeLabels = labels.scopes;
  function cards(periods: readonly PredictionPeriod[], additional = false, scope: 'personal' | 'global' = 'personal') {
    return <EnergyCards additional={additional} items={periods.flatMap((period, rank) => {
      const cycle = predictionCycle(predictions, period, scope);
      const square = squares?.[scope][period];
      return cycle ? [{ key: period, rank, energy: cycle.energy,
        title: labels.cycleTitles[period], subtitle: cycle.houseName,
        caption: additional ? undefined : cycle.reading.title,
        artwork: displayMode === 'MagicSquare' && square ? <MagicSquare square={square} compact /> : undefined,
        selected: selected?.period === period && selected.scope === scope, onPress: () => setSelected({ period, scope }),
      }] : [];
    })} />;
  }
  return <>
    <ThemedText type="title" accessibilityRole="header">{title}</ThemedText>
    {predictions.help.overview && <ContextualHelp help={predictions.help.overview} />}
    {displayControlsAvailable && <AppDisclosure title={controls.advancedOptions}>
      <AppSelect label={controls.display} value={displayMode} onChange={setMode} options={displayOptions} />
    </AppDisclosure>}
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
    {directionologyAvailable && <SectionWidgets selected=""
      items={[{ key: 'directionology', title: controls.directionology, artworkId: 'ninestar.magic-square-plate' }]}
      onSelect={() => setDirectionsOpen(true)} />}
    {directionsOpen && directionologyAvailable && <AppModal title={controls.directionology} onClose={() => setDirectionsOpen(false)}>
      {primaryPeriods.map(period => squares?.personal[period]
        ? <MagicSquareReading key={period} square={squares.personal[period]!} arrows /> : null)}
      {predictions.travelSummary && <TravelSummary summary={predictions.travelSummary} />}
    </AppModal>}
    {predictions.access === 'free' && <ThemedText type="small" themeColor="textSecondary">{uiCopy.accessNotice}</ThemedText>}
    {selected && detail && <AppModal title={labels.predictionTitles[selected.period] || labels.periods[selected.period]} onClose={() => setSelected(null)}>
      {selected.scope === 'global' && predictions.help.globalKi && <ContextualHelp help={predictions.help.globalKi} />}
      {selected.scope === 'personal' && predictions.help[selected.period] && <ContextualHelp help={predictions.help[selected.period]} />}
      {selected.period === 'epoch' && predictions.help.globalKiWarning && <ContextualHelp help={predictions.help.globalKiWarning} />}
      {displayMode === 'MagicSquare' && squares?.[selected.scope][selected.period] &&
        <MagicSquareReading square={squares[selected.scope][selected.period]!} />}
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
