import { AppField } from '@/components/ui/app-field';
import { ControlHeight, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AppDateTimeFieldProps } from './app-date-time-field.types';

// The browser's own date/time controls; @expo/ui's native picker has no web UI.
export function AppDateTimeField({ label, mode, value, onChange, disabled, error }: AppDateTimeFieldProps) {
  const theme = useTheme();
  return <AppField label={label} error={error}>
    <input type={mode} aria-label={label} aria-invalid={!!error} disabled={disabled}
      value={mode === 'time' ? value.slice(0, 5) : value} onChange={event => onChange(event.target.value)}
      min={mode === 'date' ? '1800-01-01' : undefined} max={mode === 'date' ? '2200-12-31' : undefined}
      style={{ boxSizing: 'border-box', width: '100%', minHeight: ControlHeight,
        padding: Spacing.two, borderRadius: Radius.control, border: `1px solid ${error ? theme.error : theme.border}`,
        fontFamily: Typography.body.fontFamily, fontSize: Typography.body.fontSize,
        backgroundColor: theme.input, color: theme.text, opacity: disabled ? 0.65 : 1 }} />
  </AppField>;
}
