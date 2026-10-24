import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { useArtwork } from '@/hooks/use-artwork';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveArtwork } from '@/lib/artwork-catalogue';

export function ArtworkImage({ artworkId, legacyUrl, fallback, ...props }: Omit<ImageProps, 'source'> & {
  artworkId?: string; legacyUrl?: string; fallback?: ImageProps['source'];
}) {
  const catalogue = useArtwork();
  const theme = useColorScheme();
  const source = resolveArtwork(catalogue, artworkId, theme === 'dark');
  const [failed, setFailed] = useState<string[]>([]);
  const uri = source && !failed.includes(source.uri) ? source.uri
    : legacyUrl && !failed.includes(legacyUrl) ? legacyUrl : undefined;
  return <Image {...props} source={uri ? { uri, cacheKey: uri } : fallback}
    recyclingKey={uri ?? artworkId ?? legacyUrl ?? 'fallback'} cachePolicy="memory-disk"
    onError={(event) => { if (uri) setFailed((previous) => [...previous, uri]); props.onError?.(event); }} />;
}
