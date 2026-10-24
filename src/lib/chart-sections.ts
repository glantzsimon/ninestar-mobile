import type { ChartEnergy, ChartReading, PersonalChart } from './personal-chart';

export const ChartEnergyLabels: Record<string, { title: string; hint: string }> = {
  core: { title: 'Core', hint: 'Your underlying nature' },
  character: { title: 'Character', hint: 'Your inner responses' },
  socialExpression: { title: 'Social Expression', hint: 'How you meet the world' },
  dayStar: { title: 'Day Star', hint: 'Your day-star influence' },
  generation: { title: 'Generational Energy', hint: 'Your generation’s shared influence' },
  epoch: { title: 'Epoch Energy', hint: 'Your wider era’s influence' },
};

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
  character: [
    { title: 'Childhood and Growth', keys: [['childNature', 'Childhood Nature'],
      ['adultChildRelationship', 'Your Adult and Child Energies']] },
    { title: 'Stress and Balance', keys: [['stressResponse', 'Responding to Stress'],
      ['natalHouseStressResponse', 'Natal House Stress Response'], ['childStressResponse', 'Childhood Stress Response']] },
  ],
};

export type ChartDetail = {
  isSixteenOrOver?: boolean;
  energy: ChartEnergy;
  key: string; title: string; reading: ChartReading;
  groups: { title: string; readings: (ChartReading & { title: string })[] }[];
};

export function selectChartDetail(chart: PersonalChart, key: string): ChartDetail | null {
  const energy = [...chart.energies, ...chart.extendedEnergies].find((item) => item.key === key);
  if (!energy || !ChartEnergyLabels[key]) return null;
  const title = key === 'core' ? 'Core Nature' : ChartEnergyLabels[key].title;
  const reading = chart.readings.find((item) => item.key === key) ?? {
    key, summary: '', body: '', summaryBlocks: [], bodyBlocks: energy.descriptionBlocks,
    unavailableMessage: energy.descriptionBlocks.length ? undefined : 'A detailed reading for this energy is not included in your current chart.',
  };
  return {
    key, title, reading, energy, isSixteenOrOver: chart.isSixteenOrOver,
    groups: (groups[key] ?? []).flatMap((group) => {
      const readings = group.keys.flatMap(([sectionKey, sectionTitle]) => {
        const section = chart.readings.find((item) => item.key === sectionKey);
        return section ? [{ ...section, title: sectionTitle }] : [];
      });
      return readings.length ? [{ title: group.title, readings }] : [];
    }),
  };
}
