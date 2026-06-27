import { Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { useGuestStore, type VoiceListenMode } from '@/stores/guestStore';
import { colors, radius, spacing, touch, typography } from '@/theme';

const OPTIONS: Array<{ mode: VoiceListenMode; label: string; description: string }> =
  [
    {
      mode: 'auto',
      label: 'Auto-listen on your turn',
      description: 'Mic arms when it is your move. Tap mic to cancel or re-arm.',
    },
    {
      mode: 'manual',
      label: 'Tap to listen',
      description: 'Tap the mic to start and stop listening. Hold mic to speak.',
    },
  ];

export default function SettingsRoute() {
  const router = useRouter();
  const voiceListenMode = useGuestStore((s) => s.voiceListenMode);
  const setVoiceListenMode = useGuestStore((s) => s.setVoiceListenMode);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader bordered showSettings={false} />
      <View style={styles.content}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>Voice match</Text>
        <View style={styles.card}>
          {OPTIONS.map((option) => {
            const selected = voiceListenMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                accessibilityLabel={`${option.label}${selected ? ', selected' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setVoiceListenMode(option.mode)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>
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
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: touch.min,
    justifyContent: 'center',
  },
  backText: {
    ...typography.labelBold,
    color: colors.tertiary,
  },
  sectionTitle: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.recessedBg,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    gap: spacing.sm,
  },
  option: {
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  optionLabel: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  optionDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
