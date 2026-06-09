import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface HeroCopyProps {
  title: string;
  subtitle?: string;
  /** `display` centers and uses the large display face; `section` is left-aligned headline. */
  variant?: 'display' | 'section';
  align?: 'center' | 'left';
}

/**
 * Screen hero: title + optional subtitle. Replaces the duplicated
 * "Cognitive Heatmap" / "Story of the Position" blocks across screens.
 */
export function HeroCopy({
  title,
  subtitle,
  variant = 'display',
  align = variant === 'display' ? 'center' : 'left',
}: HeroCopyProps) {
  const textAlign = align;

  return (
    <View style={[styles.container, align === 'center' && styles.centered]}>
      <Text
        style={[
          variant === 'display' ? styles.displayTitle : styles.sectionTitle,
          { textAlign },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            variant === 'display' ? styles.displaySubtitle : styles.sectionSubtitle,
            { textAlign },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  centered: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  displayTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
  },
  displaySubtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
