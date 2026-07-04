import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { ScreenScroll } from '@/components/ui/ScreenScroll';
import { MatchSummaryCard } from '@/components/replay/MatchSummaryCard';
import { useMatchHistory } from '@/hooks/useMatchHistory';

export function MatchHistoryScreen() {
  const router = useRouter();
  const { hasHydrated, matches } = useMatchHistory();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScreenScroll gap={spacing.lg}>
        <HeroCopy
          subtitle="Review saved blindfold matches offline. Replays survive app restarts."
          title="Game Analysis"
          variant="section"
        />

        {!hasHydrated ? (
          <Text style={styles.status}>Loading saved games…</Text>
        ) : matches.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              No saved matches yet
            </Text>
            <Text style={styles.emptyHint}>
              Finish a voice match and your moves, peeks, and voice errors will
              appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {matches.map((record) => (
              <MatchSummaryCard
                key={record.id}
                onPress={() =>
                  router.push(`/(main)/analysis/${record.id}` as never)
                }
                record={record}
              />
            ))}
          </View>
        )}
      </ScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    gap: spacing.md,
  },
  status: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyWrap: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  emptyHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
