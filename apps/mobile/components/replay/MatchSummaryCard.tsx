import { Pressable, Text, StyleSheet } from 'react-native';
import type { MatchRecord } from '@mindboard/shared';
import { countMatchMoves, countMatchPeeks } from '@mindboard/chess-core';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';
import {
  formatMatchDate,
  formatMatchResult,
  formatPlayerColor,
} from '@/lib/matchHistory';

interface MatchSummaryCardProps {
  record: MatchRecord;
  onPress: () => void;
}

export function MatchSummaryCard({ record, onPress }: MatchSummaryCardProps) {
  const moves = countMatchMoves(record);
  const peeks = countMatchPeeks(record);
  const result = formatMatchResult(record);

  return (
    <Pressable
      accessibilityLabel={`Replay match from ${formatMatchDate(record.finishedAt)}, ${result}, ${moves} moves, ${peeks} peeks`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <Card style={styles.card}>
        <Text style={styles.date}>{formatMatchDate(record.finishedAt)}</Text>
        <Text style={styles.meta}>
          {result} · {formatPlayerColor(record.playerColor)} · Elo {record.engineElo}
        </Text>
        <Text style={styles.stats}>
          {moves} moves · {peeks} peeks
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  date: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  meta: {
    ...typography.bodyMd,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  stats: {
    ...typography.labelBold,
    color: colors.outline,
    marginTop: spacing.xs,
  },
});
