import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { purchasePackage, getOfferings, type PurchasesPackage } from "@/lib/revenuecat";
import { useOuro } from "@/hooks/useOuro";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { GoldPrisms } from "@/components/icons";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type OuroPack = {
  id: string;
  name: string;
  amount: number;
  priceLabel: string;
  bonus?: string;
  packageId: string;
};

const PACKS: OuroPack[] = [
  { id: "small", name: "Saco", amount: 500, priceLabel: "€1.99", packageId: "ouro_500" },
  { id: "medium", name: "Bolsa", amount: 1200, priceLabel: "€3.99", bonus: "+200 bonus", packageId: "ouro_1200" },
  { id: "large", name: "Cofre", amount: 3000, priceLabel: "€7.99", bonus: "+500 bonus", packageId: "ouro_3000" },
  { id: "vault", name: "Tesouro", amount: 8000, priceLabel: "€17.99", bonus: "+2000 bonus", packageId: "ouro_8000" },
];

export default function OuroPacksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { balance } = useOuro();
  const { showToast } = useToast();
  const [purchasing, setPurchasing] = React.useState<string | null>(null);

  const handlePurchase = async (pack: OuroPack) => {
    try {
      setPurchasing(pack.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const packages = await getOfferings();
      const pkg = packages.find(
        (p: PurchasesPackage) => p.identifier === pack.packageId
      );
      if (!pkg) {
        showToast({ message: t("toast.pack_unavailable"), type: "error" });
        return;
      }
      await purchasePackage(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: t("toast.ouro_added", { amount: pack.amount }), type: "success" });
    } catch (err: any) {
      if (!err?.userCancelled) {
        showToast({ message: t("toast.purchase_failed"), type: "error" });
      }
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bgElevated }]}>
        <Button title={t("ouro.back")} onPress={() => router.back()} variant="ghost" size="sm" />
        <Text style={[styles.title, { color: theme.text }]}>{t("ouro.title")}</Text>
        <View style={[styles.balanceChip, { backgroundColor: theme.bgInput }]}>
          <GoldPrisms size={14} />
          <Text style={[styles.balanceValue, { color: theme.text }]}>{balance}</Text>
        </View>
      </View>

      <FlatList
        data={PACKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: pack }) => (
          <Card elevated style={styles.packCard}>
            <View style={styles.packTop}>
              <GoldPrisms size={40} />
              <Text style={styles.packAmount}>{pack.amount.toLocaleString()}</Text>
              <Text style={[styles.packName, { color: theme.textSecondary }]}>{pack.name}</Text>
              {pack.bonus && (
                <View style={[styles.bonusBadge, { backgroundColor: theme.bgAccent }]}>
                  <Text style={[styles.bonusText, { color: theme.isDark ? colors.primary[400] : colors.primary[700] }]}>{pack.bonus}</Text>
                </View>
              )}
            </View>
            <Button
              title={pack.priceLabel}
              onPress={() => handlePurchase(pack)}
              loading={purchasing === pack.id}
              disabled={!!purchasing}
              size="lg"
              style={styles.buyButton}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  balanceValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  packCard: {
    marginBottom: spacing.md,
    alignItems: "center",
    padding: spacing.xl,
  },
  packTop: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  packAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.ouro,
  },
  packName: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  bonusBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  bonusText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  buyButton: {
    width: "100%",
  },
});
