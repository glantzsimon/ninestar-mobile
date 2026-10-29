import { StyleSheet } from 'react-native';
import { HexagramDiagram } from '@/components/hexagram-diagram';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppPanel } from '@/components/ui/app-panel';
import type { HexagramReading, IChingReading as Reading } from '@/lib/iching';
import { uiCopy } from '@/lib/ui-copy';

function HexagramPanel({ hexagram }: { hexagram: HexagramReading }) {
  return <AppPanel title={hexagram.name}>
    <HexagramDiagram lines={hexagram.lines} />
    <ThemedText type="smallBold" style={styles.centred}>{hexagram.number}. {hexagram.name}</ThemedText>
    {!!hexagram.readingName && <ThemedText type="sectionTitle" style={styles.centred}>{hexagram.readingName}</ThemedText>}
    {!!hexagram.stage && <ThemedText type="subtitle" style={styles.centred}>{hexagram.stage}</ThemedText>}
    {!!hexagram.title.length && <ReadingContent blocks={hexagram.title} />}
    {!!hexagram.summary.length && <ReadingContent blocks={hexagram.summary} />}
    {!!hexagram.details.length && <AppDisclosure title={uiCopy.readMore}><ReadingContent blocks={hexagram.details} /></AppDisclosure>}
    {!!hexagram.changingLines.length && <ReadingContent blocks={hexagram.changingLines} />}
  </AppPanel>;
}

// Results render directly, in primary/transformed order, without section buttons.
export function IChingReading({ reading }: { reading: Reading }) {
  return <>
    <HexagramPanel hexagram={reading.primary} />
    {reading.transformed && <HexagramPanel hexagram={reading.transformed} />}
  </>;
}
const styles = StyleSheet.create({ centred: { textAlign: 'center' } });
