import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { ContextualHelp } from '@/components/contextual-help';
import { useSubmissionError } from '@/hooks/use-submission-error';
import { useUiLabels } from '@/hooks/use-ui-labels';
import { getAiAstrologerContent } from '@/lib/mobile-api';
import { uiCopy } from '@/lib/ui-copy';
import type { AiAstrologerContent } from '@/lib/ai-astrologer';

export default function AiAstrologerScreen() {
  useUiLabels();
  const errorDialog = useSubmissionError();
  const { showError } = errorDialog;
  const [content, setContent] = useState<AiAstrologerContent | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setContent(null);
    void getAiAstrologerContent().then(result => {
      if (active) setContent(result);
    }).catch(() => {
      if (active) showError(uiCopy.externalLinkError);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [showError]));

  return <AppScreen>
    {errorDialog.dialog}
    <AppButton title={uiCopy.calculator.back} variant="secondary" onPress={() => router.navigate('/explore')} />
    {loading ? <AppPanel><View accessibilityRole="progressbar"><ActivityIndicator size="large" /></View></AppPanel>
      : <>
        {content?.help && <ContextualHelp help={content.help} />}
        {content?.externalUrl && <AppButton title={uiCopy.explore.ai} onPress={() => {
          void Linking.openURL(content.externalUrl!).catch(() => showError(uiCopy.externalLinkError));
        }} />}
      </>}
  </AppScreen>;
}
