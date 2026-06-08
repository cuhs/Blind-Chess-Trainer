import { Text, StyleSheet, type TextProps } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface PromptTextProps extends TextProps {
  subtitle?: string;
}

export function PromptText({ children, subtitle, style, ...props }: PromptTextProps) {
  return (
    <>
      <Text style={[styles.headline, style]} {...props}>
        {children}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  headline: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
});
