import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReplayStepKind } from '@mindboard/chess-core';
import type { Square } from '@mindboard/shared';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface ReplayTurnNoticeProps {
  stepKind: Extract<ReplayStepKind, 'peek' | 'illegal_attempt'>;
  title: string;
  weaknessSquares: Square[];
  onShowClearBoard: () => void;
}

function weaknessSummary(
  stepKind: ReplayTurnNoticeProps['stepKind'],
  squares: Square[],
): string | null {
  if (squares.length === 0) return null;
  const prefix = stepKind === 'peek' ? 'Peeked square' : 'Weak spot';
  if (squares.length === 1) return `${prefix}: ${squares[0]}`;
  return `${prefix}s: ${squares.join(', ')}`;
}

export function ReplayTurnNotice({
  stepKind,
  title,
  weaknessSquares,
  onShowClearBoard,
}: ReplayTurnNoticeProps) {
  const line =
    stepKind === 'peek'
      ? 'You peeked at the board here'
      : 'You tried an illegal move here';
  const weakness = weaknessSummary(stepKind, weaknessSquares);
  const summary = [line, weakness, title].filter(Boolean).join('. ');

  return (
    <View
      accessibilityLabel={`Mental map broke. ${summary}`}
      accessibilityRole="text"
      style={styles.wrap}
    >
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.title}>Here&apos;s where your mental map broke</Text>
      </View>
      <Text style={styles.line}>{line}</Text>
      {weakness ? <Text style={styles.weakness}>{weakness}</Text> : null}
      {stepKind === 'illegal_attempt' ? (
        <Text style={styles.detail}>{title}</Text>
      ) : null}
      <Pressable
        accessibilityLabel="Show clear board"
        accessibilityRole="button"
        onPress={onShowClearBoard}
        style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
      >
        <Text style={styles.clearButtonText}>Show clear board</Text>
      </Pressable>
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
    flex: 1,
  },
  line: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    paddingLeft: 10 + spacing.sm,
  },
  weakness: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    fontFamily: typography.labelBold.fontFamily,
    paddingLeft: 10 + spacing.sm,
  },
  detail: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    paddingLeft: 10 + spacing.sm,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginLeft: 10 + spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.onErrorContainer,
  },
  pressed: {
    opacity: 0.7,
  },
  clearButtonText: {
    ...typography.labelBold,
    color: colors.onErrorContainer,
    letterSpacing: 0,
  },
});
