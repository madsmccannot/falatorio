import { View, Text, ScrollView, Pressable, Modal, Image, StyleSheet, Share } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useStreak } from "@/hooks/useStreak";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Loading } from "@/components/ui/Loading";
import {
  FlameIcon, MedalIcon, GearIcon, CheckIcon,
  BoltIcon, ShieldIcon,
} from "@/components/icons";
import { MasteryDashboard } from "@/components/gamification/MasteryDashboard";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { getString, setString } from "@/lib/storage";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

const L1_OPTIONS = [
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "zh", label: "Mandarin Chinese", native: "中文" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

const GOAL_OPTIONS = [
  { min: 5, label: "5 min", descKey: "profile.goal_relaxed" as const },
  { min: 10, label: "10 min", descKey: "profile.goal_normal" as const },
  { min: 15, label: "15 min", descKey: "profile.goal_serious" as const },
  { min: 20, label: "20 min", descKey: "profile.goal_intense" as const },
  { min: 30, label: "30 min", descKey: "profile.goal_dedicated" as const },
];

const L1_FLAGS: Record<string, string> = {
  en: "gb", es: "es", fr: "fr", hi: "in", ur: "pk",
  ar: "sa", bn: "bd", de: "de", zh: "cn",
  ru: "ru", uk: "ua", tr: "tr", pl: "pl", ko: "kr", ja: "jp",
};

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  sapphire: "#0EA5E9",
  ruby: "#EF4444",
  emerald: "#10B981",
  diamond: "#A78BFA",
};

const ACHIEVEMENT_COLORS: Record<string, string> = {
  milestone: "#F59E0B",
  learning: "#3B82F6",
  streak: "#EF4444",
  cultural: "#8B5CF6",
  social: "#EC4899",
  competence: "#10B981",
};

function ChevronRight({ size = 16, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusCircle({ size = 48, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={color} strokeWidth={1.5} strokeDasharray="3 3" />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const profile = trpc.user.getProfile.useQuery();
  const achievements = trpc.gamification.getAchievements.useQuery();
  const cefrEstimate = trpc.mastery.getCEFREstimate.useQuery();
  const following = trpc.user.getFollowing.useQuery({});
  const followers = trpc.user.getFollowers.useQuery({});
  const leaderboard = trpc.gamification.getLeaderboard.useQuery();
  const { t } = useTranslation();
  const { currentDays } = useStreak();
  const { isSuper } = useEntitlements();
  const user = profile.data;


  const [selectedL1, setSelectedL1] = useState(() =>
    user?.l1 ?? getString("selected_l1") ?? ""
  );
  const [dailyGoal, setDailyGoal] = useState(() => {
    const stored = getString("daily_goal");
    return stored ? parseInt(stored, 10) : (user?.dailyGoalMin ?? null);
  });
  const [showL1Picker, setShowL1Picker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const updateSettings = trpc.user.updateSettings.useMutation();

  useEffect(() => {
    if (!user) return;
    const stored = getString("daily_goal");
    if (stored) {
      const local = parseInt(stored, 10);
      if (dailyGoal == null) setDailyGoal(local);
      if (user.dailyGoalMin !== local) {
        updateSettings.mutate({ dailyGoalMin: local }, { onError: () => {} });
      }
    } else if (user.dailyGoalMin != null) {
      setDailyGoal(user.dailyGoalMin);
      setString("daily_goal", user.dailyGoalMin.toString());
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && !selectedL1 && user.l1) {
      setSelectedL1(user.l1);
    }
  }, [user?.l1]);

  const handleSelectL1 = useCallback((code: string) => {
    setSelectedL1(code);
    setString("selected_l1", code);
    setShowL1Picker(false);
  }, []);

  const handleSelectGoal = useCallback((min: number) => {
    setDailyGoal(min);
    setString("daily_goal", min.toString());
    setShowGoalPicker(false);
    updateSettings.mutate({ dailyGoalMin: min });
  }, [updateSettings]);

  const unlockedAchievements = useMemo(() => {
    if (!achievements.data) return [];
    const unlockedIds = new Set(achievements.data.unlocked.map(u => u.badgeId));
    return achievements.data.all.filter(a => unlockedIds.has(a.id));
  }, [achievements.data]);

  const friendStreaks = useMemo(() => {
    if (!following.data) return [];
    return following.data
      .filter(f => (f.streakDays ?? 0) > 0)
      .sort((a, b) => (b.streakDays ?? 0) - (a.streakDays ?? 0))
      .slice(0, 4);
  }, [following.data]);

  if (profile.isLoading) {
    return <Loading fullScreen message={t("profile.loading")} />;
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const l1Display = L1_OPTIONS.find(o => o.code === selectedL1);
  const tierName = leaderboard.data?.tier ?? "bronze";
  const tierColor = TIER_COLORS[tierName] ?? TIER_COLORS["bronze"];
  const joinYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const superYear = isSuper && user?.tierExpiresAt ? new Date(user.tierExpiresAt).getFullYear() : null;
  const l1FlagCode = L1_FLAGS[selectedL1] ?? L1_FLAGS[user?.l1 ?? ""] ?? null;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={styles.scroll}
      >
        {/* Header with blue hero */}
        <View style={[styles.heroSection, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroNameCol}>
              <Text style={styles.heroName}>{user?.name ?? t("profile.anon")}</Text>
              {isSuper && superYear && (
                <Text style={styles.heroSuperText}>{t("profile.super_since")} {superYear}</Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.gearButton}
              hitSlop={12}
            >
              <GearIcon size={24} color="#E2E8F0" />
            </Pressable>
          </View>

          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary[600] }]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            {isSuper && (
              <View style={styles.superBadge}>
                <Text style={styles.superBadgeText}>SUPER</Text>
              </View>
            )}
          </View>
        </View>

        {/* Username + joined + stats */}
        <View style={[styles.infoSection, { backgroundColor: theme.bg }]}>
          <Text style={[styles.usernameJoined, { color: theme.textMuted }]}>
            @{user?.username?.toUpperCase() ?? "USER"} {"·"} {t("profile.joined").toUpperCase()} {joinYear}
          </Text>

          <View style={styles.countsRow}>
            {l1FlagCode && (
              <View style={styles.countCol}>
                <View style={styles.countIconRow}>
                  <Image
                    source={{ uri: `https://flagcdn.com/w40/${l1FlagCode}.png` }}
                    style={styles.countFlag}
                  />
                </View>
                <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.courses")}</Text>
              </View>
            )}
            <Pressable onPress={() => router.push("/profile/followers")} style={styles.countCol}>
              <Text style={[styles.countNumber, { color: theme.text }]}>{following.data?.length ?? 0}</Text>
              <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.following")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/profile/followers")} style={styles.countCol}>
              <Text style={[styles.countNumber, { color: theme.text }]}>{followers.data?.length ?? 0}</Text>
              <Text style={[styles.countLabel, { color: theme.textMuted }]}>{t("profile.followers")}</Text>
            </Pressable>
          </View>

          <View style={styles.addFriendsRow}>
            <Pressable
              style={[styles.addFriendsButton, { borderColor: theme.border }]}
              onPress={() => {
                Share.share({ message: t("profile.share_invite" as any) }).catch(() => {});
              }}
            >
              <UserPlusIcon size={18} color={theme.textMuted} />
              <Text style={[styles.addFriendsText, { color: theme.text }]}>{t("profile.add_friends").toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />

        {/* OVERVIEW section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t("profile.overview")}</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <FlameIcon size={20} />
              <Text style={[styles.overviewValue, { color: theme.text }]}>{currentDays} {currentDays === 1 ? "dia" : "dias"}</Text>
            </View>
            {l1FlagCode && (
              <View style={styles.overviewItem}>
                <Image
                  source={{ uri: `https://flagcdn.com/w40/${l1FlagCode}.png` }}
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
                {(user?.totalXp ?? 0).toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />

        {/* FRIEND STREAKS section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t("profile.friend_streaks")}</Text>
          <View style={styles.friendStreaksRow}>
            {friendStreaks.map(friend => (
              <Pressable
                key={friend.id}
                style={styles.friendStreakCol}
                onPress={() => router.push(`/profile/${friend.id}`)}
              >
                {friend.avatarUrl ? (
                  <Image source={{ uri: friend.avatarUrl }} style={styles.friendAvatar} />
                ) : (
                  <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                    <Text style={styles.friendAvatarInitial}>
                      {(friend.name ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.friendFireRow}>
                  <FlameIcon size={14} />
                  <Text style={[styles.friendStreakCount, { color: theme.text }]}>{friend.streakDays ?? 0}</Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              style={styles.friendStreakCol}
              onPress={() => router.push("/profile/followers")}
            >
              <PlusCircle size={48} color={theme.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />

        {/* ACHIEVEMENTS section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t("profile.achievements")}</Text>
          {unlockedAchievements.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
              {unlockedAchievements.map(a => {
                const bgColor = ACHIEVEMENT_COLORS[a.category] ?? ACHIEVEMENT_COLORS["milestone"];
                return (
                  <View key={a.id} style={styles.achievementCircle}>
                    <View style={[styles.achievementBg, { backgroundColor: bgColor }]}>
                      <MedalIcon size={28} color="#FFF" />
                    </View>
                    <Text style={[styles.achievementName, { color: theme.textMuted }]} numberOfLines={1}>
                      {a.name}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyAchievements, { color: theme.textMuted }]}>
              {t("profile.no_achievements")}
            </Text>
          )}
        </View>

        <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />

        {/* Mastery dashboard */}
        {cefrEstimate.data && (
          <>
            <MasteryDashboard
              level={cefrEstimate.data.level}
              confidence={cefrEstimate.data.confidence}
              strongDomains={cefrEstimate.data.strongDomains}
              weakDomains={cefrEstimate.data.weakDomains}
              unevaluatedDomains={cefrEstimate.data.unevaluatedDomains}
            />
            <View style={[styles.dividerFull, { backgroundColor: theme.border }]} />
          </>
        )}

        {/* Settings card */}
        <View style={[styles.settingsCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Pressable style={styles.settingsRow} onPress={() => setShowL1Picker(true)}>
            <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>{t("profile.my_language")}</Text>
            <View style={styles.settingsRight}>
              <Text style={[styles.settingsValue, { color: theme.text }]}>
                {l1Display ? l1Display.native : t("profile.choose")}
              </Text>
              <ChevronRight color={theme.textMuted} />
            </View>
          </Pressable>
          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingsRow} onPress={() => setShowGoalPicker(true)}>
            <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>{t("profile.daily_goal")}</Text>
            <View style={styles.settingsRight}>
              <Text style={[styles.settingsValue, { color: theme.text }]}>{dailyGoal != null ? `${dailyGoal} min` : t("profile.choose")}</Text>
              <ChevronRight color={theme.textMuted} />
            </View>
          </Pressable>
        </View>

      </ScrollView>

      <PickerModal
        visible={showL1Picker}
        title={t("profile.my_language")}
        closeLabel={t("profile.done")}
        onClose={() => setShowL1Picker(false)}
        theme={theme}
      >
        {L1_OPTIONS.map(opt => (
          <Pressable
            key={opt.code}
            style={[
              styles.pickerItem,
              selectedL1 === opt.code && { backgroundColor: theme.bgAccent },
            ]}
            onPress={() => handleSelectL1(opt.code)}
          >
            <Text style={[styles.pickerLabel, { color: theme.text }]}>{opt.native}</Text>
            <Text style={[styles.pickerSublabel, { color: theme.textMuted }]}>{opt.label}</Text>
            {selectedL1 === opt.code && (
              <View style={[styles.pickerCheck, { backgroundColor: colors.primary[500] }]}>
                <CheckIcon size={14} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        ))}
      </PickerModal>

      <PickerModal
        visible={showGoalPicker}
        title={t("profile.daily_goal")}
        closeLabel={t("profile.done")}
        onClose={() => setShowGoalPicker(false)}
        theme={theme}
      >
        {GOAL_OPTIONS.map(opt => (
          <Pressable
            key={opt.min}
            style={[
              styles.pickerItem,
              dailyGoal === opt.min && { backgroundColor: theme.bgAccent },
            ]}
            onPress={() => handleSelectGoal(opt.min)}
          >
            <Text style={[styles.pickerLabel, { color: theme.text }]}>{opt.label}</Text>
            <Text style={[styles.pickerSublabel, { color: theme.textMuted }]}>{t(opt.descKey)}</Text>
            {dailyGoal === opt.min && (
              <View style={[styles.pickerCheck, { backgroundColor: colors.primary[500] }]}>
                <CheckIcon size={14} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        ))}
      </PickerModal>
    </>
  );
}

function PickerModal({
  visible,
  title,
  onClose,
  theme,
  closeLabel = "Feito",
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
  closeLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: theme.bgElevated }]} onPress={e => e.stopPropagation()}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={[styles.modalClose, { color: colors.primary[theme.isDark ? 400 : 600] }]}>{closeLabel}</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 120,
  },
  heroSection: {
    backgroundColor: "#1560BD",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["2xl"],
    alignItems: "center",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: spacing.lg,
  },
  heroNameCol: {
    flex: 1,
  },
  heroName: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSuperText: {
    fontSize: typography.sizes.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  superBadge: {
    position: "absolute",
    bottom: -4,
    right: -8,
    backgroundColor: "#A855F7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    transform: [{ skewX: "-6deg" }],
  },
  superBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  infoSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  usernameJoined: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  countsRow: {
    flexDirection: "row",
    gap: spacing["2xl"],
    marginBottom: spacing.lg,
  },
  countCol: {
    alignItems: "center",
    gap: 2,
  },
  countIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  addFriendsRow: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },
  addFriendsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  addFriendsText: {
    fontSize: typography.sizes.sm,
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
  friendStreaksRow: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  friendStreakCol: {
    alignItems: "center",
    gap: 4,
  },
  friendAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarInitial: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  friendFireRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  friendStreakCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  achievementsScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  achievementCircle: {
    alignItems: "center",
    width: 72,
    gap: 4,
  },
  achievementBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementName: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyAchievements: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  settingsDivider: {
    height: 1,
    marginLeft: spacing.lg,
  },
  settingsLabel: {
    fontSize: typography.sizes.sm,
  },
  settingsValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  modalClose: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  modalScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginVertical: 2,
  },
  pickerLabel: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    flex: 1,
  },
  pickerSublabel: {
    fontSize: typography.sizes.sm,
    marginRight: spacing.md,
  },
  pickerCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
