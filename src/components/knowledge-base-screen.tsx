import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ArtworkDiagram } from '@/components/artwork-diagram';
import { ReadingContent } from '@/components/reading-content';
import { SectionWidgets } from '@/components/section-widgets';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { ContextualHelp } from '@/components/contextual-help';
import { AppModal } from '@/components/ui/app-modal';
import { AppPanel } from '@/components/ui/app-panel';
import { AppLoadingPanel } from '@/components/ui/app-loading-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { useKnowledgeBase } from '@/components/knowledge-base-provider';
import type { KnowledgeReading } from '@/lib/knowledge-base';
import { uiCopy } from '@/lib/ui-copy';

export function KnowledgeBaseScreen() {
  const { sections, loading, failed } = useKnowledgeBase();
  const [selected, setSelected] = useState('');
  const article = sections.find(item => item.key === selected);
  return <AppScreen>
    <AppButton title={uiCopy.calculator.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    <ThemedText type="title" accessibilityRole="header">{uiCopy.explore.knowledge}</ThemedText>
    {loading || failed ? <KnowledgeStatus /> : <KnowledgeButtons items={sections} onSelect={key => {
      const item = sections.find(section => section.key === key);
      if (item?.isGroup) router.push({ pathname: '/explore/knowledge-base/[section]', params: { section: key } });
      else setSelected(key);
    }} />}
    {article && <KnowledgeDetail reading={article} onClose={() => setSelected('')} />}
  </AppScreen>;
}

export function KnowledgeGroupScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { sections, loading, failed } = useKnowledgeBase();
  const group = sections.find(item => item.key === section && item.isGroup);
  return <AppScreen>
    <AppButton title={uiCopy.knowledge.back} variant="secondary"
      onPress={() => router.navigate('/explore/knowledge-base')} />
    {loading || failed ? <KnowledgeStatus /> : group ? <KnowledgeGroup key={group.key} group={group} />
      : <AppPanel><ThemedText>{uiCopy.knowledge.unavailable}</ThemedText></AppPanel>}
  </AppScreen>;
}

function KnowledgeGroup({ group }: { group: KnowledgeReading }) {
  const [selected, setSelected] = useState('');
  const reading = group.children.find(item => item.key === selected);
  return <>
    <ThemedText type="title" accessibilityRole="header">{group.title}</ThemedText>
    {group.introduction && <ContextualHelp help={group.introduction} />}
    {group.inline?.map(item => <KnowledgeArticle key={item.key} reading={item} titled />)}
    {group.key === 'modalities' ? <AppPanel>
      <KnowledgeButtons items={group.children} onSelect={setSelected} />
    </AppPanel> : <KnowledgeButtons items={group.children} onSelect={setSelected} />}
    {reading && <KnowledgeDetail reading={reading} onClose={() => setSelected('')} />}
  </>;
}

function KnowledgeButtons({ items, onSelect }: { items: KnowledgeReading[]; onSelect: (key: string) => void }) {
  return <SectionWidgets selected="" items={items.map(item => ({ ...item,
    fallbackArtwork: require('../../assets/images/ninestar-mark.png') }))} onSelect={onSelect} />;
}

function KnowledgeArticle({ reading, titled = false }: { reading: KnowledgeReading; titled?: boolean }) {
  return <AppPanel title={titled ? reading.title : undefined}>
    {reading.key !== 'origins' && reading.artworkId && <ArtworkDiagram artworkId={reading.artworkId} />}
    <ReadingContent blocks={reading.blocks} />
  </AppPanel>;
}

function KnowledgeDetail({ reading, onClose }: { reading: KnowledgeReading; onClose: () => void }) {
  return <AppModal title={reading.title} onClose={onClose}><KnowledgeArticle reading={reading} /></AppModal>;
}

function KnowledgeStatus() {
  const { loading, retry } = useKnowledgeBase();
  return loading ? <AppLoadingPanel message={uiCopy.knowledge.loading} />
    : <AppPanel><ThemedText>{uiCopy.knowledge.unavailable}</ThemedText>
      <AppButton title={uiCopy.calculator.retry} onPress={retry} /></AppPanel>;
}
