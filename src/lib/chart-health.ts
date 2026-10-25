import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type ChartOrgan = { value: string; label: string; artworkId?: string };
export type OrganPanel = { title: string; blocks: ReadingBlock[]; yinOrgans: ChartOrgan[]; yangOrgans: ChartOrgan[] };
export type ChartHealth = { expansion?: { title: string; blocks: ReadingBlock[] }; strongOrgans?: OrganPanel; weakOrgans?: OrganPanel };
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function organs(value: unknown): ChartOrgan[] {
  return Array.isArray(value) ? value.flatMap((raw) => {
    const item = object(raw);
    if (typeof item.value !== 'string' || typeof item.label !== 'string') return [];
    const label = readingText(item.label);
    return label && item.value ? [{ value: item.value, label,
      artworkId: typeof item.artworkId === 'string' ? item.artworkId : undefined }] : [];
  }) : [];
}
function panel(value: unknown): OrganPanel | undefined {
  const item = object(value);
  // No enum-derived labels or locally invented organ-panel titles.
  if (typeof item.title !== 'string' || typeof item.htmlBody !== 'string') return undefined;
  const title = readingText(item.title);
  return title ? { title, blocks: readingBlocks(item.htmlBody),
    yinOrgans: organs(item.yinOrgans), yangOrgans: organs(item.yangOrgans) } : undefined;
}
export function parseChartHealth(data: Record<string, unknown>, access: 'full' | 'free'): ChartHealth | undefined {
  if (access !== 'full') return undefined;
  const health = object(data.health);
  const energy = object(object(data.energies).core);
  const title = readingText(energy.yinYangExpansionTitle);
  const blocks = readingBlocks(energy.yinYangExpansionDescription);
  return { expansion: title && blocks.length ? { title, blocks } : undefined,
    strongOrgans: panel(health.strongOrgans), weakOrgans: panel(health.weakOrgans) };
}
