import { parseSquareDirection, squareColor, type SquareDirection } from './magic-squares';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type TravelSummary = {
  title: string; instructions: ReadingBlock[]; periods: string[];
  labels: { direction: string; score: string; guidance: string };
  rows: { score: number; severity: string; color: string; showWarning: boolean;
    guidance: ReadingBlock[]; directions: SquareDirection[] }[];
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function parseTravelSummary(value: unknown, access: 'full' | 'free'): TravelSummary | null {
  if (access !== 'full') return null;
  const raw = object(value), labels = object(raw.labels);
  // Fail closed on older hourly summaries. Never derive, subtract or re-score.
  if (!Array.isArray(raw.periods) || raw.periods.length !== 3 || new Set(raw.periods).size !== 3 ||
    !['year', 'month', 'day'].every(period => (raw.periods as unknown[]).includes(period)) ||
    !readingText(raw.title) || !['direction', 'score', 'guidance'].every(key => readingText(labels[key])) ||
    !Array.isArray(raw.rows) || !raw.rows.length) return null;
  const rows: TravelSummary['rows'] = [];
  for (const entry of raw.rows) {
    const row = object(entry);
    if (typeof row.score !== 'number' || !Number.isSafeInteger(row.score) || row.score < 0 ||
      !squareColor(row.color) || typeof row.showWarning !== 'boolean' || !readingText(row.severity) ||
      !readingText(row.guidance) || !Array.isArray(row.directions) || !row.directions.length) return null;
    const directions = row.directions.map(parseSquareDirection);
    if (directions.some(direction => !direction)) return null;
    rows.push({ score: row.score, color: row.color, showWarning: row.showWarning,
      severity: readingText(row.severity), guidance: readingBlocks(row.guidance), directions: directions as SquareDirection[] });
  }
  return { title: readingText(raw.title), instructions: readingBlocks(raw.instructions), periods: [...raw.periods],
    labels: { direction: readingText(labels.direction), score: readingText(labels.score), guidance: readingText(labels.guidance) }, rows };
}
