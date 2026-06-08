// TODO(stitch): MatchPrimer — infer from HookBoard
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { OnboardingChrome } from '@/components/onboarding/OnboardingChrome';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useGuestStore } from '@/stores/guestStore';

const MATCH_PRIMER_COPY =
  'Your first game will feel chaotic. You will lose track of the board. That is the point. Peek freely, let the app catch your mistakes, and your failures will build tomorrow\'s puzzles.';

export function MatchPrimerScreen() {
  const router = useRouter();
  const { progressLabel, progressPercent } =
    useOnboardingNavigation('match-primer');
  const setOnboardingComplete = useGuestStore((s) => s.setOnboardingComplete);

  const handleEnter = () => {
    setOnboardingComplete(true);
    router.replace('/(main)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <OnboardingChrome
          label={progressLabel()}
          percent={progressPercent()}
        />

        <Text style={styles.headline}>Ready for your first match?</Text>
        <Text style={styles.body}>{MATCH_PRIMER_COPY}</Text>

        <PrimaryButton label="Enter MindBoard" onPress={handleEnter} />
      </ScrollView>
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
    paddingBottom: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
});
