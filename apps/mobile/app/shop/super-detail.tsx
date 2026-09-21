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
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { CheckIcon } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { SUPER_PRICING } from "@falatorio/core";

const FEATURES: { titleKey: TKey; descKey: TKey }[] = [
  { titleKey: "super.feat_hearts", descKey: "super.feat_hearts_desc" },
  { titleKey: "super.feat_ads", descKey: "super.feat_ads_desc" },
  { titleKey: "super.feat_ai", descKey: "super.feat_ai_desc" },
  { titleKey: "super.feat_streak", descKey: "super.feat_streak_desc" },
  { titleKey: "super.feat_support", descKey: "super.feat_support_desc" },
];

export default function SuperDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
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
        showToast({ message: t("toast.plan_unavailable"), type: "error" });
        return;
      }
      await purchasePackage(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: t("toast.welcome_super"), type: "success" });
      router.replace("/tabs/learn");
    } catch (err: unknown) {
      if (!(err as Record<string, boolean>)?.["userCancelled"]) {
        showToast({ message: t("toast.purchase_failed"), type: "error" });
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (isSuper) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.isDark ? theme.bg : "#1C1917", paddingTop: insets.top }]}>
        <Text style={[styles.activeTitle, { color: theme.isDark ? theme.text : "#FFFFFF" }]}>{t("super.active_title")}</Text>
        <Text style={[styles.activeSubtitle, { color: theme.textMuted }]}>
          {t("super.active_text")}
        </Text>
        <Button
          title={t("super.back")}
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  const cardBg = theme.isDark ? theme.bgCard : "#292524";
  const cardBorder = theme.isDark ? theme.border : "#44403C";
  const bestBorder = theme.isDark ? colors.primary[400] : colors.primary[500];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.isDark ? theme.bg : "#1C1917", paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
    >
      <Button
        title={t("super.back")}
        onPress={() => router.back()}
        variant="ghost"
        size="sm"
        style={styles.backButton}
      />

      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.hero}>
        <Text style={[styles.heroTitle, { color: theme.isDark ? theme.text : "#FFFFFF" }]}>{t("super.title")}</Text>
        <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
          {t("super.subtitle")}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureCheck}>
              <CheckIcon size={14} color="#FFFFFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.isDark ? theme.text : "#FFFFFF" }]}>{t(f.titleKey)}</Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>{t(f.descKey)}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.plans}>
        <View style={[styles.planCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.planPeriod, { color: theme.textMuted }]}>{t("super.monthly")}</Text>
          <Text style={[styles.planPrice, { color: theme.isDark ? theme.text : "#FFFFFF" }]}>
            {"€"}{SUPER_PRICING.MONTHLY_EUR.toFixed(2)}/mo
          </Text>
          <Button
            title={t("super.subscribe")}
            onPress={() => handleSubscribe("monthly")}
            variant="outline"
            loading={purchasing}
            style={styles.planButton}
          />
        </View>

        <View style={[styles.planCard, { backgroundColor: cardBg, borderColor: bestBorder }]}>
          <View style={styles.bestBadge}>
            <Text style={styles.bestText}>{t("super.best_value")}</Text>
          </View>
          <Text style={[styles.planPeriod, { color: theme.textSecondary }]}>{t("super.yearly")}</Text>
          <Text style={[styles.planPrice, { color: colors.primary[400] }]}>
            {"€"}{SUPER_PRICING.YEARLY_EUR.toFixed(2)}/yr
          </Text>
          <Text style={styles.planSaving}>
            {t("super.save", { percent: Math.round((1 - SUPER_PRICING.YEARLY_EUR / (SUPER_PRICING.MONTHLY_EUR * 12)) * 100) })}
          </Text>
          <Button
            title={t("super.trial")}
            onPress={() => handleSubscribe("yearly")}
            loading={purchasing}
            style={styles.planButton}
          />
        </View>
      </Animated.View>

      <Text style={[styles.legalText, { color: theme.textMuted }]}>
        {t("super.legal")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
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
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  featureDesc: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  plans: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
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
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  planPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    marginBottom: spacing.sm,
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
  },
  activeSubtitle: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  legalText: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 16,
  },
});
