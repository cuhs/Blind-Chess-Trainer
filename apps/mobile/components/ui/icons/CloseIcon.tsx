import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface CloseIconProps {
  size?: number;
  color?: string;
}

export function CloseIcon({ size = 24, color = colors.error }: CloseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6 18 18M18 6 6 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      />
    </Svg>
  );
}
