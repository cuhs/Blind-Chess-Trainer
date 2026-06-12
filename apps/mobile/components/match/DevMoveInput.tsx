import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface DevMoveInputProps {
  disabled: boolean;
  error: string | null;
  onSubmit: (move: string) => void;
  onClearError: () => void;
}

export function DevMoveInput({
  disabled,
  error,
  onSubmit,
  onClearError,
}: DevMoveInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>DEV MOVE INPUT</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Enter move in SAN"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={(value) => {
            if (error) onClearError();
            setInput(value);
          }}
          onSubmitEditing={handleSubmit}
          placeholder="e.g. e4, Nf3"
          placeholderTextColor={colors.outline}
          returnKeyType="go"
          style={styles.input}
          value={input}
        />
        <Pressable
          accessibilityLabel="Submit move"
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || !input.trim() }}
          disabled={disabled || !input.trim()}
          onPress={handleSubmit}
          style={[
            styles.submit,
            (disabled || !input.trim()) && styles.submitDisabled,
          ]}
        >
          <Text style={styles.submitText}>Play</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.recessedBg,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
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
    ...typography.bodyMd,
    color: colors.onSurface,
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
  error: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
