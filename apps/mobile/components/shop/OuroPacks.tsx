import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { GoldPrisms } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/ui/Toast";
import { purchasePackage, getOfferings, type PurchasesPackage } from "@/lib/revenuecat";
import { trackPurchase } from "@/lib/analytics";
import { trpc } from "@/lib/trpc";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type OuroPack = {
  id: string;
  name: string;
  amount: number;
  priceLabel: string;
  bonus?: string;
  packageId: string;
};

const OURO_PACKS: OuroPack[] = [
  { id: "medium", name: "Bolsa", amount: 1200, priceLabel: "€3.99", bonus: "+200", packageId: "ouro_1200" },
  { id: "large", name: "Cofre", amount: 3000, priceLabel: "€7.99", bonus: "+500", packageId: "ouro_3000" },
  { id: "vault", name: "Tesouro", amount: 8000, priceLabel: "€17.99", bonus: "+2000", packageId: "ouro_8000" },
];

export function OuroPacks() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const utils = trpc.useUtils();
  const [purchasingId, setPurchasingId] = React.useState<string | null>(null);

  const handlePurchase = async (pack: OuroPack) => {
    try {
      setPurchasingId(pack.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const packages = await getOfferings();
      const pkg = packages.find(
        (p: PurchasesPackage) => p.identifier === pack.packageId,
      );
      if (!pkg) {
        showToast({ message: t("toast.pack_unavailable"), type: "error" });
        return;
      }
      await purchasePackage(pkg);
      trackPurchase(pack.packageId, "money", pack.amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: t("toast.ouro_added", { amount: pack.amount }), type: "success" });
      await utils.economy.getBalance.invalidate();
    } catch (err: any) {
      if (!err?.userCancelled) {
        showToast({ message: t("toast.purchase_failed"), type: "error" });
      }
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {t("ouro.section")}
      </Text>
      <Text style={[styles.desc, { color: theme.textMuted }]}>
        {t("ouro.desc")}
      </Text>
      <View style={styles.grid}>
        {OURO_PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            onPress={() => handlePurchase(pack)}
            disabled={!!purchasingId}
            style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
          >
            <GoldPrisms size={24} />
            <Text style={styles.amount}>{pack.amount.toLocaleString()}</Text>
            <Text style={[styles.name, { color: theme.textSecondary }]}>{pack.name}</Text>
            {pack.bonus && (
              <View style={[styles.bonusBadge, { backgroundColor: theme.bgAccent }]}>
                <Text style={[styles.bonusText, { color: theme.isDark ? colors.primary[400] : colors.primary[700] }]}>
                  {pack.bonus}
                </Text>
              </View>
            )}
            <View style={[styles.price, { backgroundColor: colors.primary[600] }]}>
              <Text style={styles.priceText}>{pack.priceLabel}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.lg,
  },
  desc: {
    fontSize: typography.sizes.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    color: colors.ouro,
    marginTop: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  bonusBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  price: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  priceText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
