import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import { WarningIcon } from '@/components/ui/warning-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { squareArrowGeometry } from '@/lib/magic-squares';
import type { TravelSummary as Summary } from '@/lib/travel-summary';

export function TravelSummary({ summary }: { summary: Summary }) {
  const theme = useTheme();
  return <AppPanel title={summary.title}>
    {!!summary.instructions.length && <ReadingContent blocks={summary.instructions} />}
    {summary.rows.map((row, index) => <AppPanel key={index}>
      <ThemedText type="smallBold">{summary.labels.direction}</ThemedText>
      <ThemedText type="sectionTitle" accessibilityRole="header">{row.directions.map(direction => direction.label).join(', ')}</ThemedText>
      <View style={styles.status}>
        <Svg viewBox="0 0 100 100" width={100} height={100} accessible={false}>
          <Circle cx={50} cy={50} r={14} fill={row.color} stroke={theme.border} strokeWidth={1} />
          {row.directions.map((direction, position) => {
            const geometry = squareArrowGeometry(direction);
            return geometry.ring ? <Circle key={position} cx={50} cy={50} r={46} fill="none" stroke={theme.text} strokeWidth={2} />
              : <DirectionArrow key={position} endX={geometry.endX} endY={geometry.endY} points={geometry.points} color={theme.text} />;
          })}
        </Svg>
        <View style={styles.score}>
          <ThemedText type="smallBold">{summary.labels.score}</ThemedText>
          <ThemedText type="sectionTitle">{row.score}</ThemedText>
          {row.showWarning && <WarningIcon />}
        </View>
      </View>
      <ThemedText type="smallBold">{summary.labels.guidance}</ThemedText>
      <ReadingContent blocks={row.guidance} />
    </AppPanel>)}
  </AppPanel>;
}

function DirectionArrow({ endX, endY, points, color }: { endX: number; endY: number; points: string; color: string }) {
  return <><Line x1={50} y1={50} x2={endX} y2={endY} stroke={color} strokeWidth={2} />
    <Polygon points={points} fill={color} /></>;
}
const styles = StyleSheet.create({ status: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  score: { gap: Spacing.one } });
