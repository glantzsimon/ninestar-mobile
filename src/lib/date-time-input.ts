// Native pickers use local Date objects only at the UI boundary. API/memory
// values remain date-only and wall-clock strings, with no UTC conversion.
export type DateTimeMode = 'date' | 'time';
const pad = (value: number) => String(value).padStart(2, '0');

export function pickerDate(value: string, mode: DateTimeMode, today = new Date()): Date {
  if (mode === 'date') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const year = +match[1], month = +match[2] - 1, day = +match[3];
      const date = new Date(year, month, day, 12);
      if (year >= 1800 && year <= 2200 && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) return date;
    }
    return new Date(Math.min(2200, Math.max(1800, today.getFullYear())), today.getMonth(), today.getDate(), 12);
  }
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d{1,7})?)?$/.exec(value);
  // Use a neutral day: current-day daylight-saving gaps must not change a
  // historical or future local birth/prediction time.
  return new Date(2000, 0, 15, match ? +match[1] : 0, match ? +match[2] : 0);
}

export function pickerValue(value: Date, mode: DateTimeMode) {
  return mode === 'date' ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    : `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
