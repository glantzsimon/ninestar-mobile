import { createContext, useCallback, useContext, useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBackground } from '@/components/ui/app-background';
import { AppMenuNavigation } from '@/components/ui/app-menu-navigation';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { uiCopy } from '@/lib/ui-copy';

type ScrollTarget = ComponentRef<typeof View>;
const ModalScrollContext = createContext<(target: ScrollTarget, options?: { topInset?: number }) => void>(() => {});
export const useModalScroll = () => useContext(ModalScrollContext);
const ModalMenuContext = createContext<(target: ScrollTarget) => void>(() => {});
export const useModalMenu = () => useContext(ModalMenuContext);

// Presentation only: callers own selection/data so chart and calculator can share it.
export function AppModal({ title, onClose, backToTopLabel, children, edgeToEdge = false }: PropsWithChildren<{
  title: string; onClose: () => void; backToTopLabel?: string; edgeToEdge?: boolean;
}>) {
  const theme = useTheme();
  const [scrolledDown, setScrolledDown] = useState(false);
  const [minimumHeight, setMinimumHeight] = useState(0);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const pendingOffset = useRef<number | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const content = useRef<ScrollTarget>(null);
  const menuOffset = useRef(0);
  const currentOffset = useRef(0);
  const registerMenu = useCallback((target: ScrollTarget) => {
    if (!content.current) return;
    target.measureLayout(content.current, (_x, y) => {
      menuOffset.current = Math.max(0, y - Spacing.three);
      setScrolledDown(currentOffset.current > menuOffset.current + Spacing.four);
    }, () => {});
  }, []);
  const scrollTo = useCallback((target: ScrollTarget, options?: { topInset?: number }) => {
    const container = content.current;
    if (!container) return;
    target.measureLayout(container, (_x, y) => {
      const offset = Math.max(0, y - (options?.topInset ?? Spacing.three));
      const requiredHeight = offset + viewportHeight.current;
      pendingOffset.current = offset;
      setMinimumHeight((previous) => Math.max(previous, requiredHeight));
      if (options?.topInset === 0) {
        container.measure((_left, _top, _width, height) => {
          if (pendingOffset.current === offset && height >= requiredHeight) {
            pendingOffset.current = null;
            scroll.current?.scrollTo({ y: offset, animated: true });
          }
        });
        return;
      }
      // Short sections need layout space before native scrollTo can reach them.
      if (contentHeight.current >= requiredHeight) {
        pendingOffset.current = null;
        scroll.current?.scrollTo({ y: offset, animated: true });
      }
    }, () => {});
  }, []);
  return <Modal visible transparent animationType="slide" presentationStyle="overFullScreen"
    onRequestClose={onClose}>
    <SafeAreaProvider>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
      <SafeAreaView style={[styles.surface, { backgroundColor: theme.backgroundElement }]}
        edges={['bottom']} accessibilityViewIsModal onAccessibilityEscape={onClose}>
        <View style={[styles.header, edgeToEdge && styles.fullWidth, { borderColor: theme.primary }]}>
          <ThemedText type="modalTitle" accessibilityRole="header" style={styles.title}>{title}</ThemedText>
          <AppButton title={uiCopy.close} variant="secondary" accessibilityLabel={`${uiCopy.close} ${title}`} onPress={onClose} />
        </View>
        {!!backToTopLabel && <AppMenuNavigation visible={scrolledDown} title={backToTopLabel}
          onPress={() => scroll.current?.scrollTo({ y: menuOffset.current, animated: true })} />}
        <View style={[styles.fill, { backgroundColor: theme.background }]}>
        <AppBackground />
        <ScrollView ref={scroll} style={styles.fill} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"
          onLayout={({ nativeEvent }) => { viewportHeight.current = nativeEvent.layout.height; }}
          onContentSizeChange={(_width, height) => {
            contentHeight.current = height;
            const offset = pendingOffset.current;
            if (offset !== null && height >= offset + viewportHeight.current - 1) {
              pendingOffset.current = null;
              scroll.current?.scrollTo({ y: offset, animated: true });
            }
          }}
          scrollEventThrottle={32}
          onScroll={({ nativeEvent }) => {
            currentOffset.current = nativeEvent.contentOffset.y;
            setScrolledDown(currentOffset.current > menuOffset.current + Spacing.four);
          }}>
          <ModalScrollContext.Provider value={scrollTo}>
            <ModalMenuContext.Provider value={registerMenu}>
            <View ref={content} collapsable={false} style={[styles.content, edgeToEdge && styles.edgeContent,
              { minHeight: minimumHeight }]}>{children}</View>
            </ModalMenuContext.Provider>
          </ModalScrollContext.Provider>
        </ScrollView>
        </View>
      </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}

const styles = StyleSheet.create({
  fullWidth: { maxWidth: '100%' },
  edgeContent: { maxWidth: '100%', padding: 0, gap: 0 },
  fill: { flex: 1 },
  surface: { flex: 1, borderRadius: Radius.modal, overflow: 'hidden' },
  header: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: Spacing.three,
    padding: Spacing.three, borderBottomWidth: 1 },
  title: { flex: 1, minWidth: 0 },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
    padding: Spacing.three, gap: Spacing.three },
});
