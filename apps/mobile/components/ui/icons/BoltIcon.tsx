import Svg, { Path } from 'react-native-svg';

interface BoltIconProps {
  size?: number;
  color?: string;
}

const ORANGE = '#f97316';

export function BoltIcon({ size = 24, color = ORANGE }: BoltIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08 1.15-2.57 1.12-2.53 2.2-4.97 2.2-4.97.1-.22.32-.4.57-.4h3.12c.45 0 .67.36.62.8l-1.12 7h3.38c.45 0 .67.36.62.8l-1 7c-.05.44-.37.8-.82.8Z" />
    </Svg>
  );
}
