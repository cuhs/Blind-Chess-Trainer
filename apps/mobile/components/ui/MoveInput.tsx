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
  ...props
}: MoveInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={(e) => onSubmitAnswer?.(e.nativeEvent.text)}
        placeholder="Type here..."
        placeholderTextColor={colors.outline}
        returnKeyType="done"
        style={[
          styles.input,
          focused && styles.inputFocused,
        ]}
        value={value}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: touch.inputHeight,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  inputFocused: {
    borderColor: colors.tertiaryContainer,
  },
});
