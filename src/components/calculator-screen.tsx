import { useUiLabels } from '@/hooks/use-ui-labels';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { CalculationForm } from '@/components/calculation-form';
import { ContextualHelp } from '@/components/contextual-help';
import { PersonalChart } from '@/components/personal-chart';
import { Predictions } from '@/components/predictions';
import { Compatibility } from '@/components/compatibility';
import { CompatibilityForm } from '@/components/compatibility-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppActionGroup } from '@/components/ui/app-action-group';
import { AppFieldErrors } from '@/components/ui/app-field';
import { AppScreen, AppScrollTarget } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { useSubmissionError } from '@/hooks/use-submission-error';
import { accountOptions, type AccountOptions } from '@/lib/account';
import { settleAccountLoad } from '@/lib/account-load';
import { buildCalculation, calculationDraft, type CalculationDraft } from '@/lib/calculation';
import { calculatorMemory } from '@/lib/calculator-storage';
import type { ContextualHelp as Introduction } from '@/lib/contextual-help';
import { API_BASE_URL, calculatePersonalChart, calculatePredictions, calculateCompatibility, getOwnAccount, getPersonalChartIntroduction,
  getPredictionsIntroduction, getCompatibilityIntroduction, getTimezones, MobileApiError, mobileApiRequest } from '@/lib/mobile-api';
import { parsePersonalChart, type PersonalChart as Chart } from '@/lib/personal-chart';
import { parsePredictions, type Predictions as PredictionReading } from '@/lib/predictions';
import { buildCompatibility, parseCompatibility, type CompatibilityReading } from '@/lib/compatibility';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';
import { FieldValidationError, type FieldErrors } from '@/lib/field-validation';

type CalculatorKind = 'personal-chart' | 'predictions' | 'compatibility';
type Result = { kind: 'personal-chart'; chart: Chart } | { kind: 'predictions'; predictions: PredictionReading }
  | { kind: 'compatibility'; compatibility: CompatibilityReading };
type Configuration = {
  title: string; signInRequired: string; introduction: () => Promise<Introduction | null>;
  calculate: (body: Record<string, unknown>) => Promise<{ status: number; data: Record<string, unknown> }>;
  parse: (data: Record<string, unknown>, hideSexualChemistry: boolean) => Result;
};
const calculators: Record<CalculatorKind, Configuration> = {
  'personal-chart': {
    get title() { return uiCopy.calculator.title; }, get signInRequired() { return uiCopy.calculator.signInRequired; },
    introduction: getPersonalChartIntroduction, calculate: calculatePersonalChart,
    parse: (data: Record<string, unknown>): Result => ({ kind: 'personal-chart', chart: parsePersonalChart(data, 'full') }),
  },
  predictions: {
    get title() { return uiCopy.predictionCalculator.title; }, get signInRequired() { return uiCopy.predictionCalculator.signInRequired; },
    introduction: getPredictionsIntroduction, calculate: calculatePredictions,
    parse: (data: Record<string, unknown>): Result => ({ kind: 'predictions', predictions: parsePredictions(data, 'full') }),
  },
  compatibility: {
    get title() { return uiCopy.compatibility.title; }, get signInRequired() { return uiCopy.compatibility.signInRequired; },
    introduction: getCompatibilityIntroduction, calculate: calculateCompatibility,
    parse: (data, hide) => ({ kind: 'compatibility', compatibility: parseCompatibility(data, hide) }),
  },
};
const memoryKey = (kind: CalculatorKind, person = 'first') => kind === 'compatibility' ? `${kind}:${person}` : kind;

function describeError(error: unknown, kind: CalculatorKind) {
  const errors = uiCopy.calculator.errors;
  const fallback = kind === 'compatibility' ? uiCopy.compatibility.unavailable
    : kind === 'predictions' ? uiCopy.predictions.unavailable : errors.unavailable;
  if (kind === 'compatibility' && error instanceof MobileApiError && error.code === 'membership_required') {
    return uiCopy.compatibility.membership_required;
  }
  if (kind === 'predictions' && error instanceof MobileApiError && error.code === 'membership_required') {
    return uiCopy.predictionCalculator.membership_required;
  }
  return error instanceof MobileApiError
    ? errors[error.code as keyof typeof errors] ?? fallback : fallback;
}

export function CalculatorScreen({ kind }: { kind: CalculatorKind }) {
  useUiLabels();
  const { generation, status } = useSession();
  const copy = uiCopy.calculator;
  const config = calculators[kind];
  if (Platform.OS !== 'web' && status !== 'signed-out' && status !== 'changing') return <Calculator key={`${kind}:${generation}`} kind={kind} />;
  return <AppScreen>
    <AppButton title={copy.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    {Platform.OS === 'web' ? <ThemedText>{copy.mobileOnly}</ThemedText>
      : status === 'signed-out' || status === 'changing'
        ? <><ThemedText type="title">{config.title}</ThemedText>
          <ThemedText>{config.signInRequired}</ThemedText>
          <AppButton title={copy.signIn} onPress={() => router.navigate('/my-chart/personal-chart')} /></>
        : null}
  </AppScreen>;
}

function Calculator({ kind }: { kind: CalculatorKind }) {
  useUiLabels();
  const submissionError = useSubmissionError();
  const copy = uiCopy.calculator;
  const config = calculators[kind];
  const theme = useTheme();
  const [draft, setDraft] = useState<CalculationDraft | null>(null);
  const [secondDraft, setSecondDraft] = useState<CalculationDraft | null>(null);
  const [hideSexualChemistry, setHideSexualChemistry] = useState(true);
  const [options, setOptions] = useState<AccountOptions | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const pending = useRef(false);
  const alive = useRef(true);
  const helpStarted = useRef(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage('');
    const generation = session.getSnapshot().generation;
    try {
      const [account, metadata, zones] = await settleAccountLoad([
        getOwnAccount(), mobileApiRequest('metadata/options'), getTimezones(),
      ]);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const nextOptions = accountOptions(metadata.data, zones);
      const identity = session.getSnapshot().identity;
      const [remembered, secondRemembered] = identity ? await Promise.all([
        calculatorMemory.read(API_BASE_URL, identity, memoryKey(kind)),
        kind === 'compatibility' ? calculatorMemory.read(API_BASE_URL, identity, memoryKey(kind, 'second')) : Promise.resolve(null),
      ]) : [null, null];
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const defaults = calculationDraft(account.data, nextOptions.genders);
      const initial = remembered ?? defaults;
      const choices = [...zones];
      // Account-supplied aliases have already been validated by the server.
      for (const value of [defaults.birthTimeZoneId, defaults.userTimeZoneId]) {
        if (value && !choices.some((zone) => zone.value === value)) choices.push({ value, label: value });
      }
      setOptions(accountOptions(metadata.data, choices));
      setDraft(initial);
      if (identity && !remembered) void calculatorMemory.remember(API_BASE_URL, identity, memoryKey(kind), initial);
      if (kind === 'compatibility') {
        const second = secondRemembered ?? calculationDraft(account.data, nextOptions.genders);
        setSecondDraft(second);
        if (identity && !secondRemembered) void calculatorMemory.remember(API_BASE_URL, identity, memoryKey(kind, 'second'), second);
      }
    } catch (error) {
      if (alive.current && generation === session.getSnapshot().generation) setMessage(describeError(error, kind));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }, [kind]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    if (!draft) void load();
    if (helpStarted.current) return;
    helpStarted.current = true;
    const generation = session.getSnapshot().generation;
    void config.introduction().then((help) => {
      if (alive.current && generation === session.getSnapshot().generation) setIntroduction(help);
    }).catch(() => {
      // Optional help must not block the form or overwrite an in-progress draft.
      helpStarted.current = false;
    });
  }, [draft, load, config]));

  function remember(next: CalculationDraft, person = 'first') {
    const identity = session.getSnapshot().identity;
    if (identity) void calculatorMemory.remember(API_BASE_URL, identity, memoryKey(kind, person), next);
  }

  async function calculate() {
    if (!draft || !options || pending.current) return;
    if (kind === 'compatibility' && !secondDraft) return;
    let body: Record<string, unknown>;
    try { body = kind === 'compatibility' ? buildCompatibility(draft, secondDraft!, options, hideSexualChemistry)
      : buildCalculation(draft, options, kind === 'predictions'); }
    catch (error) {
      if (error instanceof FieldValidationError) { setFieldErrors({ [error.field]: error.message }); setMessage(''); }
      else submissionError.showError(error instanceof Error ? error.message : copy.errors.unavailable);
      return;
    }
    setFieldErrors({});
    submissionError.dismiss();
    remember(draft);
    if (kind === 'compatibility' && secondDraft) remember(secondDraft, 'second');
    pending.current = true;
    setBusy(true);
    setMessage('');
    const generation = session.getSnapshot().generation;
    try {
      const response = await config.calculate(body);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const next = config.parse(response.data, hideSexualChemistry);
      setResult(next);
      const help = next.kind === 'personal-chart' ? next.chart.help?.overview
        : next.kind === 'predictions' ? next.predictions.help.overview : next.compatibility.help.overview;
      if (help) setIntroduction(help);
    } catch (error) {
      if (alive.current && generation === session.getSnapshot().generation) submissionError.showError(describeError(error, kind));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return <AppScreen key={result ? 'result' : 'form'} backToTopLabel={result?.kind === 'compatibility' ? uiCopy.backToMenu : undefined}>
    {submissionError.dialog}
    <AppActionGroup>
    <AppButton title={copy.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    {result && <AppButton title={copy.edit} variant="secondary" onPress={() => { setEditing(true); setResult(null); }} />}
    </AppActionGroup>
    {result ? result.kind === 'personal-chart' ? <PersonalChart chart={result.chart} />
      : result.kind === 'predictions' ? <Predictions predictions={result.predictions} />
      : <Compatibility reading={result.compatibility} /> : <>
    <ThemedText type="title" accessibilityRole="header">{config.title}</ThemedText>
    {introduction && <ContextualHelp help={introduction} />}
    {!!message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
    {!draft && busy && <ActivityIndicator accessibilityLabel={copy.loading} color={theme.primary} />}
    {draft && options && <AppFieldErrors errors={fieldErrors}><AppScrollTarget scrollOnMount={editing}>
      {kind === 'compatibility' && secondDraft ? <CompatibilityForm first={draft} second={secondDraft} options={options}
        onFirstChange={next => { setDraft(next); setFieldErrors({}); setMessage(''); remember(next); }}
        onSecondChange={next => { setSecondDraft(next); setFieldErrors({}); setMessage(''); remember(next, 'second'); }}
        hideSexualChemistry={hideSexualChemistry} onHideSexualChemistryChange={value => { setHideSexualChemistry(value); setFieldErrors({}); }}
        busy={busy} onSubmit={calculate} errors={fieldErrors} /> : <CalculationForm draft={draft} options={options} errors={fieldErrors}
        onChange={(next) => { setDraft(next); setFieldErrors({}); setMessage(''); remember(next); }} onSubmit={calculate} busy={busy}
        includeSelectedDate={kind === 'predictions'} />}
    </AppScrollTarget></AppFieldErrors>}
    {!draft && !busy && <AppButton title={copy.retry} onPress={load} />}
    </>}
  </AppScreen>;
}
