import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';

export type MatchStatusTone = 'neutral' | 'action' | 'alert' | 'success';

interface MatchStatusBarProps {
  elo: number;
  statusText: string;
  statusTone?: MatchStatusTone;
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
}: MatchStatusBarProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.opponentLabel}>VS ENGINE</Text>
        <Text style={styles.opponentElo}>~{elo} Elo</Text>
      </View>
      <Text
        accessibilityLabel={`Match status: ${statusText}`}
        numberOfLines={1}
        style={[styles.status, { color: TONE_COLORS[statusTone] }]}
      >
        {statusText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
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
    letterSpacing: 1,
  },
  opponentElo: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  status: {
    ...typography.labelBold,
    minHeight: 18,
  },
});
