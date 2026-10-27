import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { GaugeColors, Spacing } from '@/constants/theme';
import { gaugePosition, type CompatibilityGauge } from '@/lib/compatibility';

function point(position: number, radius = 74) {
  const angle = (207 + 126 * position) * Math.PI / 180;
  return { x: 100 + radius * Math.cos(angle), y: 110 + radius * Math.sin(angle) };
}
function arc(position: number) {
  const start = point(0), end = point(position);
  return `M ${start.x} ${start.y} A 74 74 0 0 1 ${end.x} ${end.y}`;
}
function colour(desirability: number) {
  const from = desirability < 0.5 ? GaugeColors.low : GaugeColors.middle;
  const to = desirability < 0.5 ? GaugeColors.middle : GaugeColors.high;
  const fraction = desirability < 0.5 ? desirability * 2 : (desirability - 0.5) * 2;
  const channels = [1, 3, 5].map(offset => Math.round(parseInt(from.slice(offset, offset + 2), 16) * (1 - fraction)
    + parseInt(to.slice(offset, offset + 2), 16) * fraction));
  return `rgb(${channels.join(',')})`;
}

export function CompatibilityGauges({ gauges }: { gauges: CompatibilityGauge[] }) {
  const [wide, setWide] = useState(false);
  return <View style={styles.grid} onLayout={({ nativeEvent }) => setWide(nativeEvent.layout.width >= 600)}>
    {gauges.map(gauge => {
      const { position, desirability } = gaugePosition(gauge), tip = point(position, 78);
      return <View key={gauge.key} style={[styles.gauge, { width: wide ? '31%' : '47%' }]}
        accessible accessibilityRole="progressbar" accessibilityLabel={gauge.label}
        accessibilityValue={{ min: gauge.minValue, max: gauge.maxValue, now: gauge.value }}>
        <ThemedText type="smallBold" style={styles.label}>{gauge.label}</ThemedText>
        <View style={styles.dial} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Svg width="100%" height="100%" viewBox="0 0 200 125">
            <Path d={arc(1)} fill="none" stroke={GaugeColors.track} strokeWidth={33} />
            {position > 0 && <Path d={arc(position)} fill="none" stroke={colour(desirability)} strokeWidth={33} />}
            <Line x1={100} y1={110} x2={tip.x} y2={tip.y} stroke={GaugeColors.needle} strokeWidth={6} strokeLinecap="round" />
            <Circle cx={100} cy={110} r={3} fill={GaugeColors.needle} />
          </Svg>
        </View>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.three },
  gauge: { alignItems: 'center', gap: Spacing.one },
  label: { textAlign: 'center', lineHeight: 20, minHeight: 40 },
  dial: { width: '100%', aspectRatio: 200 / 125 },
});
