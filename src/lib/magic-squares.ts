import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type SquareDirection = { key: string; label: string; displayDirection: string; endX: number; endY: number; isCentre: boolean };
export type SquareArrow = { key: string; color: string; title: string; blocks: ReadingBlock[]; score: number; direction: SquareDirection };
export type SquareCell = { row: number; column: number; house: number; number: number; color: string; isActive: boolean; isLunarActive: boolean };
export type MagicSquare = {
  title: string; houseName: string; secondaryHouseName: string; globalNumber: number; personalHouse: number;
  isGlobal: boolean; isSplit: boolean; isDualView: boolean; showDirections: boolean;
  artworkId?: string; cells: SquareCell[]; arrows: SquareArrow[]; secondary: MagicSquare | null;
};
export const squarePeriods = ['epoch', 'generation', 'year', 'month', 'day', 'hour'] as const;
export type MagicSquares = { personal: Partial<Record<typeof squarePeriods[number], MagicSquare>>;
  global: Partial<Record<typeof squarePeriods[number], MagicSquare>> };
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const integer = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
export const squareColor = (value: unknown): value is string => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);

export function parseSquareDirection(value: unknown): SquareDirection | null {
  const raw = object(value);
  if (!readingText(raw.key) || !readingText(raw.label) || typeof raw.isCentre !== 'boolean' ||
    typeof raw.endX !== 'number' || !Number.isFinite(raw.endX) || raw.endX < 0 || raw.endX > 1 ||
    typeof raw.endY !== 'number' || !Number.isFinite(raw.endY) || raw.endY < 0 || raw.endY > 1) return null;
  return { key: readingText(raw.key), label: readingText(raw.label), displayDirection: readingText(raw.displayDirection),
    endX: raw.endX, endY: raw.endY, isCentre: raw.isCentre };
}
export function parseMagicSquare(value: unknown, depth = 0): MagicSquare | null {
  const raw = object(value);
  if (depth > 1 || !readingText(raw.title) || !integer(raw.globalNumber, 1, 9) || !integer(raw.personalHouse, 1, 9) ||
    !['isGlobal', 'isSplit', 'isDualView', 'showDirections'].every(key => typeof raw[key] === 'boolean') ||
    !Array.isArray(raw.cells) || raw.cells.length !== 9) return null;
  const cells: SquareCell[] = [];
  for (const entry of raw.cells) {
    const cell = object(entry);
    if (!integer(cell.row, 0, 2) || !integer(cell.column, 0, 2) || !integer(cell.house, 1, 9) ||
      !integer(cell.number, 1, 9) || !squareColor(cell.color) || typeof cell.isActive !== 'boolean' || typeof cell.isLunarActive !== 'boolean') return null;
    cells.push({ row: cell.row, column: cell.column, house: cell.house, number: cell.number,
      color: cell.color, isActive: cell.isActive, isLunarActive: cell.isLunarActive });
  }
  if (new Set(cells.map(cell => `${cell.row}:${cell.column}`)).size !== 9 || new Set(cells.map(cell => cell.house)).size !== 9 ||
    new Set(cells.map(cell => cell.number)).size !== 9) return null;
  const arrows: SquareArrow[] = [];
  for (const entry of Array.isArray(raw.arrows) ? raw.arrows : []) {
    const arrow = object(entry), direction = parseSquareDirection(arrow.direction);
    if (direction && readingText(arrow.key) && readingText(arrow.title) && squareColor(arrow.color) && integer(arrow.score, 0, 100)) {
      arrows.push({ key: readingText(arrow.key), title: readingText(arrow.title), color: arrow.color,
        score: arrow.score, blocks: readingBlocks(arrow.description), direction });
    }
  }
  const secondary = raw.isSplit === true ? parseMagicSquare(raw.secondary, depth + 1) : null;
  if (raw.isSplit === true && !secondary) return null;
  return { title: readingText(raw.title), houseName: readingText(raw.houseName), secondaryHouseName: readingText(raw.secondaryHouseName),
    globalNumber: raw.globalNumber, personalHouse: raw.personalHouse, isGlobal: raw.isGlobal === true,
    isSplit: raw.isSplit === true, isDualView: raw.isDualView === true, showDirections: raw.showDirections === true,
    artworkId: typeof raw.artworkId === 'string' ? raw.artworkId : undefined, cells,
    arrows: raw.isGlobal === true || raw.showDirections !== true ? [] : arrows, secondary };
}
export function parseMagicSquares(value: unknown, access: 'full' | 'free'): MagicSquares | null {
  if (access !== 'full' || !value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = object(value);
  const scopes = Object.fromEntries(['personal', 'global'].map(scope => [scope,
    Object.fromEntries(squarePeriods.flatMap(period => {
      const square = parseMagicSquare(object(raw[scope])[period]);
      return square ? [[period, square]] : [];
    }))])) as MagicSquares;
  return Object.keys(scopes.personal).length || Object.keys(scopes.global).length ? scopes : null;
}

// Drawing geometry only. Endpoints are already south-up; never derive them
// from key/displayDirection or apply an additional compass rotation.
export function squareArrowGeometry(direction: SquareDirection) {
  const endX = direction.endX * 100, endY = direction.endY * 100;
  const dx = endX - 50, dy = endY - 50, length = Math.hypot(dx, dy);
  if (direction.isCentre || !length) return { ring: true as const };
  const ux = dx / length, uy = dy / length;
  return { ring: false as const, endX, endY,
    points: `${endX},${endY} ${endX - ux * 7 - uy * 3},${endY - uy * 7 + ux * 3} ${endX - ux * 7 + uy * 3},${endY - uy * 7 - ux * 3}` };
}
