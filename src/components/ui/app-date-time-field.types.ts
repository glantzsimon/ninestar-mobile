import type { DateTimeMode } from '@/lib/date-time-input';
export type AppDateTimeFieldProps = { label: string; mode: DateTimeMode; value: string;
  onChange: (value: string) => void; disabled?: boolean; error?: string; allowClear?: boolean };
