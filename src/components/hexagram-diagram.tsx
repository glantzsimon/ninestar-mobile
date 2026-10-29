import { StyleSheet, View } from 'react-native';
import { HexagramColors, LayoutSpacing, Spacing } from '@/constants/theme';
import { hexagramLineStyle, type HexagramLine } from '@/lib/iching';

export function HexagramDiagram({ lines }: { lines: HexagramLine[] }) {
  return <View style={styles.figure} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {lines.map((line, index) => {
      const { broken, changing } = hexagramLineStyle(line);
      const backgroundColor = changing ? HexagramColors.changing : HexagramColors.ink;
      return <View key={index} style={styles.row}>
        {broken ? <><View style={[styles.half, { backgroundColor }]} /><View style={[styles.half, { backgroundColor }]} /></>
          : <View style={[styles.whole, { backgroundColor }]} />}
      </View>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  figure: { width: '100%', maxWidth: 180, padding: Spacing.three, alignSelf: 'center', gap: Spacing.two,
    marginBottom: LayoutSpacing.figureBottom, backgroundColor: HexagramColors.paper },
  row: { height: 10, flexDirection: 'row', gap: 20 }, half: { flex: 1 }, whole: { flex: 1 },
});
