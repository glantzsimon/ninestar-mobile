import { createContext, useCallback, useContext, useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, LayoutSpacing, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppBackground } from '@/components/ui/app-background';
import { AppMenuNavigation } from '@/components/ui/app-menu-navigation';

export type ScreenScrollTarget = ComponentRef<typeof View>;
const ScreenScrollContext = createContext<(target: ScreenScrollTarget, options?: { topInset?: number; ensureSpace?: boolean }) => void>(() => {});
export const useScreenScroll = () => useContext(ScreenScrollContext);
const ScreenMenuContext = createContext<(target: ScreenScrollTarget) => void>(() => {});
export const useScreenMenu = () => useContext(ScreenMenuContext);

// Mount an updated form/section before measuring and revealing its actual top.
export function AppScrollTarget({ children, scrollOnMount = false }: PropsWithChildren<{ scrollOnMount?: boolean }>) {
  const scrollTo = useScreenScroll();
  const target = useRef<ScreenScrollTarget>(null);
  const pending = useRef(scrollOnMount);
  return <View ref={target} collapsable={false} style={styles.target} onLayout={() => {
    if (pending.current && target.current) {
      pending.current = false;
      scrollTo(target.current, { topInset: 0, ensureSpace: true });
    }
  }}>{children}</View>;
}

export function AppScreen({ children, backToTopLabel }: PropsWithChildren<{ backToTopLabel?: string }>) {
  const theme = useTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const content = useRef<ScreenScrollTarget>(null);
  const viewportHeight = useRef(0);
  const pendingOffset = useRef<number | null>(null);
  const [minimumHeight, setMinimumHeight] = useState(0);
  const [scrolledDown, setScrolledDown] = useState(false);
  const menuOffset = useRef(0);
  const currentOffset = useRef(0);
  const registerMenu = useCallback((target: ScreenScrollTarget) => {
    if (!content.current) return;
    target.measureLayout(content.current, (_x, y) => {
      menuOffset.current = Math.max(0, y - Spacing.three);
      setScrolledDown(currentOffset.current > menuOffset.current + Spacing.four);
    }, () => {});
  }, []);
  const scrollToView = useCallback((target: ScreenScrollTarget, options?: { topInset?: number; ensureSpace?: boolean }) => {
    const container = content.current;
    if (!container) return;
    target.measureLayout(container, (_x, y) => {
      const offset = Math.max(0, y - (options?.topInset ?? Spacing.three));
      if (options?.ensureSpace) {
        const requiredHeight = offset + viewportHeight.current;
        pendingOffset.current = offset;
        setMinimumHeight(previous => Math.max(previous, requiredHeight));
        // Measure the current native layout: cached height may belong to the
        // previously selected, longer reading. Otherwise wait for content layout.
        container.measure((_left, _top, _width, height) => {
          if (pendingOffset.current === offset && height >= requiredHeight) {
            pendingOffset.current = null;
            scroll.current?.scrollTo({ y: offset, animated: true });
          }
        });
        return;
      }
      scroll.current?.scrollTo({ y: offset, animated: true });
    }, () => {});
  }, []);
  return (
    <SafeAreaView collapsable={false} style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <AppBackground />
      <KeyboardAvoidingView collapsable={false} style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {!!backToTopLabel && <AppMenuNavigation visible={scrolledDown} title={backToTopLabel}
          onPress={() => scroll.current?.scrollTo({ y: menuOffset.current, animated: true })} />}
        <ScrollView
          ref={scroll}
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
          scrollEventThrottle={32}
          onScroll={backToTopLabel ? ({ nativeEvent }) => {
            currentOffset.current = nativeEvent.contentOffset.y;
            setScrolledDown(currentOffset.current > menuOffset.current + Spacing.four);
          } : undefined}
          onLayout={({ nativeEvent }) => { viewportHeight.current = nativeEvent.layout.height; }}
          onContentSizeChange={(_width, height) => {
            const offset = pendingOffset.current;
            if (offset !== null && height >= offset + viewportHeight.current - 1) {
              pendingOffset.current = null;
              scroll.current?.scrollTo({ y: offset, animated: true });
            }
          }}
          contentContainerStyle={styles.scrollContent}>
          <ScreenScrollContext.Provider value={scrollToView}>
            <ScreenMenuContext.Provider value={registerMenu}>
            <View ref={content} collapsable={false} style={[styles.content, minimumHeight > 0 && { minHeight: minimumHeight }]}>{children}</View>
            </ScreenMenuContext.Provider>
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
  target: { gap: Spacing.four },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'web' ? Spacing.six + Spacing.five : Spacing.four,
    paddingBottom: BottomTabInset + LayoutSpacing.bottomClearance,
    gap: Spacing.four,
  },
});
