import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

// Decorative navigation arrows, not a fabricated artwork-catalogue identifier
// or a representation of calculated favourable/unfavourable Ki directions.
export function DirectionologyIcon() {
  const theme = useTheme();
  return <Svg width="100%" height="100%" viewBox="0 0 72 72" accessible={false}>
    <Circle cx={36} cy={36} r={32} fill="none" stroke={theme.border} strokeWidth={1} />
    <Path d="M36 12V60 M12 36H60 M28 20L36 12L44 20 M28 52L36 60L44 52 M20 28L12 36L20 44 M52 28L60 36L52 44"
      fill="none" stroke={theme.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
