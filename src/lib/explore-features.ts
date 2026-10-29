import { uiCopy } from './ui-copy';
import { FeatureArtwork } from '../constants/feature-artwork';

const copy = uiCopy.explore;
export const exploreFeatures = [
  { key: 'personalChart', get title() { return copy.personalChart; }, group: 'readings', artworkId: FeatureArtwork.personalChart },
  { key: 'predictions', get title() { return copy.predictions; }, group: 'readings', artworkId: FeatureArtwork.predictions },
  { key: 'compatibility', get title() { return copy.compatibility; }, group: 'readings', artworkId: FeatureArtwork.relationships },
  { key: 'iching', get title() { return copy.iching; }, group: 'readings', artworkId: 'iching.iching' },
  { key: 'ai', get title() { return copy.ai; }, group: 'ask', artworkId: FeatureArtwork.aiAstrologer },
  { key: 'knowledge', get title() { return copy.knowledge; }, group: 'learn', artworkId: FeatureArtwork.knowledgeBase },
  { key: 'articles', get title() { return copy.articles; }, group: 'learn', artworkId: FeatureArtwork.articles },
] as const;
