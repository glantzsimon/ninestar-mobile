import { FieldValidationError } from './field-validation';
import { uiCopy } from './ui-copy';

export type Option = { label: string; value: string };
export type AccountOptions = {
  genders: Option[]; calculationMethods: Option[]; calculatorTypes: Option[];
  houseDisplays: Option[]; timezones: Option[];
};
// Mobile exposes explicit preferences, so the server must apply Advanced semantics.
export const MobileCalculatorType = 'Advanced';

export type AccountDraft = {
  firstName: string; lastName: string; emailAddress: string; phoneNumber: string;
  dateOfBirth: string; timeOfBirth: string; timeOfBirthKnown: string;
  gender: string; birthTimeZoneId: string; userTimeZoneId: string;
  calculationMethod: string; housesDisplay: string;
  invertNatal: string; invertCycles: string; allowMarketingEmails: boolean;
};
const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value : '';
const bool = (value: unknown) => typeof value === 'boolean' ? String(value) : '';

export function accountDraft(data: Record<string, unknown>): AccountDraft {
  const calculation = object(data.calculation);
  const person = object(calculation.person);
  const birth = object(data.birthDetails);
  if (typeof data.allowMarketingEmails !== 'boolean') throw new Error('Invalid account response');
  return {
    firstName: text(data.firstName), lastName: text(data.lastName),
    emailAddress: text(data.emailAddress), phoneNumber: text(data.phoneNumber),
    dateOfBirth: /^\d{4}-\d{2}-\d{2}$/.test(text(data.birthDate)) && text(data.birthDate) !== '0001-01-01'
      ? text(data.birthDate) : '',
    timeOfBirth: text(person.timeOfBirth) || text(birth.timeOfBirth),
    timeOfBirthKnown: bool(person.timeOfBirthKnown),
    gender: text(data.gender), birthTimeZoneId: text(person.birthTimeZoneId) || text(birth.birthTimeZoneId),
    userTimeZoneId: text(calculation.userTimeZoneId),
    calculationMethod: text(calculation.calculationMethod),
    housesDisplay: text(calculation.housesDisplay),
    invertNatal: bool(calculation.invertDailyAndHourlyKiForSouthernHemisphere),
    invertCycles: bool(calculation.invertDailyAndHourlyCycleKiForSouthernHemisphere),
    allowMarketingEmails: data.allowMarketingEmails,
  };
}

export function accountOptions(data: Record<string, unknown>, timezones: Option[]): AccountOptions {
  function options(key: string): Option[] {
    const values = data[key];
    if (!Array.isArray(values) || !values.length) throw new Error('Missing account options');
    return values.map((item) => {
      const row = object(item);
      if (typeof row.value !== 'string') throw new Error('Invalid option');
      return { value: row.value, label: text(row.label) || row.value };
    });
  }
  return {
    genders: options('genders'), calculationMethods: options('calculationMethods'),
    calculatorTypes: options('calculatorTypes'), houseDisplays: options('houseDisplays'), timezones,
  };
}

export function buildAccountUpdate(draft: AccountDraft, options: AccountOptions): Record<string, unknown> {
  const errors = uiCopy.accountValidation;
  if (!draft.firstName.trim() || draft.firstName.trim().length > 100) throw new FieldValidationError('firstName', errors.firstName);
  if (!draft.lastName.trim() || draft.lastName.trim().length > 100) throw new FieldValidationError('lastName', errors.lastName);
  if (`${draft.firstName.trim()} ${draft.lastName.trim()}`.length > 200) throw new FieldValidationError('lastName', errors.fullName);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.emailAddress.trim()) || draft.emailAddress.trim().length > 200) {
    throw new FieldValidationError('emailAddress', errors.emailAddress);
  }
  if (draft.phoneNumber.length > 100) throw new FieldValidationError('phoneNumber', errors.phoneNumber);
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(draft.dateOfBirth);
  if (!date) throw new FieldValidationError('dateOfBirth', errors.dateFormat);
  const year = Number(date[1]), month = Number(date[2]), day = Number(date[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1800 || year > 2200 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
    throw new FieldValidationError('dateOfBirth', errors.dateRange);
  }
  if (!['true', 'false'].includes(draft.timeOfBirthKnown)) throw new FieldValidationError('timeOfBirthKnown', errors.timeKnown);
  const time = draft.timeOfBirth || (draft.timeOfBirthKnown === 'false' ? '00:00' : '');
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,7})?)?$/.test(time)) {
    throw new FieldValidationError('timeOfBirth', errors.time);
  }
  const selections: ['gender' | 'birthTimeZoneId' | 'userTimeZoneId' | 'calculationMethod' | 'housesDisplay', Option[]][] = [
    ['gender', options.genders], ['birthTimeZoneId', options.timezones], ['userTimeZoneId', options.timezones],
    ['calculationMethod', options.calculationMethods], ['housesDisplay', options.houseDisplays],
  ];
  for (const [field, choices] of selections) {
    if (!choices.some((item) => item.value === draft[field])) throw new FieldValidationError(field, errors[field]);
  }
  if (!options.calculatorTypes.some(item => item.value === MobileCalculatorType)) throw new Error(errors.supportedMode);
  for (const field of ['invertNatal', 'invertCycles'] as const) {
    if (!['true', 'false'].includes(draft[field])) throw new FieldValidationError(field, errors.hemisphere);
  }
  return {
    firstName: draft.firstName.trim(), lastName: draft.lastName.trim(),
    emailAddress: draft.emailAddress.trim(), phoneNumber: draft.phoneNumber.trim(),
    allowMarketingEmails: draft.allowMarketingEmails,
    settings: {
      person: {
        name: `${draft.firstName.trim()} ${draft.lastName.trim()}`,
        dateOfBirth: draft.dateOfBirth, timeOfBirth: time.length === 5 ? `${time}:00` : time,
        timeOfBirthKnown: draft.timeOfBirthKnown === 'true', birthTimeZoneId: draft.birthTimeZoneId,
        gender: draft.gender,
      },
      selectedDateTime: null, userTimeZoneId: draft.userTimeZoneId,
      calculationMethod: draft.calculationMethod, calculatorType: MobileCalculatorType,
      housesDisplay: draft.housesDisplay,
      invertDailyAndHourlyKiForSouthernHemisphere: draft.invertNatal === 'true',
      invertDailyAndHourlyCycleKiForSouthernHemisphere: draft.invertCycles === 'true',
    },
  };
}
