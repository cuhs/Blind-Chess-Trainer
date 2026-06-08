import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { FireIcon } from '@/components/ui/icons/FireIcon';

interface HabitHeaderProps {
  streakDays: number;
  boardMappedPercent: number;
}

export function HabitHeader({ streakDays, boardMappedPercent }: HabitHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <FireIcon />
        <Text style={styles.value}>{streakDays}</Text>
        <Text style={styles.label}>Day Streak</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.value}>{boardMappedPercent}%</Text>
        <Text style={styles.label}>Board Mapped</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
