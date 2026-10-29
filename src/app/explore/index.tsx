import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { ThemedText } from '@/components/themed-text';
import { SectionWidgets } from '@/components/section-widgets';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { AppModal } from '@/components/ui/app-modal';
import { exploreFeatures } from '@/lib/explore-features';
import { uiCopy } from '@/lib/ui-copy';
import { API_BASE_URL } from '@/lib/mobile-api';
import { websiteLinks } from '@/lib/website-links';
import { useSubmissionError } from '@/hooks/use-submission-error';

export default function ExploreScreen() {
  useUiLabels();
  const errorDialog = useSubmissionError();
  const [selected, setSelected] = useState('');
  const feature = exploreFeatures.find((item) => item.key === selected);
  return <AppScreen>
    {errorDialog.dialog}
    <ThemedText type="title" accessibilityRole="header">{uiCopy.navigation.explore}</ThemedText>
    <ThemedText>{uiCopy.explore.introduction}</ThemedText>
    {(['readings', 'ask', 'learn'] as const).map((group) => <AppPanel key={group} title={uiCopy.explore[group]}>
      <SectionWidgets selected=""
        items={exploreFeatures.filter((item) => item.group === group).map((item) => ({ ...item,
          fallbackArtwork: require('../../../assets/images/ninestar-mark.png') }))}
        onSelect={(key) => key === 'personalChart' ? router.push('/explore/personal-chart')
          : key === 'predictions' ? router.push('/explore/predictions')
          : key === 'compatibility' ? router.push('/explore/compatibility')
          : key === 'iching' ? router.push('/explore/iching')
          : key === 'knowledge' ? router.push('/explore/knowledge-base')
          : key === 'ai' ? void Linking.openURL(websiteLinks(API_BASE_URL).aiAstrologer)
            .catch(() => errorDialog.showError(uiCopy.externalLinkError))
          : key === 'articles' ? void Linking.openURL(websiteLinks(API_BASE_URL).articles)
            .catch(() => errorDialog.showError(uiCopy.externalLinkError)) : setSelected(key)} />
    </AppPanel>)}
    {feature && <AppModal title={feature.title} onClose={() => setSelected('')}>
      <AppPanel><ThemedText>{uiCopy.explore.unavailable}</ThemedText></AppPanel>
    </AppModal>}
  </AppScreen>;
}
