import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useStreak } from "@/hooks/useStreak";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { StarIcon, FlameIcon, TrophyIcon, MedalIcon, GearIcon, CheckIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { getString, setString } from "@/lib/storage";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

const L1_OPTIONS = [
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "Français", native: "Français" },
  { code: "es", label: "Español", native: "Español" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "ro", label: "Română", native: "Română" },
];

const GOAL_OPTIONS = [
  { min: 5, label: "5 min", descKey: "profile.goal_relaxed" as const },
  { min: 10, label: "10 min", descKey: "profile.goal_normal" as const },
  { min: 15, label: "15 min", descKey: "profile.goal_serious" as const },
  { min: 20, label: "20 min", descKey: "profile.goal_intense" as const },
  { min: 30, label: "30 min", descKey: "profile.goal_dedicated" as const },
];

function ChevronRight({ size = 16, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const profile = trpc.user.getProfile.useQuery();
  const achievements = trpc.gamification.getAchievements.useQuery();
  const { t } = useTranslation();
  const { currentDays, longestDays } = useStreak();
  const { isSuper } = useEntitlements();
  const user = profile.data;

  const HAS_CLERK = !!process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"];
  let signOut: (() => void) | null = null;
  if (HAS_CLERK) {
    const { useAuth } = require("@clerk/clerk-expo");
    const auth = useAuth();
    signOut = () => auth.signOut();
  }

  const [selectedL1, setSelectedL1] = useState(() =>
    user?.l1 ?? getString("selected_l1") ?? ""
  );
  const [dailyGoal, setDailyGoal] = useState(() => {
    const stored = getString("daily_goal");
    return stored ? parseInt(stored, 10) : (user?.dailyGoalMin ?? 15);
  });
  const [showL1Picker, setShowL1Picker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const handleSelectL1 = useCallback((code: string) => {
    setSelectedL1(code);
    setString("selected_l1", code);
    setShowL1Picker(false);
  }, []);

  const handleSelectGoal = useCallback((min: number) => {
    setDailyGoal(min);
    setString("daily_goal", min.toString());
    setShowGoalPicker(false);
  }, []);

  if (profile.isLoading) {
    return <Loading fullScreen message={t("profile.loading")} />;
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const l1Display = L1_OPTIONS.find(o => o.code === selectedL1);

  return (
    <>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}
        contentContainerStyle={styles.scroll}
      >
        <View style={[styles.profileHeader, { backgroundColor: theme.headerBg }]}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.gearButton}
            hitSlop={12}
          >
            <GearIcon size={24} color={theme.textMuted} />
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: colors.primary[600] }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.name ?? t("profile.anon")}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.levelBadge, { backgroundColor: theme.bgAccent, borderColor: theme.borderAccent }]}>
              <Text style={[styles.levelText, { color: colors.primary[theme.isDark ? 400 : 700] }]}>
                {user?.cefrLevel ?? "A1"}
              </Text>
            </View>
            {isSuper && (
              <View style={styles.superBadge}>
                <Text style={styles.superText}>SUPER</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <StarIcon size={20} color={colors.xp} />
            <Text style={[styles.statValue, { color: colors.xp }]}>
              {user?.totalXp?.toString() ?? "0"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.xp_total")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <FlameIcon size={20} color={colors.streak} />
            <Text style={[styles.statValue, { color: colors.streak }]}>{currentDays}d</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.streak")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <TrophyIcon size={20} color={colors.primary[400]} />
            <Text style={[styles.statValue, { color: colors.primary[theme.isDark ? 400 : 600] }]}>
              {longestDays}d
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.record")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <MedalIcon size={20} color={colors.crystal} />
            <Text style={[styles.statValue, { color: colors.crystal }]}>
              {(achievements.data?.length ?? 0).toString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t("profile.medals")}</Text>
          </View>
        </View>

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
              <Text style={[styles.settingsValue, { color: theme.text }]}>{dailyGoal} min</Text>
              <ChevronRight color={theme.textMuted} />
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/settings")}
          style={[styles.settingsLink, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        >
          <GearIcon size={20} color={colors.primary[theme.isDark ? 400 : 600]} />
          <Text style={[styles.settingsLinkText, { color: theme.text }]}>{t("profile.settings")}</Text>
          <ChevronRight color={theme.textMuted} />
        </Pressable>

        {signOut && (
          <Button
            title={t("profile.sign_out")}
            onPress={signOut}
            variant="outline"
            style={styles.signOut}
          />
        )}
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
  closeLabel = "Done",
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
    paddingBottom: spacing["5xl"],
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.lg,
    position: "relative",
  },
  gearButton: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  superBadge: {
    backgroundColor: colors.crystal,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: typography.sizes.xs,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
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
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  settingsLinkText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  signOut: {
    marginHorizontal: spacing.lg,
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
  pickerCheckText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
