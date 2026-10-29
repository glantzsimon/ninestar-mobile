import { uiCopy } from './ui-copy';
import { FeatureArtwork } from '../constants/feature-artwork';

const copy = uiCopy.explore;
export const exploreFeatures = [
  { key: 'personalChart', title: copy.personalChart, group: 'readings', artworkId: FeatureArtwork.personalChart },
  { key: 'predictions', title: copy.predictions, group: 'readings', artworkId: FeatureArtwork.predictions },
  { key: 'compatibility', title: copy.compatibility, group: 'readings', artworkId: FeatureArtwork.relationships },
  { key: 'iching', title: copy.iching, group: 'readings', artworkId: 'iching.iching' },
  { key: 'ai', title: copy.ai, group: 'ask', artworkId: FeatureArtwork.aiAstrologer },
  { key: 'knowledge', title: copy.knowledge, group: 'learn', artworkId: FeatureArtwork.knowledgeBase },
  { key: 'articles', title: copy.articles, group: 'learn', artworkId: FeatureArtwork.articles },
] as const;
