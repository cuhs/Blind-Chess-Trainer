import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface ChevronLeftIconProps {
  size?: number;
  color?: string;
}

export function ChevronLeftIcon({
  size = 24,
  color = colors.outline,
}: ChevronLeftIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m15 6-6 6 6 6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
