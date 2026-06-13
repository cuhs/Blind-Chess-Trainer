import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { BlindfoldIcon } from '@/components/ui/icons/BlindfoldIcon';
import { getInvisibleSquareColor } from '@/components/chess/boardColors';

const FOG_GRID = 4;
const CELL = 28;

export function MatchSetupHero() {
  return (
    <View style={styles.card}>
      <View style={styles.gridWrap}>
        {Array.from({ length: FOG_GRID }, (_, rank) => (
          <View key={rank} style={styles.row}>
            {Array.from({ length: FOG_GRID }, (_, file) => (
              <View
                key={file}
                style={[
                  styles.cell,
                  {
                    backgroundColor: getInvisibleSquareColor(
                      (rank + file) % 2 === 0,
                    ),
                  },
                ]}
              />
            ))}
          </View>
        ))}
        <View style={styles.iconBadge}>
          <BlindfoldIcon color={colors.onSecondaryContainer} size={32} />
        </View>
      </View>
      <Text style={styles.tagline}>Map the board in your mind</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  gridWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: radius.sm,
    margin: 2,
  },
  iconBadge: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
