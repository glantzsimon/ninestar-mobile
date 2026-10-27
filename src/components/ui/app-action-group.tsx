import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LayoutSpacing } from '@/constants/theme';

// Related navigation/actions keep a compact gap without shrinking touch targets.
export function AppActionGroup({ children }: PropsWithChildren) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({ group: { gap: LayoutSpacing.relatedActions } });
