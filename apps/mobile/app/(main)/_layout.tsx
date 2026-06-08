import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, radius, spacing, typography, touch } from '@/theme';
import {
  DrillsTabIcon,
  HistoryTabIcon,
  HomeTabIcon,
} from '@/components/ui/icons/TabIcons';

const TAB_ICON_SIZE = 22;

function TabBarButton({
  accessibilityState,
  children,
  onPress,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.tabButton, focused && styles.tabButtonActive]}
    >
      {children}
    </Pressable>
  );
}

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.sm);

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
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
          height: 64 + bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabel: ({ color, children, focused }) => (
          <Text
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
          tabBarIcon: ({ color, focused }) => (
            <HomeTabIcon color={color} filled={focused} size={TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tabs.Screen
        name="drills"
        options={{
          title: 'Drills',
          tabBarIcon: ({ color, focused }) => (
            <DrillsTabIcon color={color} filled={focused} size={TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <HistoryTabIcon color={color} filled={focused} size={TAB_ICON_SIZE} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryContainer,
    transform: [{ translateY: 1 }],
  },
  tabLabel: {
    ...typography.labelBold,
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },
});
