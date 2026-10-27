import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MembershipStatus } from '@/components/membership-status';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppDateTimeField } from '@/components/ui/app-date-time-field';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { AppSelect } from '@/components/ui/app-select';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/hooks/use-session';
import { uiCopy } from '@/lib/ui-copy';
import { FieldValidationError, type FieldErrors } from '@/lib/field-validation';
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
      <AppButton title="Go to Sign In" onPress={() => router.navigate('/my-chart/personal-chart')} />
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    setFieldErrors({});
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
    setFieldErrors({});
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
    catch (error) {
      if (error instanceof FieldValidationError) { setFieldErrors({ [error.field]: error.message }); setMessage(''); }
      else setMessage(error instanceof Error ? error.message : 'Check the fields and try again.');
      return;
    }
    setFieldErrors({});
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
        if (error instanceof MobileApiError && error.code === 'email_unavailable') {
          setFieldErrors({ emailAddress: messageFor(error) }); setMessage('');
        } else setMessage(messageFor(error));
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
    setFieldErrors({});
  }
  return (
    <AppScreen>
      <ThemedText type="title" accessibilityRole="header">{uiCopy.accountTitle}</ThemedText>
      {!!message && <ThemedText accessibilityLiveRegion="polite" themeColor={saved ? 'success' : 'text'}>{message}</ThemedText>}
      {draft && !signedOut && <MembershipStatus refreshOnFocus />}
      {loading && <ActivityIndicator size="large" color={theme.primary} accessibilityLabel="Loading account details" />}
      {draft && options && !loading && (
        <>
          <AppPanel title="Personal Details">
            <AppInput label="First name" value={draft.firstName} error={fieldErrors.firstName} onChangeText={(value) => edit('firstName', value)} maxLength={100} editable={!disabled} autoComplete="given-name" />
            <AppInput label="Last name" value={draft.lastName} error={fieldErrors.lastName} onChangeText={(value) => edit('lastName', value)} maxLength={100} editable={!disabled} autoComplete="family-name" />
            <AppInput label="Email address" value={draft.emailAddress} error={fieldErrors.emailAddress} onChangeText={(value) => edit('emailAddress', value)} maxLength={200} editable={!disabled} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <AppInput label="Phone number (optional)" value={draft.phoneNumber} error={fieldErrors.phoneNumber} onChangeText={(value) => edit('phoneNumber', value)} maxLength={100} editable={!disabled} keyboardType="phone-pad" />
          </AppPanel>
          <AppPanel title="Birth Details">
            <AppDateTimeField label={uiCopy.calculator.dateOfBirth} mode="date" value={draft.dateOfBirth} error={fieldErrors.dateOfBirth} onChange={(value) => edit('dateOfBirth', value)} disabled={disabled} />
            <AppSelect label="Do you know your birth time?" value={draft.timeOfBirthKnown} error={fieldErrors.timeOfBirthKnown} options={yesNo} onChange={(value) => edit('timeOfBirthKnown', value)} disabled={disabled} />
            <AppDateTimeField label={uiCopy.calculator.timeOfBirth} mode="time" value={draft.timeOfBirth} error={fieldErrors.timeOfBirth} onChange={(value) => edit('timeOfBirth', value)} disabled={disabled} allowClear />
            <ThemedText type="small" themeColor="textSecondary">If your birth time is unknown, choose No. You can leave the time blank.</ThemedText>
            <AppSelect label="Birth timezone" value={draft.birthTimeZoneId} error={fieldErrors.birthTimeZoneId} options={options.timezones} onChange={(value) => edit('birthTimeZoneId', value)} disabled={disabled} />
            <AppSelect label="Gender" value={draft.gender} error={fieldErrors.gender} options={options.genders} onChange={(value) => edit('gender', value)} disabled={disabled} />
            <AppSelect label="Current timezone" value={draft.userTimeZoneId} error={fieldErrors.userTimeZoneId} options={options.timezones} onChange={(value) => edit('userTimeZoneId', value)} disabled={disabled} />
          </AppPanel>
          {(!draft.calculationMethod || !draft.housesDisplay || !draft.invertNatal || !draft.invertCycles) && (
            <ThemedText type="small">{uiCopy.calculator.missingPreferences}</ThemedText>
          )}
          <AppPanel title={uiCopy.calculator.preferences}>
            <AppSelect label="Calculation method" value={draft.calculationMethod} error={fieldErrors.calculationMethod} options={options.calculationMethods} onChange={(value) => edit('calculationMethod', value)} disabled={disabled} />
            <AppSelect label="House display" value={draft.housesDisplay} error={fieldErrors.housesDisplay} options={options.houseDisplays} onChange={(value) => edit('housesDisplay', value)} disabled={disabled} />
            <AppSelect label="Invert natal daily/hourly energies for the southern hemisphere" value={draft.invertNatal} error={fieldErrors.invertNatal} options={yesNo} onChange={(value) => edit('invertNatal', value)} disabled={disabled} />
            <AppSelect label="Invert daily/hourly cycles for the southern hemisphere" value={draft.invertCycles} error={fieldErrors.invertCycles} options={yesNo} onChange={(value) => edit('invertCycles', value)} disabled={disabled} />
          </AppPanel>
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
      {signedOut && <AppButton title="Go to Sign In" onPress={() => router.navigate('/my-chart/personal-chart')} />}
      {saved && !uncertain && <AppButton title="View My Chart" onPress={() => router.navigate('/my-chart/personal-chart')} />}
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
