import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NativeDateTimePicker from '@expo/ui/community/datetime-picker';
import { AppField } from '@/components/ui/app-field';
import { AppButton } from '@/components/ui/app-button';
import { ThemedText } from '@/components/themed-text';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { pickerDate, pickerValue } from '@/lib/date-time-input';
import { uiCopy } from '@/lib/ui-copy';
import type { AppDateTimeFieldProps } from './app-date-time-field.types';

export function AppDateTimeField({ label, mode, value, onChange, disabled = false, error, allowClear = false }: AppDateTimeFieldProps) {
  useUiLabels();
  const theme = useTheme();
  const scheme = useColorScheme();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(() => pickerDate(value, mode));
  const copy = uiCopy.dateTime;
  const date = pickerDate(value, mode);
  const text = value ? (mode === 'date' && pickerValue(date, mode) === value ? date.toLocaleDateString() : mode === 'time' ? value.slice(0, 5) : value)
    : mode === 'date' ? copy.chooseDate : copy.chooseTime;
  const picker = <NativeDateTimePicker value={pending} mode={mode} display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    presentation="dialog" accentColor={theme.primary} themeVariant={scheme} disabled={disabled}
    minimumDate={mode === 'date' ? new Date(1800, 0, 1) : undefined}
    maximumDate={mode === 'date' ? new Date(2200, 11, 31, 23, 59) : undefined}
    onDismiss={() => setOpen(false)}
    onValueChange={(_event, date) => {
      if (disabled) return;
      if (Platform.OS === 'android') { setOpen(false); onChange(pickerValue(date, mode)); }
      else setPending(date);
    }} />;
  return <AppField label={label} error={error}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${text}`} accessibilityHint={error}
      accessibilityState={{ disabled, expanded: open }} disabled={disabled}
      onPress={() => { setPending(pickerDate(value, mode)); setOpen(true); }}
      style={[styles.control, { backgroundColor: theme.input, borderColor: error ? theme.error : theme.border, opacity: disabled ? 0.65 : 1 }]}>
      <ThemedText themeColor={value ? 'text' : 'textSecondary'}>{text}</ThemedText>
    </Pressable>
    {allowClear && !!value && <AppButton title={copy.clear} accessibilityLabel={`${copy.clear} ${label}`} variant="secondary"
      disabled={disabled} onPress={() => onChange('')} />}
    {open && Platform.OS === 'android' && picker}
    {Platform.OS === 'ios' && <Modal visible={open} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: theme.shadow }]}>
        <View accessibilityViewIsModal onAccessibilityEscape={() => setOpen(false)}
          style={[styles.sheet, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText type="sectionTitle" accessibilityRole="header">{label}</ThemedText>
          {open && picker}
          <View style={styles.actions}>
            <AppButton title={copy.cancel} variant="secondary" onPress={() => setOpen(false)} />
            <AppButton title={copy.done} disabled={disabled} onPress={() => { onChange(pickerValue(pending, mode)); setOpen(false); }} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>}
  </AppField>;
}

const styles = StyleSheet.create({
  control: { minHeight: ControlHeight, justifyContent: 'center', paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two, borderWidth: 1, borderRadius: Radius.control },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: Spacing.three },
  sheet: { borderWidth: 1, borderRadius: Radius.modal, padding: Spacing.three, gap: Spacing.three },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
});
