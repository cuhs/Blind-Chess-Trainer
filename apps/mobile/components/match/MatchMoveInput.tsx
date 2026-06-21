import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import type { MatchSpeechStatus } from '@/hooks/useMatchSpeech';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface MatchMoveInputProps {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (move: string) => void;
  onClearError: () => void;
  moveError: string | null;
  speechError: string | null;
  speechStatus: MatchSpeechStatus;
}

function hintLabel(status: MatchSpeechStatus, disabled: boolean): string | null {
  if (disabled) return null;
  switch (status) {
    case 'requesting_permission':
      return 'Requesting microphone…';
    case 'listening':
      return 'Listening — say your move';
    case 'processing':
      return 'Processing voice…';
    default:
      return null;
  }
}

export function MatchMoveInput({
  disabled,
  value,
  onChange,
  onSubmit,
  onClearError,
  moveError,
  speechError,
  speechStatus,
}: MatchMoveInputProps) {
  const canSubmit = !disabled && value.trim().length > 0;
  const listening = speechStatus === 'listening';
  const hint = hintLabel(speechStatus, disabled);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={
            listening ? 'Move input, listening for voice' : 'Enter move in SAN'
          }
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={(text) => {
            if (moveError || speechError) onClearError();
            onChange(text);
          }}
          onSubmitEditing={submit}
          placeholder={listening ? 'Say your move…' : 'e.g. e4, Nf3'}
          placeholderTextColor={colors.outline}
          returnKeyType="go"
          style={[styles.input, listening && styles.inputListening]}
          value={value}
        />
        <Pressable
          accessibilityLabel="Submit move"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submit}
          style={[styles.submit, !canSubmit && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>Play</Text>
        </Pressable>
      </View>
      {hint ? (
        <Text accessibilityLabel={`Voice status: ${hint}`} style={styles.hint}>
          {hint}
        </Text>
      ) : null}
      {speechError ? <Text style={styles.error}>{speechError}</Text> : null}
      {moveError ? <Text style={styles.error}>{moveError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  inputListening: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  submit: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    ...typography.labelBold,
    color: colors.onTertiaryContainer,
  },
  hint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
