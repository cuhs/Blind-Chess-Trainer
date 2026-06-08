import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { LightbulbIcon } from '@/components/ui/icons/LightbulbIcon';

interface MascotTipProps {
  text: string;
}

export function MascotTip({ text }: MascotTipProps) {
  return (
    <View style={styles.chip}>
      <LightbulbIcon />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  text: {
    ...typography.bodyMd,
    color: colors.contrastInk,
    flex: 1,
  },
});
