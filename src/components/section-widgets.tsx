import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { Spacing } from '@/constants/theme';

export function SectionWidgets({ items, selected, onSelect }: {
  items: { key: string; title: string }[]; selected: string; onSelect: (key: string) => void;
}) {
  return <View style={styles.grid}>{items.map((item) => <View key={item.key} style={styles.item}>
    <AppButton title={item.title} variant={selected === item.key ? 'primary' : 'secondary'}
      accessibilityState={{ selected: selected === item.key }} onPress={() => onSelect(item.key)} />
  </View>)}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  item: { flexGrow: 1, flexBasis: '45%' },
});
