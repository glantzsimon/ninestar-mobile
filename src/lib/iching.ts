import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type HexagramLine = 'Yin' | 'Yang' | 'ChangingYin' | 'ChangingYang';
export type HexagramReading = { number: number; name: string; lines: HexagramLine[];
  heading?: string;
  stage: string; readingName: string; title: ReadingBlock[]; summary: ReadingBlock[];
  details: ReadingBlock[]; changingLines: ReadingBlock[] };
export type IChingReading = { primary: HexagramReading; transformed: HexagramReading | null;
  help: Record<string, ContextualHelp> };
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Record<string, unknown> : {};
const lineTypes = new Set(['Yin', 'Yang', 'ChangingYin', 'ChangingYang']);

function parseHexagram(value: unknown): HexagramReading {
  const raw = object(value), info = object(raw.info), name = readingText(raw.name);
  if (!Number.isInteger(raw.number) || (raw.number as number) < 1 || (raw.number as number) > 64 || !name ||
    !Array.isArray(raw.lines) || raw.lines.length !== 6 || !raw.lines.every(line => typeof line === 'string' && lineTypes.has(line))) {
    throw new Error('invalid_response');
  }
  return { number: raw.number as number, name, heading: readingText(raw.heading) || undefined, lines: [...raw.lines] as HexagramLine[],
    stage: readingText(info.stage), readingName: readingText(info.name), title: readingBlocks(info.title),
    summary: readingBlocks(info.summary), details: readingBlocks(info.details), changingLines: readingBlocks(info.changingLinesInterpretation) };
}

export function parseIChing(data: Record<string, unknown>): IChingReading {
  return { primary: parseHexagram(data.primary), transformed: data.transformed == null ? null : parseHexagram(data.transformed),
    help: parseContextualHelp(data.help) };
}

// Website ToHtml renders array order top-to-bottom. Never reverse it or compute
// King Wen numbers / transformed hexagrams from the lines in the client.
export function hexagramLineStyle(line: HexagramLine) {
  return { broken: line === 'Yin' || line === 'ChangingYin', changing: line === 'ChangingYin' || line === 'ChangingYang' };
}
