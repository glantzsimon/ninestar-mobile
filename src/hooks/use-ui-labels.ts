import { useSyncExternalStore } from 'react';
import { uiLabelStore } from '@/lib/ui-labels';

// Refresh text in place; never remount a form or replace its draft to change labels.
export function useUiLabels() {
  useSyncExternalStore(uiLabelStore.subscribe, uiLabelStore.getSnapshot, uiLabelStore.getSnapshot);
  return uiLabelStore.getCatalogue();
}
