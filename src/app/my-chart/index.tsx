import { router } from 'expo-router';
import { SectionWidgets } from '@/components/section-widgets';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { uiCopy } from '@/lib/ui-copy';
import { FeatureArtwork } from '@/constants/feature-artwork';

const destinations = {
  personalChart: '/my-chart/personal-chart', cycles: '/my-chart/cycles', calendar: '/my-chart/calendar',
} as const;

export default function MyChartHub() {
  return <AppScreen>
    <ThemedText type="title" accessibilityRole="header">{uiCopy.myChart.title}</ThemedText>
    <AppPanel>
      <SectionWidgets selected="" items={[
        { key: 'personalChart', title: uiCopy.myChart.personalChart, artworkId: FeatureArtwork.personalChart },
        { key: 'cycles', title: uiCopy.predictions.ownTitle, artworkId: FeatureArtwork.predictions },
        { key: 'calendar', title: uiCopy.myChart.calendar, artworkId: FeatureArtwork.calendar },
      ].map(item => ({ ...item, fallbackArtwork: require('../../../assets/images/ninestar-mark.png') }))}
        onSelect={key => router.push(destinations[key as keyof typeof destinations])} />
    </AppPanel>
  </AppScreen>;
}
