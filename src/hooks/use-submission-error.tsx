import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Keyboard } from 'react-native';
import { AppErrorDialog } from '@/components/ui/app-error-dialog';
import { useSession } from '@/hooks/use-session';
import { session } from '@/lib/session';

// Screen-owned feedback: no stale alerts leaking across navigation/accounts.
export function useSubmissionError() {
  const { generation } = useSession();
  const [issue, setIssue] = useState<{ message: string; generation: number } | null>(null);
  const focused = useRef(false);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    return () => { focused.current = false; setIssue(null); };
  }, []));
  const dismiss = useCallback(() => setIssue(null), []);
  const showError = useCallback((message: string) => {
    if (!focused.current || !message) return;
    Keyboard.dismiss();
    setIssue({ message, generation: session.getSnapshot().generation });
  }, []);
  return { showError, dismiss, dialog: issue && issue.generation === generation
    ? <AppErrorDialog message={issue.message} onClose={dismiss} /> : null };
}
