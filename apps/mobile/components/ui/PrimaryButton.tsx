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
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  variant = 'primary',
  uppercase = true,
  disabled,
  style,
  ...props
}: PrimaryButtonProps) {
  const [pressed, setPressed] = useState(false);

  const bg =
    variant === 'primary' ? colors.primaryContainer : colors.tertiaryContainer;
  const borderColor =
    variant === 'primary' ? colors.primary : colors.tertiary;
  const labelColor =
    variant === 'primary' ? colors.onPrimaryContainer : colors.onTertiaryContainer;

  return (
    <Pressable
      accessibilityLabel={label}
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
      <Text
        style={[
          styles.label,
          { color: labelColor },
          !uppercase && styles.labelMixedCase,
        ]}
      >
        {label}
      </Text>
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
    ...typography.headlineMd,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMixedCase: {
    textTransform: 'none',
    letterSpacing: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});
