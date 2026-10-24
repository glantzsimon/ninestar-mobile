import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { artworkEnvironment, artworkStore } from '@/lib/artwork-store';

import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useEffect(() => {
    const refresh = () => { void artworkStore.refresh(artworkEnvironment); };
    refresh();
    const timer = setInterval(refresh, 300000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'Candara-Regular': require('../../assets/fonts/Candara-Regular.ttf'),
    'Candara-Bold': require('../../assets/fonts/Candara-Bold.ttf'),
    'Candara-Light': require('../../assets/fonts/Candara-Light.ttf'),
  });
  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <ThemeProvider value={{ ...base, colors: {
      ...base.colors, primary: colors.primary, background: colors.background,
      card: colors.backgroundElement, text: colors.text, border: colors.border,
    } }}>
      <AppTabs />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
