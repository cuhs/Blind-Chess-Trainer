import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography, touch } from '@/theme';
import {
  DrillsTabIcon,
  HistoryTabIcon,
  HomeTabIcon,
} from '@/components/ui/icons/TabIcons';

const TAB_ICON_SIZE = 22;
const TAB_CONTENT_HEIGHT = 48;

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.sm);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceContainerHigh,
          borderTopWidth: touch.strokeWidth,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingTop: spacing.xs,
          paddingBottom: bottomInset,
          height: TAB_CONTENT_HEIGHT + bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: spacing.xs,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          ...typography.labelBold,
          fontSize: 10,
          lineHeight: 12,
          marginTop: 0,
        },
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
