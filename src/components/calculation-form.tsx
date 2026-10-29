import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { AppButton } from '@/components/ui/app-button';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppDateTimeField } from '@/components/ui/app-date-time-field';
import { CalculationPersonFields } from '@/components/calculation-person-fields';
import { AppSelect } from '@/components/ui/app-select';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import type { AccountOptions } from '@/lib/account';
import { predictionDateMode, type CalculationDraft } from '@/lib/calculation';
import { uiCopy } from '@/lib/ui-copy';
import type { FieldErrors } from '@/lib/field-validation';

// One controlled form; hosts own their independent drafts and API/result flow.
// Predictions can opt into local selected-date inputs without copying birth fields.
export function CalculationForm({ draft, options, onChange, onSubmit, busy, includeSelectedDate = false, errors = {} }: {
  draft: CalculationDraft; options: AccountOptions; onChange: (draft: CalculationDraft) => void;
  onSubmit: () => void; busy: boolean; includeSelectedDate?: boolean; errors?: FieldErrors;
}) {
  const labels = useUiLabels().shared.calculator;
  const dateMode = predictionDateMode(draft);
  const copy = uiCopy.calculator;
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const preferenceError = Object.keys(errors).some(key =>
    ['calculationMethod', 'userTimeZoneId', 'housesDisplay', 'invertNatal', 'invertCycles',
      ...(dateMode === 'SelectedDate' ? ['selectedDate', 'selectedTime'] : [])].includes(key));
  const yesNo = [{ value: 'false', label: copy.no }, { value: 'true', label: copy.yes }];
  function select(key: keyof CalculationDraft, label: string, choices: { label: string; value: string }[]) {
    return <AppSelect label={label} value={draft[key] ?? ''} error={errors[key]} options={choices} disabled={busy}
      helper={key === 'userTimeZoneId' ? labels.help.currentTimeZone : undefined}
      onChange={(value) => { setPreferencesOpen(true); onChange({ ...draft, [key]: value }); }} />;
  }
  return <>
    <CalculationPersonFields draft={draft} options={options} onChange={onChange} busy={busy} errors={errors} />
    <AppDisclosure title={copy.preferences} expanded={preferencesOpen || preferenceError}
      onExpandedChange={setPreferencesOpen}>
        {select('calculationMethod', copy.calculationMethod, options.calculationMethods)}
        {(includeSelectedDate || errors.userTimeZoneId || errors.housesDisplay) && <>
          {select('userTimeZoneId', copy.currentTimezone, options.timezones)}
          {select('housesDisplay', copy.housesDisplay, options.houseDisplays)}
        </>}
        {includeSelectedDate && <>
          <AppSelect label={labels.fields.displayDataFor} value={dateMode} options={labels.displayDataForPeriods}
            disabled={busy} onChange={value => { if (value === 'Now' || value === 'SelectedDate') {
              setPreferencesOpen(true); onChange({ ...draft, displayDataFor: value });
            } }} />
          <FadeCollapse visible={dateMode === 'SelectedDate'}><View style={styles.dateFields}>
          <AppDateTimeField label={copy.selectedDate} mode="date" value={draft.selectedDate} error={dateMode === 'SelectedDate' ? errors.selectedDate : undefined} allowClear
            disabled={busy} onChange={value => { setPreferencesOpen(true); onChange({ ...draft, selectedDate: value }); }} />
          <AppDateTimeField label={copy.selectedTime} mode="time" value={draft.selectedTime} error={dateMode === 'SelectedDate' ? errors.selectedTime : undefined} allowClear
            disabled={busy} onChange={value => { setPreferencesOpen(true); onChange({ ...draft, selectedTime: value }); }} />
          </View></FadeCollapse>
        </>}
        {includeSelectedDate ? select('invertCycles', copy.invertCycles, yesNo)
          : select('invertNatal', copy.invertNatal, yesNo)}
        {includeSelectedDate && !!errors.invertNatal && select('invertNatal', copy.invertNatal, yesNo)}
        {!includeSelectedDate && !!errors.invertCycles && select('invertCycles', copy.invertCycles, yesNo)}
    </AppDisclosure>
    <AppButton title={copy.calculate} onPress={onSubmit} loading={busy} />
  </>;
}
const styles = StyleSheet.create({ dateFields: { gap: Spacing.three } });
