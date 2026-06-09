import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { MascotAvatar } from '@/components/ui/MascotAvatar';

interface PlaceholderScreenProps {
  title: string;
  body: string;
  /** Small pill above the title, e.g. "Phase 3" or "Coming soon". */
  badge?: string;
  /** Centered icon/illustration shown in the hero circle. Defaults to the mascot. */
  icon?: ReactNode;
}

/**
 * Centered "coming soon" scaffold for not-yet-built routes (Match, Settings).
 * Keeps unfinished tabs on-brand instead of bare left-aligned text.
 */
export function PlaceholderScreen({
  title,
  body,
  badge,
  icon,
}: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>{icon ?? <MascotAvatar size={56} />}</View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.labelBold,
    color: colors.onSecondaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
