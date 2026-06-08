import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface FireIconProps {
  size?: number;
  color?: string;
}

export function FireIcon({
  size = 24,
  color = colors.error,
}: FireIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1.5-3.5-2-5 2 1.5 4 3.5 4 7a6 6 0 0 1-12 0C6 9 10 7 12 2z"
        fill={color}
      />
      <Path
        d="M12 14a2 2 0 0 0-2 2c0 1.5 1.5 2 2 2s2-.5 2-2a2 2 0 0 0-2-2z"
        fill={colors.secondaryContainer}
      />
    </Svg>
  );
}
