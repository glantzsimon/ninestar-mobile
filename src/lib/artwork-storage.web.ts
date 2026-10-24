import type { ArtworkCache } from './artwork-catalogue';

export const artworkStorage = {
  async read(environment: string): Promise<unknown> {
    const saved = localStorage.getItem(`artwork:${environment}`);
    return saved ? JSON.parse(saved) : null;
  },
  async write(environment: string, cache: ArtworkCache) {
    localStorage.setItem(`artwork:${environment}`, JSON.stringify(cache));
  },
};
