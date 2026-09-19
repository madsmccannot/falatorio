import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  tier: string;
  rank: number;
  totalPlayers: number;
  weeklyXp: number;
};

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

export function LeagueCard({ tier, rank, totalPlayers, weeklyXp }: Props) {
  const tierColor = TIER_COLORS[tier] ?? colors.neutral[500];

  return (
    <Card elevated style={styles.container}>
      <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
        <Text style={styles.tierText}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>#{rank}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.xp }]}>{weeklyXp}</Text>
          <Text style={styles.statLabel}>Weekly XP</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalPlayers}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: "center",
  },
  tierBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  tierText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[200],
  },
});
