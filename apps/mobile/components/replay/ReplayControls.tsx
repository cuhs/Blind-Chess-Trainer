import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeftIcon } from '@/components/ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/components/ui/icons/ChevronRightIcon';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface ReplayControlsProps {
  positionIndex: number;
  positionCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ReplayControls({
  positionIndex,
  positionCount,
  onPrevious,
  onNext,
}: ReplayControlsProps) {
  const atStart = positionIndex <= 0;
  const atEnd = positionIndex >= positionCount - 1;
  const moveLabel =
    positionIndex === 0
      ? 'Start position'
      : `After move ${positionIndex} of ${positionCount - 1}`;

  return (
    <View style={styles.wrap}>
      <Text accessibilityRole="text" style={styles.label}>
        {moveLabel}
      </Text>
      <View style={styles.buttons}>
        <StepButton
          accessibilityLabel="Previous position"
          disabled={atStart}
          icon={<ChevronLeftIcon color={colors.onTertiaryContainer} size={36} />}
          onPress={onPrevious}
        />
        <StepButton
          accessibilityLabel="Next position"
          disabled={atEnd}
          icon={<ChevronRightIcon color={colors.onTertiaryContainer} size={36} />}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

interface StepButtonProps {
  accessibilityLabel: string;
  disabled: boolean;
  icon: ReactNode;
  onPress: () => void;
}

function StepButton({
  accessibilityLabel,
  disabled,
  icon,
  onPress,
}: StepButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.stepButton,
        disabled && styles.stepButtonDisabled,
        {
          transform: [{ translateY: pressed && !disabled ? touch.buttonOffset : 0 }],
          marginBottom: pressed && !disabled ? 0 : touch.buttonOffset,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

const STEP_BUTTON_SIZE = 80;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.marginMobile,
  },
  label: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepButton: {
    width: STEP_BUTTON_SIZE,
    height: STEP_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
});
