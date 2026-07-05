import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PuzzleKind } from '@mindboard/shared';
import { colors, radius, spacing, typography } from '@/theme';
import { BlindfoldIcon } from '@/components/ui/icons/BlindfoldIcon';
import { BoltIcon } from '@/components/ui/icons/BoltIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import { LightbulbIcon } from '@/components/ui/icons/LightbulbIcon';
import type { NodeVisualState } from '@/hooks/useTrainingPath';

interface TrainingNodeChipProps {
  title: string;
  puzzleKind: PuzzleKind;
  state: NodeVisualState;
  stars?: number;
  onPress?: () => void;
  accessibilityLabel: string;
}

function NodeKindIcon({
  kind,
  color,
}: {
  kind: PuzzleKind;
  color: string;
}) {
  switch (kind) {
    case 'coordinate':
      return <BoltIcon size={18} color={color} />;
    case 'static_recall':
    case 'chunk':
      return <BlindfoldIcon size={18} color={color} />;
    case 'move_update':
    case 'shallow_calc':
    case 'story_check':
      return <LightbulbIcon size={18} color={color} />;
    case 'functional_geometry':
      return <CheckIcon size={18} color={color} />;
    default:
      return <BoltIcon size={18} color={color} />;
  }
}

function starLabel(stars: number): string {
  if (stars <= 0) return '';
  return `${stars} star${stars === 1 ? '' : 's'}`;
}

export function TrainingNodeChip({
  title,
  puzzleKind,
  state,
  stars = 0,
  onPress,
  accessibilityLabel,
}: TrainingNodeChipProps) {
  const isLocked = state === 'locked';
  const isActive = state === 'active';
  const isComplete = state === 'complete';

  const circleColor = isActive
    ? colors.primaryContainer
    : isComplete
      ? colors.secondaryContainer
      : colors.surfaceContainerHigh;

  const iconColor = isLocked
    ? colors.outlineVariant
    : isActive
      ? colors.onPrimaryContainer
      : colors.onSecondaryContainer;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isActive && styles.rowActive,
        pressed && !isLocked && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: circleColor },
          isLocked && styles.circleLocked,
          isActive && styles.circleActive,
        ]}
      >
        <NodeKindIcon kind={puzzleKind} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text
          style={[
            styles.title,
            isLocked && styles.titleLocked,
          ]}
        >
          {title}
        </Text>
        {isComplete && stars > 0 ? (
          <Text style={styles.stars}>{starLabel(stars)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  rowActive: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  rowPressed: {
    opacity: 0.9,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outlineVariant,
  },
  circleLocked: {
    opacity: 0.55,
  },
  circleActive: {
    borderColor: colors.primary,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  titleLocked: {
    color: colors.outline,
  },
  stars: {
    ...typography.labelBold,
    color: colors.secondary,
  },
});
