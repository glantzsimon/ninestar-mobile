import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { uiCopy } from '@/lib/ui-copy';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>{uiCopy.navigation.explore}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-chart">
        <NativeTabs.Trigger.Label>{uiCopy.navigation.chart}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index" hidden />
      <NativeTabs.Trigger name="predictions" hidden />
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>{uiCopy.navigation.account}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="style-guide" hidden>
        <NativeTabs.Trigger.Label>Style Guide</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
