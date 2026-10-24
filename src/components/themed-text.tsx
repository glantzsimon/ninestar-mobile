import { StyleSheet, Text, type TextProps } from 'react-native';

import { BrandFonts, Fonts, ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'modalTitle' | 'small' | 'smallBold' | 'subtitle' | 'sectionTitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  const defaultColor = type === 'title' || type === 'modalTitle' || type === 'subtitle' || type === 'sectionTitle' ? 'heading'
    : type === 'linkPrimary' ? 'primary' : 'text';
  return <Text style={[{ color: theme[themeColor ?? defaultColor] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  modalTitle: { ...Typography.modalTitle },
  sectionTitle: { ...Typography.sectionTitle },
  small: {
    ...Typography.small,
  },
  smallBold: {
    ...Typography.small,
    fontFamily: BrandFonts.bold,
  },
  default: {
    ...Typography.body,
  },
  title: {
    ...Typography.title,
  },
  subtitle: {
    ...Typography.subtitle,
  },
  link: {
    ...Typography.small,
  },
  linkPrimary: {
    ...Typography.small,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 19,
  },
});
