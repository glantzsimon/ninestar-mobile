import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { EnergyCard } from '@/components/energy-card';
import { EnergyCards } from '@/components/energy-cards';
import { ArtworkImage } from '@/components/artwork-image';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { useUiLabels } from '@/hooks/use-ui-labels';
import { plannerItemAnchor, plannerRangeLabel, type PlannerItem, type PlannerOverview } from '@/lib/calendar-planner';

export function CalendarZoomNavigation({ upLabel, onUp, onBack, busy }: {
  upLabel?: string; onUp?: () => void; onBack?: () => void; busy: boolean;
}) {
  const labels = useUiLabels();
  return <FadeCollapse visible={!!onBack || !!(upLabel && onUp)}><View style={styles.toolbar}>
    {onBack && <View style={styles.action}><AppButton title={labels.shared.actions.back} variant="secondary" onPress={onBack} disabled={busy} /></View>}
    {upLabel && onUp && <View style={styles.action}><AppButton title={`↑ ${upLabel}`} variant="secondary" onPress={onUp} disabled={busy} /></View>}
  </View></FadeCollapse>;
}

export function CalendarOverview({ planner, title, onSelect, onAdjacent, navigation, busy, inModal = false, onExpand, selectedDate, timeZone }: {
  planner: PlannerOverview; title: string; onSelect: (item: PlannerItem) => void;
  onAdjacent: (direction: 'Back' | 'Forward') => void; navigation: ReactNode; busy: boolean; inModal?: boolean;
  onExpand?: () => void; selectedDate: string; timeZone?: string;
}) {
  const labels = useUiLabels();
  const culture = labels.culture;
  const second = planner.secondEnergy && planner.secondEnergy.energy.number !== planner.energy.energy.number ? planner.secondEnergy : null;
  return <>
    <AppPanel title={title} flush={inModal}>
      {navigation}
      <View style={styles.toolbar}>
        <View style={styles.action}><AppButton title="‹" accessibilityLabel={`‹ ${title}`} variant="secondary" disabled={busy} onPress={() => onAdjacent('Back')} /></View>
        <View style={styles.action}><AppButton title="›" accessibilityLabel={`› ${title}`} variant="secondary" disabled={busy} onPress={() => onAdjacent('Forward')} /></View>
      </View>
      {onExpand && <AppButton title={labels.screens.calendar.labels.expand} variant="secondary" onPress={onExpand} disabled={busy} />}
      <ThemedText type="sectionTitle" accessibilityRole="header">{plannerRangeLabel(planner.startsOn, planner.endsOn, culture, timeZone)}</ThemedText>
      <EnergyCard energy={planner.energy.energy} title={planner.energy.houseName}
        caption={planner.energy.reading.title} hint="" />
      {second && <EnergyCard energy={second.energy} title={second.houseName} caption={second.reading.title} hint="" />}
      <EnergyCards disabled={busy} items={planner.items.map((item, index) => ({ key: `${item.startsOn}:${index}`,
        rank: 0, energy: item.energy.energy, title: plannerRangeLabel(item.startsOn, item.endsOn, culture, timeZone),
        subtitle: item.energy.houseName, caption: item.energy.reading.title, selected: item.active,
        disabled: !plannerItemAnchor(item, selectedDate),
        onPress: () => { if (!busy) onSelect(item); },
        artwork: item.secondEnergy && item.secondEnergy.energy.number !== item.energy.energy.number ? <View style={styles.split}>
          <ArtworkImage artworkId={item.energy.energy.artworkId} legacyUrl={item.energy.energy.imageUrl} fallback={EnergyArtwork[item.energy.energy.number]} style={styles.art} contentFit="contain" accessible={false} />
          <ArtworkImage artworkId={item.secondEnergy.energy.artworkId} legacyUrl={item.secondEnergy.energy.imageUrl} fallback={EnergyArtwork[item.secondEnergy.energy.number]} style={styles.art} contentFit="contain" accessible={false} />
        </View> : undefined,
      }))} />
    </AppPanel>
    {!!(planner.blocks.length || planner.energy.reading.bodyBlocks.length) && <AppPanel title={planner.energy.reading.title} flush={inModal} joined={inModal}>
      <ReadingContent blocks={planner.blocks.length ? planner.blocks : planner.energy.reading.bodyBlocks} />
    </AppPanel>}
  </>;
}
const styles = StyleSheet.create({ toolbar: { flexDirection: 'row', gap: Spacing.two }, action: { flex: 1 },
  split: { flex: 1, flexDirection: 'row', alignItems: 'center' }, art: { width: '50%', aspectRatio: 1 } });
