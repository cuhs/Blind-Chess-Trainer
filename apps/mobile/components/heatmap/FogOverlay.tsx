import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';

interface FogOverlayProps {
  opacity: number;
}

export function FogOverlay({ opacity }: FogOverlayProps) {
  if (opacity <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.fog,
        {
          opacity,
          backgroundColor: colors.fogStone,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fog: {
    ...StyleSheet.absoluteFillObject,
  },
});
