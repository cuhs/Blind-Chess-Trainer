import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { layout, spacing } from '@/theme';

interface ScreenScrollProps extends ScrollViewProps {
  withTabClearance?: boolean;
  gap?: number;
}

export function ScreenScroll({
  children,
  contentContainerStyle,
  withTabClearance = true,
  gap = spacing.md,
  showsVerticalScrollIndicator = false,
  ...props
}: ScreenScrollProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { gap },
        withTabClearance && styles.tabClearance,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.marginMobile,
    flexGrow: 1,
  },
  tabClearance: {
    paddingBottom: layout.tabBarClearance,
  },
});
