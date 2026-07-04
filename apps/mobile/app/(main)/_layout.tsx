import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, layout, radius, spacing, typography, touch } from '@/theme';
import { useHabitStreakSync } from '@/hooks/useHabitStreak';
import { useProfileSync } from '@/hooks/useProfileSync';
import {
  AnalysisTabIcon,
  HomeTabIcon,
  MatchTabIcon,
  TrainingTabIcon,
} from '@/components/ui/icons/TabIcons';

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
  return focused ? colors.primary : colors.outline;
}

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.md);
  useProfileSync();
  useHabitStreakSync();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: touch.strokeWidth,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
          height: layout.tabBarHeight + bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: spacing.xs / 2,
        },
        tabBarLabel: ({ color, children, focused }) => (
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            numberOfLines={1}
            style={[
              styles.tabLabel,
              { color: focused ? colors.primary : color },
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
              size={layout.tabIconSize}
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
              size={layout.tabIconSize}
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
              size={layout.tabIconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ focused }) => (
            <AnalysisTabIcon
              color={tabIconColor(focused)}
              filled={focused}
              size={layout.tabIconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
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
    marginHorizontal: spacing.xs / 2,
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceContainer,
  },
  tabButtonPressed: {
    opacity: 0.85,
  },
  tabLabel: {
    ...typography.labelBold,
    letterSpacing: 0,
    marginTop: spacing.xs / 2,
    textAlign: 'center',
    width: '100%',
  },
});
