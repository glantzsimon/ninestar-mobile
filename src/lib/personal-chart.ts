import { uiLabel } from './ui-labels';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';
import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { parseChartHealth, type ChartHealth } from './chart-health';

export type ChartEnergy = {
  roleLabel?: string;
  title?: string;
  key: string;
  number: number;
  name: string;
  element: string;
  imageUrl?: string;
  artworkId?: string;
  facts?: { key?: string; label: string; value: string; artworkId?: string }[];
  descriptionBlocks: ReadingBlock[];
};
export type ChartReading = {
  title?: string;
  key: string; summary: string; body: string; summaryBlocks: ReadingBlock[]; bodyBlocks: ReadingBlock[];
  unavailableMessage?: string;
};
export type PersonalChart = {
  health?: ChartHealth;
  help?: Record<string, ContextualHelp>;
  isSixteenOrOver?: boolean;
  access: 'full' | 'free';
  name: string;
  summary: string;
  summaryBlocks: ReadingBlock[];
  energies: ChartEnergy[];
  extendedEnergies: ChartEnergy[];
  readings: ChartReading[];
};

function object(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function parsePersonalChart(data: Record<string, unknown>, access: 'full' | 'free'): PersonalChart {
  function parseEnergy(key: string, required: boolean): ChartEnergy | null {
    const energy = object(object(data.energies)[key]);
    const number = access === 'full' ? energy.number : data[key];
    if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > 9) {
      if (!required) return null;
      throw new Error('Invalid chart energy');
    }
    return {
      key, number,
      roleLabel: typeof object(data.roleLabels)[key] === 'string'
        ? readingText(object(data.roleLabels)[key]) || undefined : undefined,
      title: readingText(energy.title) || undefined,
      artworkId: typeof energy.artworkId === 'string' ? energy.artworkId : undefined,
      facts: [
        ...(access === 'full' ? [
          ['yinYang', 'yinYang', 'yinYangArtworkId'], ['element', 'element', 'elementArtworkId'],
          ['group', 'modality', 'modalityArtworkId'], ['trigram', 'trigram', 'trigramArtworkId'],
        ] : []),
        ['colour', 'colour'], ['direction', 'direction'], ['familyMember', 'familyMember'],
        ['season', 'season'], ['internalRepresentation', 'internalRepresentation'],
        ['physiognomy', 'physiognomy'], ['primaryAttributes', 'primaryAttributes'],
        ['mostHarmoniousCombinations', 'mostHarmoniousCombinations'],
        ['mostChallengingCombinations', 'mostChallengingCombinations'],
      ].flatMap(([key, field, artwork]) => {
        const value = readingText(energy[field]);
        return value ? [{ key, get label() { return uiLabel(`screens.personalChart.facts.${key}`); }, value, artworkId: artwork && typeof energy[artwork] === 'string' ? energy[artwork] as string : undefined }] : [];
      }),
      name: readingText(energy.name),
      element: readingText(energy.element),
      imageUrl: typeof energy.imageUrl === 'string' && energy.imageUrl.startsWith('https://')
        ? energy.imageUrl : undefined,
      descriptionBlocks: access === 'full' ? readingBlocks(energy.description) : [],
    };
  }
  const energies = ['core', 'character', 'socialExpression'].map((key) => parseEnergy(key, true)!);
  const extendedEnergies = ['dayStar', 'generation', 'epoch'].flatMap((key) => {
    const energy = parseEnergy(key, false);
    return energy ? [energy] : [];
  });
  const readings = Object.entries(object(data.sections)).map(([key, value]) => {
    const section = object(value);
    return { key, title: readingText(section.title) || undefined, summary: readingText(section.summary), body: readingText(section.body),
      summaryBlocks: readingBlocks(section.summary), bodyBlocks: readingBlocks(section.body) };
  }).filter((section) => section.summary || section.body);
  const primaryReadings: ChartReading[] = ['core', 'character', 'socialExpression'].map((key) =>
    readings.find((reading) => reading.key === key) ?? {
      key, summary: '', body: '', summaryBlocks: [], bodyBlocks: [],
      unavailableMessage: access === 'free'
        ? 'This reading is not included in your current chart access.'
        : 'This reading is temporarily unavailable. Please try again later.',
    });
  return {
    isSixteenOrOver: typeof object(data.person).isSixteenOrOver === 'boolean'
      ? object(data.person).isSixteenOrOver as boolean : undefined,
    help: parseContextualHelp(data.help),
    health: parseChartHealth(data, access),
    access, energies, extendedEnergies, readings: [...primaryReadings,
      ...readings.filter((reading) => !primaryReadings.some((primary) => primary.key === reading.key))],
    name: readingText(object(data.person).name),
    // The website's chart summary is narrative. Its overview is a separate
    // main-energy traits list, so do not substitute it when summary is absent.
    summary: readingText(data.summary),
    summaryBlocks: readingBlocks(data.summary),
  };
}
