import { useSyncExternalStore } from 'react';
import { artworkEnvironment, artworkStore } from '@/lib/artwork-store';

export function useArtwork() {
  return useSyncExternalStore(artworkStore.subscribe,
    () => artworkStore.get(artworkEnvironment), () => null);
}
