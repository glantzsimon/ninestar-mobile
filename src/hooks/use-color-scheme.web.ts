import { DefaultColorScheme } from '@/constants/theme';

// A shared default also keeps server rendering and browser hydration consistent.
export function useColorScheme(): 'light' | 'dark' {
  return DefaultColorScheme;
}
