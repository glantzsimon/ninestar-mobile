// Website sources and mobile adaptations are documented in docs/design-system.md.

import '@/global.css';

import { Platform } from 'react-native';

export const DefaultColorScheme: 'light' | 'dark' = 'dark';

export const Colors = {
  light: {
    text: '#444444',
    background: '#ffffff',
    backgroundElement: '#f9f9f9',
    backgroundSelected: '#e6f0ff',
    textSecondary: '#666666',
    border: '#dddddd',
    primary: '#337ab7',
    primaryPressed: '#286090',
    onPrimary: '#ffffff',
    heading: '#0a4070',
    accent: '#276e93',
    panelHeader: '#f0f8ff',
    input: '#ffffff',
    success: '#155724',
    successBackground: '#d4edda',
    error: '#721c24',
    errorBackground: '#f8d7da',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#f9f9f9',
    background: '#14384a',
    backgroundElement: '#091a22',
    backgroundSelected: '#1e5875',
    textSecondary: '#aeaeae',
    border: '#ffffff',
    primary: '#63a0d4',
    primaryPressed: '#8cb9e0',
    onPrimary: '#0f1215',
    heading: '#e7e7e7',
    accent: '#63a0d4',
    panelHeader: '#0f2c3a',
    input: '#0f1215',
    success: '#bcebc7',
    successBackground: '#153e2b',
    error: '#ffc5c5',
    errorBackground: '#4a2028',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BrandFonts = {
  regular: 'Candara-Regular',
  bold: 'Candara-Bold',
  light: 'Candara-Light',
} as const;

export const Typography = {
  modalTitle: { fontSize: 28, lineHeight: 36, fontFamily: BrandFonts.bold },
  title: { fontSize: 34, lineHeight: 42, fontFamily: BrandFonts.light },
  subtitle: { fontSize: 24, lineHeight: 32, fontFamily: BrandFonts.regular },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontFamily: BrandFonts.bold },
  body: { fontSize: 17, lineHeight: 27, fontFamily: BrandFonts.regular },
  small: { fontSize: 15, lineHeight: 23, fontFamily: BrandFonts.regular },
  label: { fontSize: 16, lineHeight: 24, fontFamily: BrandFonts.bold },
} as const;

export const Radius = { panel: 8, control: 6, pill: 99 } as const;
export const ControlHeight = 48;

// Website tiers are 1/.62/.38 and .62/.38/.24. Keep the hierarchy gentler
// on small screens so secondary artwork remains legible.
export const EnergyInfluenceScale = {
  primary: [1, 0.78, 0.6],
  additional: [0.72, 0.6, 0.5],
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
