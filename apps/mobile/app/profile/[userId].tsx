import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { StarIcon, BoltIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const L1_NAMES: Record<string, string> = {
  en: "English", es: "Espanol", fr: "Francais", hi: "Hindi", ur: "Urdu",
  ar: "Arabic", bn: "Bengali", de: "Deutsch", zh: "Chinese",
  ru: "Russian", uk: "Ukrainian", tr: "Turkish", pl: "Polish", ko: "Korean", ja: "Japanese",
};

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const profile = trpc.user.getPublicProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId },
  );
  const followMut = trpc.user.follow.useMutation({
    onSuccess: () => utils.user.getPublicProfile.invalidate({ userId: userId! }),
  });
  const unfollowMut = trpc.user.unfollow.useMutation({
    onSuccess: () => utils.user.getPublicProfile.invalidate({ userId: userId! }),
  });

  const data = profile.data;

  if (profile.isLoading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        <Loading message={t("profile.loading")} />
      </View>
    );
  }

  const joinDate = new Date(data.createdAt).toLocaleDateString("pt-PT", {
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"<-"}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          @{data.username}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          {data.avatarUrl ? (
            <Image
              source={{ uri: data.avatarUrl }}
              style={styles.avatarLarge}
            />
          ) : (
            <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(data.name ?? "?").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.displayName, { color: theme.text }]}>{data.name}</Text>
          <Text style={[styles.username, { color: theme.textMuted }]}>@{data.username}</Text>

          <View style={styles.followRow}>
            <Text style={[styles.followStat, { color: theme.text }]}>
              <Text style={styles.followCount}>{data.followerCount}</Text> {t("profile.followers")}
            </Text>
            <Text style={[styles.followDot, { color: theme.textMuted }]}>{"  "}  </Text>
            <Text style={[styles.followStat, { color: theme.text }]}>
              <Text style={styles.followCount}>{data.followingCount}</Text> {t("profile.following")}
            </Text>
          </View>

          <Button
            title={data.isFollowing ? t("profile.unfollow") : t("profile.follow")}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (data.isFollowing) {
                unfollowMut.mutate({ userId: userId! });
              } else {
                followMut.mutate({ userId: userId! });
              }
            }}
            size="sm"
            variant={data.isFollowing ? "outline" : "primary"}
            style={styles.followButton}
          />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <BoltIcon size={18} color={colors.xp} />
            <Text style={[styles.statValue, { color: theme.text }]}>{data.totalXp.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.xp_total")}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <StarIcon size={18} color={colors.streak} />
            <Text style={[styles.statValue, { color: theme.text }]}>{data.streakDays}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.streak")}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{data.lessonsCompleted}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.lessons_completed")}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{data.achievementCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.medals")}</Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{t("profile.my_language")}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{L1_NAMES[data.l1] ?? data.l1}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>CEFR</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{data.cefrLevel}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{t("profile.record")}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{data.longestStreak} dias</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{t("profile.joined")}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{joinDate}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    textAlign: "center",
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
  },
  displayName: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: 2,
  },
  username: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  followRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  followStat: {
    fontSize: typography.sizes.sm,
  },
  followCount: {
    fontWeight: "700",
  },
  followDot: {
    fontSize: typography.sizes.sm,
  },
  followButton: {
    minWidth: 140,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  infoDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
});
