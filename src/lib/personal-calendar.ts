import { parseContextualHelp, type ContextualHelp } from './contextual-help';
import { readingBlocks, readingText, type ReadingBlock } from './reading-text';

export type CalendarDay = {
  date: string; day: number; yearHouse: number; monthHouse: number; dayHouse: number;
  afternoonDayHouse?: number; summary: string; blocks: ReadingBlock[];
  dateLabel: string; houses: string; energyName: string; artworkId?: string;
  yearHouseLabel: string; monthHouseLabel: string; dayHouseLabel: string; afternoonDayHouseLabel: string;
  yearArtworkId?: string; monthArtworkId?: string; afternoonArtworkId?: string;
};
const calendarLabelKeys = ['title', 'previousMonth', 'nextMonth', 'today', 'help', 'copyCalendarLink',
  'disableCalendarLink', 'copied', 'copyError', 'expand', 'close', 'revoked', 'error', 'unavailable',
  'myAccount', 'year', 'month', 'day', 'googleCalendarLink'] as const;
type CalendarLabels = Record<typeof calendarLabelKeys[number], string> & {
  weekdays: { dayOfWeek: number; label: string; shortLabel: string }[];
};
export type CalendarMonth = {
  year: number; month: number; title: string; today: string; offset: number;
  entries: CalendarDay[]; help: Record<string, ContextualHelp>; labels: CalendarLabels;
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const artworkId = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const energy = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 9;
export function validCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseCalendarMonth(data: Record<string, unknown>): CalendarMonth {
  const { year, month, today, offset } = data;
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1900 || year > 2100 ||
    typeof month !== 'number' || !Number.isInteger(month) || month < 1 || month > 12 ||
    !validCalendarDate(today) || !Array.isArray(data.entries)) throw new Error('Invalid calendar response');
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const expectedOffset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  if (offset !== expectedOffset || data.entries.length !== days) throw new Error('Invalid calendar response');
  const entries = data.entries.map((raw: unknown, index): CalendarDay => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid calendar day');
    const item = raw as Record<string, unknown>;
    const expectedDate = `${prefix}${String(index + 1).padStart(2, '0')}`;
    if (item.date !== expectedDate || !energy(item.yearHouse) || !energy(item.monthHouse) || !energy(item.dayHouse) ||
      (item.afternoonDayHouse != null && !energy(item.afternoonDayHouse)) ||
      (item.day != null && item.day !== index + 1)) throw new Error('Invalid calendar day');
    return { date: expectedDate, day: index + 1, yearHouse: item.yearHouse, monthHouse: item.monthHouse,
      dayHouse: item.dayHouse, afternoonDayHouse: energy(item.afternoonDayHouse) ? item.afternoonDayHouse : undefined,
      summary: readingText(item.summary), blocks: readingBlocks(item.description),
      dateLabel: readingText(item.dateLabel), houses: readingText(item.houses), energyName: readingText(item.energyName),
      yearHouseLabel: readingText(item.yearHouseLabel), monthHouseLabel: readingText(item.monthHouseLabel),
      dayHouseLabel: readingText(item.dayHouseLabel),
      afternoonDayHouseLabel: energy(item.afternoonDayHouse) ? readingText(item.afternoonDayHouseLabel) : '',
      artworkId: artworkId(item.artworkId), yearArtworkId: artworkId(item.yearArtworkId), monthArtworkId: artworkId(item.monthArtworkId),
      afternoonArtworkId: energy(item.afternoonDayHouse) ? artworkId(item.afternoonArtworkId) : undefined };
  });
  const rawLabels = object(data.labels);
  const labels = Object.fromEntries(calendarLabelKeys.map(key => [key, readingText(rawLabels[key])])) as Record<typeof calendarLabelKeys[number], string>;
  const weekdays = Array.isArray(rawLabels.weekdays) ? rawLabels.weekdays : [];
  const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
    const item = object(weekdays.find(value => object(value).dayOfWeek === index + 1));
    return { dayOfWeek: index + 1, label: readingText(item.label), shortLabel: readingText(item.shortLabel) };
  }).filter(item => item.label && item.shortLabel);
  return { year, month, today, offset: expectedOffset, title: readingText(data.title), entries,
    help: parseContextualHelp(data.help), labels: { ...labels, weekdays: weekdayLabels } };
}

export function adjacentCalendarMonth(year: number, month: number, delta: -1 | 1) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextYear = date.getUTCFullYear();
  return nextYear >= 1900 && nextYear <= 2100 ? { year: nextYear, month: date.getUTCMonth() + 1 } : null;
}

export function calendarSelection(calendar: CalendarMonth, previous?: string) {
  return calendar.entries.find(day => day.date === previous) ??
    calendar.entries.find(day => day.date === calendar.today) ?? calendar.entries[0];
}

// The feed URL is a private capability. Validate, preserve exact bytes, never log/cache it.
export function calendarSubscriptionUrl(value: unknown, apiBase: string): string {
  if (typeof value !== 'string') throw new Error('Invalid calendar link');
  const url = new URL(value), api = new URL(apiBase);
  if (url.protocol !== 'https:' || url.origin !== api.origin || url.username || url.password || url.hash ||
    !url.pathname.toLowerCase().endsWith('/personal-calendar/feed') || !url.searchParams.get('token')) {
    throw new Error('Invalid calendar link');
  }
  return value;
}

export function calendarDateLabel(date: string, culture?: string) {
  const value = new Date(`${date}T12:00:00Z`);
  try { return new Intl.DateTimeFormat(culture || undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(value); }
  catch { return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(value); }
}
export function calendarWeekdays(culture?: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 0, 5 + index)); // Monday first, matching API offset.
    try { return new Intl.DateTimeFormat(culture || undefined, { weekday: 'short', timeZone: 'UTC' }).format(date); }
    catch { return new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' }).format(date); }
  });
}
