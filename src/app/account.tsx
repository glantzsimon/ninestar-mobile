import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MembershipStatus } from '@/components/membership-status';
import { AppButton } from '@/components/ui/app-button';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppInput } from '@/components/ui/app-input';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { AppSelect } from '@/components/ui/app-select';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/hooks/use-session';
import { uiCopy } from '@/lib/ui-copy';
import { accountDraft, accountOptions, buildAccountUpdate, type AccountDraft, type AccountOptions } from '@/lib/account';
import { settleAccountLoad } from '@/lib/account-load';
import { getOwnAccount, getTimezones, MobileApiError, mobileApiRequest, signOut, updateOwnAccount } from '@/lib/mobile-api';

const yesNo = [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }];
const errors: Record<string, string> = {
  authentication_required: 'Please sign in on My Chart, then return to My Account.',
  invalid_csrf_token: 'Your session could not be verified. Your edits are still here. Please try saving again.',
  email_unavailable: 'That email address is already used by another account.',
  invalid_account_request: 'The server could not accept these details. Check your birth details, timezones and calculation preferences.',
  request_timeout: 'The request took too long. Please try again.',
  network_error: 'We could not connect. Check your connection and try again.',
};
function messageFor(error: unknown) {
  if (error instanceof MobileApiError) {
    const message = errors[error.code] ?? 'The server could not complete the request. Please try again.';
    return message;
  }
  return 'We could not read your saved account details. Please try again.';
}

export default function MyAccountScreen() {
  const { generation, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError('');
    try { await signOut(); }
    catch { setLogoutError('Your local details were cleared, but sign-out could not be confirmed. Please try again.'); }
    finally { setSigningOut(false); }
  }
  if (status === 'signed-out' || status === 'changing') return (
    <AppScreen><ThemedText type="title">{uiCopy.accountTitle}</ThemedText>
      <ThemedText>Please sign in on My Chart to open your account.</ThemedText>
      <AppButton title="Go to Sign In" onPress={() => router.navigate('/')} />
      {!!logoutError && <><ThemedText>{logoutError}</ThemedText><AppButton title="Try Signing Out Again" onPress={logout} loading={signingOut} /></>}
    </AppScreen>
  );
  // Identity changes discard the previous account's form; access-only refreshes do not.
  return <AccountForm key={generation} onSignOut={logout} />;
}

function AccountForm({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const theme = useTheme();
  const [draft, setDraft] = useState<AccountDraft | null>(null);
  const [baseline, setBaseline] = useState<AccountDraft | null>(null);
  const [options, setOptions] = useState<AccountOptions | null>(null);
  const [loading, setLoading] = useState(Platform.OS !== 'web');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [signedOut, setSignedOut] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const pending = useRef(false);
  const alive = useRef(true);

  const fetchAccount = useCallback(async () => {
    const [account, metadata, zones] = await settleAccountLoad([
      getOwnAccount(), mobileApiRequest('metadata/options'), getTimezones(),
    ]);
    const nextDraft = accountDraft(account.data);
    // Keep valid server-saved Windows/IANA aliases even if the selector lists a different alias.
    const choices = [...zones];
    for (const value of [nextDraft.birthTimeZoneId, nextDraft.userTimeZoneId]) {
      if (value && !choices.some((zone) => zone.value === value)) choices.push({ value, label: `${value} (saved)` });
    }
    const nextOptions = accountOptions(metadata.data, choices);
    if (!alive.current) return;
    setDraft(nextDraft);
    setBaseline(nextDraft);
    setOptions(nextOptions);
    setSignedOut(false);
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  function edit<K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setSaved(false);
    setMessage('');
  }

  const reload = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    setMessage('');
    try { await fetchAccount(); setUncertain(false); setSaved(false); }
    catch (error) {
      if (alive.current) {
        setMessage(messageFor(error));
        if (error instanceof MobileApiError && error.status === 401) { setDraft(null); setSignedOut(true); }
      }
    }
    finally { pending.current = false; if (alive.current) setLoading(false); }
  }, [fetchAccount]);

  useFocusEffect(useCallback(() => {
    if (!draft && Platform.OS !== 'web') void reload();
  }, [draft, reload]));

  async function save() {
    if (!draft || !options || pending.current || uncertain) return;
    let body: Record<string, unknown>;
    try { body = buildAccountUpdate(draft, options); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Check the fields and try again.'); return; }
    pending.current = true;
    setSaving(true);
    setMessage('');
    let writeSucceeded = false;
    try {
      await updateOwnAccount(body);
      writeSucceeded = true;
      if (alive.current) { setSaved(true); setMessage('Your account details have been saved.'); }
      await fetchAccount();
    } catch (error) {
      if (!alive.current) return;
      if (writeSucceeded) {
        setMessage('Your details were saved, but could not be checked. Check saved details before making more changes; this will replace your local edits.');
        setUncertain(true);
      } else {
        setMessage(messageFor(error));
        if (error instanceof MobileApiError && (['network_error', 'request_timeout', 'invalid_response'].includes(error.code) || (error.status ?? 0) >= 500)) {
          setUncertain(true);
          setMessage('We could not confirm whether your changes were saved. Check saved details before saving again; this will replace your local edits.');
        }
        if (error instanceof MobileApiError && error.status === 401) { setDraft(null); setSignedOut(true); }
      }
    } finally { pending.current = false; if (alive.current) setSaving(false); }
  }

  if (Platform.OS === 'web') return <AppScreen><ThemedText type="title">{uiCopy.accountTitle}</ThemedText><ThemedText>Open the mobile app to edit your account.</ThemedText></AppScreen>;
  const disabled = loading || saving || uncertain;
  const dirty = draft !== null && baseline !== null &&
    (Object.keys(baseline) as (keyof AccountDraft)[]).some((key) => draft[key] !== baseline[key]);
  function discard() {
    if (pending.current || uncertain) return;
    setDraft(baseline);
    setSaved(false);
    setMessage('');
  }
  return (
    <AppScreen>
      <ThemedText type="title" accessibilityRole="header">{uiCopy.accountTitle}</ThemedText>
      <ThemedText themeColor="textSecondary">Your details are shared with the NineStar website.</ThemedText>
      {draft && !signedOut && <MembershipStatus refreshOnFocus />}
      {loading && <ActivityIndicator size="large" color={theme.primary} accessibilityLabel="Loading account details" />}
      {draft && options && !loading && (
        <>
          <AppPanel title="Personal Details">
            <AppInput label="First name" value={draft.firstName} onChangeText={(value) => edit('firstName', value)} maxLength={100} editable={!disabled} autoComplete="given-name" />
            <AppInput label="Last name" value={draft.lastName} onChangeText={(value) => edit('lastName', value)} maxLength={100} editable={!disabled} autoComplete="family-name" />
            <AppInput label="Email address" value={draft.emailAddress} onChangeText={(value) => edit('emailAddress', value)} maxLength={200} editable={!disabled} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <AppInput label="Phone number (optional)" value={draft.phoneNumber} onChangeText={(value) => edit('phoneNumber', value)} maxLength={100} editable={!disabled} keyboardType="phone-pad" />
          </AppPanel>
          <AppPanel title="Birth Details">
            <ThemedText type="small" themeColor="textSecondary">Review the details already saved to your account. Fill in anything missing.</ThemedText>
            <AppInput label="Birth date (YYYY-MM-DD)" placeholder="1980-06-15" value={draft.dateOfBirth} onChangeText={(value) => edit('dateOfBirth', value)} maxLength={10} editable={!disabled} autoCorrect={false} />
            <AppSelect label="Do you know your birth time?" value={draft.timeOfBirthKnown} options={yesNo} onChange={(value) => edit('timeOfBirthKnown', value)} disabled={disabled} />
            <AppInput label="Birth time (24-hour HH:mm)" placeholder="14:30" value={draft.timeOfBirth} onChangeText={(value) => edit('timeOfBirth', value)} maxLength={16} editable={!disabled} autoCorrect={false} />
            <ThemedText type="small" themeColor="textSecondary">If your birth time is unknown, choose No. You can leave the time blank.</ThemedText>
            <AppSelect label="Birth timezone" value={draft.birthTimeZoneId} options={options.timezones} onChange={(value) => edit('birthTimeZoneId', value)} disabled={disabled} />
            <AppSelect label="Gender" value={draft.gender} options={options.genders} onChange={(value) => edit('gender', value)} disabled={disabled} />
            <AppSelect label="Current timezone" value={draft.userTimeZoneId} options={options.timezones} onChange={(value) => edit('userTimeZoneId', value)} disabled={disabled} />
          </AppPanel>
          {(!draft.calculationMethod || !draft.calculatorType || !draft.housesDisplay || !draft.invertNatal || !draft.invertCycles) && (
            <ThemedText type="small">Some calculation preferences were not returned by the server. Open Calculation Preferences below to choose them before saving.</ThemedText>
          )}
          <AppDisclosure title="Calculation Preferences">
            <ThemedText type="small">Existing settings are preserved. If no settings were returned, choose them here before saving.</ThemedText>
            <AppSelect label="Calculation method" value={draft.calculationMethod} options={options.calculationMethods} onChange={(value) => edit('calculationMethod', value)} disabled={disabled} />
            <AppSelect label="Calculator type" value={draft.calculatorType} options={options.calculatorTypes} onChange={(value) => edit('calculatorType', value)} disabled={disabled} />
            <AppSelect label="House display" value={draft.housesDisplay} options={options.houseDisplays} onChange={(value) => edit('housesDisplay', value)} disabled={disabled} />
            <AppSelect label="Invert natal daily/hourly energies for the southern hemisphere" value={draft.invertNatal} options={yesNo} onChange={(value) => edit('invertNatal', value)} disabled={disabled} />
            <AppSelect label="Invert daily/hourly cycles for the southern hemisphere" value={draft.invertCycles} options={yesNo} onChange={(value) => edit('invertCycles', value)} disabled={disabled} />
          </AppDisclosure>
          <View style={styles.toggle}>
            <ThemedText style={styles.toggleLabel}>Receive marketing emails</ThemedText>
            <Switch accessibilityLabel="Receive marketing emails" value={draft.allowMarketingEmails} onValueChange={(value) => edit('allowMarketingEmails', value)} disabled={disabled} />
          </View>
          {dirty && !uncertain && <>
            <AppButton title="Save Changes" onPress={save} loading={saving} disabled={disabled} />
            <AppButton title="Discard Changes" variant="secondary" onPress={discard} disabled={disabled} />
          </>}
        </>
      )}
      {!!message && <ThemedText accessibilityLiveRegion="polite" themeColor={saved ? 'success' : 'text'}>{message}</ThemedText>}
      {signedOut && <AppButton title="Go to Sign In" onPress={() => router.navigate('/')} />}
      {saved && !uncertain && <AppButton title="View My Chart" onPress={() => router.navigate('/')} />}
      {!loading && !signedOut && (uncertain || (!draft && !!message)) &&
        <AppButton title={uncertain ? 'Check Saved Details' : 'Try Again'} variant="secondary" onPress={reload} disabled={saving} />}
      {!signedOut && <AppButton title="Sign Out" variant="secondary" onPress={onSignOut} disabled={loading || saving} />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  toggleLabel: { flex: 1 },
});
