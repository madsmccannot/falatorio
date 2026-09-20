import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFSRS } from "@/hooks/useFSRS";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dueItems, dueCount, isLoading } = useFSRS();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>
          Review exercises the FSRS algorithm says you're about to forget.
        </Text>
      </View>

      <View style={styles.dueCard}>
        <Text style={styles.dueCount}>{dueCount}</Text>
        <Text style={styles.dueLabel}>items due for review</Text>
        {dueCount > 0 && (
          <Button
            title="Start review session"
            onPress={() => router.push("/lesson/review")}
            size="lg"
            style={styles.startButton}
          />
        )}
      </View>

      {isLoading ? (
        <Loading message="Checking your review queue..." />
      ) : (
        <FlatList
          data={dueItems}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.reviewItem}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewType}>{item.exerciseType}</Text>
                <Text style={styles.reviewScore}>
                  {Math.round(item.lastScore * 100)}%
                </Text>
              </View>
              <Text style={styles.reviewReps}>
                {item.reps} reps · {item.lapses} lapses
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyText}>
                No items are due for review right now.
                Keep learning to build your review queue.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  dueCard: {
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  dueCount: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.primary[600],
  },
  dueLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    marginTop: spacing.xs,
  },
  startButton: {
    marginTop: spacing.lg,
    width: "100%",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  reviewItem: {
    marginBottom: spacing.sm,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewType: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  reviewScore: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.primary[600],
  },
  reviewReps: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    textAlign: "center",
    lineHeight: 20,
  },
});
