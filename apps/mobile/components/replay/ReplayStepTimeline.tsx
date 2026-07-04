import { useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import type { ReplayStep } from '@mindboard/chess-core';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface ReplayStepTimelineProps {
  steps: ReplayStep[];
  selectedIndex: number;
  onSelectStep: (index: number) => void;
}

const CHIP_WIDTH = 72;
const CHIP_STRIDE = CHIP_WIDTH + spacing.sm;

function chipLabel(step: ReplayStep): string {
  if (step.kind === 'start') return 'Start';
  if (step.kind === 'peek') return 'Peek';
  if (step.kind === 'illegal_attempt') return 'Illegal';
  if (step.kind === 'move') return step.title;
  return step.title;
}

function chipSubLabel(step: ReplayStep): string | null {
  if (step.kind === 'peek' && step.weaknessSquares?.[0]) {
    return step.weaknessSquares[0];
  }
  if (step.kind === 'move' && step.detail) {
    return step.detail.replace('Move ', '');
  }
  return null;
}

export function ReplayStepTimeline({
  steps,
  selectedIndex,
  onSelectStep,
}: ReplayStepTimelineProps) {
  const listRef = useRef<FlatList<ReplayStep>>(null);

  useEffect(() => {
    if (steps.length === 0) return;
    listRef.current?.scrollToIndex({ animated: true, index: selectedIndex });
  }, [selectedIndex, steps.length]);

  const renderItem: ListRenderItem<ReplayStep> = ({ item }) => {
    const selected = item.index === selectedIndex;
    const subLabel = chipSubLabel(item);
    const flagLabel = item.mentalMapBreak ? ', mental map break' : '';

    return (
      <Pressable
        accessibilityLabel={`${chipLabel(item)}${subLabel ? `, ${subLabel}` : ''}${flagLabel}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onSelectStep(item.index)}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        {item.mentalMapBreak ? <View style={styles.flagDot} /> : null}
        <Text style={[styles.primaryLabel, selected && styles.chipTextSelected]}>
          {chipLabel(item)}
        </Text>
        {subLabel ? (
          <Text style={[styles.subLabel, selected && styles.chipTextSelected]}>
            {subLabel}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  if (steps.length <= 1) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No moves recorded</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      horizontal
      accessibilityLabel="Replay timeline"
      contentContainerStyle={styles.listContent}
      data={steps}
      getItemLayout={(_, index) => ({
        index,
        length: CHIP_STRIDE,
        offset: CHIP_STRIDE * index,
      })}
      keyExtractor={(item) => String(item.index)}
      onScrollToIndexFailed={() => {}}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
  },
  chip: {
    width: CHIP_WIDTH,
    minHeight: touch.inputHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  chipTextSelected: {
    color: colors.onTertiaryContainer,
  },
  flagDot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  primaryLabel: {
    ...typography.labelBold,
    color: colors.onSurface,
    letterSpacing: 0,
    textAlign: 'center',
  },
  subLabel: {
    ...typography.labelBold,
    color: colors.outline,
    letterSpacing: 0,
    textAlign: 'center',
  },
  empty: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
  },
});
