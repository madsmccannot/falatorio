import { View, Text, ScrollView, Pressable, Image, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { FlameIcon, BoltIcon, ShieldIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  sapphire: "#0EA5E9",
  ruby: "#EF4444",
  emerald: "#10B981",
  diamond: "#A78BFA",
};

const L1_FLAGS: Record<string, string> = {
  en: "gb", es: "es", fr: "fr", hi: "in", ur: "pk",
  ar: "sa", bn: "bd", de: "de", zh: "cn",
  ru: "ru", uk: "ua", tr: "tr", pl: "pl", ko: "kr", ja: "jp",
};

function BackArrow({ size = 24, color = "#FFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UserPlusIcon({ size = 20, color = "#FFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FlagIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BlockIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM4.93 4.93l14.14 14.14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

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

  const joinYear = new Date(data.createdAt).getFullYear();
  const tierName = data.leagueTier ?? "bronze";
  const tierColor = TIER_COLORS[tierName] ?? TIER_COLORS["bronze"];
  const flagCode = L1_FLAGS[data.l1] ?? null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm, backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <BackArrow size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {data.name ?? t("profile.anon")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          {data.avatarUrl ? (
            <Image source={{ uri: data.avatarUrl }} style={styles.avatarLarge} />
          ) : (
            <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(data.name ?? "?").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Username + joined */}
        <Text style={[styles.usernameJoined, { color: theme.textMuted }]}>
          @{data.username?.toUpperCase() ?? "USER"} {"·"} {t("profile.joined").toUpperCase()} {joinYear}
        </Text>

        {/* Counts row */}
        <View style={styles.countsRow}>
          {flagCode && (
            <View style={styles.countCol}>
              <Image
                source={{ uri: `https://flagcdn.com/w40/${flagCode}.png` }}
                style={styles.countFlag}
              />
              <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.courses")}</Text>
            </View>
          )}
          <View style={styles.countCol}>
            <Text style={[styles.countNumber, { color: theme.text }]}>{data.followingCount}</Text>
            <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.following")}</Text>
          </View>
          <View style={styles.countCol}>
            <Text style={[styles.countNumber, { color: theme.text }]}>{data.followerCount}</Text>
            <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.followers")}</Text>
          </View>
        </View>

        {/* Follow button */}
        <View style={styles.followRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (data.isFollowing) {
                unfollowMut.mutate({ userId: userId! });
              } else {
                followMut.mutate({ userId: userId! });
              }
            }}
            style={[
              styles.followButton,
              data.isFollowing
                ? { borderColor: theme.border, backgroundColor: "transparent" }
                : { backgroundColor: "#1CB0F6", borderColor: "#1CB0F6" },
            ]}
          >
            {!data.isFollowing && <UserPlusIcon size={18} color="#FFF" />}
            <Text style={[
              styles.followButtonText,
              data.isFollowing
                ? { color: theme.text }
                : { color: "#FFFFFF" },
            ]}>
              {data.isFollowing ? t("profile.unfollow").toUpperCase() : t("profile.follow").toUpperCase()}
            </Text>
          </Pressable>
        </View>

        {/* OVERVIEW section */}
        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t("profile.overview")}</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <FlameIcon size={20} />
              <Text style={[styles.overviewValue, { color: theme.text }]}>{data.streakDays} dias</Text>
            </View>
            {flagCode && (
              <View style={styles.overviewItem}>
                <Image
                  source={{ uri: `https://flagcdn.com/w40/${flagCode}.png` }}
                  style={styles.overviewFlag}
                />
                <Text style={[styles.overviewValue, { color: theme.text }]}>1</Text>
              </View>
            )}
            <View style={styles.overviewItem}>
              <ShieldIcon size={20} color={tierColor} />
              <Text style={[styles.overviewValue, { color: theme.text }]}>
                {t(`leaderboard.tier_${tierName}` as any)}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <BoltIcon size={20} color={colors.xp} />
              <Text style={[styles.overviewValue, { color: theme.text }]}>
                {data.totalXp.toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Stats cards */}
        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
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
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{t("profile.lessons_completed")}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{data.lessonsCompleted}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{t("profile.medals")}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{data.achievementCount}</Text>
            </View>
          </View>
        </View>

        {/* Report / Block */}
        <View style={styles.bottomActions}>
          <Pressable
            style={styles.bottomAction}
            onPress={() => {
              Alert.alert(
                t("profile.report_confirm_title" as any),
                t("profile.report_confirm_msg" as any),
                [
                  { text: t("common.cancel" as any), style: "cancel" },
                  {
                    text: t("common.confirm" as any),
                    style: "destructive",
                    onPress: () => {
                      Alert.alert(t("profile.user_reported" as any));
                    },
                  },
                ],
              );
            }}
          >
            <FlagIcon size={18} color={theme.textMuted} />
            <Text style={[styles.bottomActionText, { color: theme.textMuted }]}>
              {t("profile.report_user").toUpperCase()}
            </Text>
          </Pressable>
          <Pressable
            style={styles.bottomAction}
            onPress={() => {
              Alert.alert(
                t("profile.block_confirm_title" as any),
                t("profile.block_confirm_msg" as any),
                [
                  { text: t("common.cancel" as any), style: "cancel" },
                  {
                    text: t("common.confirm" as any),
                    style: "destructive",
                    onPress: () => {
                      Alert.alert(t("profile.user_blocked" as any));
                      router.back();
                    },
                  },
                ],
              );
            }}
          >
            <BlockIcon size={18} color={theme.textMuted} />
            <Text style={[styles.bottomActionText, { color: theme.textMuted }]}>
              {t("profile.block_user").toUpperCase()}
            </Text>
          </Pressable>
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
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    textAlign: "center",
  },
  scroll: {
    paddingBottom: spacing["5xl"],
  },
  avatarSection: {
    alignItems: "center",
    paddingTop: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
  },
  usernameJoined: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  countsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing["2xl"],
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  countCol: {
    alignItems: "center",
    gap: 2,
  },
  countFlag: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  countNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  countLabel: {
    fontSize: typography.sizes.xs,
  },
  followRow: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  followButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dividerFull: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  section: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  overviewItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  overviewValue: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  overviewFlag: {
    width: 24,
    height: 16,
    borderRadius: 2,
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
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    alignItems: "center",
  },
  bottomAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bottomActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
