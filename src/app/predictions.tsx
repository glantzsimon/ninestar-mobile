import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform } from 'react-native';
import { Predictions } from '@/components/predictions';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { getOwnAccount, getOwnPredictions, MobileApiError, mobileApiRequest } from '@/lib/mobile-api';
import { parsePredictions, predictionScopeLabels, type Predictions as Reading } from '@/lib/predictions';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';

export default function PredictionsScreen() {
  const { generation, status } = useSession();
  const copy = uiCopy.predictions;
  if (Platform.OS === 'web' || status === 'signed-out' || status === 'changing') return <AppScreen>
    <ThemedText type="title">{copy.ownTitle}</ThemedText>
    <ThemedText>{Platform.OS === 'web' ? copy.mobileOnly : copy.signInRequired}</ThemedText>
    {Platform.OS !== 'web' && <AppButton title={copy.signIn} onPress={() => router.navigate('/')} />}
  </AppScreen>;
  return <OwnPredictions key={generation} />;
}

function OwnPredictions() {
  const theme = useTheme();
  const copy = uiCopy.predictions;
  const [reading, setReading] = useState<Reading | null>(null);
  const [labels, setLabels] = useState({ personal: '', lunar: '', global: '' });
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setReading(null);
    setMessage('');
    const generation = session.getSnapshot().generation;
    try {
      await getOwnAccount();
      const responses = await Promise.allSettled([getOwnPredictions(), mobileApiRequest('metadata/options')]);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const result = responses[0];
      if (result.status === 'rejected') throw result.reason;
      const metadata = responses[1];
      setLabels(metadata.status === 'fulfilled' ? predictionScopeLabels(metadata.value.data) : { personal: '', lunar: '', global: '' });
      setReading(parsePredictions(result.value.data, result.value.access));
    } catch (error) {
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      setMessage(error instanceof MobileApiError ? copy[error.code as keyof typeof copy] ?? copy.unavailable : copy.unavailable);
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, [copy]);
  useFocusEffect(useCallback(() => {
    void load();
    let wasBackground = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && wasBackground) { wasBackground = false; void load(); }
      if (state === 'background') wasBackground = true;
    });
    return () => subscription.remove();
  }, [load]));
  return <AppScreen>
    {reading && !busy ? <Predictions predictions={reading} scopeLabels={labels} title={copy.ownTitle} /> : <>
      <ThemedText type="title">{copy.ownTitle}</ThemedText>
      {busy && <ActivityIndicator color={theme.primary} accessibilityLabel={copy.loading} />}
    </>}
    {!!message && <><ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>
      <AppButton title={copy.account} variant="secondary" onPress={() => router.navigate('/account')} />
      <AppButton title={copy.retry} onPress={load} /></>}
  </AppScreen>;
}
