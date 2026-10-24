import { createContext, useCallback, useContext, useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScrollTarget = ComponentRef<typeof View>;
const ModalScrollContext = createContext<(target: ScrollTarget) => void>(() => {});
export const useModalScroll = () => useContext(ModalScrollContext);

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
          <AppButton title="Close" variant="secondary" accessibilityLabel={`Close ${title}`} onPress={onClose} />
        </View>
        {!!backToTopLabel && <FadeCollapse visible={scrolledDown}><View style={styles.navigation}>
          <AppButton title={`↑ ${backToTopLabel}`} variant="secondary"
            accessibilityHint="Scrolls to the section buttons without closing the details"
            onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })} />
        </View></FadeCollapse>}
        <ScrollView ref={scroll} style={[styles.fill, { backgroundColor: theme.background }]} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"
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
          onScroll={({ nativeEvent }) => setScrolledDown(nativeEvent.contentOffset.y > Spacing.four)}>
          <ModalScrollContext.Provider value={scrollTo}>
            <View ref={content} collapsable={false} style={[styles.content, { minHeight: minimumHeight }]}>{children}</View>
          </ModalScrollContext.Provider>
        </ScrollView>
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
