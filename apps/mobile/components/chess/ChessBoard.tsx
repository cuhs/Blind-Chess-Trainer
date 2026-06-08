import { View, StyleSheet } from 'react-native';
import {
  parseBoard,
  isLightSquare,
} from './boardUtils';
import { getVisibleSquareColor } from './boardColors';
import { RankLabels, FileLabels } from './BoardLabels';
import { BoardGrid } from './BoardGrid';
import { ChessPiece } from './pieces/ChessPiece';
import { useBoardDimensions } from './useBoardDimensions';

interface ChessBoardProps {
  fen: string;
}

export function ChessBoard({ fen }: ChessBoardProps) {
  const { squareSize, boardSize, labelGutter } = useBoardDimensions();
  const squares = parseBoard(fen);

  return (
    <View accessibilityLabel="Chess board" style={styles.wrapper}>
      <View style={styles.row}>
        <RankLabels labelGutter={labelGutter} squareSize={squareSize} />
        <View>
          <BoardGrid
            boardSize={boardSize}
            squareSize={squareSize}
            renderSquare={(file, displayRank) => {
              const light = isLightSquare(file, displayRank);
              const piece = squares[displayRank][file];
              return (
                <View
                  style={[
                    styles.square,
                    {
                      backgroundColor: getVisibleSquareColor(light),
                    },
                  ]}
                >
                  {piece ? (
                    <ChessPiece piece={piece} size={squareSize} />
                  ) : null}
                </View>
              );
            }}
          />
          <FileLabels labelGutter={0} squareSize={squareSize} />
        </View>
      </View>
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
  },
});
