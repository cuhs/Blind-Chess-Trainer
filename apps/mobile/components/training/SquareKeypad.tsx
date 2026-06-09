import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

interface SquareKeypadProps {
  /** Submits the assembled square (e.g. `"f6"`). */
  onSubmit: (square: string) => void;
  /** Change this (e.g. to the puzzle id) to clear the current selection. */
  resetKey?: string;
  disabled?: boolean;
}

interface KeyButtonProps {
  label: string;
  accessibilityLabel: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function KeyButton({
  label,
  accessibilityLabel,
  selected,
  disabled,
  onPress,
}: KeyButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.key,
        selected && styles.keySelected,
        {
          transform: [{ translateY: pressed ? touch.buttonOffset / 2 : 0 }],
        },
      ]}
    >
      <Text style={[styles.keyLabel, selected && styles.keyLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Two rows of thumb-friendly keys — files A–H then ranks 1–8 — that assemble a
 * single algebraic square. Replaces the native keyboard for `square` puzzles.
 * Tapping a key (re)selects that file/rank; Submit fires once both are chosen.
 */
export function SquareKeypad({ onSubmit, resetKey, disabled }: SquareKeypadProps) {
  const [file, setFile] = useState<string | null>(null);
  const [rank, setRank] = useState<string | null>(null);

  useEffect(() => {
    setFile(null);
    setRank(null);
  }, [resetKey]);

  const ready = file !== null && rank !== null;

  const selectFile = (value: string) => {
    setFile(value);
    Haptics.selectionAsync();
  };

  const selectRank = (value: string) => {
    setRank(value);
    Haptics.selectionAsync();
  };

  const handleSubmit = () => {
    if (!ready) return;
    onSubmit(`${file}${rank}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayLabel}>Your Answer</Text>
        <Text
          accessibilityLabel={
            ready
              ? `Selected square ${(file ?? '').toUpperCase()}${rank}`
              : 'No square selected yet'
          }
          style={styles.displayValue}
        >
          {(file ?? '–').toUpperCase()}
          {rank ?? '–'}
        </Text>
      </View>

      <View style={styles.row}>
        {FILES.map((f) => (
          <KeyButton
            key={f}
            accessibilityLabel={`File ${f.toUpperCase()}`}
            disabled={disabled}
            label={f.toUpperCase()}
            onPress={() => selectFile(f)}
            selected={file === f}
          />
        ))}
      </View>
      <View style={styles.row}>
        {RANKS.map((r) => (
          <KeyButton
            key={r}
            accessibilityLabel={`Rank ${r}`}
            disabled={disabled}
            label={r}
            onPress={() => selectRank(r)}
            selected={rank === r}
          />
        ))}
      </View>

      <PrimaryButton
        accessibilityLabel="Submit Answer"
        disabled={disabled || !ready}
        label="Submit Answer"
        onPress={handleSubmit}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  display: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.surfaceContainerHighest,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  displayLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  displayValue: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  key: {
    flex: 1,
    height: touch.inputHeight,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  keyLabel: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  keyLabelSelected: {
    color: colors.onPrimaryContainer,
  },
  submit: {
    marginTop: spacing.xs,
  },
});
