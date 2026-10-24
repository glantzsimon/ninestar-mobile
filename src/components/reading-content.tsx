import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { type ReadingBlock } from '@/lib/reading-text';

export function ReadingContent({ blocks }: { blocks: ReadingBlock[] }) {
  return (
    <View style={styles.content}>
      {blocks.map((block, index) => block.kind === 'heading' ? (
        <ThemedText key={index} type="sectionTitle" accessibilityRole="header" selectable
          style={index > 0 ? styles.heading : undefined}>{block.text}</ThemedText>
      ) : block.kind === 'list-item' ? (
        <View key={index} style={styles.item}>
          <ThemedText accessible={false}>•</ThemedText>
          <ThemedText selectable style={styles.itemText}>{block.text}</ThemedText>
        </View>
      ) : <ThemedText key={index} selectable>{block.text}</ThemedText>)}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.two },
  heading: { marginTop: Spacing.two },
  item: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  itemText: { flex: 1 },
});
