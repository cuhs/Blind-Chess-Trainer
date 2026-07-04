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

  return (
    <View
      accessibilityLabel={`Mental map broke. ${line}`}
      accessibilityRole="text"
      style={styles.wrap}
    >
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.title}>Here&apos;s where your mental map broke</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.errorContainer,
    backgroundColor: colors.errorContainer,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    backgroundColor: colors.error,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.labelBold,
    color: colors.onErrorContainer,
    letterSpacing: 0,
  },
  line: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
  },
  weakness: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    fontFamily: typography.labelBold.fontFamily,
  },
  detail: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    minHeight: touch.min,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
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
