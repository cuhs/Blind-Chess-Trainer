import { Text, View, StyleSheet } from 'react-native';
import type { MatchSpeechStatus } from '@/hooks/useMatchSpeech';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface VoiceMovePromptProps {
  disabled: boolean;
  error: string | null;
  interimTranscript: string;
  lastTranscript: string;
  speechError: string | null;
  status: MatchSpeechStatus;
}

function statusLabel(status: MatchSpeechStatus, disabled: boolean): string {
  if (disabled) return 'Waiting for your turn';
  switch (status) {
    case 'requesting_permission':
      return 'Requesting microphone…';
    case 'listening':
      return 'Listening — say your move';
    case 'processing':
      return 'Processing…';
    default:
      return 'Tap the mic and say your move';
  }
}

export function VoiceMovePrompt({
  disabled,
  error,
  interimTranscript,
  lastTranscript,
  speechError,
  status,
}: VoiceMovePromptProps) {
  const displayTranscript = interimTranscript || lastTranscript;
  const prompt = statusLabel(status, disabled);

  return (
    <View style={styles.wrap}>
      <Text accessibilityRole="header" style={styles.heading}>
        Your move
      </Text>
      <Text
        accessibilityLabel={`Voice prompt: ${prompt}`}
        style={[styles.prompt, disabled && styles.promptDisabled]}
      >
        {prompt}
      </Text>
      <View
        accessibilityLabel={
          displayTranscript
            ? `Heard: ${displayTranscript}`
            : 'No move heard yet'
        }
        style={styles.transcriptBox}
      >
        <Text style={styles.transcript}>
          {displayTranscript || '—'}
        </Text>
      </View>
      {speechError ? <Text style={styles.error}>{speechError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.xs,
  },
  heading: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  prompt: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  promptDisabled: {
    color: colors.onSurfaceVariant,
  },
  transcriptBox: {
    minHeight: 48,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  transcript: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  error: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
