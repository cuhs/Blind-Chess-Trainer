import { View, StyleSheet } from 'react-native';
import { spacing } from '@/theme';
import { StatCard } from '@/components/ui/StatCard';
import { BoltIcon } from '@/components/ui/icons/BoltIcon';

interface HabitHeaderProps {
  streakDays: number;
  boardMappedPercent: number;
}

export function HabitHeader({ streakDays, boardMappedPercent }: HabitHeaderProps) {
  return (
    <View style={styles.row}>
      <StatCard
        accessibilityLabel={`${streakDays} day streak`}
        label="Day Streak"
        leading={<BoltIcon size={22} />}
        value={`${streakDays}`}
      />
      <StatCard
        accessibilityLabel={`${boardMappedPercent} percent board mapped`}
        label="Board Mapped"
        value={`${boardMappedPercent}%`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
