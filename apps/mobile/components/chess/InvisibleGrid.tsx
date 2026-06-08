import { View, StyleSheet } from 'react-native';
import { isLightSquare } from './boardUtils';
import { getInvisibleSquareColor } from './boardColors';
import { RankLabels, FileLabels } from './BoardLabels';
import { BoardGrid } from './BoardGrid';
import { BoardFrame } from './BoardFrame';
import { useBoardDimensions } from './useBoardDimensions';

interface InvisibleGridProps {
  showLabels?: boolean;
}

export function InvisibleGrid({ showLabels = true }: InvisibleGridProps) {
  const { squareSize, boardSize, labelGutter } = useBoardDimensions();

  const grid = (
    <BoardGrid
      boardSize={boardSize}
      squareSize={squareSize}
      variant="invisible"
      renderSquare={(file, displayRank) => {
        const light = isLightSquare(file, displayRank);
        return (
          <View
            style={[
              styles.square,
              { backgroundColor: getInvisibleSquareColor(light) },
            ]}
          />
        );
      }}
    />
  );

  if (!showLabels) {
    return grid;
  }

  return (
    <View accessibilityLabel="Invisible grid" style={styles.wrapper}>
      <BoardFrame>
        <View style={styles.row}>
          <RankLabels
            faint
            labelGutter={labelGutter}
            squareSize={squareSize}
          />
          <View>
            {grid}
            <FileLabels faint labelGutter={0} squareSize={squareSize} />
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
  },
});
