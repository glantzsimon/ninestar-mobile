import type { ChartEnergy, ChartReading } from './personal-chart';
import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { readingBlocks, readingText } from './reading-text';

export const primaryPeriods = ['year', 'month', 'day'] as const;
export const additionalPeriods = ['generation', 'epoch', 'hour'] as const;
export const predictionScopes = ['personal', 'lunar', 'global'] as const;
export type PredictionScope = typeof predictionScopes[number];
export type PredictionPeriod = typeof primaryPeriods[number] | typeof additionalPeriods[number];
export type PredictionCycle = { energy: ChartEnergy; reading: ChartReading };
export type Predictions = {
  access: 'full' | 'free'; name: string; help: Record<string, ContextualHelp>;
  scopes: Record<PredictionScope, Record<string, PredictionCycle>>;
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function parsePredictions(data: Record<string, unknown>, access: 'full' | 'free'): Predictions {
  let count = 0;
  const scopes = Object.fromEntries(predictionScopes.map((scope) => {
    const freeKey = scope === 'personal' ? 'year' : scope === 'lunar' ? 'lunarYear' : 'globalYear';
    const entries = access === 'full' ? Object.entries(object(data[scope])) : [['year', data[freeKey]]] as [string, unknown][];
    const cycles = entries.flatMap(([key, value]) => {
      if (!['year', 'month', 'day', 'generation', 'epoch', 'hour', 'afternoon', 'invertedDay', 'invertedAfternoon'].includes(key)) return [];
      const cycle = object(value), energy = access === 'full' ? object(cycle.energy) : cycle;
      const number = energy.number;
      if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > 9) return [];
      const title = readingText(access === 'full' ? cycle.cycleDescriptiveName : cycle.title);
      count++;
      return [[key, {
        energy: { key, number, name: readingText(energy.name), element: readingText(energy.element),
          title: readingText(energy.title) || undefined,
          artworkId: typeof energy.artworkId === 'string' ? energy.artworkId : undefined,
          imageUrl: typeof energy.imageUrl === 'string' && energy.imageUrl.startsWith('https://') ? energy.imageUrl : undefined,
          descriptionBlocks: [],
        },
        reading: { key, title, body: readingText(cycle.description), bodyBlocks: readingBlocks(cycle.description), summary: '', summaryBlocks: [] },
      }]];
    });
    return [scope, Object.fromEntries(cycles)];
  })) as Predictions['scopes'];
  if (!count) throw new Error('Invalid predictions response');
  return { access, scopes, help: parseContextualHelp(data.help), name: readingText(object(data.profile).name) || readingText(object(object(data.profile).person).name) };
}

export function predictionCycle(predictions: Predictions, period: PredictionPeriod): PredictionCycle | undefined {
  // Match the website's global-only epoch detail.
  return predictions.scopes[period === 'epoch' ? 'global' : 'personal'][period];
}

// Existing enum labels; do not guess a new scope-label transport field.
export function predictionScopeLabels(metadata: Record<string, unknown>) {
  function label(key: string, value: string) {
    const items = metadata[key];
    if (!Array.isArray(items)) return '';
    const match = items.find((item) => object(item).value === value);
    return readingText(object(match).label);
  }
  return { personal: label('houseDisplays', 'SolarHouse'), lunar: label('houseDisplays', 'LunarHouse'), global: label('scopes', 'GlobalKi') };
}
