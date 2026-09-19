import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import { SUPER_PRICING } from "@fala-pt/core";
import { setOnboardingComplete } from "@/lib/storage";

type Plan = "free" | "super";

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Choose your path</Text>
        <Text style={styles.subtitle}>
          You can upgrade to Super anytime from the shop.
        </Text>

        <Pressable
          onPress={() => handleSelect("free")}
          style={[styles.planCard, selected === "free" && styles.planSelected]}
        >
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planPrice}>Forever free</Text>
          <View style={styles.features}>
            <Text style={styles.feature}>5 hearts per session</Text>
            <Text style={styles.feature}>Earn ouro by completing lessons</Text>
            <Text style={styles.feature}>Full course access</Text>
            <Text style={styles.feature}>Ads between lessons</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => handleSelect("super")}
          style={[styles.planCard, styles.superCard, selected === "super" && styles.superSelected]}
        >
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>{SUPER_PRICING.TRIAL_DAYS} days free trial</Text>
          </View>
          <Text style={[styles.planName, styles.superName]}>Super</Text>
          <Text style={[styles.planPrice, styles.superPrice]}>
            {SUPER_PRICING.MONTHLY_EUR.toFixed(2)}/mo
          </Text>
          <View style={styles.features}>
            <Text style={[styles.feature, styles.superFeature]}>Unlimited hearts</Text>
            <Text style={[styles.feature, styles.superFeature]}>Zero ads</Text>
            <Text style={[styles.feature, styles.superFeature]}>AI error review with L1 explanations</Text>
            <Text style={[styles.feature, styles.superFeature]}>Streak recovery (1x/week)</Text>
            <Text style={[styles.feature, styles.superFeature]}>Bonus monthly power-ups</Text>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={selected === "super" ? "Start free trial" : "Start learning"}
          onPress={handleContinue}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing["2xl"],
  },
  planCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  planSelected: {
    borderColor: colors.primary[600],
  },
  superCard: {
    backgroundColor: colors.neutral[900],
  },
  superSelected: {
    borderColor: colors.primary[400],
  },
  trialBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary[500],
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
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  superName: {
    color: "#FFFFFF",
  },
  planPrice: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing.lg,
  },
  superPrice: {
    color: colors.neutral[400],
  },
  features: {
    gap: spacing.sm,
  },
  feature: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  superFeature: {
    color: colors.neutral[300],
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
