import { useState, type ComponentProps } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { AppField } from '@/components/ui/app-field';
import { ControlHeight, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppInputProps = ComponentProps<typeof TextInput> & { label: string; error?: string };

export function AppInput({ label, error, style, onFocus, onBlur, ...props }: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const theme = useTheme();
  return (
    <AppField label={label} error={error}>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.primary}
        {...props}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        style={[styles.input, props.multiline && styles.multiline, {
          color: theme.text,
          backgroundColor: theme.input,
          borderColor: error ? theme.error : focused ? theme.primary : theme.border,
          opacity: props.editable === false ? 0.65 : 1,
        }, style]}
      />
    </AppField>
  );
}

const styles = StyleSheet.create({
  input: {
    // Let the native single-line control centre its font metrics. Paragraph
    // lineHeight pushes the custom font's baseline down on iOS.
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    textAlignVertical: 'center',
    includeFontPadding: false,
    borderWidth: 1,
    borderRadius: Radius.control,
    minHeight: ControlHeight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  multiline: { lineHeight: Typography.body.lineHeight, textAlignVertical: 'top' },
});
