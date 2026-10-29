import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { CompatibilityGauges } from '@/components/compatibility-gauges';
import { CompatibilitySectionContent } from '@/components/compatibility-section-content';
import { PersonalChart } from '@/components/personal-chart';
import { ReadingContent } from '@/components/reading-content';
import { SectionWidgets } from '@/components/section-widgets';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppPanel } from '@/components/ui/app-panel';
import { useScreenMenu, useScreenScroll } from '@/components/ui/app-screen';
import { Spacing } from '@/constants/theme';
import { FeatureArtwork } from '@/constants/feature-artwork';
import { compatibilityMenu, type CompatibilityReading } from '@/lib/compatibility';
import { uiCopy } from '@/lib/ui-copy';

// Direct section navigation: no energy selection/banner or extra modal step.
export function Compatibility({ reading }: { reading: CompatibilityReading }) {
  const [selected, setSelected] = useState('');
  const menu = useRef<ComponentRef<typeof View>>(null);
  const target = useRef<ComponentRef<typeof View>>(null);
  const pending = useRef(false);
  const registerMenu = useScreenMenu(), scrollTo = useScreenScroll();
  const items = compatibilityMenu(reading);
  const active = items.find(item => item.key === selected);
  const heading = (reading.labels.results || reading.strengths.subtitle) && <View style={styles.heading}>
    {!!reading.labels.results && <ThemedText type="title" accessibilityRole="header">{reading.labels.results}</ThemedText>}
    {!!reading.strengths.subtitle && <ThemedText type="subtitle">{reading.strengths.subtitle}</ThemedText>}
  </View>;
  function choose(key: string) {
    if (selected === key) {
      if (target.current) scrollTo(target.current, { topInset: 0, ensureSpace: true });
      return;
    }
    pending.current = true;
    setSelected(key);
  }
  // Older servers have prose but no navigation labels. Retain that working
  // presentation instead of fabricating section names or displaying a blank page.
  if (!items.length) return <>
    {heading}
    {!!reading.overview.length && <AppPanel title={uiCopy.coreSections.energyFacts}><ReadingContent blocks={reading.overview} /></AppPanel>}
    {!!reading.details.length && <AppDisclosure title={uiCopy.readMore}>
      {reading.details.map(section => <CompatibilitySectionContent key={section.key} blocks={section.blocks}
        diagram={section.key === 'fundamental' ? reading.visuals.fundamental : section.key === 'character' ? reading.visuals.character : null}
        breakdown={section.key === 'elements' ? reading.visuals.breakdown : []} />)}
    </AppDisclosure>}
    <AppDisclosure title={reading.labels.firstPerson || uiCopy.compatibility.firstPerson}><PersonalChart chart={reading.first} /></AppDisclosure>
    <AppDisclosure title={reading.labels.secondPerson || uiCopy.compatibility.secondPerson}><PersonalChart chart={reading.second} /></AppDisclosure>
  </>;
  return <View style={styles.content}>
    {heading}
    <View ref={menu} collapsable={false} onLayout={() => { if (menu.current) registerMenu(menu.current); }}>
      <SectionWidgets items={items.map(item => ({ key: item.key, title: item.navigationTitle,
        artworkId: artwork[item.key] }))} selected={selected} onSelect={choose} />
    </View>
    {active && <View key={active.key} ref={target} collapsable={false} style={styles.content} onLayout={() => {
      if (pending.current && target.current) {
        pending.current = false;
        scrollTo(target.current, { topInset: 0, ensureSpace: true });
      }
    }}>
      <AppPanel title={active.title}>
        {active.key === 'overview' ? <>
          <CompatibilityGauges gauges={reading.gauges} />
          <AppDisclosure title={reading.labels.firstPerson || uiCopy.compatibility.firstPerson}><PersonalChart chart={reading.first} /></AppDisclosure>
          <AppDisclosure title={reading.labels.secondPerson || uiCopy.compatibility.secondPerson}><PersonalChart chart={reading.second} /></AppDisclosure>
        </> : <>
            {!!active.subtitle && <ThemedText type="sectionTitle" accessibilityRole="header">{active.subtitle}</ThemedText>}
            <CompatibilitySectionContent blocks={active.blocks} diagram={active.diagram} breakdown={active.breakdown} />
          </>}
      </AppPanel>
    </View>}
  </View>;
}

const styles = StyleSheet.create({ content: { gap: Spacing.three }, heading: { gap: Spacing.two } });
const artwork: Record<string, string> = { overview: 'ui.overview', strengthsAndChallenges: 'ui.relationships-strengths-challenges',
  solarElements: FeatureArtwork.constitution, lunarElements: FeatureArtwork.character, allElements: 'ui.five-elements',
  yinYang: 'ui.yinyang', birthMonth: 'ui.moon', sexualChemistry: 'ui.relationships' };
