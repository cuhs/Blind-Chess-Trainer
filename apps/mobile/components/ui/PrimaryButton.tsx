import { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  variant = 'primary',
  disabled,
  style,
  ...props
}: PrimaryButtonProps) {
  const [pressed, setPressed] = useState(false);

  const bg =
    variant === 'primary' ? colors.primaryContainer : colors.tertiaryContainer;
  const borderColor =
    variant === 'primary' ? colors.primary : colors.tertiary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          transform: [{ translateY: pressed ? touch.buttonOffset : 0 }],
          marginBottom: pressed ? 0 : touch.buttonOffset,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.inputHeight,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.labelBold,
    color: colors.onPrimaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
