import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { BoltIcon } from '@/components/ui/icons/BoltIcon';

interface HabitHeaderProps {
  streakDays: number;
  boardMappedPercent: number;
}

export function HabitHeader({ streakDays, boardMappedPercent }: HabitHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <View style={styles.streakValue}>
          <BoltIcon size={28} />
          <Text style={styles.value}>{streakDays}</Text>
        </View>
        <Text style={styles.label}>Day Streak</Text>
      </View>
      <View style={styles.stat}>
        <Text style={[styles.value, styles.mappedValue]}>{boardMappedPercent}%</Text>
        <Text style={styles.label}>Board Mapped</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
  },
  mappedValue: {
    color: colors.primary,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
