import { useUiLabels } from '@/hooks/use-ui-labels';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ReadingContent, ReadingInline } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppPanel } from '@/components/ui/app-panel';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { type ContextualHelp as Help } from '@/lib/contextual-help';
import { uiCopy } from '@/lib/ui-copy';

export function ContextualHelp({ help }: { help: Help }) {
  useUiLabels();
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const progress = useSharedValue(0);
  const previewHeight = useSharedValue(0);
  const fullHeight = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: expanded ? 180 : 140, reduceMotion: ReduceMotion.System });
  }, [expanded, progress]);
  const bodyStyle = useAnimatedStyle(() => ({ height: previewHeight.value + (fullHeight.value - previewHeight.value) * progress.value }));
  const previewStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const fullStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const preview = help.blocks.find((block) => block.kind === 'paragraph') ?? help.blocks[0];
  const toggle = () => setExpanded((current) => !current);
  return <AppPanel title={help.title} headerAction={{
    title: expanded ? uiCopy.showLess : uiCopy.readMore, expanded, onPress: toggle,
  }}>
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }}
      accessibilityLabel={`${help.title}. ${expanded ? uiCopy.showLess : uiCopy.readMore}. ${expanded
        ? help.blocks.map((block) => block.text).join('\n\n') : preview?.text ?? ''}`}>
    <Animated.View style={[styles.clip, bodyStyle]}>
    {preview && <Animated.View style={[styles.content, previewStyle]} pointerEvents={expanded ? 'none' : 'auto'}
      accessibilityElementsHidden={expanded} importantForAccessibility={expanded ? 'no-hide-descendants' : 'auto'}
      onLayout={({ nativeEvent }) => { previewHeight.value = nativeEvent.layout.height; }}>
      <ThemedText numberOfLines={3} ellipsizeMode="clip"><ReadingInline block={preview} /></ThemedText>
      <View pointerEvents="none" accessible={false} style={[styles.fade, {
        backgroundImage: `linear-gradient(to bottom, transparent, ${theme.backgroundElement})`,
      }]} />
    </Animated.View>}
    <Animated.View style={[styles.content, fullStyle]} pointerEvents={expanded ? 'auto' : 'none'}
      accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
      onLayout={({ nativeEvent }) => { fullHeight.value = nativeEvent.layout.height; }}>
      <ReadingContent blocks={help.blocks} />
    </Animated.View>
    </Animated.View>
    </Pressable>
  </AppPanel>;
}
const styles = StyleSheet.create({
  clip: { overflow: 'hidden' }, content: { position: 'absolute', left: 0, right: 0, top: 0 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 28 },
});
