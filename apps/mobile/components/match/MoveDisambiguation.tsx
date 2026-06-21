import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { MoveCandidate } from '@mindboard/chess-core';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface MoveDisambiguationProps {
  prompt: string;
  candidates: MoveCandidate[];
  onSelect: (san: string) => void;
  onCancel: () => void;
}

export function MoveDisambiguation({
  prompt,
  candidates,
  onSelect,
  onCancel,
}: MoveDisambiguationProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.options}>
        {candidates.map((candidate) => (
          <Pressable
            key={candidate.san}
            accessibilityLabel={`Play ${candidate.san}, ${candidate.label}`}
            accessibilityRole="button"
            onPress={() => onSelect(candidate.san)}
            style={styles.option}
          >
            <Text style={styles.san}>{candidate.san}</Text>
            <Text style={styles.label}>{candidate.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityLabel="Cancel move selection"
        accessibilityRole="button"
        onPress={onCancel}
        style={styles.cancel}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Text
        accessibilityLabel="You can also answer by voice using the microphone"
        style={styles.voiceHint}
      >
        Or answer by voice with the mic below
      </Text>
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
    gap: spacing.md,
  },
  prompt: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    minHeight: touch.min,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  san: {
    ...typography.labelBold,
    color: colors.onTertiaryContainer,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
  },
  cancel: {
    alignSelf: 'center',
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  voiceHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
