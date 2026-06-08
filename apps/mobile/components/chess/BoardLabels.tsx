import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';
import { DISPLAY_RANKS, FILES } from './boardUtils';

interface BoardLabelsProps {
  squareSize: number;
  labelGutter: number;
  showRankLabels?: boolean;
  showFileLabels?: boolean;
  faint?: boolean;
}

export function RankLabels({
  squareSize,
  labelGutter,
  faint = false,
}: Pick<BoardLabelsProps, 'squareSize' | 'labelGutter' | 'faint'>) {
  return (
    <View style={[styles.rankColumn, { width: labelGutter }]}>
      {DISPLAY_RANKS.map((rank) => (
        <View
          key={rank}
          style={[styles.rankCell, { height: squareSize }]}
        >
          <Text style={[styles.label, faint && styles.faint]}>{rank}</Text>
        </View>
      ))}
    </View>
  );
}

export function FileLabels({
  squareSize,
  labelGutter,
  faint = false,
}: Pick<BoardLabelsProps, 'squareSize' | 'labelGutter' | 'faint'>) {
  return (
    <View style={[styles.fileRow, { marginLeft: labelGutter }]}>
      {FILES.map((file) => (
        <View
          key={file}
          style={[styles.fileCell, { width: squareSize }]}
        >
          <Text style={[styles.label, faint && styles.faint]}>{file}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rankColumn: {
    justifyContent: 'flex-start',
  },
  rankCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileRow: {
    flexDirection: 'row',
  },
  fileCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  label: {
    ...typography.labelBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  faint: {
    opacity: 0.5,
  },
});
