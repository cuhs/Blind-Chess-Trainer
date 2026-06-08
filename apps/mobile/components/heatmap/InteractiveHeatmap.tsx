import { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors } from '@/theme';
import type { Square } from '@mindboard/shared';
import { isSquareCleared } from '@mindboard/heatmap';
import { useFogOpacity } from '@/hooks/useFogOpacity';
import { useHeatmapLedger } from '@/hooks/useHeatmapLedger';
import { FogOverlay } from './FogOverlay';
import { SquareTooltip } from './SquareTooltip';
import { isLightSquare, squareFromIndex } from '../chess/boardUtils';
import { getVisibleSquareColor } from '../chess/boardColors';
import { RankLabels, FileLabels } from '../chess/BoardLabels';
import { BoardGrid } from '../chess/BoardGrid';
import { BoardFrame } from '../chess/BoardFrame';
import {
  BOARD_CARD_INSET,
  LABEL_GUTTER,
  useBoardDimensions,
} from '../chess/useBoardDimensions';

interface InteractiveHeatmapProps {
  interactive?: boolean;
  showLabels?: boolean;
  fullWidthFrame?: boolean;
  horizontalInset?: number;
}

export function InteractiveHeatmap({
  interactive = true,
  showLabels = true,
  fullWidthFrame = true,
  horizontalInset,
}: InteractiveHeatmapProps) {
  const { squareSize, boardSize, labelGutter } = useBoardDimensions({
    labelGutter: showLabels ? LABEL_GUTTER : 0,
    frameInset: BOARD_CARD_INSET,
    horizontalInset,
  });
  const frameWidth =
    boardSize + BOARD_CARD_INSET + (showLabels ? labelGutter : 0);
  const { getOpacity } = useFogOpacity();
  const { getInteractions } = useHeatmapLedger();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const getSquareColor = (square: Square, file: number, displayRank: number): string => {
    const interactions = getInteractions(square);
    if (isSquareCleared(square, interactions)) {
      return colors.secondaryContainer;
    }
    if (interactions > 0) {
      return colors.primaryContainer;
    }
    return getVisibleSquareColor(isLightSquare(file, displayRank));
  };

  const getAccuracy = (square: Square): number => {
    const opacity = getOpacity(square);
    return Math.round((1 - opacity) * 100);
  };

  return (
    <View style={styles.wrapper}>
      <BoardFrame
        padding="md"
        style={[
          styles.frame,
          fullWidthFrame ? styles.fullWidthFrame : { width: frameWidth },
        ]}
      >
        <View style={styles.row}>
          {showLabels ? (
            <RankLabels labelGutter={labelGutter} squareSize={squareSize} />
          ) : null}
          <BoardGrid
            boardSize={boardSize}
            squareSize={squareSize}
            renderSquare={(file, displayRank) => {
              const square = squareFromIndex(file, displayRank);
              const opacity = getOpacity(square);

              return (
                <Pressable
                  accessibilityLabel={`Square ${square}`}
                  disabled={!interactive}
                  onPress={() => setSelectedSquare(square)}
                  style={[
                    styles.square,
                    {
                      backgroundColor: getSquareColor(square, file, displayRank),
                    },
                  ]}
                >
                  <FogOverlay opacity={opacity} />
                </Pressable>
              );
            }}
          />
        </View>
        {showLabels ? (
          <View style={[styles.fileLabels, { marginLeft: labelGutter }]}>
            <FileLabels labelGutter={0} squareSize={squareSize} />
          </View>
        ) : null}
      </BoardFrame>

      {selectedSquare && interactive ? (
        <SquareTooltip
          accuracy={getAccuracy(selectedSquare)}
          onDismiss={() => setSelectedSquare(null)}
          square={selectedSquare}
          weakness={
            getInteractions(selectedSquare) === 0
              ? 'No data collected yet'
              : undefined
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  frame: {
    marginBottom: 0,
  },
  fullWidthFrame: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fileLabels: {
    alignItems: 'flex-start',
  },
  square: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});
