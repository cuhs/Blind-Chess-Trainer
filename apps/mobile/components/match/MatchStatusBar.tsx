import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';

export type MatchStatusTone = 'neutral' | 'action' | 'alert' | 'success';

interface MatchStatusBarProps {
  elo: number;
  statusText: string;
  statusTone?: MatchStatusTone;
  loading?: boolean;
}

const TONE_COLORS: Record<MatchStatusTone, string> = {
  neutral: colors.onSurfaceVariant,
  action: colors.tertiary,
  alert: colors.error,
  success: colors.primary,
};

export function MatchStatusBar({
  elo,
  statusText,
  statusTone = 'neutral',
  loading = false,
}: MatchStatusBarProps) {
  const toneColor = TONE_COLORS[statusTone];

  return (
    <Card variant="recessed" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.opponentLabel}>VS ENGINE</Text>
        <Text style={styles.opponentElo}>~{elo} Elo</Text>
      </View>
      <View style={styles.statusRow}>
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Loading"
            color={toneColor}
            size="small"
          />
        ) : null}
        <Text
          accessibilityLabel={`Match status: ${statusText}`}
          numberOfLines={2}
          style={[styles.status, { color: toneColor }]}
        >
          {statusText}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  header: {
    gap: 2,
  },
  opponentLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  opponentElo: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 22,
  },
  status: {
    ...typography.labelBold,
    flex: 1,
    letterSpacing: 0,
  },
});
