import { createContext, useCallback, useContext, useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBackground } from '@/components/ui/app-background';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { uiCopy } from '@/lib/ui-copy';

type ScrollTarget = ComponentRef<typeof View>;
const ModalScrollContext = createContext<(target: ScrollTarget) => void>(() => {});
export const useModalScroll = () => useContext(ModalScrollContext);
const ModalMenuContext = createContext<(target: ScrollTarget) => void>(() => {});
export const useModalMenu = () => useContext(ModalMenuContext);

// Presentation only: callers own selection/data so chart and calculator can share it.
export function AppModal({ title, onClose, backToTopLabel, children }: PropsWithChildren<{
  title: string; onClose: () => void; backToTopLabel?: string;
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
  const scrollTo = useCallback((target: ScrollTarget) => {
    if (!content.current) return;
    target.measureLayout(content.current, (_x, y) => {
      const offset = Math.max(0, y - Spacing.three);
      const requiredHeight = offset + viewportHeight.current;
      pendingOffset.current = offset;
      setMinimumHeight((previous) => Math.max(previous, requiredHeight));
      // Short sections need layout space before native scrollTo can reach them.
      if (contentHeight.current >= requiredHeight) {
        pendingOffset.current = null;
        scroll.current?.scrollTo({ y: offset, animated: true });
      }
    }, () => {});
  }, []);
  return <Modal visible animationType="slide" presentationStyle="pageSheet"
    allowSwipeDismissal onRequestClose={onClose}>
    <SafeAreaProvider>
      <SafeAreaView style={[styles.fill, { backgroundColor: theme.backgroundElement }]}
        edges={['top', 'bottom', 'left', 'right']} accessibilityViewIsModal onAccessibilityEscape={onClose}>
        <View style={[styles.header, { borderColor: theme.primary }]}>
          <ThemedText type="modalTitle" accessibilityRole="header" style={styles.title}>{title}</ThemedText>
          <AppButton title={uiCopy.close} variant="secondary" accessibilityLabel={`${uiCopy.close} ${title}`} onPress={onClose} />
        </View>
        {!!backToTopLabel && <FadeCollapse visible={scrolledDown}><View style={styles.navigation}>
          <AppButton title={`↑ ${backToTopLabel}`} variant="secondary"
            accessibilityHint={uiCopy.menuHint}
            onPress={() => scroll.current?.scrollTo({ y: menuOffset.current, animated: true })} />
        </View></FadeCollapse>}
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
            <View ref={content} collapsable={false} style={[styles.content, { minHeight: minimumHeight }]}>{children}</View>
            </ModalMenuContext.Provider>
          </ModalScrollContext.Provider>
        </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: Spacing.three,
    padding: Spacing.three, borderBottomWidth: 1 },
  title: { flex: 1, minWidth: 0 },
  navigation: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
    padding: Spacing.three, gap: Spacing.three },
});
