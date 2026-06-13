import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

interface BlindfoldIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

/** Slashed eye — blindfold match (not voice). Shared by home card + Match tab. */
export function BlindfoldIcon({
  size = 24,
  color = colors.outline,
  filled = false,
}: BlindfoldIconProps) {
  const detailColor = filled ? colors.background : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12s4.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-4.2 6.5-9.5 6.5S2.5 12 2.5 12Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Circle cx={12} cy={12} r={1.8} fill={detailColor} />
      <Path
        d="M5 5l14 14"
        stroke={detailColor}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}
