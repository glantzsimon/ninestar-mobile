import type { ChartDetail } from './chart-sections';

export function coreMenu(detail: ChartDetail) {
  return [{ key: 'energyFacts', title: 'Overview' }, { key: 'essence', title: 'Essence' },
    { key: 'intellectualQualities', title: 'Intellectual Qualities' },
    { key: 'interpersonalQualities', title: 'Interpersonal Qualities' },
    { key: 'emotionalLandscape', title: 'Emotional Landscape' },
    ...(detail.isSixteenOrOver === false ? [] : [{ key: 'relationships', title: 'Relationships' }]),
    { key: 'career', title: 'Career' }, { key: 'finances', title: 'Finances' },
    { key: 'health', title: 'Health' }, { key: 'spirituality', title: 'Spirituality' }];
}

export function coreReading(detail: ChartDetail, key: string) {
  if (key === 'essence') return detail.reading;
  return detail.groups.flatMap((group) => group.readings).find((reading) => reading.key === key) ?? {
    key, summary: '', body: '', summaryBlocks: [], bodyBlocks: [],
    unavailableMessage: 'This reading is not available in your current chart.',
  };
}
