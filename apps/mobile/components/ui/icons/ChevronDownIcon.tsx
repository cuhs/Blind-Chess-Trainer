import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface ChevronDownIconProps {
  size?: number;
  color?: string;
}

export function ChevronDownIcon({
  size = 24,
  color = colors.primary,
}: ChevronDownIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m6 9 6 6 6-6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
