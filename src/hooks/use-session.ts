import { useSyncExternalStore } from 'react';
import { session } from '@/lib/session';

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
}
