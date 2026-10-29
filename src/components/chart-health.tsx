import { useUiLabels } from '@/hooks/use-ui-labels';
import { StyleSheet, View } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { ChartReading } from '@/components/chart-reading';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { Spacing } from '@/constants/theme';
import type { ChartDetail } from '@/lib/chart-sections';
import type { OrganPanel } from '@/lib/chart-health';
import { coreReading } from '@/lib/core-menu';
import { uiCopy } from '@/lib/ui-copy';

function Organs({ panel }: { panel: OrganPanel }) {
  useUiLabels();
  return <AppPanel title={panel.title}>
    <ReadingContent blocks={panel.blocks} />
    <View style={styles.organs}>{[...panel.yinOrgans, ...panel.yangOrgans].map((organ, index) => (
      <View key={`${organ.value}:${index}`} style={styles.organ}>
        {!!organ.artworkId && <ArtworkImage artworkId={organ.artworkId} style={styles.image}
          contentFit="contain" accessible={false} />}
        <ThemedText style={styles.label}>{organ.label}</ThemedText>
      </View>
    ))}</View>
  </AppPanel>;
}

export function ChartHealth({ detail }: { detail: ChartDetail }) {
  useUiLabels();
  const health = detail.health;
  const illnesses = detail.groups.flatMap((group) => group.readings).find((reading) => reading.key === 'illnesses');
  return <View style={styles.content}>
    <ChartReading title={uiCopy.coreSections.health} reading={coreReading(detail, 'health')} />
    {!!health && !!illnesses?.bodyBlocks.length && <AppPanel title={uiCopy.commonHealthChallenges}><ReadingContent blocks={illnesses.bodyBlocks} /></AppPanel>}
    {health?.expansion && <AppPanel title={health.expansion.title}><ReadingContent blocks={health.expansion.blocks} /></AppPanel>}
    {health?.strongOrgans && <Organs panel={health.strongOrgans} />}
    {health?.weakOrgans && <Organs panel={health.weakOrgans} />}
  </View>;
}
const styles = StyleSheet.create({
  content: { gap: Spacing.three },
  organs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  organ: { flexBasis: '40%', flexGrow: 1, alignItems: 'center', gap: Spacing.two },
  image: { width: 88, height: 88 }, label: { textAlign: 'center' },
});
