import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

interface SettingsIconProps {
  size?: number;
  color?: string;
}

export function SettingsIcon({
  size = 24,
  color = colors.onSurfaceVariant,
}: SettingsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}
