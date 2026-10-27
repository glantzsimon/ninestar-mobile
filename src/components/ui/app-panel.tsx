import { type PropsWithChildren } from 'react';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { EnterFade } from '@/components/ui/fade-view';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const actionIcons = {
  fullText: require('../../../assets/images/ui/view-full-text.svg'),
  summary: require('../../../assets/images/ui/view-summary.svg'),
};

export function AppPanel({ title, headerAction, children, flush = false, joined = false }: PropsWithChildren<{
  title?: string;
  flush?: boolean; joined?: boolean;
  headerAction?: { title: string; onPress: () => void; expanded?: boolean; icon?: keyof typeof actionIcons };
}>) {
  const theme = useTheme();
  return (
    <Animated.View entering={EnterFade} style={[styles.panel, {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      boxShadow: flush ? 'none' : `0 4px 10px ${theme.shadow}`,
    }, flush && styles.flush, joined && styles.joined]}>
      {title && (
        <View style={[styles.header, { backgroundColor: theme.panelHeader, borderColor: theme.border }]}>
          <ThemedText type="sectionTitle" accessibilityRole="header" style={styles.title}>{title}</ThemedText>
          {headerAction && <Pressable accessibilityRole="button"
            accessibilityLabel={headerAction.title}
            accessibilityState={{ expanded: headerAction.expanded }} onPress={headerAction.onPress}
            style={({ pressed }) => [styles.action, {
              borderColor: theme.primary, backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            }]}>
            {headerAction.icon && <Image source={actionIcons[headerAction.icon]} tintColor={theme.primary}
              style={styles.actionIcon} contentFit="contain" accessible={false} />}
            <ThemedText type="smallBold" themeColor="primary">{headerAction.title}</ThemedText>
          </Pressable>}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flush: { borderRadius: 0 }, joined: { borderTopWidth: 0 },
  panel: { borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' },
  header: { padding: Spacing.three, borderBottomWidth: 1, flexDirection: 'row',
    flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
  title: { flexGrow: 1, flexShrink: 1 },
  actionIcon: { width: 20, height: 20 },
  action: { minHeight: ControlHeight, flexDirection: 'row', gap: Spacing.one, justifyContent: 'center', alignItems: 'center',
    marginLeft: 'auto', paddingHorizontal: Spacing.two, paddingVertical: Spacing.one,
    borderWidth: 1, borderRadius: Radius.control },
  body: { padding: Spacing.three, gap: Spacing.three },
});
