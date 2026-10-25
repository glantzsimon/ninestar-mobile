import type { ChartDetail } from './chart-sections';
import { uiCopy } from './ui-copy';

export function coreMenu(detail: ChartDetail) {
  return Object.entries(uiCopy.coreSections).filter(([key]) => key !== 'relationships' || detail.isSixteenOrOver !== false)
    .map(([key, title]) => ({ key, title }));
}

export function coreReading(detail: ChartDetail, key: string) {
  if (key === 'essence') return detail.reading;
  return detail.groups.flatMap((group) => group.readings).find((reading) => reading.key === key) ?? {
    key, summary: '', body: '', summaryBlocks: [], bodyBlocks: [],
    unavailableMessage: 'This reading is not available in your current chart.',
  };
}
