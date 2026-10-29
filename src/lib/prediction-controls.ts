import { readingText } from './reading-text';
type EnergyDisplay = 'Graphical' | 'MagicSquare';

export type PredictionControls = {
  controls: { display: string; advancedOptions: string; directionology: string; showDirections: string };
  displayOptions: { value: EnergyDisplay; label: string }[];
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

// Both documented sources use the same shape. Hosts can use metadata while the
// reading screen uses its own response, avoiding another request per result.
export function parsePredictionControls(value: unknown, source: 'predictions' | 'metadata' = 'predictions'): PredictionControls {
  const data = object(value), raw = object(data[source === 'metadata' ? 'predictionControls' : 'controls']);
  const options = data[source === 'metadata' ? 'energyDisplays' : 'displayOptions'];
  const seen = new Set<string>();
  const displayOptions: PredictionControls['displayOptions'] = [];
  for (const entry of Array.isArray(options) ? options : []) {
    const item = object(entry);
    if ((item.value !== 'Graphical' && item.value !== 'MagicSquare') || !readingText(item.label) || seen.has(item.value)) continue;
    seen.add(item.value);
    displayOptions.push({ value: item.value, label: readingText(item.label) });
  }
  return { controls: { display: readingText(raw.display), advancedOptions: readingText(raw.advancedOptions),
    directionology: readingText(raw.directionology), showDirections: readingText(raw.showDirections) }, displayOptions };
}
