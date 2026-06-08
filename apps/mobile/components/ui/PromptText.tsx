import { Text, StyleSheet, type TextProps } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface PromptTextProps extends TextProps {
  subtitle?: string;
  variant?: 'default' | 'hero';
  highlight?: string;
}

export function PromptText({
  children,
  subtitle,
  variant = 'default',
  highlight,
  style,
  ...props
}: PromptTextProps) {
  const headlineStyle = variant === 'hero' ? styles.heroHeadline : styles.headline;

  const renderHeadline = () => {
    if (typeof children !== 'string' || !highlight || !children.includes(highlight)) {
      return (
        <Text style={[headlineStyle, style]} {...props}>
          {children}
        </Text>
      );
    }

    const [before, after] = children.split(highlight);
    return (
      <Text style={[headlineStyle, style]} {...props}>
        {before}
        <Text style={styles.highlight}>{highlight}</Text>
        {after}
      </Text>
    );
  };

  return (
    <>
      {renderHeadline()}
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
  heroHeadline: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
