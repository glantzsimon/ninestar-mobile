import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppField } from '@/components/ui/app-field';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type Option } from '@/lib/account';
import { useUiLabels } from '@/hooks/use-ui-labels';

export function AppSelect({ label, value, options, onChange, disabled = false, error, helper }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled?: boolean; error?: string; helper?: string;
}) {
  const labels = useUiLabels();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((item) => item.value === value);
  const filtered = options.filter((item) => `${item.label} ${item.value}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <AppField label={label} error={error} helper={helper}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={error}
        accessibilityLabel={`${label}: ${selected?.label ?? (value || 'Choose')}`}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => { setSearch(''); setOpen(true); }}
        style={[styles.choice, { backgroundColor: theme.input, borderColor: error ? theme.error : theme.border, opacity: disabled ? 0.6 : 1 }]}>
        <ThemedText>{selected?.label ?? (value || 'Choose…')}</ThemedText>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle" accessibilityRole="header">{label}</ThemedText>
          {options.length > 8 && <AppInput label="Search" value={search} onChangeText={setSearch} autoCorrect={false} autoCapitalize="none" />}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<ThemedText>No matches. Try another search.</ThemedText>}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: value === item.value }}
                onPress={() => { onChange(item.value); setOpen(false); }}
                style={[styles.option, { backgroundColor: value === item.value ? theme.backgroundSelected : theme.background }]}>
                <ThemedText>{item.label}{value === item.value ? ' ✓' : ''}</ThemedText>
              </Pressable>
            )}
          />
          <AppButton title={labels.shared.actions.cancel} variant="secondary" onPress={() => setOpen(false)} />
        </SafeAreaView>
      </Modal>
    </AppField>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: ControlHeight, borderWidth: 1, borderRadius: Radius.control,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, justifyContent: 'center',
  },
  modal: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  option: { minHeight: ControlHeight, padding: Spacing.three, justifyContent: 'center' },
});
