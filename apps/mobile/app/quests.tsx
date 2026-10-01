import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { CheckIcon, StarIcon, BoltIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Circle } from "react-native-svg";

function TargetIcon({ size = 20, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const quests = trpc.quests.getDailyQuests.useQuery();
  const monthly = trpc.quests.getMonthlyProgress.useQuery();
  const claimReward = trpc.quests.claimReward.useMutation();
  const utils = trpc.useUtils();

  const questData = quests.data ?? [];
  const completedCount = questData.filter((q) => q.completed).length;

  const monthlyData = monthly.data;
  const monthPoints = monthlyData?.points ?? 0;
  const targetPoints = monthlyData?.targetPoints ?? 31;
  const canClaim = monthPoints >= targetPoints && !monthlyData?.rewardClaimed;

  const handleClaim = () => {
    claimReward.mutate(undefined, {
      onSuccess: () => {
        utils.quests.getMonthlyProgress.invalidate();
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"<-"}</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{t("quests.title")}</Text>
        <View style={styles.spacer} />
      </View>

      {quests.isLoading ? (
        <Loading message={t("quests.loading")} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.pointsCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={styles.pointsHeader}>
              <TargetIcon size={24} color={colors.ouro} />
              <Text style={[styles.pointsTitle, { color: theme.text }]}>{t("quests.monthly_goal")}</Text>
            </View>
            <View style={styles.pointsRow}>
              <Text style={[styles.pointsValue, { color: colors.ouro }]}>
                {monthPoints}/{targetPoints}
              </Text>
              <Text style={[styles.pointsLabel, { color: theme.textMuted }]}>
                {t("quests.points")}
              </Text>
            </View>
            <View style={[styles.monthProgressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.monthProgressFill,
                  { width: `${Math.min((monthPoints / targetPoints) * 100, 100)}%` as any },
                ]}
              />
            </View>
            {canClaim && (
              <Button
                title={t("quests.claim_reward")}
                onPress={handleClaim}
                size="md"
                style={styles.claimBtn}
              />
            )}
            {monthlyData?.rewardClaimed && (
              <View style={styles.claimedRow}>
                <CheckIcon size={16} color={colors.success} />
                <Text style={[styles.claimedText, { color: colors.success }]}>
                  {t("quests.reward_claimed")}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t("quests.today")}
          </Text>

          <View style={[styles.progressSummary, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}>
            <BoltIcon size={20} color={colors.xp} />
            <Text style={[styles.progressText, { color: theme.text }]}>
              {completedCount}/3 {t("quests.completed")}
            </Text>
            {completedCount > 0 && (
              <View style={styles.pointBadge}>
                <Text style={styles.pointBadgeText}>+{completedCount} pt</Text>
              </View>
            )}
          </View>

          {questData.map((quest) => (
            <View
              key={quest.id}
              style={[
                styles.questCard,
                { backgroundColor: theme.bgCard, borderColor: theme.border },
                quest.completed && { borderColor: colors.success + "40" },
              ]}
            >
              <View style={styles.questLeft}>
                {quest.completed ? (
                  <View style={[styles.questCheck, { backgroundColor: colors.success }]}>
                    <CheckIcon size={14} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={[styles.questCircle, { borderColor: theme.border }]}>
                    <StarIcon size={14} color={theme.textMuted} />
                  </View>
                )}
              </View>
              <View style={styles.questContent}>
                <Text
                  style={[
                    styles.questDesc,
                    { color: theme.text },
                    quest.completed && { textDecorationLine: "line-through", color: theme.textMuted },
                  ]}
                >
                  {quest.description}
                </Text>
                <View style={[styles.questProgressTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.questProgressFill,
                      {
                        width: `${Math.min((quest.currentValue / quest.targetValue) * 100, 100)}%` as any,
                        backgroundColor: quest.completed ? colors.success : colors.primary[500],
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.questProgressText, { color: theme.textMuted }]}>
                  {quest.currentValue}/{quest.targetValue}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.infoCard, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>{t("quests.how_it_works")}</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {t("quests.how_desc")}
            </Text>
          </View>
        </ScrollView>
      )}
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
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  spacer: {
    width: 32,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  pointsCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pointsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  pointsValue: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "800",
  },
  pointsLabel: {
    fontSize: typography.sizes.sm,
  },
  monthProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  monthProgressFill: {
    height: "100%",
    backgroundColor: colors.ouro,
    borderRadius: 4,
  },
  claimBtn: {
    marginTop: spacing.sm,
  },
  claimedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  claimedText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  progressSummary: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  progressText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  pointBadge: {
    backgroundColor: colors.ouro,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pointBadgeText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  questCard: {
    flexDirection: "row",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: "flex-start",
  },
  questLeft: {
    paddingTop: 2,
  },
  questCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  questCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  questContent: {
    flex: 1,
    gap: spacing.xs,
  },
  questDesc: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  questProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  questProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: typography.sizes.xs,
  },
  infoCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  infoText: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
