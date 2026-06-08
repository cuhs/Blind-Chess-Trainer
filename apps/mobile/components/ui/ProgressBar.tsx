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
      <View style={[styles.fill, { width: `${clamped}%` }]}>
        {clamped > 0 ? <View style={styles.shine} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: touch.progressBarHeight,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 2,
    left: '10%',
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.full,
  },
});
