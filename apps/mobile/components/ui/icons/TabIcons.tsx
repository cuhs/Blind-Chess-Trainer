import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '@/theme';

interface TabIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export function HomeTabIcon({
  size = 24,
  color = colors.onSurfaceVariant,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={4}
        width={7}
        height={7}
        rx={1.5}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect
        x={13}
        y={4}
        width={7}
        height={7}
        rx={1.5}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect
        x={4}
        y={13}
        width={7}
        height={7}
        rx={1.5}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect
        x={13}
        y={13}
        width={7}
        height={7}
        rx={1.5}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function DrillsTabIcon({
  size = 24,
  color = colors.onSurfaceVariant,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4h12a1 1 0 0 1 1 1v14l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Path
        d="M9 8h6M9 12h4"
        stroke={filled ? colors.background : color}
        strokeLinecap="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function HistoryTabIcon({
  size = 24,
  color = colors.onSurfaceVariant,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3a9 9 0 1 0 9 9"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
      <Path
        d="M12 7v5l3 2"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      {filled ? (
        <Path d="M21 3v4h-4" stroke={color} strokeLinecap="round" strokeWidth={1.8} />
      ) : null}
    </Svg>
  );
}
