import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { purchasePackage, getOfferings, type PurchasesPackage } from "@/lib/revenuecat";
import { useCrystals } from "@/hooks/useCrystals";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type CrystalPack = {
  id: string;
  name: string;
  amount: number;
  priceLabel: string;
  bonus?: string;
  packageId: string;
};

const PACKS: CrystalPack[] = [
  { id: "small", name: "Pouch", amount: 500, priceLabel: "€1.99", packageId: "crystals_500" },
  { id: "medium", name: "Bag", amount: 1200, priceLabel: "€3.99", bonus: "+200 bonus", packageId: "crystals_1200" },
  { id: "large", name: "Chest", amount: 3000, priceLabel: "€7.99", bonus: "+500 bonus", packageId: "crystals_3000" },
  { id: "vault", name: "Vault", amount: 8000, priceLabel: "€17.99", bonus: "+2000 bonus", packageId: "crystals_8000" },
];

export default function CrystalPacksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balance } = useCrystals();
  const { showToast } = useToast();
  const [purchasing, setPurchasing] = React.useState<string | null>(null);

  const handlePurchase = async (pack: CrystalPack) => {
    try {
      setPurchasing(pack.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const packages = await getOfferings();
      const pkg = packages.find(
        (p: PurchasesPackage) => p.identifier === pack.packageId
      );
      if (!pkg) {
        showToast({ message: "Pack not available", type: "error" });
        return;
      }
      await purchasePackage(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: `${pack.amount} ouro added!`, type: "success" });
    } catch (err: any) {
      if (!err?.userCancelled) {
        showToast({ message: "Purchase failed", type: "error" });
      }
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => router.back()} variant="ghost" size="sm" />
        <Text style={styles.title}>Crystal Packs</Text>
        <View style={styles.balanceChip}>
          <Text style={styles.balanceValue}>{balance}</Text>
        </View>
      </View>

      <FlatList
        data={PACKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: pack }) => (
          <Card elevated style={styles.packCard}>
            <View style={styles.packTop}>
              <Text style={styles.packAmount}>{pack.amount.toLocaleString()}</Text>
              <Text style={styles.packName}>{pack.name}</Text>
              {pack.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{pack.bonus}</Text>
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
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  balanceChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  balanceValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.neutral[900],
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
    color: colors.crystal,
  },
  packName: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[700],
    marginTop: spacing.xs,
  },
  bonusBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  bonusText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: colors.primary[700],
  },
  buyButton: {
    width: "100%",
  },
});
