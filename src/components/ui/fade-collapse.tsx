import { useEffect, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Keep natural content measured while its occupied height and opacity animate
// together. There is no final layout removal to make surrounding UI jump.
export function FadeCollapse({ visible, children }: PropsWithChildren<{ visible: boolean }>) {
  const progress = useSharedValue(visible ? 1 : 0);
  const height = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 180 : 140, reduceMotion: ReduceMotion.System,
    });
  }, [visible, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ height: height.value * progress.value, opacity: progress.value }));
  return <Animated.View style={[styles.clip, animatedStyle]} pointerEvents={visible ? 'auto' : 'none'}
    accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
    <View style={styles.content} onLayout={({ nativeEvent }) => { height.value = nativeEvent.layout.height; }}>
      {children}
    </View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' }, content: { position: 'absolute', top: 0, left: 0, right: 0 },
});
