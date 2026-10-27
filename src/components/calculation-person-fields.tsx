import { StyleSheet, View } from 'react-native';
import { AppInput } from '@/components/ui/app-input';
import { AppDateTimeField } from '@/components/ui/app-date-time-field';
import { AppPanel } from '@/components/ui/app-panel';
import { AppSelect } from '@/components/ui/app-select';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { Spacing } from '@/constants/theme';
import type { AccountOptions } from '@/lib/account';
import { calculationVisibility, type CalculationDraft } from '@/lib/calculation';
import { uiCopy } from '@/lib/ui-copy';
import type { FieldErrors } from '@/lib/field-validation';

export function CalculationPersonFields({ draft, options, onChange, busy, title = uiCopy.calculator.birthDetails, errors = {}, prefix = '' }: {
  draft: CalculationDraft; options: AccountOptions; onChange: (draft: CalculationDraft) => void; busy: boolean; title?: string;
  errors?: FieldErrors; prefix?: string;
}) {
  const copy = uiCopy.calculator;
  const visible = calculationVisibility(draft);
  const yesNo = [{ value: 'false', label: copy.no }, { value: 'true', label: copy.yes }];
  const error = (key: keyof CalculationDraft) => errors[`${prefix}${key}`];
  const input = (key: keyof CalculationDraft, label: string, maxLength: number) =>
    <AppInput label={label} value={draft[key]} error={error(key)} maxLength={maxLength} editable={!busy} autoCorrect={false}
      onChangeText={value => onChange({ ...draft, [key]: value })} />;
  const select = (key: keyof CalculationDraft, label: string, choices: { value: string; label: string }[]) =>
    <AppSelect label={label} value={draft[key]} error={error(key)} options={choices} disabled={busy}
      onChange={value => onChange({ ...draft, [key]: value })} />;
  return <AppPanel title={title}><View>
    <View style={styles.fields}>
      {input('name', copy.name, 200)}
      <AppDateTimeField label={copy.dateOfBirth} mode="date" value={draft.dateOfBirth} error={error('dateOfBirth')}
        disabled={busy} onChange={value => onChange({ ...draft, dateOfBirth: value })} />
      {select('timeOfBirthKnown', copy.timeKnown, yesNo)}
    </View>
    <FadeCollapse visible={visible.birthTime || !!error('timeOfBirth') || !!error('birthTimeZoneId')}><View style={styles.revealed}>
      <AppDateTimeField label={copy.timeOfBirth} mode="time" value={draft.timeOfBirth} error={error('timeOfBirth')}
        disabled={busy} onChange={value => onChange({ ...draft, timeOfBirth: value })} />
      {select('birthTimeZoneId', copy.birthTimezone, options.timezones)}
    </View></FadeCollapse>
    <FadeCollapse visible={visible.gender || !!error('gender')}><View style={styles.revealed}>
      {select('gender', copy.gender, options.genders)}
    </View></FadeCollapse>
  </View></AppPanel>;
}

const styles = StyleSheet.create({ fields: { gap: Spacing.three }, revealed: { gap: Spacing.three, paddingTop: Spacing.three } });
