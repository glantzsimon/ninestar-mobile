import type { ChartEnergy, ChartReading, PersonalChart } from './personal-chart';
import type { ContextualHelp } from './contextual-help';

const chartEnergyKeys = new Set(['core', 'character', 'socialExpression', 'dayStar', 'generation', 'epoch']);

type GroupDefinition = { title: string; keys: [string, string][] };
// Match the website's main-energy tabs and character/child/stress tabs.
const groups: Record<string, GroupDefinition[]> = {
  core: [
    { title: 'Your Nature', keys: [['intellectualQualities', 'How You Think'],
      ['emotionalLandscape', 'Emotional Landscape'], ['interpersonalQualities', 'Connecting With Others']] },
    { title: 'People and Relationships', keys: [['relationships', 'Relationships'],
      ['relationshipsStraight', 'Relationships — Opposite Sex'], ['relationshipsLgbtq', 'Relationships — Same Sex']] },
    { title: 'Work and Direction', keys: [['career', 'Career'], ['occupations', 'Occupations'],
      ['finances', 'Finances'], ['spirituality', 'Spirituality']] },
    { title: 'Wellbeing and Balance', keys: [['health', 'Health'], ['illnesses', 'Health Tendencies']] },
  ],
};

export type ChartDetail = {
  navigation?: { key: string; title: string; heading: string; reading: ChartReading }[];
  health?: PersonalChart['health'];
  help?: ContextualHelp;
  contextualHelp?: PersonalChart['help'];
  isSixteenOrOver?: boolean;
  energy: ChartEnergy;
  key: string; title: string; reading: ChartReading;
  groups: { title: string; readings: (ChartReading & { title: string })[] }[];
};

export function selectChartDetail(chart: PersonalChart, key: string): ChartDetail | null {
  const energy = [...chart.energies, ...chart.extendedEnergies].find((item) => item.key === key);
  if (!energy || !chartEnergyKeys.has(key)) return null;
  const help = chart.help?.[key];
  const title = help?.title ?? energy.name;
  const reading = chart.readings.find((item) => item.key === key) ?? {
    key, summary: '', body: '', summaryBlocks: [], bodyBlocks: energy.descriptionBlocks,
    unavailableMessage: energy.descriptionBlocks.length ? undefined : 'A detailed reading for this energy is not included in your current chart.',
  };
  return {
    navigation: key === 'character' ? characterNavigation(chart, energy) : undefined,
    key, title, reading, energy, help, health: key === 'core' ? chart.health : undefined,
    contextualHelp: chart.help, isSixteenOrOver: chart.isSixteenOrOver,
    groups: (groups[key] ?? []).flatMap((group) => {
      const readings = group.keys.flatMap(([sectionKey, sectionTitle]) => {
        const section = chart.readings.find((item) => item.key === sectionKey);
        return section ? [{ ...section, title: sectionTitle }] : [];
      });
      return readings.length ? [{ title: group.title, readings }] : [];
    }),
  };
}

function characterNavigation(chart: PersonalChart, energy: ChartEnergy): NonNullable<ChartDetail['navigation']> {
  return ['character', 'childNature', 'adultChildRelationship', 'stressResponse'].flatMap((key) => {
    const reading = chart.readings.find((item) => item.key === key);
    if (!reading?.title) return [];
    if (key !== 'stressResponse') return [{ key, title: reading.title,
      heading: key === 'character' ? energy.title ?? '' : reading.title, reading }];
    const parts = ['stressResponse', 'natalHouseStressResponse', 'childStressResponse']
      .flatMap((part) => chart.readings.filter((item) => item.key === part));
    return [{ key, title: reading.title, heading: reading.title, reading: {
      ...reading, body: parts.map((part) => part.body).filter(Boolean).join('\n\n'),
      bodyBlocks: parts.flatMap((part) => part.bodyBlocks),
      summary: parts.map((part) => part.summary || part.body).filter(Boolean).join('\n\n'),
      summaryBlocks: parts.flatMap((part) => part.summaryBlocks.length ? part.summaryBlocks : part.bodyBlocks),
    } }];
  });
}
