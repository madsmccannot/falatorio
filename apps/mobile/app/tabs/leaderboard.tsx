import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { colors, spacing, radii, typography, shadows } from "@fala-pt/ui/tokens";
import { LEAGUE } from "@fala-pt/core";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const leaderboard = trpc.gamification.getLeaderboard.useQuery();
  const data = leaderboard.data;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>League</Text>
        {data?.tier && (
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>
              {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {leaderboard.isLoading ? (
        <Loading message="Loading leaderboard..." />
      ) : !data || data.entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Not in a league yet</Text>
          <Text style={styles.emptyText}>
            Complete lessons to earn XP and join the weekly league.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data.entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          renderItem={({ item: entry }) => {
            const isMe = entry.rank === data.myRank;
            const isPromo = entry.rank <= LEAGUE.PROMOTE_TOP;
            const isDemo = entry.rank > data.entries.length - LEAGUE.DEMOTE_BOTTOM;

            return (
              <View
                style={[
                  styles.row,
                  isMe && styles.rowMe,
                  isPromo && styles.rowPromo,
                  isDemo && styles.rowDemo,
                ]}
              >
                <Text style={[styles.rank, isPromo && styles.rankPromo, isDemo && styles.rankDemo]}>
                  {entry.rank}
                </Text>
                <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
                  {entry.name ?? "Learner"}
                </Text>
                <Text style={styles.xp}>{entry.weeklyXp} XP</Text>
              </View>
            );
          }}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
  },
  tierBadge: {
    backgroundColor: colors.xp,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  tierText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  rowMe: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  rowPromo: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  rowDemo: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent[400],
  },
  rank: {
    width: 28,
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: colors.neutral[500],
  },
  rankPromo: {
    color: colors.success,
  },
  rankDemo: {
    color: colors.accent[500],
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: "500",
    color: colors.neutral[900],
  },
  nameMe: {
    fontWeight: "700",
    color: colors.primary[700],
  },
  xp: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.xp,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["5xl"],
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
