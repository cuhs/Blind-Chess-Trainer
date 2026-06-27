import { Pressable, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch } from '@/theme';
import { PeekIcon } from '@/components/ui/icons/PeekIcon';
import { EyeOffIcon } from '@/components/ui/icons/EyeOffIcon';

interface MatchControlBarProps {
  onPeekPress: () => void;
  onCoverPress: () => void;
  covered: boolean;
}

export function MatchControlBar({
  onPeekPress,
  onCoverPress,
  covered,
}: MatchControlBarProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Peek at board"
        accessibilityRole="button"
        onPress={onPeekPress}
        style={styles.control}
      >
        <PeekIcon color={colors.tertiary} size={22} />
      </Pressable>

      <Pressable
        accessibilityLabel={covered ? 'Show grid and coordinates' : 'Cover board completely'}
        accessibilityRole="button"
        accessibilityState={{ selected: covered }}
        onPress={onCoverPress}
        style={[styles.control, covered && styles.controlActive]}
      >
        <EyeOffIcon color={colors.onSecondaryContainer} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  control: {
    width: touch.min + 8,
    height: touch.min + 8,
    borderRadius: radius.full,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: touch.buttonOffset,
  },
  controlActive: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
});
