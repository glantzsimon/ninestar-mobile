import { useEffect, useRef, type ComponentRef, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useScreenScroll } from '@/components/ui/app-screen';
import { Spacing } from '@/constants/theme';

export function AppField({ label, error, children }: PropsWithChildren<{ label: string; error?: string }>) {
  const target = useRef<ComponentRef<typeof View>>(null);
  const scrollTo = useScreenScroll();
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(() => { if (target.current) scrollTo(target.current, { topInset: 0, ensureSpace: true }); });
    return () => cancelAnimationFrame(frame);
  }, [error, scrollTo]);
  return <View ref={target} collapsable={false} style={styles.field}>
    <ThemedText type="smallBold">{label}</ThemedText>
    {!!error && <ThemedText type="small" themeColor="error" accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</ThemedText>}
    {children}
  </View>;
}
const styles = StyleSheet.create({ field: { gap: Spacing.one } });
