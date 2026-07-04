import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';
import { PeekChip } from '@/components/ui/PeekChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface DailyMatrixCardProps {
  puzzleCount: number;
  loopBadge: string | null;
  completedToday?: boolean;
  onPress: () => void;
}

export function DailyMatrixCard({
  puzzleCount,
  loopBadge,
  completedToday = false,
  onPress,
}: DailyMatrixCardProps) {
  const buttonLabel = completedToday ? 'Completed Today' : 'Start Training';

  return (
    <Card>
      <Text style={styles.title}>Today&apos;s Matrix: {puzzleCount} Positions</Text>
      {loopBadge ? <PeekChip label={loopBadge} variant="loop" /> : null}
      <PrimaryButton
        accessibilityLabel={buttonLabel}
        disabled={completedToday}
        label={buttonLabel}
        onPress={onPress}
        uppercase={false}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
});
