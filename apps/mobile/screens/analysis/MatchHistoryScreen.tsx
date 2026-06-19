import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { MatchSummaryCard } from '@/components/replay/MatchSummaryCard';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { colors, layout, spacing, typography } from '@/theme';

export function MatchHistoryScreen() {
  const router = useRouter();
  const { hasHydrated, matches } = useMatchHistory();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroCopy
          subtitle="Review saved blindfold matches offline. Replays survive app restarts."
          title="Game Analysis"
        />

        {!hasHydrated ? (
          <Text style={styles.empty}>Loading saved games…</Text>
        ) : matches.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text accessibilityRole="header" style={styles.empty}>
              No saved matches yet
            </Text>
            <Text style={styles.emptyHint}>
              Finish a voice match and your moves, peeks, and voice errors will appear here.
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
    paddingTop: spacing.md,
    paddingBottom: layout.tabBarClearance,
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  emptyWrap: {
    gap: spacing.sm,
  },
  empty: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  emptyHint: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
  },
});
