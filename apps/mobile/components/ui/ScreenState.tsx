import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface ScreenStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function ScreenState({
  title,
  message,
  actionLabel,
  onAction,
  children,
}: ScreenStateProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        {title ? (
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <Text style={styles.message}>{message}</Text>
        {children}
        {actionLabel && onAction ? (
          <PrimaryButton
            accessibilityLabel={actionLabel}
            label={actionLabel}
            onPress={onAction}
            uppercase={false}
            variant="ghost"
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
