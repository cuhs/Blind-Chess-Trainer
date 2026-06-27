import { useRef } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ListeningSource, MatchSpeechStatus } from '@/hooks/useMatchSpeech';
import { MicIcon } from '@/components/ui/icons/MicIcon';
import { colors, radius, spacing, touch, typography } from '@/theme';

const HOLD_DELAY_MS = 150;

interface MatchMoveInputProps {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (move: string) => void;
  onClearError: () => void;
  moveError: string | null;
  speechError: string | null;
  speechStatus: MatchSpeechStatus;
  listeningSource: ListeningSource;
  isListening: boolean;
  onMicTap: () => void;
  onMicHoldStart: () => void;
  onMicHoldEnd: () => void;
  voiceHint?: string | null;
}

function hintLabel(
  status: MatchSpeechStatus,
  listeningSource: ListeningSource,
  disabled: boolean,
): string | null {
  if (disabled) return null;
  switch (status) {
    case 'requesting_permission':
      return 'Requesting microphone…';
    case 'listening':
      if (listeningSource === 'auto') return 'Auto-listening — say your move';
      if (listeningSource === 'hold') return 'Hold to speak — release to submit';
      return 'Listening — say your move';
    case 'processing':
      return 'Processing voice…';
    default:
      return 'Tap mic or hold to speak';
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
  listeningSource,
  isListening,
  onMicTap,
  onMicHoldStart,
  onMicHoldEnd,
  voiceHint,
}: MatchMoveInputProps) {
  const canSubmit = !disabled && value.trim().length > 0;
  const listening = speechStatus === 'listening';
  const hint = hintLabel(speechStatus, listeningSource, disabled);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdActiveRef = useRef(false);
  const pressStartRef = useRef(0);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleMicPressIn = () => {
    if (disabled) return;
    pressStartRef.current = Date.now();
    holdActiveRef.current = false;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdActiveRef.current = true;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMicHoldStart();
    }, HOLD_DELAY_MS);
  };

  const handleMicPressOut = () => {
    if (disabled) return;
    clearHoldTimer();
    if (holdActiveRef.current) {
      holdActiveRef.current = false;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMicHoldEnd();
    }
  };

  const handleMicPress = () => {
    if (disabled || holdActiveRef.current) return;
    const duration = Date.now() - pressStartRef.current;
    if (duration >= HOLD_DELAY_MS) return;
    onMicTap();
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
          showSoftInputOnFocus
          style={[styles.input, listening && styles.inputListening]}
          value={value}
        />
        <Pressable
          accessibilityLabel={
            isListening ? 'Stop listening' : 'Hold to speak or tap to toggle microphone'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: isListening }}
          disabled={disabled}
          onPress={handleMicPress}
          onPressIn={handleMicPressIn}
          onPressOut={handleMicPressOut}
          style={[
            styles.mic,
            disabled && styles.micDisabled,
            isListening && styles.micActive,
          ]}
        >
          <MicIcon color={colors.onTertiaryContainer} size={20} />
        </Pressable>
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
      {!hint && voiceHint ? (
        <Text accessibilityLabel={`Voice hint: ${voiceHint}`} style={styles.hint}>
          {voiceHint}
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
  mic: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDisabled: {
    opacity: 0.4,
  },
  micActive: {
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
