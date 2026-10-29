import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ContextualHelp } from '@/components/contextual-help';
import { IChingReading } from '@/components/iching-reading';
import { ThemedText } from '@/components/themed-text';
import { AppActionGroup } from '@/components/ui/app-action-group';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen, AppScrollTarget } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { useSubmissionError } from '@/hooks/use-submission-error';
import { parseIChing, type IChingReading as Reading } from '@/lib/iching';
import type { ContextualHelp as Introduction } from '@/lib/contextual-help';
import { castIChing, getIChingIntroduction, MobileApiError } from '@/lib/mobile-api';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';

export function IChingCalculatorScreen() {
  const { generation } = useSession();
  return <Calculator key={generation} />;
}

function Calculator() {
  const errorDialog = useSubmissionError();
  const [reading, setReading] = useState<Reading | null>(null);
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [busy, setBusy] = useState(false);
  const [castNumber, setCastNumber] = useState(0);
  const pending = useRef(false), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let active = true;
    const generation = session.getSnapshot().generation;
    void getIChingIntroduction().then(help => {
      if (active && alive.current && generation === session.getSnapshot().generation) setIntroduction(help);
    }).catch(() => { /* Optional help must not prevent a deliberate cast. */ });
    return () => { active = false; };
  }, []);
  async function generate() {
    if (pending.current) return;
    pending.current = true; setBusy(true); errorDialog.dismiss();
    const generation = session.getSnapshot().generation;
    try {
      const response = await castIChing();
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const result = parseIChing(response.data);
      setReading(result); setCastNumber(number => number + 1);
    } catch (error) {
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      errorDialog.showError(error instanceof MobileApiError && ['invalid_csrf_token', 'request_timeout', 'network_error'].includes(error.code)
        ? uiCopy.calculator.errors[error.code as keyof typeof uiCopy.calculator.errors] ?? uiCopy.iching.unavailable : uiCopy.iching.unavailable);
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  return <AppScreen>
    {errorDialog.dialog}
    <AppActionGroup>
      <AppButton title={uiCopy.calculator.back} variant="secondary" onPress={() => router.navigate('/explore')} />
      {reading && <AppButton title={uiCopy.iching.generate} onPress={generate} loading={busy} />}
    </AppActionGroup>
    <ThemedText type="title" accessibilityRole="header">{uiCopy.explore.iching}</ThemedText>
    {!reading && introduction && <ContextualHelp help={introduction} />}
    {!reading ? <AppPanel>
      <ArtworkImage artworkId="iching.iching" fallback={require('../../assets/images/ninestar-mark.png')}
        contentFit="contain" accessible={false} style={styles.artwork} />
      <AppButton title={uiCopy.iching.generate} onPress={generate} loading={busy} />
    </AppPanel> : <AppScrollTarget key={castNumber} scrollOnMount><IChingReading reading={reading} /></AppScrollTarget>}
  </AppScreen>;
}
const styles = StyleSheet.create({ artwork: { width: '100%', maxWidth: 200, aspectRatio: 1, alignSelf: 'center' } });
