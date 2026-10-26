import { AppButton } from '@/components/ui/app-button';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppInput } from '@/components/ui/app-input';
import { AppPanel } from '@/components/ui/app-panel';
import { AppSelect } from '@/components/ui/app-select';
import type { AccountOptions } from '@/lib/account';
import type { CalculationDraft } from '@/lib/calculation';
import { uiCopy } from '@/lib/ui-copy';

// One controlled form; hosts own their independent drafts and API/result flow.
// Predictions can opt into local selected-date inputs without copying birth fields.
export function CalculationForm({ draft, options, onChange, onSubmit, busy, includeSelectedDate = false }: {
  draft: CalculationDraft; options: AccountOptions; onChange: (draft: CalculationDraft) => void;
  onSubmit: () => void; busy: boolean; includeSelectedDate?: boolean;
}) {
  const copy = uiCopy.calculator;
  const yesNo = [{ value: 'false', label: copy.no }, { value: 'true', label: copy.yes }];
  function input(key: keyof CalculationDraft, label: string, maxLength: number) {
    return <AppInput label={label} value={draft[key]} maxLength={maxLength} editable={!busy}
      onChangeText={(value) => onChange({ ...draft, [key]: value })} autoCorrect={false} />;
  }
  function select(key: keyof CalculationDraft, label: string, choices: { label: string; value: string }[]) {
    return <AppSelect label={label} value={draft[key]} options={choices} disabled={busy}
      onChange={(value) => onChange({ ...draft, [key]: value })} />;
  }
  return <>
    <AppPanel title={copy.birthDetails}>
      {input('name', copy.name, 200)}
      {input('dateOfBirth', copy.dateOfBirth, 10)}
      {select('timeOfBirthKnown', copy.timeKnown, yesNo)}
      {input('timeOfBirth', copy.timeOfBirth, 16)}
      {select('birthTimeZoneId', copy.birthTimezone, options.timezones)}
      {select('gender', copy.gender, options.genders)}
    </AppPanel>
    <AppDisclosure title={copy.preferences}>
      {select('calculatorType', copy.calculatorType, options.calculatorTypes)}
      {select('calculationMethod', copy.calculationMethod, options.calculationMethods)}
      {select('userTimeZoneId', copy.currentTimezone, options.timezones)}
      {select('housesDisplay', copy.housesDisplay, options.houseDisplays)}
      {includeSelectedDate && <>
        {input('selectedDate', copy.selectedDate, 10)}
        {input('selectedTime', copy.selectedTime, 16)}
      </>}
      {select('invertNatal', copy.invertNatal, yesNo)}
      {select('invertCycles', copy.invertCycles, yesNo)}
    </AppDisclosure>
    <AppButton title={copy.calculate} onPress={onSubmit} loading={busy} />
  </>;
}
