// TODO(stitch): MatchPrimer — infer from HookBoard
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { ScreenScroll } from '@/components/ui/ScreenScroll';
import { MatchSetupHero } from '@/components/match/MatchSetupHero';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useGuestStore } from '@/stores/guestStore';

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenScroll
        contentContainerStyle={styles.content}
        gap={spacing.lg}
        withTabClearance={false}
      >
        <AppHeader bordered showSettings={false} />

        <ProgressChrome label={progressLabel()} percent={progressPercent()} />

        <View style={styles.heroWrap}>
          <MatchSetupHero />
        </View>

        <HeroCopy
          title="Ready for your first match?"
          subtitle="Your first game will feel chaotic. You will lose track of the board. That is the point. Peek freely, let the app catch your mistakes, and your failures will build tomorrow's puzzles."
        />

        <PrimaryButton label="Enter MindBoard" onPress={handleEnter} />
      </ScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  heroWrap: {
    alignItems: 'center',
  },
});
