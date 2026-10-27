import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppPanel } from '@/components/ui/app-panel';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { Spacing } from '@/constants/theme';

// Shared chart/prediction result structure; calculator hosts pass the same slots.
export function ReadingGroups({ primaryTitle, additionalTitle, primary, additional, between }: {
  primaryTitle: string; additionalTitle: string;
  primary: ReactNode; additional: ReactNode; between?: ReactNode;
}) {
  return <View style={styles.groups}>
    {primary != null && <AppPanel title={primaryTitle}>{primary}</AppPanel>}
    {between}
    {additional != null && (additionalTitle ? <AppDisclosure title={additionalTitle} defaultExpanded>{additional}</AppDisclosure>
      : <AppPanel>{additional}</AppPanel>)}
  </View>;
}

const styles = StyleSheet.create({ groups: { gap: Spacing.four } });
