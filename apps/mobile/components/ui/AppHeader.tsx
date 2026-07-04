import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, layout, spacing, touch, typography } from '@/theme';
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
          hitSlop={spacing.sm}
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
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    minHeight: layout.headerHeight,
  },
  bordered: {
    borderBottomWidth: touch.strokeWidth,
    borderBottomColor: colors.outlineVariant,
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
