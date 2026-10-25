import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const source = require('../../../assets/videos/stars-background.mp4');

// Decorative only: never participates in scrolling, accessibility or account state.
export function AppBackground() {
  const theme = useTheme();
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true;
      setReducedMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted && !changed) setReducedMotion(value);
    }).catch(() => {});
    const state = AppState.addEventListener('change', (value) => setActive(value === 'active'));
    return () => { mounted = false; motion.remove(); state.remove(); };
  }, []);
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    onLayout={({ nativeEvent }) => setSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}
    style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundElement, overflow: 'hidden' }]}>
    <Image source={require('../../../assets/images/stars-background.jpg')} contentFit="cover" contentPosition="bottom"
      style={[StyleSheet.absoluteFill, { opacity: videoReady ? 0 : 1 }]} />
    {focused && active && !reducedMotion && size.width > 0 && size.height > 0 && <BackgroundVideo {...size} onReady={setVideoReady} />}
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundElement, opacity: 0.75 }]} />
  </View>;
}

function BackgroundVideo({ width, height, onReady }: { width: number; height: number; onReady: (ready: boolean) => void }) {
  // Portrait asset: minimum cover scale, horizontally centred and bottom aligned.
  const scale = Math.max(width / 720, height / 1280);
  const videoWidth = 720 * scale;
  const videoHeight = 1280 * scale;
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(source, (video) => {
    video.muted = true;
    video.loop = true;
    video.playbackRate = 0.5;
    video.audioMixingMode = 'mixWithOthers';
    video.staysActiveInBackground = false;
    video.play();
  });
  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') { player.pause(); setFailed(true); onReady(false); }
    });
    return () => { subscription.remove(); onReady(false); };
  }, [player, onReady]);
  if (failed) return null;
  return <VideoView player={player} style={{ position: 'absolute', width: videoWidth, height: videoHeight,
    left: (width - videoWidth) / 2, top: height - videoHeight, opacity: ready ? 1 : 0 }} contentFit="contain"
    contentPosition={{ dx: 0, dy: 0 }}
    onFirstFrameRender={() => { setReady(true); onReady(true); }}
    nativeControls={false} allowsPictureInPicture={false} allowsVideoFrameAnalysis={false} />;
}
