import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AppPanel({ title, children }: PropsWithChildren<{ title?: string }>) {
  const theme = useTheme();
  return (
    <View style={[styles.panel, {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      boxShadow: `0 4px 10px ${theme.shadow}`,
    }]}>
      {title && (
        <View style={[styles.header, { backgroundColor: theme.panelHeader, borderColor: theme.border }]}>
          <ThemedText type="smallBold" accessibilityRole="header">{title}</ThemedText>
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' },
  header: { padding: Spacing.three, borderBottomWidth: 1 },
  body: { padding: Spacing.three, gap: Spacing.three },
});
