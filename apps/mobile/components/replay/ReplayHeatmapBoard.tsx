import { View, StyleSheet } from 'react-native';
import type { Square } from '@mindboard/shared';
import { colors } from '@/theme';
import {
  parseBoard,
  isLightSquare,
  squareFromIndex,
} from '../chess/boardUtils';
import { getVisibleSquareColor } from '../chess/boardColors';
import { RankLabels, FileLabels } from '../chess/BoardLabels';
import { BoardGrid } from '../chess/BoardGrid';
import { BoardFrame } from '../chess/BoardFrame';
import { ChessPiece } from '../chess/pieces/ChessPiece';
import { useBoardDimensions } from '../chess/useBoardDimensions';
import { FogOverlay } from '../heatmap/FogOverlay';

const FOGGED_OPACITY = 0.5;
const WEAKNESS_FOG_OPACITY = 0;

interface ReplayHeatmapBoardProps {
  fen: string;
  weaknessSquares?: Square[];
  showHeatmap: boolean;
}

export function ReplayHeatmapBoard({
  fen,
  weaknessSquares = [],
  showHeatmap,
}: ReplayHeatmapBoardProps) {
  const { squareSize, boardSize, labelGutter } = useBoardDimensions();
  const squares = parseBoard(fen);
  const weaknessSet = new Set(weaknessSquares);

  return (
    <View
      accessibilityLabel={
        showHeatmap
          ? 'Chess board with cognitive heatmap overlay'
          : 'Chess board'
      }
      style={styles.wrapper}
    >
      <BoardFrame>
        <View style={styles.row}>
          <RankLabels labelGutter={labelGutter} squareSize={squareSize} />
          <View>
            <BoardGrid
              boardSize={boardSize}
              squareSize={squareSize}
              renderSquare={(file, displayRank) => {
                const square = squareFromIndex(file, displayRank);
                const light = isLightSquare(file, displayRank);
                const piece = squares[displayRank][file];
                const isWeakness = weaknessSet.has(square);
                const baseColor = showHeatmap && isWeakness
                  ? colors.secondaryContainer
                  : getVisibleSquareColor(light);
                const fogOpacity = showHeatmap
                  ? isWeakness
                    ? WEAKNESS_FOG_OPACITY
                    : FOGGED_OPACITY
                  : 0;

                return (
                  <View
                    style={[
                      styles.square,
                      { backgroundColor: baseColor },
                      showHeatmap && isWeakness ? styles.weaknessSquare : null,
                    ]}
                  >
                    {piece ? (
                      <ChessPiece piece={piece} size={squareSize} />
                    ) : null}
                    <FogOverlay opacity={fogOpacity} />
                  </View>
                );
              }}
            />
            <FileLabels labelGutter={0} squareSize={squareSize} />
          </View>
        </View>
      </BoardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  square: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  weaknessSquare: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
});
