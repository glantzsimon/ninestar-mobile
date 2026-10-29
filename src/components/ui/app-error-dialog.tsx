import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { WarningIcon } from '@/components/ui/warning-icon';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { uiCopy } from '@/lib/ui-copy';

// One acknowledgement only: dismissing an error never resubmits a request.
export function AppErrorDialog({ message, onClose }: { message: string; onClose: () => void }) {
  const theme = useTheme();
  return <Modal visible transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={onClose}>
    <SafeAreaView style={[styles.overlay, { backgroundColor: theme.shadow }]}>
      <View accessibilityViewIsModal onAccessibilityEscape={onClose}
        {...(Platform.OS === 'web' ? { role: 'alertdialog' as const, 'aria-modal': true,
          'aria-label': uiCopy.feedback.errorTitle, 'aria-describedby': 'submission-error-message' } : {})}
        style={[styles.dialog, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <View style={styles.heading}>
          <WarningIcon />
          <ThemedText type="sectionTitle" accessibilityRole="header" style={styles.title}>{uiCopy.feedback.errorTitle}</ThemedText>
        </View>
        <ScrollView style={styles.message} contentContainerStyle={styles.messageContent}>
          <ThemedText nativeID="submission-error-message" accessibilityRole="alert" accessibilityLiveRegion="assertive">{message}</ThemedText>
        </ScrollView>
        <AppButton title={uiCopy.close} onPress={onClose} />
      </View>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  dialog: { width: '100%', maxWidth: MaxContentWidth, maxHeight: '85%', borderWidth: 1, borderRadius: Radius.modal,
    padding: Spacing.three, gap: Spacing.three },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1 }, message: { flexGrow: 0, flexShrink: 1 }, messageContent: { flexGrow: 1 },
});
