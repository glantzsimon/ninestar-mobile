import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { CalculationForm } from '@/components/calculation-form';
import { ContextualHelp } from '@/components/contextual-help';
import { PersonalChart } from '@/components/personal-chart';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { accountOptions, type AccountOptions } from '@/lib/account';
import { settleAccountLoad } from '@/lib/account-load';
import { buildCalculation, calculationDraft, type CalculationDraft } from '@/lib/calculation';
import { calculatorMemory } from '@/lib/calculator-storage';
import type { ContextualHelp as Introduction } from '@/lib/contextual-help';
import { API_BASE_URL, calculatePersonalChart, getOwnAccount, getPersonalChartIntroduction, getTimezones, MobileApiError, mobileApiRequest } from '@/lib/mobile-api';
import { parsePersonalChart, type PersonalChart as Chart } from '@/lib/personal-chart';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';

function describeError(error: unknown) {
  const errors = uiCopy.calculator.errors;
  return error instanceof MobileApiError
    ? errors[error.code as keyof typeof errors] ?? errors.unavailable : errors.unavailable;
}

export default function PersonalChartCalculatorScreen() {
  const { generation, status } = useSession();
  const copy = uiCopy.calculator;
  if (Platform.OS !== 'web' && status !== 'signed-out' && status !== 'changing') return <Calculator key={generation} />;
  return <AppScreen>
    <AppButton title={copy.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    {Platform.OS === 'web' ? <ThemedText>{copy.mobileOnly}</ThemedText>
      : status === 'signed-out' || status === 'changing'
        ? <><ThemedText type="title">{copy.title}</ThemedText>
          <ThemedText>{copy.signInRequired}</ThemedText>
          <AppButton title={copy.signIn} onPress={() => router.navigate('/')} /></>
        : null}
  </AppScreen>;
}

function Calculator() {
  const copy = uiCopy.calculator;
  const theme = useTheme();
  const [draft, setDraft] = useState<CalculationDraft | null>(null);
  const [options, setOptions] = useState<AccountOptions | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const alive = useRef(true);
  const helpStarted = useRef(false);

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
      const remembered = identity ? await calculatorMemory.read(API_BASE_URL, identity, 'personal-chart') : null;
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
      if (identity && !remembered) void calculatorMemory.remember(API_BASE_URL, identity, 'personal-chart', initial);
    } catch (error) {
      if (alive.current && generation === session.getSnapshot().generation) setMessage(describeError(error));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    if (!draft) void load();
    if (helpStarted.current) return;
    helpStarted.current = true;
    const generation = session.getSnapshot().generation;
    void getPersonalChartIntroduction().then((help) => {
      if (alive.current && generation === session.getSnapshot().generation) setIntroduction(help);
    }).catch(() => {
      // Optional help must not block the form or overwrite an in-progress draft.
      helpStarted.current = false;
    });
  }, [draft, load]));

  function remember(next: CalculationDraft) {
    const identity = session.getSnapshot().identity;
    if (identity) void calculatorMemory.remember(API_BASE_URL, identity, 'personal-chart', next);
  }

  async function calculate() {
    if (!draft || !options || pending.current) return;
    let body: Record<string, unknown>;
    try { body = buildCalculation(draft, options); }
    catch (error) { setMessage(error instanceof Error ? error.message : copy.errors.unavailable); return; }
    remember(draft);
    pending.current = true;
    setBusy(true);
    setMessage('');
    const generation = session.getSnapshot().generation;
    try {
      const response = await calculatePersonalChart(body);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const result = parsePersonalChart(response.data, 'full');
      setChart(result);
      if (result.help?.overview) setIntroduction(result.help.overview);
    } catch (error) {
      if (alive.current && generation === session.getSnapshot().generation) setMessage(describeError(error));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return <AppScreen key={chart ? 'result' : 'form'}>
    <AppButton title={copy.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    {chart ? <>
    <AppButton title={copy.edit} variant="secondary" onPress={() => setChart(null)} />
    <PersonalChart chart={chart} />
    </> : <>
    <ThemedText type="title" accessibilityRole="header">{copy.title}</ThemedText>
    {introduction && <ContextualHelp help={introduction} />}
    {!draft && busy && <ActivityIndicator accessibilityLabel={copy.loading} color={theme.primary} />}
    {draft && options && <CalculationForm draft={draft} options={options}
      onChange={(next) => { setDraft(next); setMessage(''); remember(next); }} onSubmit={calculate} busy={busy} />}
    {!!message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
    {!draft && !busy && <AppButton title={copy.retry} onPress={load} />}
    </>}
  </AppScreen>;
}
