import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartReading } from '@/components/chart-reading';
import { EnergyFacts } from '@/components/energy-facts';
import { SectionWidgets } from '@/components/section-widgets';
import { AppPanel } from '@/components/ui/app-panel';
import { useModalScroll, useModalMenu } from '@/components/ui/app-modal';
import { Spacing } from '@/constants/theme';
import type { ChartDetail } from '@/lib/chart-sections';
import { coreMenu, coreReading } from '@/lib/core-menu';
import { ContextualHelp } from '@/components/contextual-help';
import { ChartHealth } from '@/components/chart-health';
import { EnergyBanner } from '@/components/energy-banner';
import { uiCopy } from '@/lib/ui-copy';

export function ChartDetails({ detail }: { detail: ChartDetail }) {
  return detail.key === 'core' ? <CoreDetails detail={detail} /> : <OtherDetails detail={detail} />;
}

function CoreDetails({ detail }: { detail: ChartDetail }) {
  const registerMenu = useModalMenu();
  const menu = useRef<ComponentRef<typeof View>>(null);
  const [selected, setSelected] = useState('');
  const scrollTo = useModalScroll();
  const target = useRef<ComponentRef<typeof View>>(null);
  const pending = useRef(false);
  const items = coreMenu(detail);
  const selectedTitle = items.find((item) => item.key === selected)?.title ?? '';
  function choose(key: string) {
    if (selected === key) {
      if (target.current) scrollTo(target.current);
      return;
    }
    pending.current = true;
    setSelected(key);
  }
  return <View style={styles.content}>
    {detail.help && <ContextualHelp key={`${detail.help.culture}:${detail.help.title}`} help={detail.help} />}
    <EnergyBanner energy={detail.energy} />
    <View ref={menu} collapsable={false} onLayout={() => { if (menu.current) registerMenu(menu.current); }}>
      <SectionWidgets items={items} selected={selected} onSelect={(key) => choose(key)} energy={detail.energy} />
    </View>
    {!!selected && <View key={selected} ref={target} collapsable={false} style={styles.content}
      onLayout={() => {
        const destination = target.current;
        if (pending.current && destination) { pending.current = false; scrollTo(destination); }
      }}>
      {selected === 'relationships' && detail.isSixteenOrOver !== false && detail.contextualHelp?.relationships
        && <ContextualHelp help={detail.contextualHelp.relationships} />}
      {selected === 'energyFacts' ? <AppPanel title={selectedTitle}><EnergyFacts energy={detail.energy} /></AppPanel>
        : selected === 'health' ? <ChartHealth detail={detail} />
        : <ChartReading key={selected} title={selectedTitle} reading={coreReading(detail, selected)} />}
    </View>}
  </View>;
}

function OtherDetails({ detail }: { detail: ChartDetail }) {
  const registerMenu = useModalMenu();
  const menu = useRef<ComponentRef<typeof View>>(null);
  const scrollTo = useModalScroll();
  const readingView = useRef<ComponentRef<typeof View>>(null);
  const pendingScroll = useRef(false);
  const [selected, setSelected] = useState('');
  const [subsection, setSubsection] = useState('');
  const natureTitles: Record<string, string> = {
    intellectualQualities: 'Intellectual Qualities', interpersonalQualities: 'Interpersonal Qualities',
    emotionalLandscape: 'Emotional Landscape',
  };
  const nature = detail.key === 'core' ? Object.entries(natureTitles).flatMap(([key, title]) => {
    const reading = detail.groups.flatMap((group) => group.readings).find((item) => item.key === key);
    return reading ? [{ ...reading, title }] : [];
  }) : [];
  const sections = detail.key === 'character'
    ? [{ key: 'energyFacts', title: uiCopy.coreSections.energyFacts }, ...(detail.navigation ?? []).map((item) =>
      item.key === 'character' ? { ...item, key: 'essence', title: uiCopy.coreSections.essence } : item)]
    : [{ key: 'energyFacts', title: 'Overview' }, { key: 'essence', title: 'Essence' }, ...nature.map(({ key, title }) => ({ key, title })),
    ...detail.groups.filter((group) => detail.key !== 'core' || group.title !== 'Your Nature')
      .map((group) => ({ key: group.title, title: group.title }))];
  const group = detail.groups.find((item) => item.title === selected);
  const active = nature.find((reading) => reading.key === selected)
    ?? group?.readings.find((reading) => reading.key === subsection) ?? group?.readings[0];
  const characterSection = detail.navigation?.find((item) => item.key === (selected === 'essence' ? 'character' : selected));
  function select(key: string, child = false) {
    if ((child ? subsection : selected) === key) {
      if (readingView.current) scrollTo(readingView.current);
      return;
    }
    pendingScroll.current = true;
    if (child) setSubsection(key);
    else { setSelected(key); setSubsection(''); }
  }
  return (
    <View style={styles.content}>
      {detail.key === 'character' && detail.help
        && <ContextualHelp key={`${detail.help.culture}:${detail.help.title}`} help={detail.help} />}
      <EnergyBanner energy={detail.energy} />
      <View ref={menu} collapsable={false} onLayout={() => { if (menu.current) registerMenu(menu.current); }}>
        <SectionWidgets items={sections} selected={selected} onSelect={(key) => select(key)} energy={detail.energy} />
      </View>
      {!!group && <SectionWidgets items={group.readings} selected={active!.key} onSelect={(key) => select(key, true)} />}
      {!!selected && <View key={detail.key === 'character' ? selected : selected === 'energyFacts' ? 'energyFacts' : active?.key ?? 'essence'} ref={readingView} collapsable={false} style={styles.content}
        onLayout={() => {
          if (pendingScroll.current && readingView.current) {
            pendingScroll.current = false; scrollTo(readingView.current);
          }
        }}>
        {selected === 'energyFacts' ? <AppPanel title="Overview"><EnergyFacts energy={detail.energy} /></AppPanel>
          : detail.key === 'character' ? characterSection && <>
            {selected === 'adultChildRelationship' && detail.contextualHelp?.adultChildRelationship
              && <ContextualHelp help={detail.contextualHelp.adultChildRelationship} />}
            <ChartReading title={selected === 'essence' ? uiCopy.coreSections.essence : characterSection.heading}
              reading={characterSection.reading} initialFull={selected === 'stressResponse'} />
          </> : <ChartReading title={active?.title ?? 'Essence'} reading={active ?? detail.reading} />}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({ content: { gap: Spacing.three } });
