import { useState } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { EnergyCards } from '@/components/energy-cards';
import { EnergyBanner } from '@/components/energy-banner';
import { ChartReading } from '@/components/chart-reading';
import { ReadingGroups } from '@/components/reading-groups';
import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { additionalPeriods, primaryPeriods, predictionCycle, type PredictionPeriod, type Predictions as Reading } from '@/lib/predictions';
import { uiCopy } from '@/lib/ui-copy';

// Own and future calculator hosts share this result presentation. Short period
// labels remain a backend gap; these are the actual API reading titles.
export function Predictions({ predictions, scopeLabels, title = uiCopy.predictions.title }: {
  predictions: Reading; scopeLabels: { personal: string; lunar: string; global: string }; title?: string;
}) {
  const [selected, setSelected] = useState<PredictionPeriod | null>(null);
  const detail = selected ? predictionCycle(predictions, selected) : undefined;
  function cards(periods: readonly PredictionPeriod[], additional = false) {
    return <EnergyCards additional={additional} items={periods.flatMap((period, rank) => {
      const cycle = predictionCycle(predictions, period);
      return cycle ? [{ key: period, rank, energy: cycle.energy,
        // Period/house display labels are not exposed yet. Do not replace them
        // with reading titles, About titles, JSON keys or a hardcoded House suffix.
        title: '', subtitle: cycle.energy.element ? `${cycle.energy.number} ${cycle.energy.element}` : undefined,
        caption: cycle.reading.title, selected: selected === period, onPress: () => setSelected(period),
      }] : [];
    })} />;
  }
  return <>
    <ThemedText type="title" accessibilityRole="header">{title}</ThemedText>
    {!!predictions.name && <ThemedText type="subtitle">{predictions.name}</ThemedText>}
    {predictions.help.moreOnCycles && <ContextualHelp help={predictions.help.moreOnCycles} />}
    <ReadingGroups primaryTitle={uiCopy.predictions.primary} additionalTitle={uiCopy.predictions.additional}
      primary={cards(primaryPeriods)}
      additional={additionalPeriods.some((period) => predictionCycle(predictions, period))
        ? cards(additionalPeriods, true) : <ThemedText>{uiCopy.predictions.additionalUnavailable}</ThemedText>} />
    {predictions.access === 'free' && <ThemedText type="small" themeColor="textSecondary">{uiCopy.accessNotice}</ThemedText>}
    {selected && detail && <AppModal title={detail.reading.title ?? ''} onClose={() => setSelected(null)}>
      {predictions.help[selected] && <ContextualHelp help={predictions.help[selected]} />}
      {selected === 'epoch' && predictions.help.globalKiWarning && <ContextualHelp help={predictions.help.globalKiWarning} />}
      <EnergyBanner energy={detail.energy} />
      {(['personal', 'lunar', 'global'] as const).filter((scope) => selected !== 'epoch' || scope === 'global').map((scope) => {
        // Backend FreePredictions currently omits FreeYear's global=true flag.
        // Retain its payload but withhold that potentially mislabelled prose.
        if (predictions.access === 'free' && scope === 'global') return null;
        const cycle = predictions.scopes[scope][selected];
        if (!cycle) return null;
        if (!scopeLabels[scope]) return scope === 'personal' || selected === 'epoch'
          ? <ChartReading key={scope} reading={cycle.reading} title={cycle.reading.title ?? ''} /> : null;
        return <AppDisclosure key={scope} title={scopeLabels[scope]} defaultExpanded={scope === (selected === 'epoch' ? 'global' : 'personal')}>
          {scope === 'global' && selected !== 'epoch' && predictions.help.globalKiWarning && <ContextualHelp help={predictions.help.globalKiWarning} />}
          <ChartReading reading={cycle.reading} title={cycle.reading.title ?? ''} />
        </AppDisclosure>;
      })}
    </AppModal>}
  </>;
}
