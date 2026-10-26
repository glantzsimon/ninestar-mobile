import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ControlHeight, MaxContentWidth, Spacing } from '@/constants/theme';
import { uiCopy } from '@/lib/ui-copy';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>{uiCopy.navigation.explore}</TabButton>
          </TabTrigger>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>{uiCopy.navigation.chart}</TabButton>
          </TabTrigger>
          <TabTrigger name="predictions" href="/predictions" asChild>
            <TabButton>{uiCopy.navigation.predictions}</TabButton>
          </TabTrigger>
          <TabTrigger name="account" href="/account" asChild>
            <TabButton>{uiCopy.navigation.account}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

// Use the installed Pressable's ref type; Router's slot still declares the older View ref.
type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> &
  Pick<ComponentProps<typeof Pressable>, 'ref'>;

export function TabButton({ children, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" style={{ textAlign: 'center' }} themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}

      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  tabButton: { flex: 1, minWidth: 0 },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minHeight: ControlHeight,
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
  },
});
