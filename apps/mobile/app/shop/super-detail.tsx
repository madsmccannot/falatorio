import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { purchasePackage, getOfferings, type PurchasesPackage } from "@/lib/revenuecat";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import { SUPER_PRICING } from "@fala-pt/core";

const FEATURES = [
  { title: "Unlimited hearts", desc: "Never wait for hearts to refill" },
  { title: "No ads", desc: "Zero interruptions while learning" },
  { title: "AI error review", desc: "Unlimited grammar explanations from Claude" },
  { title: "Streak repair", desc: "Free streak freeze each month" },
  { title: "Priority support", desc: "Faster response from the team" },
] as const;

export default function SuperDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSuper } = useEntitlements();
  const { showToast } = useToast();
  const [purchasing, setPurchasing] = React.useState(false);

  const handleSubscribe = async (period: "monthly" | "yearly") => {
    try {
      setPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const packages = await getOfferings();
      const packageId = period === "monthly" ? "super_monthly" : "super_yearly";
      const pkg = packages.find(
        (p: PurchasesPackage) => p.identifier === packageId
      );
      if (!pkg) {
        showToast({ message: "Plan not available", type: "error" });
        return;
      }
      await purchasePackage(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: "Welcome to Super!", type: "success" });
      router.replace("/tabs/learn");
    } catch (err: unknown) {
      if (!(err as Record<string, boolean>)?.["userCancelled"]) {
        showToast({ message: "Purchase failed", type: "error" });
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (isSuper) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.activeTitle}>You're Super</Text>
        <Text style={styles.activeSubtitle}>
          All premium features are already unlocked.
        </Text>
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
    >
      <Button
        title="Back"
        onPress={() => router.back()}
        variant="ghost"
        size="sm"
        style={styles.backButton}
      />

      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.hero}>
        <Text style={styles.heroTitle}>Fala PT Super</Text>
        <Text style={styles.heroSubtitle}>
          Learn faster, without limits.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureCheck}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.plans}>
        <View style={styles.planCard}>
          <Text style={styles.planPeriod}>Monthly</Text>
          <Text style={styles.planPrice}>
            €{SUPER_PRICING.MONTHLY_EUR.toFixed(2)}/mo
          </Text>
          <Button
            title="Subscribe"
            onPress={() => handleSubscribe("monthly")}
            variant="outline"
            loading={purchasing}
            style={styles.planButton}
          />
        </View>

        <View style={[styles.planCard, styles.planCardBest]}>
          <View style={styles.bestBadge}>
            <Text style={styles.bestText}>Best value</Text>
          </View>
          <Text style={[styles.planPeriod, styles.planPeriodBest]}>Yearly</Text>
          <Text style={[styles.planPrice, styles.planPriceBest]}>
            €{SUPER_PRICING.YEARLY_EUR.toFixed(2)}/yr
          </Text>
          <Text style={styles.planSaving}>
            Save {Math.round((1 - SUPER_PRICING.YEARLY_EUR / (SUPER_PRICING.MONTHLY_EUR * 12)) * 100)}%
          </Text>
          <Button
            title="Start 7-day free trial"
            onPress={() => handleSubscribe("yearly")}
            loading={purchasing}
            style={styles.planButton}
          />
        </View>
      </Animated.View>

      <Text style={styles.legalText}>
        Payment will be charged to your App Store or Google Play account.
        Subscriptions automatically renew unless cancelled at least 24h before
        the end of the current period.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.neutral[400],
  },
  features: {
    marginBottom: spacing["2xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  featureDesc: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    marginTop: 2,
  },
  plans: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  planCardBest: {
    borderColor: colors.primary[500],
    backgroundColor: colors.neutral[800],
  },
  bestBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  bestText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planPeriod: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[400],
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  planPeriodBest: {
    color: colors.neutral[300],
  },
  planPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: spacing.sm,
  },
  planPriceBest: {
    color: colors.primary[400],
  },
  planSaving: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.primary[400],
    marginBottom: spacing.sm,
  },
  planButton: {
    width: "100%",
  },
  activeTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: "#FFFFFF",
  },
  activeSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.neutral[400],
    marginTop: spacing.xs,
    textAlign: "center",
  },
  legalText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 16,
  },
});
