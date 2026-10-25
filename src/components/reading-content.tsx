import { StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BrandFonts, Spacing } from '@/constants/theme';
import { type ReadingBlock } from '@/lib/reading-text';

export function ReadingInline({ block }: { block: ReadingBlock }) {
  return block.spans ? block.spans.map((span, index) => <Text key={index}
    style={span.bold ? styles.bold : undefined}>{span.text}</Text>) : block.text;
}
export function ReadingContent({ blocks }: { blocks: ReadingBlock[] }) {
  return (
    <View style={styles.content}>
      {blocks.map((block, index) => block.kind === 'heading' ? (
        <ThemedText key={index} type="sectionTitle" accessibilityRole="header" selectable
          style={index > 0 ? styles.heading : undefined}>{block.text}</ThemedText>
      ) : block.kind === 'list-item' ? (
        <View key={index} style={styles.item}>
          <ThemedText accessible={false}>•</ThemedText>
          <ThemedText selectable style={styles.itemText}><ReadingInline block={block} /></ThemedText>
        </View>
      ) : <ThemedText key={index} selectable><ReadingInline block={block} /></ThemedText>)}
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: BrandFonts.bold },
  content: { gap: Spacing.two },
  heading: { marginTop: Spacing.two },
  item: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  itemText: { flex: 1 },
});
