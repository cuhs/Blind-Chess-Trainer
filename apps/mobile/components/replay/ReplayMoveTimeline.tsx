import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import type { MoveReplayTimelineEntry } from '@mindboard/chess-core';
import { colors, radius, spacing, touch, typography } from '@/theme';

type TimelineItem =
  | { kind: 'start'; positionIndex: 0 }
  | { kind: 'move'; entry: MoveReplayTimelineEntry };

interface ReplayMoveTimelineProps {
  moves: MoveReplayTimelineEntry[];
  selectedPositionIndex: number;
  onSelectMove: (positionIndex: number) => void;
}

const CHIP_WIDTH = 72;
const CHIP_STRIDE = CHIP_WIDTH + spacing.sm;

export function ReplayMoveTimeline({
  moves,
  selectedPositionIndex,
  onSelectMove,
}: ReplayMoveTimelineProps) {
  const listRef = useRef<FlatList<TimelineItem>>(null);
  const items = useMemo<TimelineItem[]>(
    () => [
      { kind: 'start', positionIndex: 0 },
      ...moves.map((entry) => ({ kind: 'move' as const, entry })),
    ],
    [moves],
  );

  useEffect(() => {
    if (items.length === 0) return;
    const listIndex =
      selectedPositionIndex === 0
        ? 0
        : items.findIndex(
            (item) =>
              item.kind === 'move' &&
              item.entry.positionIndex === selectedPositionIndex,
          );
    if (listIndex < 0) return;
    listRef.current?.scrollToIndex({ animated: true, index: listIndex });
  }, [items, selectedPositionIndex]);

  const renderItem: ListRenderItem<TimelineItem> = ({ item }) => {
    if (item.kind === 'start') {
      const selected = selectedPositionIndex === 0;
      return (
        <Pressable
          accessibilityLabel="Start position"
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => onSelectMove(0)}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={[styles.startLabel, selected && styles.chipTextSelected]}>
            Start
          </Text>
        </Pressable>
      );
    }

    const { entry } = item;
    const selected = entry.positionIndex === selectedPositionIndex;
    const flagLabel = entry.flagged ? ', peek or illegal move' : '';

    return (
      <Pressable
        accessibilityLabel={`Move ${entry.moveNumber}, ${entry.san}${flagLabel}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onSelectMove(entry.positionIndex)}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        {entry.flagged ? <View style={styles.flagDot} /> : null}
        <Text style={[styles.moveNumber, selected && styles.chipTextSelected]}>
          {entry.moveNumber}
        </Text>
        <Text style={[styles.san, selected && styles.chipTextSelected]}>
          {entry.san}
        </Text>
      </Pressable>
    );
  };

  if (moves.length === 0) {
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
      accessibilityLabel="Move history timeline"
      contentContainerStyle={styles.listContent}
      data={items}
      getItemLayout={(_, index) => ({
        index,
        length: CHIP_STRIDE,
        offset: CHIP_STRIDE * index,
      })}
      keyExtractor={(item) =>
        item.kind === 'start' ? 'start' : String(item.entry.moveNumber)
      }
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
  startLabel: {
    ...typography.labelBold,
    color: colors.onSurface,
    letterSpacing: 0,
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
  moveNumber: {
    ...typography.labelBold,
    color: colors.outline,
  },
  san: {
    ...typography.labelBold,
    color: colors.onSurface,
    letterSpacing: 0,
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
