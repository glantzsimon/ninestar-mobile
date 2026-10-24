import { createContext, useCallback, useContext, useRef, type ComponentRef, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenScrollTarget = ComponentRef<typeof View>;
const ScreenScrollContext = createContext<(target: ScreenScrollTarget) => void>(() => {});
export const useScreenScroll = () => useContext(ScreenScrollContext);

export function AppScreen({ children }: PropsWithChildren) {
  const theme = useTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const content = useRef<ScreenScrollTarget>(null);
  const scrollToView = useCallback((target: ScreenScrollTarget) => {
    const container = content.current;
    if (!container) return;
    target.measureLayout(container, (_x, y) => {
      scroll.current?.scrollTo({ y: Math.max(0, y - Spacing.three), animated: true });
    }, () => {});
  }, []);
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scroll}
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}>
          <ScreenScrollContext.Provider value={scrollToView}>
            <View ref={content} collapsable={false} style={styles.content}>{children}</View>
          </ScreenScrollContext.Provider>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
    padding: Spacing.four,
    paddingTop: Platform.OS === 'web' ? Spacing.six + Spacing.five : Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
});
