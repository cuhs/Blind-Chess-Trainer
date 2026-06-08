import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, touch } from '@/theme';
import { squareFromIndex } from './boardUtils';

interface BoardGridProps {
  boardSize: number;
  squareSize: number;
  variant?: 'visible' | 'invisible';
  renderSquare: (file: number, displayRank: number) => ReactNode;
}

export function BoardGrid({
  boardSize,
  squareSize,
  variant = 'visible',
  renderSquare,
}: BoardGridProps) {
  return (
    <View
      style={[
        styles.board,
        { width: boardSize, height: boardSize },
        variant === 'invisible' && styles.invisibleBorder,
      ]}
    >
      {Array.from({ length: 8 }).map((_, displayRank) => (
        <View
          key={`rank-${displayRank}`}
          style={[styles.rankRow, { height: squareSize }]}
        >
          {Array.from({ length: 8 }).map((__, file) => (
            <View
              key={squareFromIndex(file, displayRank)}
              style={{ width: squareSize, height: squareSize }}
            >
              {renderSquare(file, displayRank)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'column',
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    overflow: 'hidden',
  },
  invisibleBorder: {
    borderColor: colors.outlineVariant,
  },
  rankRow: {
    flexDirection: 'row',
  },
});
