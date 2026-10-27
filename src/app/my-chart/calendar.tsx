import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { ContextualHelp } from '@/components/contextual-help';
import { PersonalCalendar } from '@/components/personal-calendar';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLoadingPanel } from '@/components/ui/app-loading-panel';
import { AppModal } from '@/components/ui/app-modal';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { API_BASE_URL, createCalendarSubscription, getCalendarMonth, getOwnAccount,
  MobileApiError, revokeCalendarSubscription } from '@/lib/mobile-api';
import { calendarSelection, calendarSubscriptionUrl, parseCalendarMonth, type CalendarMonth } from '@/lib/personal-calendar';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';

const copy = uiCopy.calendar;
function errorMessage(error: unknown) {
  return error instanceof MobileApiError ? copy[error.code as keyof typeof copy] ?? copy.unavailable : copy.unavailable;
}

export default function CalendarScreen() {
  const { generation, status } = useSession();
  if (Platform.OS === 'web' || status === 'signed-out' || status === 'changing') return <AppScreen>
    <AppButton title={uiCopy.myChart.back} variant="secondary" onPress={() => router.navigate('/my-chart')} />
    <ThemedText type="title">{copy.title}</ThemedText>
    <ThemedText>{Platform.OS === 'web' ? copy.mobileOnly : copy.signInRequired}</ThemedText>
    {Platform.OS !== 'web' && <AppButton title={copy.signIn} onPress={() => router.navigate('/my-chart/personal-chart')} />}
  </AppScreen>;
  return <OwnCalendar key={generation} />;
}

function OwnCalendar() {
  const [calendar, setCalendar] = useState<CalendarMonth | null>(null);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [link, setLink] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');
  const pending = useRef(false), linkPending = useRef(false), alive = useRef(true);
  const focused = useRef(false);
  const target = useRef<{ year: number; month: number } | undefined>(undefined);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = useCallback(async (year?: number, month?: number) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setError('');
    target.current = year !== undefined && month !== undefined ? { year, month } : undefined;
    const generation = session.getSnapshot().generation;
    try {
      await getOwnAccount();
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const result = await getCalendarMonth(year, month);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const next = parseCalendarMonth(result.data);
      setCalendar(next);
      setSelected(previous => calendarSelection(next, previous).date);
    } catch (failure) {
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      setError(errorMessage(failure));
      if (failure instanceof MobileApiError && [401, 403, 409].includes(failure.status ?? 0)) {
        setCalendar(null); setExpanded(false); setLink('');
        if (failure.status === 403) session.clearEntitlements(generation);
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, []);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    void load();
    let wasBackground = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && wasBackground) {
        wasBackground = false;
        void load(target.current?.year, target.current?.month);
      }
      if (state === 'background') wasBackground = true;
    });
    return () => { focused.current = false; subscription.remove(); setLink(''); setLinkMessage(''); };
  }, [load]));

  function clearDeniedAccess(failure: unknown, generation: number) {
    if (failure instanceof MobileApiError && [401, 403, 409].includes(failure.status ?? 0)) {
      setCalendar(null); setExpanded(false); setLink('');
      setError(errorMessage(failure));
      if (failure.status === 403) session.clearEntitlements(generation);
    }
  }

  async function copyLink() {
    if (linkPending.current || pending.current) return;
    const generation = session.getSnapshot().generation;
    linkPending.current = true; setLinkBusy(true); setLinkMessage('');
    try {
      const value = link || calendarSubscriptionUrl((await createCalendarSubscription()).data.url, API_BASE_URL);
      if (!alive.current || !focused.current || generation !== session.getSnapshot().generation) return;
      setLink(value);
      const copied = await Clipboard.setStringAsync(value, { android: { isSensitive: true } });
      if (alive.current && focused.current && generation === session.getSnapshot().generation) setLinkMessage(
        copied ? calendar?.labels.copied || copy.copied : calendar?.labels.copyError || copy.copyFailed);
    } catch (failure) {
      if (alive.current && focused.current && generation === session.getSnapshot().generation) {
        clearDeniedAccess(failure, generation);
        setLinkMessage(failure instanceof MobileApiError ? errorMessage(failure) : copy.copyFailed);
      }
    } finally { linkPending.current = false; if (alive.current) setLinkBusy(false); }
  }
  async function disableLink() {
    if (linkPending.current || pending.current) return;
    const generation = session.getSnapshot().generation;
    linkPending.current = true; setLinkBusy(true); setLinkMessage(''); setLink('');
    try {
      await revokeCalendarSubscription();
      if (alive.current && focused.current && generation === session.getSnapshot().generation) setLinkMessage(calendar?.labels.revoked || copy.disabled);
    } catch (failure) {
      if (alive.current && focused.current && generation === session.getSnapshot().generation) {
        clearDeniedAccess(failure, generation);
        setLinkMessage(copy.subscriptionUnavailable);
      }
    } finally { linkPending.current = false; if (alive.current) setLinkBusy(false); }
  }
  function confirmDisable() {
    Alert.alert(copy.revokeTitle, copy.revokePrompt, [
      { text: copy.cancel, style: 'cancel' }, { text: calendar?.labels.disableCalendarLink || copy.disable, style: 'destructive', onPress: () => { void disableLink(); } },
    ]);
  }
  function content(inModal = false) {
    return <>
      {busy && <AppLoadingPanel message={copy.loading} />}
      {!!error && <AppPanel><ThemedText accessibilityLiveRegion="polite">{error}</ThemedText>
        <AppButton title={copy.retry} disabled={busy} onPress={() => load(target.current?.year, target.current?.month)} />
        <AppButton title={calendar?.labels.myAccount || copy.account} variant="secondary" onPress={() => router.navigate('/account')} />
      </AppPanel>}
      {calendar && <PersonalCalendar calendar={calendar} selected={selected} onSelect={setSelected} inModal={inModal}
        onMonth={(year, month) => { void load(year, month); }} busy={busy || linkBusy}
        onExpand={inModal ? undefined : () => setExpanded(true)} />}
    </>;
  }
  return <AppScreen>
    <AppButton title={uiCopy.myChart.back} variant="secondary" onPress={() => router.navigate('/my-chart')} />
    <ThemedText type="title" accessibilityRole="header">{calendar?.labels.title || copy.title}</ThemedText>
    {calendar?.help.overview && <ContextualHelp help={calendar.help.overview} />}
    {!expanded && content()}
    {calendar && <AppPanel title={calendar.help.subscription ? undefined : calendar.labels.googleCalendarLink}>
      {calendar.help.subscription && <ContextualHelp help={{ ...calendar.help.subscription, title: calendar.labels.googleCalendarLink }} />}
      <AppButton title={calendar.labels.copyCalendarLink || copy.copy} onPress={copyLink} loading={linkBusy} disabled={busy} />
      {!!link && <AppInput label={copy.link} value={link} editable={false} multiline autoComplete="off" />}
      <AppButton title={calendar.labels.disableCalendarLink || copy.disable} variant="secondary" onPress={confirmDisable} disabled={busy || linkBusy} />
      {!!linkMessage && <ThemedText type="small" accessibilityLiveRegion="polite">{linkMessage}</ThemedText>}
    </AppPanel>}
    {expanded && <AppModal title={calendar?.labels.title || copy.title} edgeToEdge onClose={() => setExpanded(false)}>{content(true)}</AppModal>}
  </AppScreen>;
}
