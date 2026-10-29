import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { LayoutSpacing, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { elementPieSlices, type ElementSegment } from '@/lib/element-breakdown';

export function ElementBreakdown({ segments }: { segments: ElementSegment[] }) {
  const theme = useTheme();
  if (!segments.length) return null;
  return <View style={styles.content}>
    <View style={styles.chart} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 200 200" accessible={false}>
        {elementPieSlices(segments).map(slice => <Path key={slice.key} d={slice.path} fill={slice.color} />)}
        <Circle cx={100} cy={100} r={95} fill="none" stroke={theme.border} strokeWidth={1} />
      </Svg>
    </View>
    <View style={[styles.legend, { borderColor: theme.border }]}>
      {segments.map((segment, index) => <View key={segment.key} style={[styles.row, { borderColor: theme.border, borderTopWidth: index ? 1 : 0 }]}>
        <View style={[styles.dot, { backgroundColor: segment.color }]} accessibilityElementsHidden importantForAccessibility="no" />
        <ThemedText type="smallBold" style={styles.label}>{segment.label}</ThemedText>
        <ThemedText type="small">{segment.value}%</ThemedText>
      </View>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: Spacing.three, marginBottom: LayoutSpacing.chartBottom },
  chart: { width: '100%', maxWidth: 240, aspectRatio: 1 },
  legend: { width: '100%', maxWidth: 360, borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two },
  dot: { width: 12, height: 12, borderRadius: Radius.pill }, label: { flex: 1 },
});
