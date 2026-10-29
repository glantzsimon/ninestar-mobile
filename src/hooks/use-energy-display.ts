import { useSyncExternalStore } from 'react';
import { createEnergyDisplay } from '@/lib/energy-display';
import { session } from '@/lib/session';

const display = createEnergyDisplay();
let generation = session.getSnapshot().generation;
session.subscribe(() => {
  const next = session.getSnapshot().generation;
  if (next !== generation) { generation = next; display.reset(); }
});
// Presentation only, shared across own/calculator results for this session.
// No calculation request, account write or protected data persistence.
export function useEnergyDisplay() {
  const mode = useSyncExternalStore(display.subscribe, display.get, display.get);
  return { mode, setMode: display.set };
}
