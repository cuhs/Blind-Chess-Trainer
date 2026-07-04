import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenScroll } from '@/components/ui/ScreenScroll';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { MatchEloSlider } from '@/components/match/MatchEloSlider';
import { MatchColorPicker } from '@/components/match/MatchColorPicker';
import { MatchSetupHero } from '@/components/match/MatchSetupHero';
import { MATCH_PLAYER_COLOR_DEFAULT } from '@/lib/matchConstants';
import type { MatchPlayerColor } from '@/lib/matchConstants';
import { MATCH_ELO_DEFAULT } from '@/lib/engine/engineElo';
import { initEngine } from '@/lib/engine/stockfishWorker';
import { useGuestStore } from '@/stores/guestStore';

export function MatchSetupScreen() {
  const router = useRouter();
  const storedElo = useGuestStore((s) => s.matchElo);
  const storedColor = useGuestStore((s) => s.matchPlayerColor);
  const setMatchElo = useGuestStore((s) => s.setMatchElo);
  const setMatchPlayerColor = useGuestStore((s) => s.setMatchPlayerColor);
  const [elo, setElo] = useState(storedElo || MATCH_ELO_DEFAULT);
  const [playerColor, setPlayerColor] = useState<MatchPlayerColor>(
    storedColor || MATCH_PLAYER_COLOR_DEFAULT,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setMatchElo(elo);
    setMatchPlayerColor(playerColor);
    setError(null);
    setLoading(true);
    try {
      await initEngine({ elo });
      router.push('/(main)/match/play' as never);
    } catch {
      setError(
        'Could not start Stockfish. Build with npm run ios:build (native dev client — not Expo Go).',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScreenScroll gap={spacing.lg}>
        <HeroCopy
          title="Blindfold Match"
          subtitle="Choose your opponent, then play from memory. Peek anytime. It shapes tomorrow's drills."
          variant="section"
        />

        <MatchSetupHero />

        <MatchColorPicker onChange={setPlayerColor} value={playerColor} />

        <MatchEloSlider onChange={setElo} value={elo} />

        <PrimaryButton
          accessibilityLabel="Start blindfold match"
          disabled={loading}
          label={loading ? 'Loading engine…' : 'Start match'}
          onPress={() => {
            void handleStart();
          }}
          uppercase={false}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.note}>
          Peek freely. Your mistakes become tomorrow&apos;s training puzzles.
        </Text>
      </ScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  note: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  error: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: 'center',
  },
});
