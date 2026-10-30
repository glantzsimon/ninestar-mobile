import { useUiLabels } from '@/hooks/use-ui-labels';
import { useRef, type ComponentRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppPanel } from '@/components/ui/app-panel';
import { useScreenScroll } from '@/components/ui/app-screen';
import { useModalScroll } from '@/components/ui/app-modal';
import { EnergyArtwork } from '@/constants/energy-artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { adjacentCalendarMonth, calendarDateLabel, calendarWeekdays, type CalendarMonth } from '@/lib/personal-calendar';
import { calendarInteractionCopy, uiCopy } from '@/lib/ui-copy';

// Shared native calendar presentation; own and future hosts supply server months.
export function PersonalCalendar({ calendar, selected, onSelect, onMonth, busy, onExpand, inModal = false, navigation }: {
  calendar: CalendarMonth; selected: string; onSelect: (date: string) => void;
  onMonth: (year: number, month: number) => void; busy: boolean; onExpand?: () => void; inModal?: boolean; navigation?: ReactNode;
}) {
  useUiLabels();
  const theme = useTheme();
  const screenScroll = useScreenScroll();
  const modalScroll = useModalScroll();
  const scrollTo = (target: ComponentRef<typeof View>) => inModal
    ? modalScroll(target, { topInset: 0 }) : screenScroll(target, { topInset: 0, ensureSpace: true });
  const calendarTop = useRef<ComponentRef<typeof View>>(null);
  const details = useRef<ComponentRef<typeof View>>(null);
  const pendingScroll = useRef(false);
  function scrollToCalendar() {
    if (calendarTop.current) scrollTo(calendarTop.current);
  }
  function chooseDay(date: string) {
    if (date === selected && details.current) { scrollTo(details.current); return; }
    pendingScroll.current = true;
    onSelect(date);
  }
  const copy = uiCopy.calendar;
  const culture = calendar.help.overview?.culture;
  const previous = adjacentCalendarMonth(calendar.year, calendar.month, -1);
  const next = adjacentCalendarMonth(calendar.year, calendar.month, 1);
  const day = calendar.entries.find(entry => entry.date === selected);
  const weekdays = calendar.labels.weekdays.length === 7 ? calendar.labels.weekdays :
    calendarWeekdays(culture).map((label, index) => ({ label, shortLabel: label, dayOfWeek: index + 1 }));
  const slots = [...Array.from({ length: calendar.offset }, () => null), ...calendar.entries];
  const weeks = Array.from({ length: Math.ceil(slots.length / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, column) => slots[week * 7 + column] ?? null));
  return <>
    <View ref={calendarTop} collapsable={false}><AppPanel title={calendar.title} flush={inModal}>
      {navigation}
      <View style={styles.toolbar}>
        <View style={styles.action}><AppButton title="‹" accessibilityLabel={calendar.labels.previousMonth || copy.previous} variant="secondary"
          disabled={busy || !previous} onPress={() => previous && onMonth(previous.year, previous.month)} /></View>
        <View style={styles.action}><AppButton title={calendar.labels.today || copy.today} variant="secondary" disabled={busy}
          onPress={() => { const [year, month] = calendar.today.split('-').map(Number); onSelect(calendar.today); onMonth(year, month); }} /></View>
        <View style={styles.action}><AppButton title="›" accessibilityLabel={calendar.labels.nextMonth || copy.next} variant="secondary"
          disabled={busy || !next} onPress={() => next && onMonth(next.year, next.month)} /></View>
      </View>
      {onExpand && <AppButton title={calendar.labels.expand || copy.expand} variant="secondary" onPress={onExpand} disabled={busy} />}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <ThemedText type="small" themeColor="textSecondary">{calendarInteractionCopy.monthInstructions}</ThemedText>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.grid}>
        <View style={styles.week}>
            {weekdays.map((weekday) => <View key={`weekday-${weekday.dayOfWeek}`} style={styles.cell}>
              <ThemedText type="smallBold" style={styles.centred} numberOfLines={1} adjustsFontSizeToFit
                accessibilityLabel={weekday.label}>{weekday.shortLabel}</ThemedText>
            </View>)}
        </View>
        {weeks.map((week, index) => <View key={`week-${index}`} style={styles.week}>
            {week.map((entry, column) => entry ? <View key={entry.date} style={styles.cell}>
              <Pressable disabled={busy} accessibilityRole="button" hitSlop={Spacing.half}
                accessibilityLabel={`${entry.dateLabel || calendarDateLabel(entry.date, culture)}. ${entry.houses || entry.summary}`}
                accessibilityState={{ selected: entry.date === selected, disabled: busy }}
                onPress={() => chooseDay(entry.date)} style={({ pressed }) => [styles.day, {
                  borderColor: entry.date === selected || entry.date === calendar.today ? theme.primary : theme.border,
                  backgroundColor: pressed || entry.date === selected ? theme.backgroundSelected : theme.panelHeader,
                  borderWidth: 1,
                }]}>
                <View style={styles.dayContent} pointerEvents="none">
                  <ArtworkImage artworkId={entry.artworkId} fallback={EnergyArtwork[entry.dayHouse]}
                    style={styles.artwork} contentFit="contain" accessible={false} />
                </View>
                <ThemedText type="caption" themeColor="textSecondary" style={styles.date} pointerEvents="none">
                  {entry.day}
                </ThemedText>
              </Pressable>
            </View> : <View key={`empty-${column}`} style={styles.cell} accessible={false} />)}
        </View>)}
      </View>
    </AppPanel></View>
    {day && <View key={day.date} ref={details} collapsable={false} onLayout={() => {
      if (pendingScroll.current && details.current) {
        pendingScroll.current = false;
        scrollTo(details.current);
      }
    }}><AppPanel title={day.dateLabel || calendarDateLabel(day.date, culture)} flush={inModal} joined={inModal}>
      <ThemedText type="sectionTitle" accessibilityRole="header">{day.houses || `${day.yearHouse}.${day.monthHouse}.${day.dayHouse}`}</ThemedText>
      <ReadingContent blocks={day.blocks} />
      <AppButton title={calendarInteractionCopy.backToTop} variant="secondary" onPress={scrollToCalendar} />
    </AppPanel></View>}
  </>;
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: Spacing.two }, action: { flex: 1 },
  grid: { flexDirection: 'column' },
  week: { flexDirection: 'row', flexWrap: 'nowrap' },
  cell: { flex: 1, minWidth: 0, padding: Spacing.half },
  day: { width: '100%', borderRadius: Radius.control },
  dayContent: { width: '100%', aspectRatio: 1, marginTop: Spacing.half,
    alignItems: 'center', justifyContent: 'center' },
  artwork: { width: '64%', aspectRatio: 1, transform: [{ translateY: Spacing.one + 1 }] }, centred: { textAlign: 'center' },
  divider: { height: 1, width: '100%', marginVertical: Spacing.two },
  date: { position: 'absolute', top: 0, left: Spacing.one },
});
