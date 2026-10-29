import { useUiLabels } from '@/hooks/use-ui-labels';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { FadeCollapse } from '@/components/ui/fade-collapse';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { uiCopy } from '@/lib/ui-copy';

export function AppMenuNavigation({ visible, title, onPress }: { visible: boolean; title: string; onPress: () => void }) {
  useUiLabels();
  return <FadeCollapse visible={visible}><View style={styles.navigation}>
    <AppButton title={`↑ ${title}`} variant="secondary" accessibilityHint={uiCopy.menuHint} onPress={onPress} />
  </View></FadeCollapse>;
}

const styles = StyleSheet.create({ navigation: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center',
  paddingHorizontal: Spacing.three, paddingVertical: Spacing.two } });
