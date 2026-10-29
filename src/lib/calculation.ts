import type { AccountOptions, Option } from './account';
import { MobileCalculatorType } from './account';
import { uiCopy } from './ui-copy';
import { FieldValidationError } from './field-validation';

// Shared input model for personal charts and future predictions/calculators.
// Dates are local strings, never Date objects or UTC conversions.
export type CalculationDraft = {
  name: string; dateOfBirth: string; timeOfBirth: string; timeOfBirthKnown: string;
  gender: string; birthTimeZoneId: string; userTimeZoneId: string;
  calculationMethod: string; housesDisplay: string;
  invertNatal: string; invertCycles: string; selectedDate: string; selectedTime: string;
  displayDataFor?: 'Now' | 'SelectedDate';
};

export function predictionDateMode(draft: CalculationDraft): 'Now' | 'SelectedDate' {
  return draft.displayDataFor ?? (draft.selectedDate || draft.selectedTime ? 'SelectedDate' : 'Now');
}

const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value : '';
const bool = (value: unknown) => typeof value === 'boolean' ? String(value) : '';

// Protocol enum values, independent of translated display labels. Presentation
// only: the server still owns calculation rules and membership checks.
export function calculationVisibility(draft: CalculationDraft, predictions = false) {
  return {
    birthTime: draft.timeOfBirthKnown === 'true',
    gender: draft.calculationMethod !== 'Traditional',
    predictionSettings: predictions,
    natalHemisphere: !predictions,
    cycleHemisphere: predictions,
  };
}

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
    calculationMethod: text(calculation.calculationMethod),
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

export function buildCalculationPerson(draft: CalculationDraft, options: AccountOptions) {
  const errors = uiCopy.calculator.errors;
  if (draft.name.trim().length > 200) throw new FieldValidationError('name', errors.invalidName);
  if (!validDate(draft.dateOfBirth)) throw new FieldValidationError('dateOfBirth', errors.invalidDate);
  if (!['true', 'false'].includes(draft.timeOfBirthKnown)) throw new FieldValidationError('timeOfBirthKnown', errors.invalidTimeKnown);
  const time = draft.timeOfBirth || (draft.timeOfBirthKnown === 'false' ? '00:00' : '');
  if (!validTime(time)) throw new FieldValidationError('timeOfBirth', errors.invalidTime);
  if (!options.genders.some(item => item.value === draft.gender)) throw new FieldValidationError('gender', errors.invalidPreferences);
  if (!options.timezones.some(item => item.value === draft.birthTimeZoneId)) throw new FieldValidationError('birthTimeZoneId', errors.invalidPreferences);
  return { name: draft.name.trim(), dateOfBirth: draft.dateOfBirth,
    timeOfBirth: seconds(time), timeOfBirthKnown: draft.timeOfBirthKnown === 'true',
    birthTimeZoneId: draft.birthTimeZoneId, gender: draft.gender };
}

export function buildCalculation(draft: CalculationDraft, options: AccountOptions, selectedDate = false): Record<string, unknown> {
  const person = buildCalculationPerson(draft, options);
  const useSelectedDate = calculationVisibility(draft, selectedDate).predictionSettings &&
    predictionDateMode(draft) === 'SelectedDate';
  const errors = uiCopy.calculator.errors;
  const selections: [keyof CalculationDraft, { value: string }[]][] = [
    ['userTimeZoneId', options.timezones], ['calculationMethod', options.calculationMethods], ['housesDisplay', options.houseDisplays],
  ];
  for (const [field, choices] of selections) {
    if (!choices.some(item => item.value === draft[field])) throw new FieldValidationError(field, errors.invalidPreferences);
  }
  if (!options.calculatorTypes.some(item => item.value === MobileCalculatorType)) throw new Error(errors.invalidPreferences);
  for (const field of ['invertNatal', 'invertCycles'] as const) {
    if (!['true', 'false'].includes(draft[field])) throw new FieldValidationError(field, errors.invalidPreferences);
  }
  if (useSelectedDate) {
    if (!validDate(draft.selectedDate)) throw new FieldValidationError('selectedDate', errors.invalidSelectedDate);
    if (!validTime(draft.selectedTime)) throw new FieldValidationError('selectedTime', errors.invalidSelectedDate);
  }
  return {
    person,
    selectedDateTime: useSelectedDate ? `${draft.selectedDate}T${seconds(draft.selectedTime)}` : null,
    userTimeZoneId: draft.userTimeZoneId, calculationMethod: draft.calculationMethod,
    calculatorType: MobileCalculatorType, housesDisplay: draft.housesDisplay,
    invertDailyAndHourlyKiForSouthernHemisphere: draft.invertNatal === 'true',
    invertDailyAndHourlyCycleKiForSouthernHemisphere: draft.invertCycles === 'true',
  };
}
