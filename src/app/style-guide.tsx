import { useUiLabels } from '@/hooks/use-ui-labels';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppDateTimeField } from '@/components/ui/app-date-time-field';
import { AppPanel } from '@/components/ui/app-panel';
import { AppScreen } from '@/components/ui/app-screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSubmissionError } from '@/hooks/use-submission-error';
import { uiCopy } from '@/lib/ui-copy';

const copy = {
  title: 'Style Guide',
  introduction: 'The NineStar visual language, shared across every screen.',
  palette: 'Colours',
  typography: 'Typography',
  controls: 'Forms and Actions',
  feedback: 'Feedback',
  display: 'Understanding Your Energy',
  heading: 'A Natural Rhythm',
  body: 'Space to reflect, understand your patterns and move through life with greater awareness.',
  caption: 'Candara · comfortable reading · a calmer pace',
  name: 'Your name',
  placeholder: 'Enter your name',
  primary: 'Primary action',
  secondary: 'Secondary action',
  disabled: 'Unavailable action',
  selected: 'Action selected. The shared button is working.',
  ready: 'Ready when you are.',
  success: 'Your changes have been saved.',
  error: 'We could not complete that request. Please try again.',
};

export default function StyleGuideScreen() {
  useUiLabels();
  const submissionError = useSubmissionError();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState(copy.ready);
  const swatches = [
    { label: 'Primary', color: theme.primary },
    { label: 'Heading', color: theme.heading },
    { label: 'Teal', color: theme.accent },
    { label: 'Panel', color: theme.backgroundElement },
  ];

  return (
    <AppScreen>
      {submissionError.dialog}
      <View style={styles.intro}>
        <ThemedText type="title" accessibilityRole="header">{copy.title}</ThemedText>
        <ThemedText themeColor="textSecondary">{copy.introduction}</ThemedText>
      </View>
      <AppPanel title={copy.palette}>
        <View style={styles.swatches}>
          {swatches.map(({ label, color }) => (
            <View key={label} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: color, borderColor: theme.border }]} />
              <ThemedText type="smallBold">{label}</ThemedText>
              <ThemedText type="code" themeColor="textSecondary">{color}</ThemedText>
            </View>
          ))}
        </View>
      </AppPanel>
      <AppPanel title={copy.typography}>
        <ThemedText type="title">{copy.display}</ThemedText>
        <ThemedText type="subtitle">{copy.heading}</ThemedText>
        <ThemedText>{copy.body}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{copy.caption}</ThemedText>
      </AppPanel>
      <AppPanel title={copy.controls}>
        <AppInput label={copy.name} placeholder={copy.placeholder} value={name} onChangeText={setName} />
        <AppDateTimeField label={uiCopy.calculator.selectedDate} mode="date" value={date} onChange={setDate} allowClear />
        <AppDateTimeField label={uiCopy.calculator.selectedTime} mode="time" value={time} onChange={setTime} allowClear />
        <AppButton title={copy.primary} onPress={() => setStatus(copy.selected)} />
        <AppButton title={copy.secondary} variant="secondary" onPress={() => setStatus(copy.ready)} />
        <AppButton title={copy.disabled} disabled />
        <ThemedText type="small" accessibilityLiveRegion="polite">{status}</ThemedText>
      </AppPanel>
      <AppPanel title={copy.feedback}>
        <AppButton title={uiCopy.feedback.previewError} variant="secondary" onPress={() => submissionError.showError(copy.error)} />
        <View style={[styles.feedback, { backgroundColor: theme.successBackground }]}>
          <ThemedText type="small" themeColor="success">{copy.success}</ThemedText>
        </View>
        <View style={[styles.feedback, { backgroundColor: theme.errorBackground }]}>
          <ThemedText type="small" themeColor="error">{copy.error}</ThemedText>
        </View>
      </AppPanel>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.two },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  swatchItem: { width: '44%', gap: Spacing.one },
  swatch: { height: 48, borderRadius: Radius.control, borderWidth: 1 },
  feedback: { borderRadius: Radius.control, padding: Spacing.three },
});
