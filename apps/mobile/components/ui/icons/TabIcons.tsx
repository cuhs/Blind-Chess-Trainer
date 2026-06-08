import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

interface TabIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export function HomeTabIcon({
  size = 24,
  color = colors.outline,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function TrainingTabIcon({
  size = 24,
  color = colors.outline,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c-1.5 2.5-4 4.5-4 7.5a4 4 0 0 0 8 0c0-3-2.5-5-4-7.5Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Path
        d="M8 14.5c0 2.2 1.8 4 4 4s4-1.8 4-4"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
      <Path
        d="M9 10.5h1.5M13.5 10.5H15"
        stroke={filled ? colors.background : color}
        strokeLinecap="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function MatchTabIcon({
  size = 24,
  color = colors.outline,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.8}
      />
      <Path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function SettingsTabIcon({
  size = 24,
  color = colors.outline,
  filled = false,
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={12}
        r={3}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}
