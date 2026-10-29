import type { ChartEnergy, ChartReading } from './personal-chart';
import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { readingBlocks, readingText } from './reading-text';
import { parseMagicSquares, type MagicSquares } from './magic-squares';
import { parseTravelSummary, type TravelSummary } from './travel-summary';
import { parsePredictionControls, type PredictionControls } from './prediction-controls';

export const primaryPeriods = ['year', 'month', 'day'] as const;
export const additionalPeriods = ['generation', 'epoch', 'hour'] as const;
export const personalAdditionalPeriods = ['generation', 'hour'] as const;
export const globalAdditionalPeriods = ['epoch', 'generation'] as const;
export const predictionScopes = ['personal', 'lunar', 'global'] as const;
export type PredictionScope = typeof predictionScopes[number];
export type PredictionPeriod = typeof primaryPeriods[number] | typeof additionalPeriods[number];
export type PredictionCycle = { energy: ChartEnergy; houseName: string; reading: ChartReading };
export type PredictionLabels = PredictionControls & {
  yourPredictions: string; housesYouCurrentlyOccupy: string;
  predictionTitles: Record<PredictionPeriod, string>;
  periods: Record<PredictionPeriod, string>; cycleTitles: Record<PredictionPeriod, string>;
  scopes: Record<PredictionScope, string>; groups: Record<'primary' | 'additional' | 'global' | 'extendedGlobal', string>;
};
export type Predictions = {
  access: 'full' | 'free'; name: string; help: Record<string, ContextualHelp>;
  scopes: Record<PredictionScope, Record<string, PredictionCycle>>;
  labels: PredictionLabels;
  magicSquares: MagicSquares | null;
  travelSummary: TravelSummary | null;
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

function displayLabels<K extends string>(value: unknown, keys: readonly K[]): Record<K, string> {
  const labels = object(value);
  return Object.fromEntries(keys.map((key) => [key, readingText(labels[key])])) as Record<K, string>;
}

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
        houseName: readingText(cycle.houseName),
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
  const labels = object(data.labels);
  const periods = [...primaryPeriods, ...additionalPeriods];
  return { access, scopes, help: parseContextualHelp(data.help), magicSquares: parseMagicSquares(data.magicSquares, access),
    travelSummary: parseTravelSummary(data.travelSummary, access),
    labels: { ...parsePredictionControls(labels), yourPredictions: readingText(labels.yourPredictions),
      housesYouCurrentlyOccupy: readingText(labels.housesYouCurrentlyOccupy),
      predictionTitles: displayLabels(labels.predictionTitles, periods),
      periods: displayLabels(labels.periods, periods), cycleTitles: displayLabels(labels.cycleTitles, periods),
      scopes: displayLabels(labels.scopes, predictionScopes), groups: displayLabels(labels.groups, ['primary', 'additional', 'global', 'extendedGlobal']) },
    name: readingText(object(data.profile).name) || readingText(object(object(data.profile).person).name) };
}

export function predictionCycle(predictions: Predictions, period: PredictionPeriod,
  scope: 'personal' | 'global' = 'personal'): PredictionCycle | undefined {
  return predictions.scopes[scope][period];
}
