import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { useSession } from '@/hooks/use-session';
import { MobileApiError, refreshEntitlements } from '@/lib/mobile-api';
import { useUiLabels } from '@/hooks/use-ui-labels';

export function MembershipStatus({ refreshOnFocus = false, displayName = '' }: { refreshOnFocus?: boolean; displayName?: string }) {
  const labels = useUiLabels();
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const alive = useRef(true);
  const firstFocus = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage('');
    try { await refreshEntitlements(); }
    catch (error) {
      if (alive.current && !(error instanceof MobileApiError && ['session_changed', 'authentication_required'].includes(error.code))) {
        setMessage('Membership could not be checked. Please try again.');
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!refreshOnFocus || status === 'changing' || status === 'signed-out') return;
    // The account load has just supplied a fresh snapshot on this panel's mount.
    if (firstFocus.current) firstFocus.current = false;
    else void refresh();
    let wasBackground = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && wasBackground) { wasBackground = false; void refresh(); }
      if (state === 'background') wasBackground = true;
    });
    return () => subscription.remove();
  }, [refresh, refreshOnFocus, status]));

  // This private display label comes from the owning account response. Access
  // refresh remains independent of the form and never changes its draft.
  return message || displayName.trim() ? (
    <AppPanel title={labels.screens.account.currentMembership}>
      {!!displayName.trim() && <ThemedText>{displayName}</ThemedText>}
      {!!message && <>
      <ThemedText type="small" accessibilityLiveRegion="polite">{message}</ThemedText>
      <AppButton title={labels.screens.calendar.ui.retry} variant="secondary" onPress={refresh} loading={busy} disabled={status === 'changing'} />
      </>}
    </AppPanel>
  ) : null;
}
