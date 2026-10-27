import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { useTheme } from '@/hooks/use-theme';

// Shared presentation for boxed loading states; callers supply translated copy.
export function AppLoadingPanel({ message }: { message: string }) {
  const theme = useTheme();
  return <AppPanel>
    <ActivityIndicator color={theme.primary} size="large" accessibilityLabel={message} />
    <ThemedText type="small" themeColor="textSecondary" style={styles.message}
      accessibilityLiveRegion="polite">{message}</ThemedText>
  </AppPanel>;
}

const styles = StyleSheet.create({ message: { textAlign: 'center' } });
