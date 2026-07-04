import { Pressable, Text, View, StyleSheet, type ViewProps } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { LightbulbIcon } from '@/components/ui/icons/LightbulbIcon';
import { PeekIcon } from '@/components/ui/icons/PeekIcon';

type PeekChipVariant = 'action' | 'info' | 'loop';

interface PeekChipProps extends ViewProps {
  label: string;
  variant?: PeekChipVariant;
  onPress?: () => void;
}

const variantStyles = StyleSheet.create({
  action: {
    backgroundColor: colors.secondaryFixed,
    borderWidth: touch.strokeWidth,
    borderColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    backgroundColor: colors.secondaryContainer,
    marginBottom: spacing.sm,
  },
  loop: {
    backgroundColor: colors.secondaryContainer,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
});

export function PeekChip({
  label,
  variant = 'info',
  onPress,
  style,
  ...props
}: PeekChipProps) {
  const content = (
    <View style={[styles.chip, variantStyles[variant], style]} {...props}>
      {variant === 'action' ? (
        <LightbulbIcon color={colors.secondary} size={18} />
      ) : (
        <PeekIcon color={colors.onSecondaryContainer} size={16} />
      )}
      <Text style={[styles.label, variant === 'action' && styles.labelAction]}>
        {label}
      </Text>
    </View>
  );

  if (variant === 'action' && onPress) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.pressable}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View accessibilityLabel={label} accessibilityRole="text">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.labelBold,
    color: colors.contrastInk,
    letterSpacing: 0,
  },
  labelAction: {
    color: colors.onSecondaryFixedVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
