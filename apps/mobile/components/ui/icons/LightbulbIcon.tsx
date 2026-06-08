import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface LightbulbIconProps {
  size?: number;
  color?: string;
}

export function LightbulbIcon({
  size = 20,
  color = colors.onSecondaryContainer,
}: LightbulbIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z"
        fill={color}
      />
      <Path
        d="M9 20h6M10 22h4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
