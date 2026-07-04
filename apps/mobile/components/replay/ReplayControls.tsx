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
      : `Step ${positionIndex} of ${positionCount - 1}`;

  return (
    <View style={styles.wrap}>
      <Text accessibilityRole="text" style={styles.label}>
        {moveLabel}
      </Text>
      <View style={styles.buttons}>
        <StepButton
          accessibilityLabel="Previous position"
          disabled={atStart}
          icon={<ChevronLeftIcon color={colors.onSurface} size={28} />}
          onPress={onPrevious}
        />
        <StepButton
          accessibilityLabel="Next position"
          disabled={atEnd}
          icon={<ChevronRightIcon color={colors.onSurface} size={28} />}
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
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepButton,
        disabled && styles.stepButtonDisabled,
        pressed && !disabled && styles.stepButtonPressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
    letterSpacing: 0,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepButton: {
    width: touch.inputHeight,
    height: touch.inputHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  stepButtonPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
});
