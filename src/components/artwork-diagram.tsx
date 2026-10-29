import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ArtworkImage } from '@/components/artwork-image';
import { LayoutSpacing } from '@/constants/theme';
import { useArtwork } from '@/hooks/use-artwork';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveArtwork } from '@/lib/artwork-catalogue';

// Shared responsive figure; catalogue variants/cache remain owned by ArtworkImage.
export function ArtworkDiagram({ artworkId }: { artworkId: string }) {
  const catalogue = useArtwork(), scheme = useColorScheme();
  const source = resolveArtwork(catalogue, artworkId, scheme === 'dark');
  const [failed, setFailed] = useState('');
  if (!source || failed === source.uri) return null;
  return <ArtworkImage artworkId={artworkId} contentFit="contain" accessible={false}
    onError={() => setFailed(source.uri)} style={[styles.figure, { aspectRatio: source.width / source.height }]} />;
}
const styles = StyleSheet.create({ figure: { width: '100%', maxWidth: 440, alignSelf: 'center', marginBottom: LayoutSpacing.figureBottom } });
