import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { spacing, radii, typography } from "@falatorio/ui/tokens";
import { SUPER_PRICING } from "@falatorio/core";
import { setOnboardingComplete } from "@/lib/storage";

type Plan = "free" | "super";

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const [selected, setSelected] = useState<Plan>("free");

  const handleSelect = (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(plan);
  };

  const handleContinue = () => {
    setOnboardingComplete();
    if (selected === "super") {
      router.replace("/shop/super-detail");
    } else {
      router.replace("/tabs/learn");
    }
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={shared.title}>{t("onboarding.plan_title")}</Text>
        <Text style={shared.subtitle}>
          {t("onboarding.plan_subtitle")}
        </Text>

        <Pressable
          onPress={() => handleSelect("free")}
          style={[local.planCard, { backgroundColor: theme.optionBg, borderColor: selected === "free" ? theme.optionSelectedBorder : theme.optionBorder }]}
        >
          <Text style={[local.planName, { color: theme.text }]}>{t("onboarding.plan_free")}</Text>
          <Text style={[local.planPrice, { color: theme.textMuted }]}>{t("onboarding.plan_free_price")}</Text>
          <View style={local.features}>
            <Text style={[local.feature, { color: theme.textSecondary }]}>{t("onboarding.plan_free_hearts")}</Text>
            <Text style={[local.feature, { color: theme.textSecondary }]}>{t("onboarding.plan_free_ouro")}</Text>
            <Text style={[local.feature, { color: theme.textSecondary }]}>{t("onboarding.plan_free_courses")}</Text>
            <Text style={[local.feature, { color: theme.textSecondary }]}>{t("onboarding.plan_free_ads")}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => handleSelect("super")}
          style={[local.planCard, local.superCard, { borderColor: selected === "super" ? (theme.isDark ? "#67E8F9" : "#0891B2") : (theme.isDark ? "#1E2D45" : "#292524") }]}
        >
          <View style={local.trialBadge}>
            <Text style={local.trialText}>{t("onboarding.plan_trial", { days: SUPER_PRICING.TRIAL_DAYS })}</Text>
          </View>
          <Text style={[local.planName, { color: "#FFFFFF" }]}>{t("onboarding.plan_super")}</Text>
          <Text style={[local.planPrice, { color: "#94A3B8" }]}>
            {SUPER_PRICING.MONTHLY_EUR.toFixed(2)}/mo
          </Text>
          <View style={local.features}>
            <Text style={[local.feature, { color: "#D6D3D1" }]}>{t("onboarding.plan_super_hearts")}</Text>
            <Text style={[local.feature, { color: "#D6D3D1" }]}>{t("onboarding.plan_super_ads")}</Text>
            <Text style={[local.feature, { color: "#D6D3D1" }]}>{t("onboarding.plan_super_ai")}</Text>
            <Text style={[local.feature, { color: "#D6D3D1" }]}>{t("onboarding.plan_super_streak")}</Text>
            <Text style={[local.feature, { color: "#D6D3D1" }]}>{t("onboarding.plan_super_bonus")}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={selected === "super" ? t("onboarding.start_trial") : t("onboarding.start_learning")}
          onPress={handleContinue}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  planCard: {
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  superCard: {
    backgroundColor: "#1C1917",
  },
  trialBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#0891B2",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  trialText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planName: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.lg,
  },
  features: {
    gap: spacing.sm,
  },
  feature: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
