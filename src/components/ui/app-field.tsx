import { createContext, useContext, useEffect, useRef, type ComponentRef, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useScreenErrorScroll } from '@/components/ui/app-screen';
import { Spacing } from '@/constants/theme';
import { WarningIcon } from '@/components/ui/warning-icon';
import type { FieldErrors } from '@/lib/field-validation';

const AttemptContext = createContext<FieldErrors | null>(null);
export function AppFieldErrors({ errors, children }: PropsWithChildren<{ errors: FieldErrors }>) {
  return <AttemptContext.Provider value={errors}>{children}</AttemptContext.Provider>;
}

export function AppField({ label, error, helper, children }: PropsWithChildren<{ label: string; error?: string; helper?: string }>) {
  const target = useRef<ComponentRef<typeof View>>(null);
  const registerError = useScreenErrorScroll();
  const attempt = useContext(AttemptContext);
  useEffect(() => {
    if (error && target.current) return registerError(target.current);
  }, [error, registerError, attempt]);
  return <View ref={target} collapsable={false} style={styles.field}>
    <ThemedText type="smallBold">{label}</ThemedText>
    {!!error && <View style={styles.error}>
      <WarningIcon size={20} />
      <ThemedText type="small" themeColor="error" accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>{error}</ThemedText>
    </View>}
    {children}
    {!!helper && <ThemedText type="small" themeColor="textSecondary">{helper}</ThemedText>}
  </View>;
}
const styles = StyleSheet.create({ field: { gap: Spacing.one }, error: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two }, message: { flex: 1 } });
