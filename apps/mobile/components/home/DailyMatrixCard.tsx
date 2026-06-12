import { Text, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';
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
    <Card style={styles.card}>
      <Text style={styles.title}>Today&apos;s Matrix: {puzzleCount} Positions</Text>
      {loopBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{loopBadge}</Text>
        </View>
      ) : null}
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
  card: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.bodyMd,
    color: colors.contrastInk,
  },
});
