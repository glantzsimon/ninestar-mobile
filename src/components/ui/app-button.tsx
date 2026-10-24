import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { ControlHeight, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function AppButton({ title, variant = 'primary', loading = false, disabled, ...props }: AppButtonProps) {
  const theme = useTheme();
  const primary = variant === 'primary';
  const inactive = disabled || loading;
  const foreground = primary ? theme.onPrimary : theme.primary;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...props.accessibilityState, disabled: !!inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [styles.button, {
        backgroundColor: primary
          ? pressed ? theme.primaryPressed : theme.primary
          : pressed ? theme.backgroundSelected : theme.backgroundElement,
        borderColor: theme.primary,
        opacity: inactive ? 0.55 : 1,
      }]}>
      {loading && <ActivityIndicator size="small" color={foreground} />}
      <Text style={[Typography.label, { color: foreground, textAlign: 'center' }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: ControlHeight,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
