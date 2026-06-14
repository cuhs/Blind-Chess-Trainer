import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, radius, spacing, typography, touch } from '@/theme';
import { useHabitStreakSync } from '@/hooks/useHabitStreak';
import {
  HomeTabIcon,
  MatchTabIcon,
  SettingsTabIcon,
  TrainingTabIcon,
} from '@/components/ui/icons/TabIcons';

const TAB_ICON_SIZE = 24;

function TabBarButton({
  accessibilityLabel,
  accessibilityState,
  children,
  onPress,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        focused && styles.tabButtonActive,
        !focused && pressed && styles.tabButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function tabIconColor(focused: boolean) {
  return focused ? colors.onPrimaryContainer : colors.outline;
}

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.md);
  useHabitStreakSync();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onPrimaryContainer,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: touch.strokeWidth,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
          height: 72 + bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabel: ({ color, children, focused }) => (
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            numberOfLines={1}
            style={[
              styles.tabLabel,
              { color: focused ? colors.onPrimaryContainer : color },
            ]}
          >
            {children}
          </Text>
        ),
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <HomeTabIcon
              color={tabIconColor(focused)}
              filled={focused}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Training',
          tabBarIcon: ({ focused }) => (
            <TrainingTabIcon
              color={tabIconColor(focused)}
              filled={focused}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Match',
          tabBarIcon: ({ focused }) => (
            <MatchTabIcon
              color={tabIconColor(focused)}
              filled={focused}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <SettingsTabIcon
              color={tabIconColor(focused)}
              filled={focused}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryContainer,
    borderBottomWidth: touch.buttonOffset,
    borderBottomColor: colors.onPrimaryContainer,
    transform: [{ translateY: 1 }],
  },
  tabButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  tabLabel: {
    ...typography.labelBold,
    letterSpacing: 0,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
});
