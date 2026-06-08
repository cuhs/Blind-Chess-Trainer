import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { PeekIcon } from '@/components/ui/icons/PeekIcon';

interface PeekButtonProps {
  onPress: () => void;
}

export function PeekButton({ onPress }: PeekButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <View style={styles.row}>
        <PeekIcon />
        <Text style={styles.text}>I forgot... need a peek?</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodyMd,
    color: colors.tertiary,
  },
});
