import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { trpc } from "@/lib/trpc";
import { useStreak } from "@/hooks/useStreak";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const profile = trpc.user.getProfile.useQuery();
  const achievements = trpc.gamification.getAchievements.useQuery();
  const { currentDays, longestDays } = useStreak();
  const { isSuper } = useEntitlements();
  const user = profile.data;

  if (profile.isLoading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? "Learner"}</Text>
        <View style={styles.badges}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user?.cefrLevel ?? "A1"}</Text>
          </View>
          {isSuper && (
            <View style={styles.superBadge}>
              <Text style={styles.superText}>SUPER</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total XP" value={user?.totalXp?.toString() ?? "0"} color={colors.xp} />
        <StatCard label="Streak" value={`${currentDays}d`} color={colors.streak} />
        <StatCard label="Longest" value={`${longestDays}d`} color={colors.primary[600]} />
        <StatCard label="Badges" value={(achievements.data?.length ?? 0).toString()} color={colors.crystal} />
      </View>

      <Card style={styles.settingsCard}>
        <SettingsRow label="Language" value={user?.l1?.toUpperCase() ?? "EN"} />
        <SettingsRow label="Goal" value={user?.goal ?? "Not set"} />
        <SettingsRow label="Timezone" value={user?.timezone ?? "UTC"} />
        <SettingsRow label="Daily goal" value={`${user?.dailyGoalMin ?? 15} min`} />
      </Card>

      <Button
        title="Sign out"
        onPress={() => signOut()}
        variant="outline"
        style={styles.signOut}
      />
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: colors.primary[700],
  },
  superBadge: {
    backgroundColor: colors.neutral[900],
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  superText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  settingsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  settingsValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  signOut: {
    marginTop: spacing.md,
  },
});
