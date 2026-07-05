import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { TrainingNodeChip } from '@/components/training/TrainingNodeChip';
import { useTrainingPath } from '@/hooks/useTrainingPath';

export function TrainingPathMap() {
  const { units, activeNode } = useTrainingPath();

  return (
    <View style={styles.container}>
      {units.map(({ unit, nodes }) => (
        <View key={unit.id} style={styles.unit}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitTitle}>{unit.title}</Text>
            <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>
          </View>
          <View style={styles.nodeList}>
            {nodes.map(({ node, state, stars }) => (
              <TrainingNodeChip
                key={node.id}
                accessibilityLabel={`${node.title}, ${state}`}
                puzzleKind={node.puzzleKind}
                stars={stars}
                state={state}
                title={node.title}
                onPress={
                  state !== 'locked'
                    ? () =>
                        router.push(
                          `/(main)/training/node/${node.id}` as never,
                        )
                    : undefined
                }
              />
            ))}
          </View>
        </View>
      ))}
      {activeNode ? (
        <Text style={styles.hint}>
          Up next: {activeNode.title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  unit: {
    gap: spacing.sm,
  },
  unitHeader: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  unitTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  unitSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  nodeList: {
    gap: spacing.xs,
  },
  hint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.md,
  },
});
