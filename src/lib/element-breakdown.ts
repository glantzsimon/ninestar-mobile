import { readingText } from './reading-text';

export type ElementSegment = { key: string; label: string; percentage: number; value: number; color: string };

export function parseElementBreakdown(raw: unknown): ElementSegment[] {
  if (!Array.isArray(raw) || raw.length !== 3) return [];
  const keys = new Set(['supportive', 'sibling', 'challenging']), segments: ElementSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const { key, label, percentage, value, color } = item;
    if (!keys.delete(key) || typeof label !== 'string' || !readingText(label) ||
      typeof percentage !== 'number' || !Number.isFinite(percentage) || percentage < 0 || percentage > 100 ||
      !Number.isInteger(value) || value < 0 || value > 100 || typeof color !== 'string' ||
      !/^(?:#[a-f\d]{3}(?:[a-f\d]{3})?|red)$/i.test(color)) return [];
    segments.push({ key, label: readingText(label), percentage, value, color });
  }
  const total = segments.reduce((sum, item) => sum + item.percentage, 0);
  // Reject incomplete/malformed distributions rather than showing a partial pie.
  return Math.abs(total - 100) <= 0.1 ? segments : [];
}

export function elementPieSlices(segments: ElementSegment[]) {
  const total = segments.reduce((sum, item) => sum + item.percentage, 0);
  if (!(total > 0)) return [];
  let angle = -Math.PI / 2;
  const point = (radians: number) => `${100 + 95 * Math.cos(radians)} ${100 + 95 * Math.sin(radians)}`;
  return segments.flatMap(segment => {
    const sweep = segment.percentage / total * 2 * Math.PI, start = angle;
    angle += sweep;
    if (!sweep) return [];
    const path = sweep >= 2 * Math.PI - 1e-10
      ? 'M100 5 A95 95 0 1 1 100 195 A95 95 0 1 1 100 5 Z'
      : `M100 100 L${point(start)} A95 95 0 ${sweep > Math.PI ? 1 : 0} 1 ${point(angle)} Z`;
    return [{ ...segment, path }];
  });
}
