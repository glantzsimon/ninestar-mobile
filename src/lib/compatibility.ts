import { MobileCalculatorType, type AccountOptions } from './account';
import { buildCalculationPerson, type CalculationDraft } from './calculation';
import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { parsePersonalChart, type PersonalChart } from './personal-chart';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';
import { uiCopy } from './ui-copy';
import { FieldValidationError, withFieldPrefix } from './field-validation';
import { parseElementBreakdown, type ElementSegment } from './element-breakdown';

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function buildCompatibility(first: CalculationDraft, second: CalculationDraft,
  options: AccountOptions, hideSexualChemistry: boolean): Record<string, unknown> {
  if (typeof hideSexualChemistry !== 'boolean') throw new FieldValidationError('hideSexualChemistry', uiCopy.calculator.errors.invalidPreferences);
  if (!options.calculationMethods.some(item => item.value === first.calculationMethod)) {
    throw new FieldValidationError('calculationMethod', uiCopy.calculator.errors.invalidPreferences);
  }
  if (!options.calculatorTypes.some(item => item.value === MobileCalculatorType)) {
    throw new Error(uiCopy.calculator.errors.invalidPreferences);
  }
  // Compatibility has one shared method and no prediction/current-zone settings.
  return { firstPerson: withFieldPrefix('first', () => buildCalculationPerson(first, options)),
    secondPerson: withFieldPrefix('second', () => buildCalculationPerson(second, options)),
    calculationMethod: first.calculationMethod, calculatorType: MobileCalculatorType, hideSexualChemistry };
}

export type CompatibilityReading = {
  first: PersonalChart; second: PersonalChart; help: Record<string, ContextualHelp>;
  overview: ReadingBlock[]; details: { key: string; blocks: ReadingBlock[] }[];
  gauges: CompatibilityGauge[];
  labels: { results: string; firstPerson: string; secondPerson: string;
    sections: Record<string, { title: string; navigationTitle: string }> };
  strengths: { title: string; subtitle: string; blocks: ReadingBlock[] };
  visuals: { fundamental: CompatibilityDiagram | null; character: CompatibilityDiagram | null; breakdown: ElementSegment[] };
};

export type CompatibilityDiagram = { artworkId: string; before: ReadingBlock[]; after: ReadingBlock[] };

function parseDiagram(raw: unknown, transformationHtml: unknown, readingHtml: unknown): CompatibilityDiagram | null {
  const { artworkId } = object(raw);
  if (typeof artworkId !== 'string' || !/^[a-z\d][a-z\d._-]{0,255}$/i.test(artworkId)) return null;
  const html = typeof transformationHtml === 'string' ? transformationHtml : '';
  const image = /<img\b[^>]*>/i.exec(html);
  // Split around the existing image's position. readingBlocks suppresses all
  // HTML image tags; explicit artwork is drawn once between the surrounding text.
  return { artworkId, before: readingBlocks(image ? html.slice(0, image.index) : html),
    after: [...readingBlocks(image ? html.slice(image.index + image[0].length) : ''), ...readingBlocks(readingHtml)] };
}

export type CompatibilityGauge = { key: string; label: string; value: number; minValue: number; maxValue: number; isInverted: boolean };
const gaugeKeys = new Set(['complementarity', 'conflict', 'harmony', 'spark', 'sexualChemistry',
  'learningPotential', 'mutualUnderstanding', 'mutualSupport']);

export function parseCompatibilityGauges(value: unknown, chemistryAllowed: boolean): CompatibilityGauge[] {
  const seen = new Set<string>();
  return (Array.isArray(value) ? value : []).flatMap(raw => {
    const item = object(raw), key = typeof item.key === 'string' ? item.key : '', label = readingText(item.label);
    const { value, minValue, maxValue, isInverted } = item;
    if (!gaugeKeys.has(key) || seen.has(key) || !label || (key === 'sexualChemistry' && !chemistryAllowed) ||
      typeof value !== 'number' || !Number.isFinite(value) || typeof minValue !== 'number' || !Number.isFinite(minValue) ||
      typeof maxValue !== 'number' || !Number.isFinite(maxValue) || maxValue <= minValue ||
      value < minValue || value > maxValue || typeof isInverted !== 'boolean') return [];
    seen.add(key);
    return [{ key, label, value, minValue, maxValue, isInverted }];
  });
}

export function gaugePosition(gauge: CompatibilityGauge) {
  const position = (gauge.value - gauge.minValue) / (gauge.maxValue - gauge.minValue);
  return { position, desirability: gauge.isInverted ? 1 - position : position };
}

export function compatibilityMenu(reading: CompatibilityReading) {
  const sources: Record<string, ReadingBlock[]> = {
    strengthsAndChallenges: reading.strengths.blocks,
    solarElements: reading.details.find(item => item.key === 'fundamental')?.blocks ?? [],
    lunarElements: reading.details.find(item => item.key === 'character')?.blocks ?? [],
    allElements: reading.details.find(item => item.key === 'elements')?.blocks ?? [],
    yinYang: reading.details.find(item => item.key === 'yinYang')?.blocks ?? [],
    birthMonth: reading.details.find(item => item.key === 'birthMonth')?.blocks ?? [],
    sexualChemistry: reading.details.find(item => item.key === 'chemistry')?.blocks ?? [],
  };
  return ['overview', 'strengthsAndChallenges', 'solarElements', 'lunarElements', 'allElements', 'yinYang', 'birthMonth', 'sexualChemistry'].flatMap(key => {
    const label = reading.labels.sections[key], blocks = sources[key] ?? [];
    const diagram = key === 'solarElements' ? reading.visuals.fundamental : key === 'lunarElements' ? reading.visuals.character : null;
    const breakdown = key === 'allElements' ? reading.visuals.breakdown : [];
    const available = key === 'overview' ? reading.gauges.length > 0 : blocks.length > 0 || !!diagram || breakdown.length > 0;
    if (!label || !available) return [];
    return [{ key, title: key === 'strengthsAndChallenges' ? reading.strengths.title || label.title : label.title,
      navigationTitle: label.navigationTitle, blocks, diagram, breakdown,
      subtitle: key === 'strengthsAndChallenges' ? reading.strengths.subtitle : '' }];
  });
}

export function parseCompatibility(data: Record<string, unknown>, hideSexualChemistry = true): CompatibilityReading {
  const firstRaw = object(data.firstPerson), secondRaw = object(data.secondPerson);
  const first = parsePersonalChart(firstRaw, 'full'), second = parsePersonalChart(secondRaw, 'full');
  const details = object(data.details), elements = object(details.elements);
  const entries: [string, unknown[]][] = [
    ['fundamental', [elements.fundamentalElementsTransformationDetails, elements.fundamentalElementsCompatibilityDetails]],
    ['character', [elements.characterElementsTransformationDetails, elements.characterElementsCompatibilityDetails]],
    ['elements', [elements.allOtherElementsCompatibility]], ['birthMonth', [details.birthMonthDescription]],
  ];
  entries.push(['yinYang', [object(details.gender).description]]);
  // Treat response age flags and the submitted privacy choice as independent gates.
  const chemistryAllowed = !hideSexualChemistry && object(firstRaw.person).isSixteenOrOver === true &&
    object(secondRaw.person).isSixteenOrOver === true;
  if (chemistryAllowed) entries.push(['chemistry', [data.sexualChemistryDetails]]);
  const labels = object(data.labels), sections: CompatibilityReading['labels']['sections'] = {};
  for (const key of ['overview', 'strengthsAndChallenges', 'inDepth', 'solarElements', 'lunarElements', 'allElements', 'yinYang', 'birthMonth', 'sexualChemistry']) {
    if (key === 'sexualChemistry' && !chemistryAllowed) continue;
    const label = object(object(labels.sections)[key]);
    const title = readingText(label.title), navigationTitle = readingText(label.navigationTitle);
    if (title && navigationTitle) sections[key] = { title, navigationTitle };
  }
  const strengths = object(object(data.sections).strengthsAndChallenges);
  return { first, second, help: parseContextualHelp(data.help), overview: readingBlocks(data.fundamentalEnergiesCompatibility),
    visuals: {
      fundamental: parseDiagram(elements.fundamentalTransformation, elements.fundamentalElementsTransformationDetails, elements.fundamentalElementsCompatibilityDetails),
      character: parseDiagram(elements.characterTransformation, elements.characterElementsTransformationDetails, elements.characterElementsCompatibilityDetails),
      breakdown: parseElementBreakdown(elements.breakdown),
    },
    gauges: parseCompatibilityGauges(data.gauges, chemistryAllowed),
    labels: { results: readingText(labels.results), firstPerson: readingText(labels.firstPerson),
      secondPerson: readingText(labels.secondPerson), sections },
    strengths: { title: readingText(strengths.title), subtitle: readingText(strengths.subtitle),
      blocks: readingBlocks(strengths.body ?? data.fundamentalEnergiesCompatibility) },
    details: entries.flatMap(([key, sources]) => {
      const blocks = sources.flatMap(readingBlocks);
      return blocks.length ? [{ key, blocks }] : [];
    }) };
}
