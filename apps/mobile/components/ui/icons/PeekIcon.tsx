import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

interface PeekIconProps {
  size?: number;
  color?: string;
}

export function PeekIcon({
  size = 18,
  color = colors.tertiary,
}: PeekIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx="12" cy="12" r="3" fill={color} />
    </Svg>
  );
}
