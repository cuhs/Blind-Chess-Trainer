import { StyleSheet, Text, View } from 'react-native';
import type { MoveReplayTurnFlags } from '@mindboard/chess-core';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface ReplayTurnNoticeProps {
  moveNumber: number;
  turnFlags: MoveReplayTurnFlags;
}

function noticeLines(turnFlags: MoveReplayTurnFlags): string[] {
  const lines: string[] = [];
  if (turnFlags.hadPeek) lines.push('You peeked at the board');
  if (turnFlags.hadIllegal) lines.push('You tried an illegal move');
  return lines;
}

export function ReplayTurnNotice({ moveNumber, turnFlags }: ReplayTurnNoticeProps) {
  const lines = noticeLines(turnFlags);
  const summary = lines.join('. ');

  return (
    <View
      accessibilityLabel={`Before move ${moveNumber}, ${summary}`}
      accessibilityRole="text"
      style={styles.wrap}
    >
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.title}>Before move {moveNumber}</Text>
      </View>
      {lines.map((line) => (
        <Text key={line} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.marginMobile,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  title: {
    ...typography.labelBold,
    color: colors.onErrorContainer,
    letterSpacing: 0,
  },
  line: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    paddingLeft: 10 + spacing.sm,
  },
});
