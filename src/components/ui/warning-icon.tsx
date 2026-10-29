import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

export function WarningIcon({ size = 24 }: { size?: number }) {
  const theme = useTheme();
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path d="M12 3 22 21H2Z" fill="none" stroke={theme.error} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M12 9v5" stroke={theme.error} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={12} cy={17.5} r={1} fill={theme.error} />
  </Svg>;
}
