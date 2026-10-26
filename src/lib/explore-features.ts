import { uiCopy } from './ui-copy';

const copy = uiCopy.explore;
export const exploreFeatures = [
  { key: 'personalChart', title: copy.personalChart, group: 'readings', artworkId: 'ui.overview' },
  { key: 'predictions', title: copy.predictions, group: 'readings', artworkId: 'ui.sun' },
  { key: 'compatibility', title: copy.compatibility, group: 'readings', artworkId: 'ui.relationships' },
  { key: 'iching', title: copy.iching, group: 'readings', artworkId: 'iching.iching' },
  { key: 'numerology', title: copy.numerology, group: 'readings' },
  { key: 'ai', title: copy.ai, group: 'ask', artworkId: 'ui.intellectual-qualities' },
  { key: 'knowledge', title: copy.knowledge, group: 'learn' },
  { key: 'articles', title: copy.articles, group: 'learn' },
] as const;
