import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartReading } from '@/components/chart-reading';
import { SectionWidgets } from '@/components/section-widgets';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { Spacing } from '@/constants/theme';
import type { ChartDetail } from '@/lib/chart-sections';

export function ChartDetails({ detail, onBack }: { detail: ChartDetail; onBack: () => void }) {
  const [selected, setSelected] = useState('essence');
  const [subsection, setSubsection] = useState('');
  const sections = [{ key: 'essence', title: 'Essence' },
    ...detail.groups.map((group) => ({ key: group.title, title: group.title }))];
  const group = detail.groups.find((item) => item.title === selected);
  const active = group?.readings.find((reading) => reading.key === subsection) ?? group?.readings[0];
  return (
    <View style={styles.content}>
      <AppButton title="↑ Back to My Energies" variant="secondary" onPress={onBack} />
      <ThemedText type="subtitle" accessibilityRole="header">{detail.title}</ThemedText>
      <SectionWidgets items={sections} selected={group ? selected : 'essence'} onSelect={(key) => {
        setSelected(key); setSubsection('');
      }} />
      {!!group && <SectionWidgets items={group.readings} selected={active!.key} onSelect={setSubsection} />}
      <AppPanel title={active?.title ?? 'Essence'}>
        <ChartReading key={active?.key ?? 'essence'} reading={active ?? detail.reading} />
      </AppPanel>
      <AppButton title="↑ Back to My Energies" variant="secondary" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({ content: { gap: Spacing.three } });
