import type { AccountOptions, Option } from './account';
import { uiCopy } from './ui-copy';

// Shared input model for personal charts and future predictions/calculators.
// Dates are local strings, never Date objects or UTC conversions.
export type CalculationDraft = {
  name: string; dateOfBirth: string; timeOfBirth: string; timeOfBirthKnown: string;
  gender: string; birthTimeZoneId: string; userTimeZoneId: string;
  calculationMethod: string; calculatorType: string; housesDisplay: string;
  invertNatal: string; invertCycles: string; selectedDate: string; selectedTime: string;
};

const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value : '';
const bool = (value: unknown) => typeof value === 'boolean' ? String(value) : '';

export function calculationDraft(account: Record<string, unknown>, genders: Option[], today = new Date(), random = Math.random): CalculationDraft {
  const calculation = object(account.calculation);
  const year = today.getFullYear() - 22, month = String(today.getMonth() + 1).padStart(2, '0');
  let date = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;
  // Match a calendar-year subtraction on leap day, rather than rolling into March.
  if (month === '02' && today.getDate() === 29 && !validDate(date)) date = `${year}-02-28`;
  return {
    name: '', dateOfBirth: date, timeOfBirth: '00:00', timeOfBirthKnown: 'false',
    gender: genders[Math.floor(random() * genders.length)]?.value ?? '',
    birthTimeZoneId: text(calculation.userTimeZoneId),
    userTimeZoneId: text(calculation.userTimeZoneId),
    calculationMethod: text(calculation.calculationMethod), calculatorType: text(calculation.calculatorType),
    housesDisplay: text(calculation.housesDisplay),
    invertNatal: bool(calculation.invertDailyAndHourlyKiForSouthernHemisphere),
    invertCycles: bool(calculation.invertDailyAndHourlyCycleKiForSouthernHemisphere),
    selectedDate: '', selectedTime: '',
  };
}

function validDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1800 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,7})?)?$/.test(value);
const seconds = (value: string) => value.length === 5 ? `${value}:00` : value;

export function buildCalculation(draft: CalculationDraft, options: AccountOptions, selectedDate = false): Record<string, unknown> {
  const errors = uiCopy.calculator.errors;
  if (draft.name.trim().length > 200) throw new Error(errors.invalidName);
  if (!validDate(draft.dateOfBirth)) throw new Error(errors.invalidDate);
  if (!['true', 'false'].includes(draft.timeOfBirthKnown)) throw new Error(errors.invalidTimeKnown);
  const time = draft.timeOfBirth || (draft.timeOfBirthKnown === 'false' ? '00:00' : '');
  if (!validTime(time)) throw new Error(errors.invalidTime);
  const selections: [string, { value: string }[]][] = [
    [draft.gender, options.genders], [draft.birthTimeZoneId, options.timezones],
    [draft.userTimeZoneId, options.timezones], [draft.calculationMethod, options.calculationMethods],
    [draft.calculatorType, options.calculatorTypes], [draft.housesDisplay, options.houseDisplays],
  ];
  if (selections.some(([value, choices]) => !choices.some((item) => item.value === value)) ||
    ![draft.invertNatal, draft.invertCycles].every((value) => ['true', 'false'].includes(value))) {
    throw new Error(errors.invalidPreferences);
  }
  if (selectedDate && (!validDate(draft.selectedDate) || !validTime(draft.selectedTime))) {
    throw new Error(errors.invalidSelectedDate);
  }
  return {
    person: { name: draft.name.trim(), dateOfBirth: draft.dateOfBirth,
      timeOfBirth: seconds(time), timeOfBirthKnown: draft.timeOfBirthKnown === 'true',
      birthTimeZoneId: draft.birthTimeZoneId, gender: draft.gender },
    selectedDateTime: selectedDate ? `${draft.selectedDate}T${seconds(draft.selectedTime)}` : null,
    userTimeZoneId: draft.userTimeZoneId, calculationMethod: draft.calculationMethod,
    calculatorType: draft.calculatorType, housesDisplay: draft.housesDisplay,
    invertDailyAndHourlyKiForSouthernHemisphere: draft.invertNatal === 'true',
    invertDailyAndHourlyCycleKiForSouthernHemisphere: draft.invertCycles === 'true',
  };
}
