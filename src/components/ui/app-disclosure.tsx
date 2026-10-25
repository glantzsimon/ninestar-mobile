import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AppDisclosure({ title, subtitle, children, expanded, defaultExpanded = false, onExpandedChange }: PropsWithChildren<{
  title: string; subtitle?: string; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (expanded: boolean) => void;
}>) {
  const [localOpen, setLocalOpen] = useState(defaultExpanded);
  const open = expanded ?? localOpen;
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          if (expanded === undefined) setLocalOpen(!open);
          onExpandedChange?.(!open);
        }}
        style={({ pressed }) => [styles.heading, {
          backgroundColor: pressed ? theme.backgroundSelected : theme.panelHeader,
        }]}>
        <View style={styles.title}>
          <ThemedText type="sectionTitle" accessibilityRole="header">{title}</ThemedText>
          {!!subtitle && <ThemedText type="small" themeColor="textSecondary">{subtitle}</ThemedText>}
        </View>
        <ThemedText accessibilityElementsHidden importantForAccessibility="no">{open ? '−' : '+'}</ThemedText>
      </Pressable>
      <FadeCollapse visible={open}><View style={[styles.content, { backgroundColor: theme.backgroundElement }]}>{children}</View></FadeCollapse>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' },
  heading: {
    minHeight: ControlHeight, flexDirection: 'row', alignItems: 'center',
    padding: Spacing.three, gap: Spacing.two,
  },
  title: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three },
});
