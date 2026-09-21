import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { USER_GOALS, type UserGoal } from "@falatorio/core";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { spacing } from "@falatorio/ui/tokens";

const GOAL_KEYS: Record<UserGoal, { label: string; desc: string }> = {
  tourism: { label: "onboarding.goal_tourism", desc: "onboarding.goal_tourism_desc" },
  residency: { label: "onboarding.goal_residency", desc: "onboarding.goal_residency_desc" },
  work: { label: "onboarding.goal_work", desc: "onboarding.goal_work_desc" },
  citizenship: { label: "onboarding.goal_citizenship", desc: "onboarding.goal_citizenship_desc" },
  family: { label: "onboarding.goal_family", desc: "onboarding.goal_family_desc" },
  academic: { label: "onboarding.goal_academic", desc: "onboarding.goal_academic_desc" },
};

export default function SelectGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const [selected, setSelected] = useState<UserGoal | null>(null);

  const handleSelect = (goal: UserGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(goal);
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push("/onboarding/select-level");
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={shared.title}>{t("onboarding.goal_title")}</Text>
      <Text style={shared.subtitle}>
        {t("onboarding.goal_subtitle")}
      </Text>

      <View style={local.options}>
        {USER_GOALS.map((goal) => {
          const keys = GOAL_KEYS[goal];
          const isSelected = selected === goal;
          return (
            <Pressable
              key={goal}
              onPress={() => handleSelect(goal)}
              style={[shared.optionCardVertical, isSelected && shared.optionSelected]}
            >
              <Text style={[shared.optionLabel, isSelected && shared.optionLabelSelected]}>
                {t(keys.label as any)}
              </Text>
              <Text style={[shared.optionDesc, { lineHeight: 18 }]}>{t(keys.desc as any)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={t("onboarding.continue")}
          onPress={handleContinue}
          disabled={!selected}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  options: {
    flex: 1,
  },
});
