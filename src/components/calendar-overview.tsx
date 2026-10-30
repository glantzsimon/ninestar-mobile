import { Pressable, StyleSheet, View } from 'react-native';
import { useRef, type ComponentRef, type ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { EnergyCard } from '@/components/energy-card';
import { useScreenScroll } from '@/components/ui/app-screen';
import { useModalScroll } from '@/components/ui/app-modal';
import { EnergyCards } from '@/components/energy-cards';
import { ArtworkImage } from '@/components/artwork-image';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { useUiLabels } from '@/hooks/use-ui-labels';
import { plannerItemAnchor, plannerRangeLabel, type PlannerItem, type PlannerOverview } from '@/lib/calendar-planner';
import { calendarInteractionCopy, uiCopy } from '@/lib/ui-copy';
import { useTheme } from '@/hooks/use-theme';

export function CalendarZoomNavigation({ upLabel, onUp, onBack, busy }: {
  upLabel?: string; onUp?: () => void; onBack?: () => void; busy: boolean;
}) {
  const labels = useUiLabels();
  return <FadeCollapse visible={!!onBack || !!(upLabel && onUp)}><View style={styles.toolbar}>
    {onBack && <View style={styles.action}><AppButton title={labels.shared.actions.back} variant="secondary" onPress={onBack} disabled={busy} /></View>}
    {upLabel && onUp && <View style={styles.action}><AppButton title={`↑ ${upLabel}`} variant="secondary" onPress={onUp} disabled={busy} /></View>}
  </View></FadeCollapse>;
}

export function CalendarOverview({ planner, title, onSelect, onAdjacent, navigation, busy, inModal = false, onExpand, selectedDate, selectedPeriod, timeZone, onDrill, childLabel }: {
  planner: PlannerOverview; title: string; onSelect: (item: PlannerItem | null) => void; onDrill: (item: PlannerItem) => void; childLabel?: string;
  onAdjacent: (direction: 'Back' | 'Forward') => void; navigation: ReactNode; busy: boolean; inModal?: boolean;
  onExpand?: () => void; selectedDate: string; selectedPeriod?: string; timeZone?: string;
}) {
  const labels = useUiLabels();
  const theme = useTheme();
  const culture = labels.culture;
  const screenScroll = useScreenScroll();
  const modalScroll = useModalScroll();
  const calendarTop = useRef<ComponentRef<typeof View>>(null);
  const details = useRef<ComponentRef<typeof View>>(null);
  const pendingScroll = useRef(false);
  const selected = planner.items.find(item => item.startsOn === selectedPeriod);
  const reading = selected ?? planner;
  const blocks = reading.blocks.length ? reading.blocks : reading.energy.reading.bodyBlocks;
  const detailKey = `${planner.startsOn}:${selected?.startsOn ?? 'parent'}`;
  function scrollDetails() {
    if (!details.current) return;
    if (inModal) modalScroll(details.current, { topInset: 0 });
    else screenScroll(details.current, { topInset: 0, ensureSpace: true });
  }
  function scrollToCalendar() {
    if (!calendarTop.current) return;
    if (inModal) modalScroll(calendarTop.current, { topInset: 0 });
    else screenScroll(calendarTop.current, { topInset: 0 });
  }
  function choose(item: PlannerItem | null) {
    if (busy) return;
    if ((item?.startsOn ?? undefined) === selectedPeriod) { scrollDetails(); return; }
    pendingScroll.current = true;
    onSelect(item);
  }
  const second = planner.secondEnergy && planner.secondEnergy.energy.number !== planner.energy.energy.number ? planner.secondEnergy : null;
  return <>
    <View ref={calendarTop} collapsable={false}><AppPanel title={title} flush={inModal}>
      {navigation}
      <View style={styles.toolbar}>
        <View style={styles.action}><AppButton title="‹" accessibilityLabel={`‹ ${title}`} variant="secondary" disabled={busy} onPress={() => onAdjacent('Back')} /></View>
        <View style={styles.action}><AppButton title="›" accessibilityLabel={`› ${title}`} variant="secondary" disabled={busy} onPress={() => onAdjacent('Forward')} /></View>
      </View>
      {onExpand && <AppButton title={labels.screens.calendar.labels.expand} variant="secondary" onPress={onExpand} disabled={busy} />}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <ThemedText type="small" themeColor="textSecondary">{calendarInteractionCopy.overviewInstructions(childLabel)}</ThemedText>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <EnergyCard energy={planner.energy.energy}
        title={plannerRangeLabel(planner.startsOn, planner.endsOn, culture, timeZone)}
        subtitle={planner.energy.houseName} caption={planner.energy.reading.title} hint=""
        artworkSize={92} artworkFrameSize={92} onPress={() => choose(null)}
        selected={!selected} disabled={busy} fitTitle />
      {second && <EnergyCard energy={second.energy} title={second.houseName} caption={second.reading.title} hint=""
        prominent artworkSize={92} artworkFrameSize={92} onPress={() => choose(null)} disabled={busy} />}
      <EnergyCards disabled={busy} items={planner.items.map((item, index) => ({ key: `${item.startsOn}:${index}`,
        rank: 0, energy: item.energy.energy, title: plannerRangeLabel(item.startsOn, item.endsOn, culture, timeZone), fitTitle: true,
        subtitle: item.energy.houseName, selected: item === selected,
        onPress: () => choose(item),
        bottomAction: childLabel && plannerItemAnchor(item, selectedDate)
          ? <View style={styles.bottomActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={uiCopy.energyDetailsHint}
                accessibilityState={{ selected: item === selected, disabled: busy }}
                hitSlop={Spacing.one + Spacing.half}
                disabled={busy} onPress={() => choose(item)}
                style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? theme.actionPressed : theme.actionBackground,
                  borderColor: theme.actionBorder }]}>
                <SymbolView name={{ ios: 'eye', android: 'visibility', web: 'visibility' }}
                  size={20} weight="semibold" tintColor={theme.onAction} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={calendarInteractionCopy.seeView(childLabel)}
                accessibilityState={{ disabled: busy }}
                hitSlop={Spacing.one + Spacing.half}
                disabled={busy} onPress={() => { if (!busy) { onSelect(item); onDrill(item); } }}
                style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? theme.actionPressed : theme.actionBackground,
                  borderColor: theme.actionBorder }]}>
                <SymbolView name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
                size={22} weight="semibold" tintColor={theme.onAction} />
              </Pressable>
            </View>
          : undefined,
        artwork: item.secondEnergy && item.secondEnergy.energy.number !== item.energy.energy.number ? <View style={styles.split}>
          <ArtworkImage artworkId={item.energy.energy.artworkId} legacyUrl={item.energy.energy.imageUrl} fallback={EnergyArtwork[item.energy.energy.number]} style={styles.art} contentFit="contain" accessible={false} />
          <ArtworkImage artworkId={item.secondEnergy.energy.artworkId} legacyUrl={item.secondEnergy.energy.imageUrl} fallback={EnergyArtwork[item.secondEnergy.energy.number]} style={styles.art} contentFit="contain" accessible={false} />
        </View> : undefined,
      }))} />
    </AppPanel></View>
    {!!blocks.length && <View key={detailKey} ref={details} collapsable={false} onLayout={() => {
      if (pendingScroll.current) { pendingScroll.current = false; scrollDetails(); }
    }}><AppPanel title={plannerRangeLabel(reading.startsOn, reading.endsOn, culture, timeZone)} flush={inModal} joined={inModal}>
      <ThemedText type="sectionTitle" accessibilityRole="header">{reading.energy.houseName}</ThemedText>
      <ReadingContent blocks={blocks} />
      <AppButton title={calendarInteractionCopy.backToTop} variant="secondary" onPress={scrollToCalendar} />
    </AppPanel></View>}
  </>;
}
const styles = StyleSheet.create({ toolbar: { flexDirection: 'row', gap: Spacing.two }, action: { flex: 1 },
  divider: { height: 1, width: '100%', marginVertical: Spacing.two },
  bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.two },
  actionButton: { width: 32, height: 32, borderWidth: 1, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  split: { flex: 1, flexDirection: 'row', alignItems: 'center' }, art: { width: '50%', aspectRatio: 1 } });
