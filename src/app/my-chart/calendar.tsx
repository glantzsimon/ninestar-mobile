import { useUiLabels } from '@/hooks/use-ui-labels';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { ContextualHelp } from '@/components/contextual-help';
import { PersonalCalendar } from '@/components/personal-calendar';
import { CalendarOverview, CalendarZoomNavigation } from '@/components/calendar-overview';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLoadingPanel } from '@/components/ui/app-loading-panel';
import { AppModal } from '@/components/ui/app-modal';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { useSession } from '@/hooks/use-session';
import { useSubmissionError } from '@/hooks/use-submission-error';
import { API_BASE_URL, createCalendarSubscription, getCalendarMonth, getOwnAccount,
  getPredictionsPlanner, mobileApiRequest, MobileApiError, revokeCalendarSubscription } from '@/lib/mobile-api';
import { backCalendarPage, calendarPageUp, localPlannerDate, ownPlannerCalculation, parsePlannerOverview,
  plannerItemAnchor, plannerRequest, plannerViewOptions, rememberCalendarPage,
  type CalendarHistory, type CalendarPage, type CalendarView, type OverviewView, type PlannerItem, type PlannerNavigationDirection } from '@/lib/calendar-planner';
import { calendarSelection, calendarSubscriptionUrl, parseCalendarMonth, type CalendarMonth } from '@/lib/personal-calendar';
import { session } from '@/lib/session';
import { uiCopy } from '@/lib/ui-copy';

const copy = uiCopy.calendar;
type CalendarRequest = { kind: 'Month'; year?: number; month?: number; date?: string; remember: boolean }
  | { kind: OverviewView; anchor: string; direction: PlannerNavigationDirection; remember: boolean };
function errorMessage(error: unknown) {
  return error instanceof MobileApiError ? copy[error.code as keyof typeof copy] ?? copy.unavailable : copy.unavailable;
}

export default function CalendarScreen() {
  useUiLabels();
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
  useUiLabels();
  const submissionError = useSubmissionError();
  const [calendar, setCalendar] = useState<CalendarMonth | null>(null);
  const [page, setPage] = useState<CalendarPage | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [views, setViews] = useState<{ value: CalendarView; label: string }[]>([]);
  const [plannerZone, setPlannerZone] = useState('');
  const [canPlan, setCanPlan] = useState(false);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [link, setLink] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');
  const pending = useRef(false), linkPending = useRef(false), alive = useRef(true);
  const focused = useRef(false);
  const navigation = useRef<CalendarHistory>({ current: null, previous: [] });
  const calculation = useRef<Record<string, unknown> | null>(null);
  const viewOptions = useRef<{ value: CalendarView; label: string }[]>([]);
  const retry = useRef<CalendarRequest | null>(null);
  const applyNavigation = useCallback((next: CalendarHistory) => {
    navigation.current = next;
    setPage(next.current); setCanGoBack(next.previous.length > 0);
    if (next.current) {
      setSelected(next.current.selectedDate);
      if (next.current.kind === 'Month') setCalendar(next.current.calendar);
    }
  }, []);
  const commit = useCallback((next: CalendarPage, remember: boolean) => {
    applyNavigation(remember ? rememberCalendarPage(navigation.current, next) : { ...navigation.current, current: next });
  }, [applyNavigation]);
  const clearProtected = useCallback(() => {
    applyNavigation({ current: null, previous: [] });
    calculation.current = null;
    setCanPlan(false); setPlannerZone('');
    setSelected('');
    setCalendar(null); setExpanded(false); setLink('');
  }, [applyNavigation]);
  const prepare = useCallback(async (refresh = false) => {
    if (calculation.current && !refresh) return calculation.current;
    const generation = session.getSnapshot().generation;
    const [account, metadata] = await Promise.all([
      getOwnAccount(), viewOptions.current.length ? Promise.resolve(null) : mobileApiRequest('metadata/options').catch(() => null),
    ]);
    if (!alive.current || generation !== session.getSnapshot().generation) throw new MobileApiError('session_changed');
    let next: Record<string, unknown> | null = null;
    try { next = ownPlannerCalculation(account.data); }
    catch { /* An older account projection must not prevent the existing Gregorian grid. */ }
    if (calculation.current && JSON.stringify(next) !== JSON.stringify(calculation.current)) {
      // Changed saved settings invalidate previously calculated period snapshots.
      applyNavigation({ current: null, previous: [] });
      setCalendar(null); setSelected(''); setLink('');
    }
    calculation.current = next;
    setCanPlan(next !== null); setPlannerZone(typeof next?.userTimeZoneId === 'string' ? next.userTimeZoneId : '');
    if (metadata) {
      viewOptions.current = plannerViewOptions(metadata.data.plannerViews);
      setViews(viewOptions.current);
    }
    return next;
  }, [applyNavigation]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const load = useCallback(async (year?: number, month?: number, wantedDate?: string, remember = false, refresh = false) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setError('');
    retry.current = { kind: 'Month', year, month, date: wantedDate, remember };
    const generation = session.getSnapshot().generation;
    try {
      await prepare(refresh);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const result = await getCalendarMonth(year, month);
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const next = parseCalendarMonth(result.data);
      const date = calendarSelection(next, wantedDate ?? navigation.current.current?.selectedDate ?? '').date;
      commit({ kind: 'Month', calendar: next, selectedDate: date }, remember);
    } catch (failure) {
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      setError(errorMessage(failure));
      if (failure instanceof MobileApiError && [401, 403, 409].includes(failure.status ?? 0)) {
        clearProtected();
        if (failure.status === 403) session.clearEntitlements(generation);
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, [prepare, commit, clearProtected]);
  const loadOverview = useCallback(async (view: OverviewView, anchor: string, direction: PlannerNavigationDirection = 'None', remember = true, refresh = false) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    retry.current = { kind: view, anchor, direction, remember };
    const generation = session.getSnapshot().generation;
    try {
      const context = await prepare(refresh);
      if (!context) throw new MobileApiError('calendar_details_required', 409);
      if (!viewOptions.current.some(option => option.value === view)) throw new MobileApiError('invalid_response');
      const result = await getPredictionsPlanner(plannerRequest(context, view, anchor, direction));
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      const overview = parsePlannerOverview(result.data, view);
      // Preserve the caller's selected day when it belongs to the returned parent;
      // adjacent-period navigation uses the returned interior anchor instead.
      const selectedDate = direction === 'None' ? anchor.slice(0, 10) : overview.anchor.slice(0, 10);
      const current = navigation.current.current;
      const selectedPeriod = direction === 'None' && current?.kind === view &&
        current.planner.startsOn === overview.startsOn && overview.items.some(item => item.startsOn === current.selectedPeriod)
        ? current.selectedPeriod : undefined;
      commit({ kind: view, planner: overview, selectedDate, selectedPeriod }, remember);
    } catch (failure) {
      if (!alive.current || generation !== session.getSnapshot().generation) return;
      setError(errorMessage(failure));
      if (failure instanceof MobileApiError && [401, 403, 409].includes(failure.status ?? 0)) {
        clearProtected();
        if (failure.status === 403) session.clearEntitlements(generation);
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }, [prepare, commit, clearProtected]);
  const refreshCurrent = useCallback(() => {
    const current = navigation.current.current;
    if (current && current.kind !== 'Month') {
      void loadOverview(current.kind, localPlannerDate(current.selectedDate), 'None', false, true);
    } else void load(current?.calendar.year, current?.calendar.month, current?.selectedDate, false, true);
  }, [load, loadOverview]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    refreshCurrent();
    let wasBackground = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && wasBackground) {
        wasBackground = false;
        refreshCurrent();
      }
      if (state === 'background') wasBackground = true;
    });
    return () => { focused.current = false; subscription.remove(); setLink(''); setLinkMessage(''); };
  }, [refreshCurrent]));

  function selectDay(date: string) {
    const current = navigation.current.current;
    if (current?.kind === 'Month') commit({ ...current, selectedDate: date }, false);
  }
  function zoomOut() {
    const current = navigation.current.current;
    const view = current && calendarPageUp(current);
    if (view && current) void loadOverview(view, localPlannerDate(current.selectedDate));
  }
  function selectPeriod(item: PlannerItem | null) {
    const current = navigation.current.current;
    if (!current || current.kind === 'Month' || pending.current) return;
    const anchor = item && plannerItemAnchor(item, current.selectedDate);
    commit({ ...current, selectedPeriod: item?.startsOn, selectedDate: anchor?.slice(0, 10) ?? current.selectedDate }, false);
  }
  function drill(item: PlannerItem) {
    const current = navigation.current.current;
    if (!current || current.kind === 'Month' || pending.current) return;
    const anchor = plannerItemAnchor(item, current.selectedDate);
    if (!anchor) return;
    if (item.childView === 'Month') {
      const [year, month] = anchor.slice(0, 10).split('-').map(Number);
      void load(year, month, anchor.slice(0, 10), true, false);
    } else void loadOverview(item.childView, anchor);
  }
  function goBack() {
    if (pending.current || linkPending.current) return;
    setError(''); applyNavigation(backCalendarPage(navigation.current));
  }
  function retryNavigation() {
    const request = retry.current;
    if (!request) return;
    if (request.kind === 'Month') void load(request.year, request.month, request.date, request.remember, true);
    else void loadOverview(request.kind, request.anchor, request.direction, request.remember, true);
  }

  function clearDeniedAccess(failure: unknown, generation: number) {
    if (failure instanceof MobileApiError && [401, 403, 409].includes(failure.status ?? 0)) {
      clearProtected();
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
      if (alive.current && focused.current && generation === session.getSnapshot().generation) {
        if (copied) setLinkMessage(calendar?.labels.copied || copy.copied);
        else submissionError.showError(calendar?.labels.copyError || copy.copyFailed);
      }
    } catch (failure) {
      if (alive.current && focused.current && generation === session.getSnapshot().generation) {
        clearDeniedAccess(failure, generation);
        submissionError.showError(failure instanceof MobileApiError ? errorMessage(failure) : copy.copyFailed);
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
        submissionError.showError(copy.subscriptionUnavailable);
      }
    } finally { linkPending.current = false; if (alive.current) setLinkBusy(false); }
  }
  function confirmDisable() {
    Alert.alert(copy.revokeTitle, copy.revokePrompt, [
      { text: copy.cancel, style: 'cancel' }, { text: calendar?.labels.disableCalendarLink || copy.disable, style: 'destructive', onPress: () => { void disableLink(); } },
    ]);
  }
  function content(inModal = false) {
    const up = page && calendarPageUp(page);
    const upLabel = canPlan ? views.find(option => option.value === up)?.label : undefined;
    const navigationControls = <CalendarZoomNavigation upLabel={upLabel} onUp={up ? zoomOut : undefined}
      onBack={canGoBack ? goBack : undefined} busy={busy || linkBusy} />;
    return <>
      {busy && <AppLoadingPanel message={copy.loading} />}
      {!!error && <AppPanel><ThemedText accessibilityLiveRegion="polite">{error}</ThemedText>
        <AppButton title={copy.retry} disabled={busy} onPress={retryNavigation} />
        <AppButton title={calendar?.labels.myAccount || copy.account} variant="secondary" onPress={() => router.navigate('/account')} />
      </AppPanel>}
      {page?.kind === 'Month' && <PersonalCalendar calendar={page.calendar} selected={selected} onSelect={selectDay}
        inModal={inModal}
        navigation={navigationControls}
        onMonth={(year, month) => { void load(year, month); }} busy={busy || linkBusy}
        onExpand={inModal ? undefined : () => setExpanded(true)} />}
      {page && page.kind !== 'Month' && <CalendarOverview planner={page.planner}
        title={views.find(option => option.value === page.kind)?.label ?? ''} navigation={navigationControls}
        selectedDate={page.selectedDate} selectedPeriod={page.selectedPeriod} timeZone={plannerZone}
        childLabel={views.find(option => option.value === page.planner.childView)?.label} onDrill={drill}
        onSelect={selectPeriod} onAdjacent={direction => { void loadOverview(page.kind as OverviewView, page.planner.anchor, direction); }}
        busy={busy || linkBusy} inModal={inModal} onExpand={inModal ? undefined : () => setExpanded(true)} />}
    </>;
  }
  return <AppScreen>
    {submissionError.dialog}
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
