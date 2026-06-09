import { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface MoveInputProps extends TextInputProps {
  label?: string;
  onSubmitAnswer?: (value: string) => void;
}

export function MoveInput({
  label = 'Your Answer',
  onSubmitAnswer,
  value,
  onChangeText,
  placeholder = 'e.g. a8',
  ...props
}: MoveInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.card}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={(e) => onSubmitAnswer?.(e.nativeEvent.text)}
        placeholder={placeholder}
        placeholderTextColor={colors.surfaceDim}
        returnKeyType="done"
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.surfaceContainerHighest,
    padding: spacing.md,
    marginBottom: touch.buttonOffset,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  input: {
    height: touch.inputHeight,
    borderWidth: touch.strokeWidth,
    borderColor: colors.outline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});
