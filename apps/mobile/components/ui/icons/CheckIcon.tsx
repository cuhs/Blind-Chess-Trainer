import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface CheckIconProps {
  size?: number;
  color?: string;
}

export function CheckIcon({ size = 24, color = colors.primary }: CheckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 13 4 4L19 7"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      />
    </Svg>
  );
}
