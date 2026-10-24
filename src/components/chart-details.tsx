import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartReading } from '@/components/chart-reading';
import { EnergyFacts } from '@/components/energy-facts';
import { SectionWidgets } from '@/components/section-widgets';
import { AppPanel } from '@/components/ui/app-panel';
import { useModalScroll } from '@/components/ui/app-modal';
import { Spacing } from '@/constants/theme';
import type { ChartDetail } from '@/lib/chart-sections';
import { coreMenu, coreReading } from '@/lib/core-menu';

export function ChartDetails({ detail }: { detail: ChartDetail }) {
  return detail.key === 'core' ? <CoreDetails detail={detail} /> : <OtherDetails detail={detail} />;
}

function CoreDetails({ detail }: { detail: ChartDetail }) {
  const [selected, setSelected] = useState('');
  const scrollTo = useModalScroll();
  const target = useRef<ComponentRef<typeof View>>(null);
  const pending = useRef(false);
  const titles: Record<string, string> = { energyFacts: 'Overview', essence: 'Essence',
    intellectualQualities: 'Intellectual Qualities', interpersonalQualities: 'Interpersonal Qualities',
    emotionalLandscape: 'Emotional Landscape', relationships: 'Relationships', career: 'Career',
    finances: 'Finances', health: 'Health', spirituality: 'Spirituality', occupations: 'Occupations',
    illnesses: 'Health Tendencies', relationshipsStraight: 'Relationships — Opposite Sex',
    relationshipsLgbtq: 'Relationships — Same Sex' };
  function choose(key: string) {
    if (selected === key) {
      if (target.current) scrollTo(target.current);
      return;
    }
    pending.current = true;
    setSelected(key);
  }
  return <View style={styles.content}>
    <SectionWidgets items={coreMenu(detail)} selected={selected} onSelect={(key) => choose(key)} energy={detail.energy} />
    {!!selected && <View key={selected} ref={target} collapsable={false} style={styles.content}
      onLayout={() => {
        const destination = target.current;
        if (pending.current && destination) { pending.current = false; scrollTo(destination); }
      }}>
      {selected === 'energyFacts' ? <AppPanel title="Overview"><EnergyFacts energy={detail.energy} /></AppPanel>
        : <ChartReading key={selected} title={titles[selected]} reading={coreReading(detail, selected)} />}
    </View>}
  </View>;
}

function OtherDetails({ detail }: { detail: ChartDetail }) {
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
  const sections = [{ key: 'energyFacts', title: 'Overview' }, { key: 'essence', title: 'Essence' }, ...nature.map(({ key, title }) => ({ key, title })),
    ...detail.groups.filter((group) => detail.key !== 'core' || group.title !== 'Your Nature')
      .map((group) => ({ key: group.title, title: group.title }))];
  const group = detail.groups.find((item) => item.title === selected);
  const active = nature.find((reading) => reading.key === selected)
    ?? group?.readings.find((reading) => reading.key === subsection) ?? group?.readings[0];
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
      <SectionWidgets items={sections} selected={selected} onSelect={(key) => select(key)} />
      {!!group && <SectionWidgets items={group.readings} selected={active!.key} onSelect={(key) => select(key, true)} />}
      {!!selected && <View key={selected === 'energyFacts' ? 'energyFacts' : active?.key ?? 'essence'} ref={readingView} collapsable={false}
        onLayout={() => {
          if (pendingScroll.current && readingView.current) {
            pendingScroll.current = false; scrollTo(readingView.current);
          }
        }}>
        {selected === 'energyFacts' ? <AppPanel title="Overview"><EnergyFacts energy={detail.energy} /></AppPanel>
          : <ChartReading title={active?.title ?? 'Essence'} reading={active ?? detail.reading} />}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({ content: { gap: Spacing.three } });
