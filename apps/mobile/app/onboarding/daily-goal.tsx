import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { setString, KEYS } from "@/lib/storage";
import { trackOnboardingStep, trackScreenView } from "@/lib/analytics";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const GOALS = [
  { minutes: 5, labelKey: "onboarding.daily_goal_5", tagKey: "onboarding.daily_goal_casual" },
  { minutes: 10, labelKey: "onboarding.daily_goal_10", tagKey: "onboarding.daily_goal_regular" },
  { minutes: 15, labelKey: "onboarding.daily_goal_15", tagKey: "onboarding.daily_goal_serious" },
  { minutes: 20, labelKey: "onboarding.daily_goal_20", tagKey: "onboarding.daily_goal_intense" },
  { minutes: 30, labelKey: "onboarding.daily_goal_30", tagKey: "onboarding.daily_goal_insane" },
] as const;

export default function DailyGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    trackScreenView("onboarding_daily_goal");
  }, []);

  const handleSelect = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(minutes);
  };

  const handleContinue = () => {
    if (selected === null) return;
    setString(KEYS.DAILY_GOAL, String(selected));
    trackOnboardingStep("daily_goal_selected", String(selected));
    router.push("/onboarding/select-level");
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={shared.title}>{t("onboarding.daily_goal_title")}</Text>
      <Text style={shared.subtitle}>{t("onboarding.daily_goal_subtitle")}</Text>

      <View style={local.options}>
        {GOALS.map((goal) => {
          const isSelected = selected === goal.minutes;
          return (
            <Pressable
              key={goal.minutes}
              onPress={() => handleSelect(goal.minutes)}
              style={[shared.optionCardVertical, local.goalCard, isSelected && shared.optionSelected]}
            >
              <View style={local.goalRow}>
                <Text style={[local.goalTime, { color: isSelected ? colors.primary[theme.isDark ? 400 : 600] : theme.text }]}>
                  {t(goal.labelKey as any)}
                </Text>
                <View style={[local.tag, { backgroundColor: isSelected ? colors.primary[600] : theme.bgInput }]}>
                  <Text style={[local.tagText, { color: isSelected ? "#FFFFFF" : theme.textMuted }]}>
                    {t(goal.tagKey as any)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={t("onboarding.continue")}
          onPress={handleContinue}
          disabled={selected === null}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  options: {
    flex: 1,
    paddingTop: spacing.md,
  },
  goalCard: {
    paddingVertical: spacing.lg,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  goalTime: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
});
