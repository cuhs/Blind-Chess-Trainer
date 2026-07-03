import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { MatchMoveInput } from './MatchMoveInput';
import type { ListeningSource, MatchSpeechStatus } from '@/hooks/useMatchSpeech';

interface MatchMovePanelProps {
  lastEngineMove: string | null;
  lastPlayerMove: string | null;
  waitingForEngine: boolean;
  isSubmittingMove: boolean;
  showMoveInput: boolean;
  inputDisabled: boolean;
  moveDraft: string;
  onMoveDraftChange: (value: string) => void;
  moveError: string | null;
  onSubmit: (move: string) => void;
  onClearError: () => void;
  speechError: string | null;
  speechStatus: MatchSpeechStatus;
  listeningSource: ListeningSource;
  isListening: boolean;
  onMicTap: () => void;
  onMicHoldStart: () => void;
  onMicHoldEnd: () => void;
  voiceHint?: string | null;
}

function MoveRow({
  label,
  move,
  pending = false,
  pendingLabel = '…',
}: {
  label: string;
  move: string | null;
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.sideLabel}>{label}</Text>
      {pending ? (
        <View style={styles.pendingRow}>
          <ActivityIndicator
            accessibilityLabel={`${label} pending`}
            color={colors.tertiary}
            size="small"
          />
          <Text
            accessibilityLabel={`${label} ${pendingLabel}`}
            style={styles.rowMovePending}
          >
            {pendingLabel}
          </Text>
        </View>
      ) : (
        <Text
          accessibilityLabel={`${label} move ${move ?? 'none'}`}
          style={styles.rowMove}
        >
          {move ?? '—'}
        </Text>
      )}
    </View>
  );
}

export function MatchMovePanel({
  lastEngineMove,
  lastPlayerMove,
  waitingForEngine,
  isSubmittingMove,
  showMoveInput,
  inputDisabled,
  moveDraft,
  onMoveDraftChange,
  moveError,
  onSubmit,
  onClearError,
  speechError,
  speechStatus,
  listeningSource,
  isListening,
  onMicTap,
  onMicHoldStart,
  onMicHoldEnd,
  voiceHint,
}: MatchMovePanelProps) {
  const submittedMove = lastPlayerMove ?? (isSubmittingMove ? moveDraft.trim() : '');
  const showEngineRow = lastEngineMove !== null || waitingForEngine;
  const showInput = showMoveInput;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Move exchange</Text>
      <View style={styles.stack}>
        {showEngineRow ? (
          <MoveRow
            label="Engine"
            move={waitingForEngine ? null : lastEngineMove}
            pending={waitingForEngine}
            pendingLabel="Thinking…"
          />
        ) : null}
        <View style={styles.inputRow}>
          <Text style={styles.inputSideLabel}>You</Text>
          {showInput ? (
            <MatchMoveInput
              disabled={inputDisabled}
              isListening={isListening}
              listeningSource={listeningSource}
              moveError={moveError}
              onChange={onMoveDraftChange}
              onClearError={onClearError}
              onMicHoldEnd={onMicHoldEnd}
              onMicHoldStart={onMicHoldStart}
              onMicTap={onMicTap}
              onSubmit={onSubmit}
              speechError={speechError}
              speechStatus={speechStatus}
              submitting={isSubmittingMove}
              value={moveDraft}
              voiceHint={voiceHint}
            />
          ) : (
            <View style={styles.submittedWrap}>
              <Text
                accessibilityLabel={`Your move ${submittedMove || 'none'}`}
                style={styles.submittedMove}
              >
                {submittedMove || '—'}
              </Text>
              {waitingForEngine ? (
                <Text style={styles.submittedHint}>Move sent</Text>
              ) : null}
            </View>
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
  pendingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    ...typography.headlineMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  submittedWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
  },
  submittedMove: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  submittedHint: {
    ...typography.bodyMd,
    color: colors.tertiary,
  },
});
