import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { CalculationPersonFields } from '@/components/calculation-person-fields';
import { AppButton } from '@/components/ui/app-button';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppSelect } from '@/components/ui/app-select';
import type { AccountOptions } from '@/lib/account';
import type { CalculationDraft } from '@/lib/calculation';
import { uiCopy } from '@/lib/ui-copy';
import type { FieldErrors } from '@/lib/field-validation';

export function CompatibilityForm({ first, second, options, onFirstChange, onSecondChange,
  hideSexualChemistry, onHideSexualChemistryChange, busy, onSubmit, errors = {} }: {
  first: CalculationDraft; second: CalculationDraft; options: AccountOptions;
  onFirstChange: (draft: CalculationDraft) => void; onSecondChange: (draft: CalculationDraft) => void;
  hideSexualChemistry: boolean; onHideSexualChemistryChange: (hide: boolean) => void; busy: boolean; onSubmit: () => void;
  errors?: FieldErrors;
}) {
  useUiLabels();
  const copy = uiCopy.compatibility;
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  return <>
    <CalculationPersonFields title={copy.firstPerson} draft={first} options={options} busy={busy} onChange={onFirstChange} errors={errors} prefix="first." />
    <CalculationPersonFields title={copy.secondPerson} draft={{ ...second, calculationMethod: first.calculationMethod }}
      options={options} busy={busy} onChange={onSecondChange} errors={errors} prefix="second." />
    <AppDisclosure title={uiCopy.calculator.preferences} expanded={preferencesOpen || !!errors.calculationMethod || !!errors.hideSexualChemistry}
      onExpandedChange={setPreferencesOpen}>
      <AppSelect label={uiCopy.calculator.calculationMethod} value={first.calculationMethod} options={options.calculationMethods}
        disabled={busy} error={errors.calculationMethod} onChange={value => { setPreferencesOpen(true); onFirstChange({ ...first, calculationMethod: value }); }} />
      <AppSelect label={copy.hideSexualChemistry} value={String(hideSexualChemistry)} disabled={busy} error={errors.hideSexualChemistry}
        options={[{ value: 'false', label: uiCopy.calculator.no }, { value: 'true', label: uiCopy.calculator.yes }]}
        onChange={value => { setPreferencesOpen(true); onHideSexualChemistryChange(value === 'true'); }} />
    </AppDisclosure>
    <AppButton title={uiCopy.calculator.calculate} onPress={onSubmit} loading={busy} />
  </>;
}
