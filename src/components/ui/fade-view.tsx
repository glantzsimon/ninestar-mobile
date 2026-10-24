import { forwardRef, type ComponentRef } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';

// Shared motion policy: short opacity transitions, no motion when requested by OS.
export const EnterFade = FadeIn.duration(180).reduceMotion(ReduceMotion.System);
export const ExitFade = FadeOut.duration(140).reduceMotion(ReduceMotion.System);

export const FadeView = forwardRef<ComponentRef<typeof View>, ViewProps>(function FadeView(props, ref) {
  return <Animated.View ref={ref} entering={EnterFade} exiting={ExitFade} {...props} />;
});
