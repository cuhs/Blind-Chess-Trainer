import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface MicIconProps {
  size?: number;
  color?: string;
}

export function MicIcon({
  size = 24,
  color = colors.onSecondaryContainer,
}: MicIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        fill={color}
      />
      <Path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
