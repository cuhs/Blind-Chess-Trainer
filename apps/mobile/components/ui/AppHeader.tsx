import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { MascotAvatar } from '@/components/ui/MascotAvatar';
import { SettingsIcon } from '@/components/ui/icons/SettingsIcon';

interface AppHeaderProps {
  showSettings?: boolean;
  onSettingsPress?: () => void;
  bordered?: boolean;
}

export function AppHeader({
  showSettings = true,
  onSettingsPress,
  bordered = false,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, bordered && styles.bordered]}>
      <View style={styles.brand}>
        <MascotAvatar />
        <Text style={styles.title}>MindBoard</Text>
      </View>
      {showSettings ? (
        <Pressable
          accessibilityLabel="Settings"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onSettingsPress}
          style={styles.settings}
        >
          <SettingsIcon />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    minHeight: 64,
  },
  bordered: {
    borderBottomWidth: touch.strokeWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.background,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineLg,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  settings: {
    padding: spacing.xs,
  },
});
