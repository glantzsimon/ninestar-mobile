import { mobileApiRequest } from './mobile-api';
import { session } from './session';
import { uiLabelStore } from './ui-labels';

let pending: Promise<void> | null = null;
let pendingGeneration = -1;
export function refreshUiLabels(): Promise<void> {
  const generation = session.getSnapshot().generation;
  if (pending && pendingGeneration === generation) return pending;
  pendingGeneration = generation;
  pending = mobileApiRequest('metadata/labels').then(({ data }) => {
    if (generation === session.getSnapshot().generation) uiLabelStore.accept(data);
  }).catch(() => { /* Approved bootstrap/last-good labels remain usable offline. */ })
    .finally(() => { if (pendingGeneration === generation) pending = null; });
  return pending;
}
