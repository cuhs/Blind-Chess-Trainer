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

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
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
  const is3D = variant === 'primary' || variant === 'secondary';

  const palette = {
    primary: {
      bg: colors.primaryContainer,
      border: colors.primary,
      label: colors.onPrimaryContainer,
    },
    secondary: {
      bg: colors.tertiaryContainer,
      border: colors.tertiary,
      label: colors.onTertiaryContainer,
    },
    ghost: {
      bg: colors.surfaceContainerLowest,
      border: colors.cardStroke,
      label: colors.onSurface,
    },
    text: {
      bg: 'transparent',
      border: 'transparent',
      label: colors.tertiary,
    },
  }[variant];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        variant === 'text' && styles.textButton,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'text' ? 0 : touch.strokeWidth,
          transform: [
            {
              translateY:
                is3D && pressed && !disabled ? touch.buttonOffset : 0,
            },
          ],
          marginBottom:
            is3D && !(pressed && !disabled) ? touch.buttonOffset : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          { color: palette.label },
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
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    minHeight: touch.min,
    paddingHorizontal: spacing.sm,
  },
  label: {
    ...typography.button,
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
