import { View, StyleSheet } from 'react-native';
import { colors, radius, touch } from '@/theme';

interface ProgressBarProps {
  percent: number;
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: touch.progressBarHeight,
    backgroundColor: colors.recessedBg,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
  },
});
