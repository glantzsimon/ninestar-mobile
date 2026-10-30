import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { ArtworkImage } from '@/components/artwork-image';
import { ReadingContent } from '@/components/reading-content';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { AppPanel } from '@/components/ui/app-panel';
import { BrandFonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { squareArrowGeometry, type MagicSquare as Square, type SquareArrow } from '@/lib/magic-squares';

function Arrow({ arrow }: { arrow: SquareArrow }) {
  const geometry = squareArrowGeometry(arrow.direction);
  return geometry.ring ? <Circle cx={50} cy={50} r={48} stroke={arrow.color} strokeWidth={1.5} fill="none" />
    : <><Line x1={50} y1={50} x2={geometry.endX} y2={geometry.endY} stroke={arrow.color} strokeWidth={1.1} />
      <Polygon points={geometry.points} fill={arrow.color} /></>;
}

// Server coordinates/flags are presentation data; no Ki or direction calculation.
export function MagicSquare({ square, compact = false, arrows = false }: { square: Square; compact?: boolean; arrows?: boolean }) {
  const theme = useTheme();
  const shownArrows = arrows && square.showDirections ? square.arrows : [];
  return <View style={[styles.board, compact && styles.compact]}
    accessible={!compact} accessibilityRole={compact ? undefined : 'image'}
    accessibilityLabel={compact ? undefined : [square.title, square.houseName,
      square.cells.map(cell => cell.number).join(', '),
      ...shownArrows.map(arrow => `${arrow.title}: ${arrow.direction.label}`)].filter(Boolean).join('. ')}>
    {square.artworkId && <ArtworkImage artworkId={square.artworkId}
      style={[StyleSheet.absoluteFill, styles.plateArtwork]}
      contentFit="contain" accessible={false} />}
    <Svg viewBox="0 0 100 100" width="100%" height="100%" accessible={false}>
      <Rect x={0.5} y={0.5} width={99} height={99} fill="none" stroke={theme.border} strokeWidth={0.4} />
      {[1, 2].map(index => <Line key={`h${index}`} x1={0} y1={index * 100 / 3} x2={100} y2={index * 100 / 3} stroke={theme.border} strokeWidth={0.3} />)}
      {[1, 2].map(index => <Line key={`v${index}`} x1={index * 100 / 3} y1={0} x2={index * 100 / 3} y2={100} stroke={theme.border} strokeWidth={0.3} />)}
      {square.cells.map(cell => <Rect key={`active:${cell.row}:${cell.column}`}
        x={cell.column * 100 / 3 + 1} y={cell.row * 100 / 3 + 1} width={100 / 3 - 2} height={100 / 3 - 2}
        fill={cell.isActive ? theme.backgroundSelected : 'none'} fillOpacity={0.65}
        stroke={cell.isActive || cell.isLunarActive ? theme.primary : 'none'}
        strokeWidth={cell.isActive ? 1.4 : 0.8} strokeDasharray={cell.isLunarActive ? '2 1' : undefined} />)}
      {square.cells.map(cell => <SvgText key={`number:${cell.row}:${cell.column}`}
        x={(cell.column + 0.5) * 100 / 3} y={(cell.row + 0.5) * 100 / 3}
        textAnchor="middle" alignmentBaseline="central" fontFamily={BrandFonts.bold} fontSize={18} fill={cell.color}>{cell.number}</SvgText>)}
    </Svg>
    {!!shownArrows.length && <Svg pointerEvents="none" viewBox="0 0 100 100" width="116%" height="116%"
      style={styles.arrowArtwork} accessible={false}>
      {shownArrows.map((arrow, index) => <Arrow key={`${arrow.key}:${index}`} arrow={arrow} />)}
    </Svg>}
  </View>;
}

export function MagicSquareReading({ square, arrows = false }: { square: Square; arrows?: boolean }) {
  return <AppPanel title={square.title}>
    {!!square.houseName && <ThemedText type="smallBold">{square.houseName}</ThemedText>}
    {!!square.secondaryHouseName && square.isDualView && <ThemedText type="smallBold">{square.secondaryHouseName}</ThemedText>}
    <MagicSquare square={square} arrows={arrows} />
    {arrows && square.showDirections && square.arrows.map((arrow, index) => <AppDisclosure key={`${arrow.key}:${index}`} title={arrow.title}>
      <ThemedText type="smallBold">{arrow.direction.label}</ThemedText>
      <ReadingContent blocks={arrow.blocks} />
    </AppDisclosure>)}
    {square.isSplit && square.secondary && <>
      {!!square.secondaryHouseName && <ThemedText type="smallBold">{square.secondaryHouseName}</ThemedText>}
      <MagicSquare square={square.secondary} arrows={arrows} />
      {arrows && square.secondary.showDirections && square.secondary.arrows.map((arrow, index) => <AppDisclosure key={`secondary:${arrow.key}:${index}`} title={arrow.title}>
        <ThemedText type="smallBold">{arrow.direction.label}</ThemedText>
        <ReadingContent blocks={arrow.blocks} />
      </AppDisclosure>)}
    </>}
  </AppPanel>;
}
const styles = StyleSheet.create({
  board: { width: '100%', maxWidth: 320, aspectRatio: 1, alignSelf: 'center', marginVertical: Spacing.two },
  compact: { maxWidth: undefined, marginVertical: 0 },
  plateArtwork: { transform: [{ scale: 1.13 }] },
  arrowArtwork: { position: 'absolute', left: '-8%', top: '-8%' },
});
