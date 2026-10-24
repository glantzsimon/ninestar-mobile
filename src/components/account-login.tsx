import { type ComponentRef, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Spacing } from '@/constants/theme';

const labels = {
  username: 'Username or email',
  password: 'Password',
  submit: 'Sign in',
};

export function AccountLogin({ busy, onSubmit }: {
  busy: boolean;
  onSubmit: (username: string, password: string) => Promise<void>;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  async function submit() {
    if (busy || !username.trim() || !password) return;
    try {
      await onSubmit(username, password);
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
        autoComplete="username"
        textContentType="username"
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
        autoComplete="current-password"
        textContentType="password"
        maxLength={1000}
        editable={!busy}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <AppButton title={labels.submit} onPress={submit} loading={busy} disabled={!username.trim() || !password} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
});
