import { parsePredictions, type PredictionCycle } from './predictions';
import { readingBlocks, type ReadingBlock } from './reading-text';
import { validCalendarDate, type CalendarMonth } from './personal-calendar';

export type OverviewView = 'Year' | 'NineYear' | 'EightyOneYear';
export type CalendarView = 'Month' | OverviewView;
export type PlannerNavigationDirection = 'None' | 'Back' | 'Forward';
export type PlannerItem = {
  startsOn: string; endsOn: string; childView: CalendarView; active: boolean;
  energy: PredictionCycle; secondEnergy: PredictionCycle | null; blocks: ReadingBlock[];
};
export type PlannerOverview = {
  view: OverviewView; childView: CalendarView; nextViewUp: OverviewView;
  startsOn: string; endsOn: string; anchor: string;
  energy: PredictionCycle; secondEnergy: PredictionCycle | null;
  blocks: ReadingBlock[]; items: PlannerItem[];
};
export type CalendarPage = { kind: 'Month'; calendar: CalendarMonth; selectedDate: string }
  | { kind: OverviewView; planner: PlannerOverview; selectedDate: string; selectedPeriod?: string };
export type CalendarHistory = { current: CalendarPage | null; previous: CalendarPage[] };
export const overviewViews = ['Year', 'NineYear', 'EightyOneYear'] as const;
const childViews: Record<OverviewView, CalendarView> = { Year: 'Month', NineYear: 'Year', EightyOneYear: 'NineYear' };
const upperViews: Record<CalendarView, OverviewView> = { Month: 'Year', Year: 'NineYear', NineYear: 'EightyOneYear', EightyOneYear: 'EightyOneYear' };
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value : '';

// Date objects here are arithmetic containers for server boundaries, never local
// device timezone conversions or calculations of Ki periods/energies.
function timestamp(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})?$/.test(value) ||
    !validCalendarDate(value.slice(0, 10)) || !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d/.test(value.slice(11))) throw new Error('invalid_planner_response');
  const zoned = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const milliseconds = Date.parse(zoned ? value : `${value}Z`);
  if (!Number.isFinite(milliseconds)) throw new Error('invalid_planner_response');
  return { value, zoned, milliseconds };
}

export function localPlannerDate(date: string) {
  if (!validCalendarDate(date)) throw new Error('invalid_planner_date');
  return `${date}T12:00:00`;
}

export function plannerPeriodAnchor(startsOn: string, endsOn: string, preferred?: string): string {
  const start = timestamp(startsOn), end = timestamp(endsOn);
  if (start.zoned !== end.zoned || end.milliseconds <= start.milliseconds) throw new Error('invalid_planner_period');
  // A new civil-noon anchor is chosen, NOT an offset-bearing instant relabelled
  // as local time. For zoned bounds, require 36h clearance on both sides so that
  // interpreting that civil noon in any supported IANA/Windows zone is interior.
  // This avoids inventing a Windows→IANA mapping or relying on the phone zone.
  const clearance = start.zoned ? 36 * 3600000 : 0;
  function interior(candidate: string) {
    const parsed = timestamp(candidate);
    return !parsed.zoned && parsed.milliseconds - clearance > start.milliseconds &&
      parsed.milliseconds + clearance < end.milliseconds;
  }
  if (preferred && interior(preferred)) return preferred;
  const midpoint = new Date(start.milliseconds + (end.milliseconds - start.milliseconds) / 2);
  const candidate = `${midpoint.toISOString().slice(0, 10)}T12:00:00`;
  if (!interior(candidate)) throw new Error('invalid_planner_period');
  return candidate;
}

export function plannerViewOptions(value: unknown): { value: CalendarView; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(raw => {
    const item = object(raw), label = text(item.label);
    return [...overviewViews, 'Month'].includes(text(item.value)) && label.trim()
      ? [{ value: item.value as CalendarView, label }] : [];
  }).filter((item, index, all) => all.findIndex(other => other.value === item.value) === index);
}

export function ownPlannerCalculation(account: Record<string, unknown>): Record<string, unknown> {
  const settings = object(account.calculation), person = object(settings.person);
  const dateOfBirth = text(person.dateOfBirth).slice(0, 10);
  if (!validCalendarDate(dateOfBirth) || !text(person.birthTimeZoneId) || !text(settings.userTimeZoneId) ||
    !text(person.gender) || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,7})?)?$/.test(text(person.timeOfBirth)) ||
    typeof person.timeOfBirthKnown !== 'boolean' || !text(settings.calculationMethod) || !text(settings.housesDisplay) ||
    !['Simple', 'Advanced'].includes(text(settings.calculatorType)) ||
    typeof settings.invertDailyAndHourlyKiForSouthernHemisphere !== 'boolean' ||
    typeof settings.invertDailyAndHourlyCycleKiForSouthernHemisphere !== 'boolean') throw new Error('calendar_details_required');
  return {
    person: { name: text(person.name), dateOfBirth, timeOfBirth: person.timeOfBirth,
      timeOfBirthKnown: person.timeOfBirthKnown, gender: person.gender, birthTimeZoneId: person.birthTimeZoneId },
    userTimeZoneId: settings.userTimeZoneId, calculationMethod: settings.calculationMethod,
    // This read-only browser must match GET calendar/month's saved settings.
    // It does not expose a mode selector or change calculation/account-save rules.
    calculatorType: settings.calculatorType, housesDisplay: settings.housesDisplay,
    invertDailyAndHourlyKiForSouthernHemisphere: settings.invertDailyAndHourlyKiForSouthernHemisphere,
    invertDailyAndHourlyCycleKiForSouthernHemisphere: settings.invertDailyAndHourlyCycleKiForSouthernHemisphere,
  };
}

export function plannerRequest(calculation: Record<string, unknown>, view: OverviewView, selectedDateTime: string,
  navigationDirection: PlannerNavigationDirection = 'None') {
  const year = Number(selectedDateTime.slice(0, 4));
  if (!overviewViews.includes(view) || !['None', 'Back', 'Forward'].includes(navigationDirection) || timestamp(selectedDateTime).zoned || year < 1800 || year > 2200) {
    throw new Error('invalid_planner_request');
  }
  return { ...calculation, selectedDateTime, view, display: 'PersonalKi', navigationDirection, includeMoonPhases: false };
}

function cycle(value: unknown): PredictionCycle {
  return parsePredictions({ personal: { year: value } }, 'full').scopes.personal.year;
}
export function parsePlannerOverview(data: Record<string, unknown>, expectedView: OverviewView): PlannerOverview {
  const view = data.view as OverviewView;
  if (view !== expectedView || !overviewViews.includes(view) || data.childView !== childViews[view] ||
    data.nextViewUp !== upperViews[view] || !Array.isArray(data.items) || !data.items.length || data.items.length > 16 ||
    data.display !== 'PersonalKi') throw new Error('invalid_planner_response');
  const startsOn = text(data.periodStartsOn), endsOn = text(data.periodEndsOn);
  // selectedDateTime is already a local wall-clock in the service. Offset-bearing
  // values are not blindly stripped; choose a proven interior civil anchor instead.
  const selected = text(data.selectedDateTime);
  const preferred = selected && !timestamp(selected).zoned ? selected : undefined;
  const anchor = plannerPeriodAnchor(startsOn, endsOn, preferred);
  const parentStart = timestamp(startsOn), parentEnd = timestamp(endsOn);
  let previousStart = -Infinity;
  const items = data.items.map(raw => {
    const item = object(raw), begin = text(item.energyStartsOn), finish = text(item.energyEndsOn);
    const start = timestamp(begin), end = timestamp(finish);
    if (item.childView !== childViews[view] || typeof item.isActive !== 'boolean' || start.zoned !== parentStart.zoned ||
      end.zoned !== parentEnd.zoned || start.milliseconds <= previousStart) throw new Error('invalid_planner_response');
    plannerPeriodAnchor(begin, finish);
    previousStart = start.milliseconds;
    return { startsOn: begin, endsOn: finish, childView: item.childView as CalendarView, active: item.isActive,
      energy: cycle(item.energy), secondEnergy: item.secondEnergy == null ? null : cycle(item.secondEnergy),
      blocks: readingBlocks(object(item.combined).description) };
  });
  return { view, startsOn, endsOn, childView: data.childView as CalendarView, nextViewUp: data.nextViewUp as OverviewView, anchor,
    energy: cycle(data.energy), secondEnergy: data.secondEnergy == null ? null : cycle(data.secondEnergy),
    blocks: readingBlocks(object(data.combined).description), items };
}

export function calendarPageUp(page: CalendarPage): OverviewView | null {
  return page.kind === 'EightyOneYear' ? null : page.kind === 'Month' ? 'Year' : page.planner.nextViewUp;
}
export function rememberCalendarPage(state: CalendarHistory, current: CalendarPage): CalendarHistory {
  return { current, previous: state.current ? [...state.previous, state.current].slice(-24) : state.previous };
}
export function backCalendarPage(state: CalendarHistory): CalendarHistory {
  if (!state.previous.length) return state;
  return { current: state.previous[state.previous.length - 1], previous: state.previous.slice(0, -1) };
}

export function plannerItemAnchor(item: PlannerItem, selectedDate: string): string | null {
  const anchor = plannerPeriodAnchor(item.startsOn, item.endsOn, localPlannerDate(selectedDate));
  const year = Number(anchor.slice(0, 4));
  return year >= (item.childView === 'Month' ? 1900 : 1800) && year <= (item.childView === 'Month' ? 2100 : 2200) ? anchor : null;
}

export function plannerRangeLabel(startsOn: string, endsOn: string, culture?: string, timeZone?: string) {
  const format = (value: string) => {
    const parsed = timestamp(value), date = parsed.value.slice(0, 10);
    if (parsed.zoned) {
      // Unsupported Windows aliases retain exact offset-bearing timestamps;
      // never invent a Windows→IANA mapping or silently use the phone timezone.
      if (!timeZone) return value;
      try { return new Intl.DateTimeFormat(culture || undefined, { dateStyle: 'medium', timeZone }).format(new Date(parsed.milliseconds)); }
      catch { return value; }
    }
    try { return new Intl.DateTimeFormat(culture || undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${date}T12:00:00Z`)); } catch { return date; }
  };
  return `${format(startsOn)} – ${format(endsOn)}`;
}
