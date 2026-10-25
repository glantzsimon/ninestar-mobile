import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ControlHeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AppSwitch({ label, value, onValueChange, disabled = false }: {
  label: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean;
}) {
  const theme = useTheme();
  return <View style={styles.row}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange}
      disabled={disabled} trackColor={{ false: theme.backgroundSelected, true: theme.primary }} />
  </View>;
}

const styles = StyleSheet.create({
  row: { minHeight: ControlHeight, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  label: { flex: 1 },
});
