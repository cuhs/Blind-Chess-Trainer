import Svg, { Rect } from 'react-native-svg';
import { colors } from '@/theme';

interface PauseIconProps {
  size?: number;
  color?: string;
}

export function PauseIcon({
  size = 24,
  color = colors.onSecondaryContainer,
}: PauseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="5" width="4" height="14" rx="1" fill={color} />
      <Rect x="14" y="5" width="4" height="14" rx="1" fill={color} />
    </Svg>
  );
}
