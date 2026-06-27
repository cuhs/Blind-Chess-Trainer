import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MoveCandidate } from '@mindboard/chess-core';
import type { ListeningSource, MatchSpeechStatus } from '@/hooks/useMatchSpeech';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { MatchMoveInput } from './MatchMoveInput';

interface DisambiguationOverlayProps {
  visible: boolean;
  prompt: string;
  candidates: MoveCandidate[];
  moveDraft: string;
  moveError: string | null;
  speechError: string | null;
  speechStatus: MatchSpeechStatus;
  listeningSource: ListeningSource;
  isListening: boolean;
  inputDisabled: boolean;
  onMoveDraftChange: (value: string) => void;
  onSubmit: (move: string) => void;
  onClearError: () => void;
  onSelect: (san: string) => void;
  onCancel: () => void;
  onMicTap: () => void;
  onMicHoldStart: () => void;
  onMicHoldEnd: () => void;
  voiceHint?: string | null;
}

function spokenLabel(candidate: MoveCandidate): string {
  const fileMatch = /on ([a-h][1-8])/.exec(candidate.label);
  if (fileMatch) {
    return `${fileMatch[1]} (${candidate.san})`;
  }
  return candidate.label;
}

export function DisambiguationOverlay({
  visible,
  prompt,
  candidates,
  moveDraft,
  moveError,
  speechError,
  speechStatus,
  listeningSource,
  isListening,
  inputDisabled,
  onMoveDraftChange,
  onSubmit,
  onClearError,
  onSelect,
  onCancel,
  onMicTap,
  onMicHoldStart,
  onMicHoldEnd,
  voiceHint,
}: DisambiguationOverlayProps) {
  return (
    <Modal
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.prompt}>
            {prompt}
          </Text>

          <View style={styles.options}>
            {candidates.map((candidate) => (
              <Pressable
                key={candidate.san}
                accessibilityLabel={`Play ${candidate.san}, ${candidate.label}`}
                accessibilityRole="button"
                disabled={inputDisabled}
                onPress={() => onSelect(candidate.san)}
                style={[styles.option, inputDisabled && styles.optionDisabled]}
              >
                <Text style={styles.san}>{candidate.san}</Text>
                <Text style={styles.label}>{spokenLabel(candidate)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.voiceSection}>
            <Text style={styles.voiceHeading}>Or answer by voice</Text>
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
              value={moveDraft}
              voiceHint={voiceHint}
            />
          </View>

          <Pressable
            accessibilityLabel="Cancel move selection"
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.cancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  prompt: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
  },
  options: {
    gap: spacing.md,
  },
  option: {
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  san: {
    ...typography.headlineMd,
    color: colors.onTertiaryContainer,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
  },
  voiceSection: {
    gap: spacing.sm,
  },
  voiceHeading: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancel: {
    alignSelf: 'center',
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
