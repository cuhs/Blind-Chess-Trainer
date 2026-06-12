import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { BoardFrame } from './BoardFrame';
import { useBoardDimensions } from './useBoardDimensions';

interface BoardCoverProps {
  /** Extra horizontal inset when the board must fit beside other chrome. */
  horizontalInset?: number;
}

/** Solid panel — hides grid squares and coordinate labels for full blindfold. */
export function BoardCover({ horizontalInset }: BoardCoverProps) {
  const { boardSize, labelGutter } = useBoardDimensions(
    horizontalInset !== undefined ? { horizontalInset } : {},
  );

  return (
    <View accessibilityLabel="Board fully covered" style={styles.wrapper}>
      <BoardFrame>
        <View
          style={[
            styles.cover,
            {
              width: labelGutter + boardSize,
              height: boardSize + labelGutter,
            },
          ]}
        />
      </BoardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  cover: {
    backgroundColor: colors.background,
    borderRadius: 4,
  },
});
