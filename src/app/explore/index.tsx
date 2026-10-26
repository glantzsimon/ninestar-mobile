import { useState } from 'react';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { SectionWidgets } from '@/components/section-widgets';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { AppModal } from '@/components/ui/app-modal';
import { exploreFeatures } from '@/lib/explore-features';
import { uiCopy } from '@/lib/ui-copy';

export default function ExploreScreen() {
  const [selected, setSelected] = useState('');
  const feature = exploreFeatures.find((item) => item.key === selected);
  return <AppScreen>
    <ThemedText type="title" accessibilityRole="header">{uiCopy.navigation.explore}</ThemedText>
    <ThemedText>{uiCopy.explore.introduction}</ThemedText>
    {(['readings', 'ask', 'learn'] as const).map((group) => <AppPanel key={group} title={uiCopy.explore[group]}>
      <SectionWidgets selected=""
        items={exploreFeatures.filter((item) => item.group === group).map((item) => ({ ...item,
          fallbackArtwork: require('../../../assets/images/ninestar-mark.png') }))}
        onSelect={(key) => key === 'personalChart' ? router.push('/explore/personal-chart') : setSelected(key)} />
    </AppPanel>)}
    {feature && <AppModal title={feature.title} onClose={() => setSelected('')}>
      <AppPanel><ThemedText>{uiCopy.explore.unavailable}</ThemedText></AppPanel>
    </AppModal>}
  </AppScreen>;
}
