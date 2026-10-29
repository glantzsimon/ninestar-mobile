import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';
import { FeatureArtwork } from '../constants/feature-artwork';

export type KnowledgeReading = {
  key: string; title: string; artworkId?: string; blocks: ReadingBlock[];
  children: KnowledgeReading[];
  isGroup?: boolean; introduction?: ContextualHelp; inline?: KnowledgeReading[];
};

// Website KnowledgeBase/Index.cshtml content order, including the opening Origins
// article (which the website's abbreviated anchor navigation omits).
const order = ['origins', 'lightAndDark', 'yinYang', 'modalities', 'elements',
  'mainEnergies', 'characterEnergies', 'year', 'month', 'personalChart', 'relationships'] as const;
const groupKeys = new Set(['modalities', 'elements', 'mainEnergies', 'characterEnergies', 'year', 'month', 'relationships']);
const articleArtwork: Record<string, string> = {
  origins: FeatureArtwork.origins, modalities: 'ninestar.modalities.dynamic',
  lightAndDark: FeatureArtwork.lightAndDark, yinYang: FeatureArtwork.yinYang, elements: 'ninestar.elements.cycle-five',
  fire: 'ninestar.elements.fire', earth: 'ninestar.elements.earth',
  metal: 'ninestar.elements.metal', water: 'ninestar.elements.water', tree: 'ninestar.elements.tree',
  mainEnergies: FeatureArtwork.nineCoreEnergies, characterEnergies: FeatureArtwork.nineCharacterEnergies,
  year: FeatureArtwork.yearlyPredictions, month: FeatureArtwork.monthlyPredictions, personalChart: FeatureArtwork.personalChart,
  relationships: 'ui.relationships', sexuality: 'ui.relationships', transformations: 'ninestar.elements.cycle-five',
};
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function artwork(value: unknown) { return typeof value === 'string' && value.trim() ? value : undefined; }

export function parseKnowledgeBase(value: unknown): KnowledgeReading[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid knowledge base');
  const data = object(value), help = parseContextualHelp(data.help);
  function article(key: string): KnowledgeReading | undefined {
    const item = help[key];
    return item ? { key, title: item.title, blocks: item.blocks, artworkId: articleArtwork[key], children: [] } : undefined;
  }
  function articles(keys: string[]) { return keys.flatMap(key => { const item = article(key); return item ? [item] : []; }); }
  function collection(field: string, cycles = false): KnowledgeReading[] {
    if (!Array.isArray(data[field])) return [];
    return data[field].flatMap((raw, index) => {
      const item = object(raw), energy = cycles ? object(item.energy) : item;
      const title = readingText(cycles ? item.cycleDescriptiveName : item.title);
      const blocks = readingBlocks(cycles ? item.description : item.body ?? item.description);
      const references = Array.isArray(data.mainEnergies) ? data.mainEnergies.map(object) : [];
      const numbers = Array.isArray(item.numbers) ? item.numbers : [];
      const modalityArtwork = field === 'modalities'
        ? references.find(reference => numbers.includes(reference.number))?.modalityArtworkId : undefined;
      // No inferred headings or array data promoted into missing/gated articles.
      return title && blocks.length ? [{ key: `${field}:${index}`, title,
        artworkId: artwork(energy.artworkId) ?? artwork(modalityArtwork), blocks, children: [] }] : [];
    });
  }
  const collections: Record<string, KnowledgeReading[]> = {
    modalities: collection('modalities'), mainEnergies: collection('mainEnergies'),
    characterEnergies: collection('characterEnergies'), year: collection('yearCycles', true),
    month: collection('monthCycles', true),
    elements: articles(['fire', 'earth', 'metal', 'water', 'tree', 'transformations']),
    relationships: articles(['transformations']),
  };
  return order.flatMap(key => {
    const item = article(key);
    return item ? [{ ...item, isGroup: groupKeys.has(key), introduction: help[key],
      inline: key === 'relationships' ? articles(['sexuality']) : [],
      children: collections[key] ?? [] }] : [];
  });
}
