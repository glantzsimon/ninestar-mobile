import { type ComponentRef, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Spacing } from '@/constants/theme';
import { AppSwitch } from '@/components/ui/app-switch';
import { uiCopy } from '@/lib/ui-copy';

const labels = uiCopy.login;

export function AccountLogin({ busy, onSubmit }: {
  busy: boolean;
  onSubmit: (username: string, password: string, rememberMe: boolean) => Promise<void>;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  async function submit() {
    if (busy || !username.trim() || !password) return;
    try {
      await onSubmit(username, password, rememberMe);
    } finally {
      setPassword('');
    }
  }

  return (
    <View style={styles.form}>
      <AppInput
        label={labels.username}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        {...(Platform.OS === 'ios' ? { textContentType: 'username' as const } : { autoComplete: 'username' as const })}
        importantForAutofill="yes"
        maxLength={200}
        editable={!busy}
        returnKeyType="next"
        onSubmitEditing={() => passwordInput.current?.focus()}
      />
      <AppInput
        ref={passwordInput}
        label={labels.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        {...(Platform.OS === 'ios' ? { textContentType: 'password' as const } : { autoComplete: 'current-password' as const })}
        importantForAutofill="yes"
        maxLength={1000}
        editable={!busy}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <AppSwitch label={labels.staySignedIn} value={rememberMe} onValueChange={setRememberMe} disabled={busy} />
      <AppButton title={labels.submit} onPress={submit} loading={busy} disabled={!username.trim() || !password} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
});
