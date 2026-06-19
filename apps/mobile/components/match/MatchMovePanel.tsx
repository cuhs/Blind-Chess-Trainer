import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { DevMoveInput } from './DevMoveInput';

interface MatchMovePanelProps {
  lastEngineMove: string | null;
  lastPlayerMove: string | null;
  isThinking: boolean;
  inputDisabled: boolean;
  error: string | null;
  onSubmit: (move: string) => void;
  onClearError: () => void;
}

function MoveRow({
  label,
  move,
  pending = false,
}: {
  label: string;
  move: string | null;
  pending?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.sideLabel}>{label}</Text>
      <Text
        accessibilityLabel={`${label} move ${pending ? 'pending' : move ?? 'none'}`}
        style={[styles.rowMove, pending && styles.rowMovePending]}
      >
        {pending ? '…' : move ?? '—'}
      </Text>
    </View>
  );
}

export function MatchMovePanel({
  lastEngineMove,
  lastPlayerMove,
  isThinking,
  inputDisabled,
  error,
  onSubmit,
  onClearError,
}: MatchMovePanelProps) {
  const showEngineRow = lastEngineMove !== null || isThinking;
  const showInput = !inputDisabled;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Move exchange</Text>
      <View style={styles.stack}>
        {showEngineRow ? (
          <MoveRow
            label="Engine"
            move={lastEngineMove}
            pending={isThinking}
          />
        ) : null}
        <View style={styles.inputRow}>
          <Text style={styles.inputSideLabel}>You</Text>
          {showInput ? (
            <View style={styles.inputSlot}>
              <DevMoveInput
                disabled={inputDisabled}
                error={error}
                onClearError={onClearError}
                onSubmit={onSubmit}
                variant="embedded"
              />
            </View>
          ) : (
            <Text
              accessibilityLabel={`Your move ${lastPlayerMove ?? 'none'}`}
              style={styles.rowMove}
            >
              {lastPlayerMove ?? '—'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.recessedBg,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heading: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stack: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  sideLabel: {
    ...typography.labelBold,
    color: colors.outline,
    width: 56,
  },
  inputSideLabel: {
    ...typography.labelBold,
    color: colors.outline,
    width: 56,
    lineHeight: 48,
  },
  rowMove: {
    ...typography.headlineMd,
    color: colors.onSurface,
    flex: 1,
  },
  rowMovePending: {
    color: colors.onSurfaceVariant,
  },
  inputSlot: {
    flex: 1,
  },
});
