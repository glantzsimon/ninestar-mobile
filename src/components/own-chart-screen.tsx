import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';

import { AccountLogin } from '@/components/account-login';
import { PersonalChart } from '@/components/personal-chart';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { AppLoadingPanel } from '@/components/ui/app-loading-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { getOwnChart, MobileApiError, refreshEntitlements, signIn } from '@/lib/mobile-api';
import { session } from '@/lib/session';
import { parsePersonalChart, type PersonalChart as Chart } from '@/lib/personal-chart';
import { uiCopy } from '@/lib/ui-copy';

const messages: Record<string, string> = {
  invalid_credentials: 'The username or password is incorrect.',
  account_locked: 'Your account is locked. Please try again later.',
  account_not_activated: 'Please activate your NineStar account before signing in.',
  invalid_csrf_token: 'Your session could not be verified. Please sign in again.',
  authentication_required: 'Please sign in to see your personal chart.',
  birth_details_required: 'Please review your birth details and calculation preferences in My Account.',
  timezone_required: 'Please save your birth and current timezones in My Account.',
  invalid_timezone: 'Please check your saved timezones in My Account.',
  invalid_calculation_settings: 'Please check your calculation preferences in My Account.',
  membership_required: 'These chart sections are not available with your current membership.',
  request_timeout: 'The request took too long. Please try again.',
  network_error: 'We could not connect. Check your connection and try again.',
  invalid_response: 'We could not read your chart. Please try again.',
};

function describeError(error: unknown) {
  return error instanceof MobileApiError
    ? messages[error.code] ?? 'We could not load your chart. Please try again.'
    : messages.invalid_response;
}

export default function HomeScreen() {
  const { generation, status } = useSession();
  const [chart, setChart] = useState<Chart | null>(null);
  const [chartGeneration, setChartGeneration] = useState(-1);
  const [busy, setBusy] = useState(Platform.OS !== 'web' && status === 'unknown');
  const signedOut = Platform.OS === 'web' || status === 'signed-out' || status === 'changing';
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const alive = useRef(true);

  const acceptError = useCallback((error: unknown) => {
    if (!alive.current) return;
    if (error instanceof MobileApiError && error.code === 'session_changed') return;
    setChart(null);
    setMessage(describeError(error));
  }, []);

  const loadChart = useCallback(async () => {
    const requestGeneration = session.getSnapshot().generation;
    const response = await getOwnChart();
    const result = parsePersonalChart(response.data, response.access);
    if (!alive.current || requestGeneration !== session.getSnapshot().generation) return;
    setChart(result);
    setChartGeneration(requestGeneration);
    setMessage('');
  }, []);

  const refreshChart = useCallback(async () => {
    if (pending.current || Platform.OS === 'web' || ['changing', 'signed-out'].includes(session.getSnapshot().status)) return;
    pending.current = true;
    setBusy(true);
    setChart(null);
    setMessage('');
    try { await refreshEntitlements(); await loadChart(); }
    catch (error) { acceptError(error); }
    finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }, [acceptError, loadChart]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshChart();
    let wasBackground = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && wasBackground) { wasBackground = false; void refreshChart(); }
      if (state === 'background') wasBackground = true;
    });
    return () => subscription.remove();
  }, [refreshChart]));

  async function handleSignIn(username: string, password: string, rememberMe: boolean) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setChart(null);
    setMessage('');
    try {
      await signIn(username, password, rememberMe);
      await loadChart();
    } catch (error) {
      acceptError(error);
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return (
    <AppScreen>
      <AppButton title={uiCopy.myChart.back} variant="secondary" onPress={() => router.navigate('/my-chart')} />
      <View style={styles.brand}>
        <Image source={require('../../assets/images/ninestar-mark.png')} style={styles.logo} contentFit="contain" accessibilityLabel="NineStar" />
        <View style={styles.wordmark}>
          <ThemedText type="subtitle">NineStar</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">9 Star Ki Astrology</ThemedText>
        </View>
      </View>
      {busy && <AppLoadingPanel message={uiCopy.loadingPersonalChart} />}
      {!busy && chart && chartGeneration === generation && status === 'signed-in' && <PersonalChart chart={chart} title={uiCopy.ownPersonalChart} />}
      {signedOut && (
        <AppPanel title="Welcome Back">
          <ThemedText>Sign in to discover your personal chart.</ThemedText>
          {Platform.OS === 'web'
            ? <ThemedText>Open NineStar in Expo Go on your phone to sign in.</ThemedText>
            : <AccountLogin busy={busy} onSubmit={handleSignIn} />}
        </AppPanel>
      )}
      {!!message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
      {!signedOut && !busy && !!message && <AppButton title="Open My Account" onPress={() => router.navigate('/account')} />}
      {!signedOut && !busy && !chart && (
        <AppButton title="Try Again" variant="secondary" onPress={refreshChart} />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', flexDirection: 'row', gap: Spacing.three },
  logo: { width: 48, height: 48 },
  wordmark: { flex: 1 },
});
