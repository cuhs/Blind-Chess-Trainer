import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface EyeOffIconProps {
  size?: number;
  color?: string;
}

/** Slashed eye — pairs with PeekIcon; toggles full board cover (no grid or coordinates). */
export function EyeOffIcon({
  size = 22,
  color = colors.onSecondaryContainer,
}: EyeOffIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-4.1 5.2M6.1 6.1A18.5 18.5 0 0 0 2 12s3.5 7 10 7a10.2 10.2 0 0 0 4.9-1.3"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
