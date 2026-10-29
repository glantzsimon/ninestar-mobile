// Shared catalogue IDs for feature navigation, including Explore and My Chart.
export const FeatureArtwork = {
  constitution: 'ui.constitution',
  character: 'ui.character',
  essence: 'ui.fundamental-nature',
  personalChart: 'ui.personal-chart',
  predictions: 'ui.predictions',
  relationships: 'ui.relationships',
  knowledgeBase: 'ui.knowledge-base',
  articles: 'ui.articles',
  aiAstrologer: 'ui.ai-astrologer',
  origins: 'ui.origins',
  lightAndDark: 'ui.daily-cycle',
  yinYang: 'ui.yinyang',
  nineCoreEnergies: 'ui.nine-core-energies',
  nineCharacterEnergies: 'ui.nine-character-energies',
  yearlyPredictions: 'ui.sun',
  monthlyPredictions: 'ui.moon',
  numerology: 'numerology.karmic-blueprint',
  calendar: 'ui.monthly-planner',
} as const;

// Older/last-good catalogues remain usable until the coordinated artwork deploy.
// These are catalogue IDs only: never construct media URLs from them.
export const LegacyUiArtwork: Record<string, readonly string[]> = {
  'ui.constitution': ['ui.solar-nature', 'ui.fundamental-nature'],
  'ui.character': ['ui.lunar-nature'],
  'ui.personal-chart': ['ui.fundamental-nature'],
  'ui.predictions': ['ui.sun'],
  'ui.ai-astrologer': ['ui.intellectual-qualities'],
  'ui.origins': ['company.logo-notext'],
  'ui.nine-core-energies': ['ui.fundamental-nature'],
  'ui.nine-character-energies': ['ui.lunar-nature'],
};
