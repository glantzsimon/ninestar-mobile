import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ControlHeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type Option } from '@/lib/account';

export function AppSelect({ label, value, options, onChange, disabled = false }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled?: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((item) => item.value === value);
  const filtered = options.filter((item) => `${item.label} ${item.value}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? (value || 'Choose')}`}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => { setSearch(''); setOpen(true); }}
        style={[styles.choice, { backgroundColor: theme.input, borderColor: theme.border, opacity: disabled ? 0.6 : 1 }]}>
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
          <AppButton title="Cancel" variant="secondary" onPress={() => setOpen(false)} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  choice: {
    minHeight: ControlHeight, borderWidth: 1, borderRadius: Radius.control,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, justifyContent: 'center',
  },
  modal: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  option: { minHeight: ControlHeight, padding: Spacing.three, justifyContent: 'center' },
});
