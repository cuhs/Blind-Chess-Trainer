import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, spacing, typography } from '@/theme';

interface ReplayControlsProps {
  stepIndex: number;
  stepCount: number;
  stepTitle: string;
  stepDetail?: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function ReplayControls({
  stepIndex,
  stepCount,
  stepTitle,
  stepDetail,
  onPrevious,
  onNext,
}: ReplayControlsProps) {
  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= stepCount - 1;

  return (
    <View style={styles.wrap}>
      <Text accessibilityRole="header" style={styles.title}>
        {stepTitle}
      </Text>
      {stepDetail ? (
        <Text accessibilityLabel={stepDetail} style={styles.detail}>
          {stepDetail}
        </Text>
      ) : null}
      <Text style={styles.counter}>
        Step {stepIndex + 1} of {stepCount}
      </Text>
      <View style={styles.buttons}>
        <PrimaryButton
          accessibilityLabel="Previous replay step"
          disabled={atStart}
          label="Previous"
          onPress={onPrevious}
          uppercase={false}
          variant="secondary"
        />
        <PrimaryButton
          accessibilityLabel="Next replay step"
          disabled={atEnd}
          label="Next"
          onPress={onNext}
          uppercase={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  detail: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
  },
  counter: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
  },
  buttons: {
    gap: spacing.sm,
  },
});
