import { File, Paths } from 'expo-file-system';
import type { ArtworkCache } from './artwork-catalogue';

function file(environment: string) {
  return new File(Paths.cache, `artwork-${encodeURIComponent(environment)}.json`);
}
export const artworkStorage = {
  async read(environment: string): Promise<unknown> {
    const entry = file(environment);
    return entry.exists ? JSON.parse(await entry.text()) : null;
  },
  async write(environment: string, cache: ArtworkCache) {
    file(environment).write(JSON.stringify(cache));
  },
};
