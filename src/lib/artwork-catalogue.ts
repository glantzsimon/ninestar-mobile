import { LegacyUiArtwork } from '../constants/feature-artwork';

export type ArtworkVariant = { url: string; revision: string; contentType: string; width: number; height: number };
export type ArtworkCatalogue = { version: string; assets: Record<string, { group: string; variants: Record<string, ArtworkVariant> }> };
export type ArtworkCache = { catalogue: ArtworkCatalogue; etag?: string; checkedAt: number };
type Storage = { read: (environment: string) => Promise<unknown>; write: (environment: string, cache: ArtworkCache) => Promise<void> };

export function parseArtwork(value: unknown): ArtworkCatalogue {
  const data = value as ArtworkCatalogue;
  if (!data || typeof data.version !== 'string' || !/^[a-f0-9]{64}$/i.test(data.version)
    || !data.assets || typeof data.assets !== 'object' || Array.isArray(data.assets)) throw new Error('invalid_artwork');
  for (const asset of Object.values(data.assets)) {
    if (!asset || typeof asset.group !== 'string' || !asset.variants || typeof asset.variants !== 'object') throw new Error('invalid_artwork');
    for (const variant of Object.values(asset.variants)) {
      if (!variant || typeof variant.url !== 'string' || !/^https?:\/\//.test(variant.url)
        || typeof variant.revision !== 'string' || !/^[a-f0-9]{64}$/i.test(variant.revision)
        || typeof variant.contentType !== 'string' || !variant.contentType.startsWith('image/')
        || !Number.isFinite(variant.width) || variant.width <= 0 || !Number.isFinite(variant.height) || variant.height <= 0) throw new Error('invalid_artwork');
    }
  }
  return data;
}

export function resolveArtwork(catalogue: ArtworkCatalogue | null, id: string | undefined, dark: boolean) {
  for (const candidate of id ? [id, ...(LegacyUiArtwork[id] ?? [])] : []) {
    const variants = catalogue?.assets[candidate]?.variants;
    // UI medallions use the supplied transparent default in both themes.
    // Existing non-UI diagrams retain their authored dark/default selection.
    const variant = candidate.startsWith('ui.') ? variants?.default
      : (dark ? variants?.dark : undefined) ?? variants?.default;
    if (variant) return { uri: variant.url, cacheKey: variant.url, width: variant.width, height: variant.height };
  }
  return undefined;
}

export function createArtworkClient({ storage, fetcher = fetch, now = Date.now, timeoutMs = 15000 }: {
  storage: Storage; fetcher?: typeof fetch; now?: () => number; timeoutMs?: number;
}) {
  const caches = new Map<string, ArtworkCache>();
  const pending = new Map<string, Promise<ArtworkCatalogue | null>>();
  const listeners = new Set<() => void>();
  const loaded = new Set<string>();
  const retryAfter = new Map<string, number>();
  function notify() { listeners.forEach((listener) => listener()); }
  async function refresh(environment: string, force = false): Promise<ArtworkCatalogue | null> {
    if (pending.has(environment)) return pending.get(environment)!;
    const work = (async () => {
      if (!loaded.has(environment)) {
        loaded.add(environment);
        try {
          const saved = await storage.read(environment) as ArtworkCache;
          if (saved && Number.isFinite(saved.checkedAt)) {
            caches.set(environment, { catalogue: parseArtwork(saved.catalogue), checkedAt: saved.checkedAt,
              etag: typeof saved.etag === 'string' ? saved.etag : undefined }); notify();
          }
        } catch { /* Corrupt/evicted storage is a cold start. */ }
      }
      const cached = caches.get(environment);
      if (!force && ((cached && now() - cached.checkedAt < 300000 && now() >= cached.checkedAt)
        || now() < (retryAfter.get(environment) ?? 0))) return cached?.catalogue ?? null;
      try {
        async function request(conditional: boolean) {
          const controller = new AbortController();
          let timer: ReturnType<typeof setTimeout> | undefined;
          const deadline = new Promise<never>((_, reject) => {
            timer = setTimeout(() => { reject(new Error('request_timeout')); controller.abort(); }, timeoutMs);
          });
          try {
            return await Promise.race([deadline, (async () => {
              const headers: Record<string, string> = { Accept: 'application/json' };
              if (conditional && cached?.etag) headers['If-None-Match'] = cached.etag;
              const response = await fetcher(`${environment}/metadata/artwork`, {
                headers, signal: controller.signal, credentials: 'omit', cache: 'no-store',
              });
              if (response.status === 304) return { response, catalogue: cached?.catalogue };
              if (response.status !== 200) throw new Error('artwork_unavailable');
              const body = await response.json();
              if (body.success !== true) throw new Error('artwork_unavailable');
              return { response, catalogue: parseArtwork(body.data) };
            })()]);
          } finally { clearTimeout(timer); }
        }
        let result = await request(!!cached);
        if (result.response.status === 304 && !result.catalogue) result = await request(false);
        if (!result.catalogue) throw new Error('artwork_cache_missing');
        const next: ArtworkCache = { catalogue: result.catalogue, checkedAt: now(),
          etag: result.response.headers.get('ETag') ?? (result.response.status === 304 ? cached?.etag : undefined) };
        caches.set(environment, next); retryAfter.delete(environment); notify();
        try { await storage.write(environment, next); } catch { /* Memory survives disk failure. */ }
        return next.catalogue;
      } catch {
        retryAfter.set(environment, now() + 30000);
        return cached?.catalogue ?? null;
      }
    })();
    pending.set(environment, work);
    try { return await work; } finally { pending.delete(environment); }
  }
  return { refresh, get: (environment: string) => caches.get(environment)?.catalogue ?? null,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; } };
}
