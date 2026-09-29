import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useOuro } from "@/hooks/useOuro";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Loading } from "@/components/ui/Loading";
import { GoldPrisms, CrownIcon, HeartIcon, FlameIcon, ShieldIcon, TimerIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { purchasePackage, getOfferings, type PurchasesPackage } from "@/lib/revenuecat";
import { useToast } from "@/components/ui/Toast";
import { trackPurchase } from "@/lib/analytics";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const PREVIEW_ITEMS: { id: string; nameKey: TKey; descKey: TKey | null; price: number; icon: string; color: string }[] = [
  { id: "hearts_refill", nameKey: "shop.hearts_refill", descKey: null, price: 350, icon: "heart", color: colors.heart },
  { id: "streak_freeze", nameKey: "shop.streak_freeze", descKey: null, price: 200, icon: "shield", color: colors.info },
  { id: "double_xp", nameKey: "shop.double_xp", descKey: null, price: 500, icon: "flame", color: colors.xp },
  { id: "timer_boost", nameKey: "shop.timer_boost", descKey: null, price: 150, icon: "timer", color: colors.streak },
];

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

function ItemIcon({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case "heart": return <HeartIcon size={size} color={color} />;
    case "shield": return <ShieldIcon size={size} color={color} />;
    case "flame": return <FlameIcon size={size} color={color} />;
    case "timer": return <TimerIcon size={size} color={color} />;
    default: return <GoldPrisms size={size} />;
  }
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { balance } = useOuro();
  const { isSuper } = useEntitlements();
  const { showToast } = useToast();
  const items = trpc.shop.listItems.useQuery();
  const purchaseMutation = trpc.shop.purchaseWithOuro.useMutation();
  const utils = trpc.useUtils();
  const [purchasingOuro, setPurchasingOuro] = React.useState<string | null>(null);

  const handleOuroPurchase = async (pack: OuroPack) => {
    try {
      setPurchasingOuro(pack.id);
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
      trackPurchase(pack.packageId, "money", pack.amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: t("toast.ouro_added", { amount: pack.amount }), type: "success" });
      await utils.economy.getBalance.invalidate();
    } catch (err: any) {
      if (!err?.userCancelled) {
        showToast({ message: t("toast.purchase_failed"), type: "error" });
      }
    } finally {
      setPurchasingOuro(null);
    }
  };

  const handlePurchase = async (itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await purchaseMutation.mutateAsync({ itemId });
    await utils.economy.getBalance.invalidate();
    await utils.hearts.getState.invalidate();
    await utils.shop.listItems.invalidate();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t("shop.title")}</Text>
        <View style={[styles.balanceChip, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <GoldPrisms size={16} />
          <Text style={[styles.balanceValue, { color: colors.ouro }]}>{balance}</Text>
        </View>
      </View>

      {!isSuper && (
        <Pressable
          onPress={() => router.push("/shop/super-detail")}
          style={[styles.superBanner]}
        >
          <View style={styles.superGradient}>
            <View style={styles.superLeft}>
              <Text style={styles.superLabel}>SUPER</Text>
              <Text style={styles.superTitle}>{t("shop.upgrade_title")}</Text>
              <Text style={styles.superSubtitle}>{t("shop.upgrade_desc")}</Text>
              <View style={styles.superCtaRow}>
                <Text style={styles.superCtaText}>{t("shop.trial_cta")}</Text>
              </View>
            </View>
            <CrownIcon size={48} color={colors.ouro} />
          </View>
        </Pressable>
      )}

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {t("shop.available")}
      </Text>

      {items.isLoading ? (
        <Loading message={t("shop.loading")} />
      ) : (
        <View style={styles.itemsList}>
          {PREVIEW_ITEMS.map(item => {
            const canAfford = balance >= item.price;
            return (
              <View
                key={item.id}
                style={[styles.itemCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              >
                <View style={[styles.itemIconBg, { backgroundColor: item.color + "20" }]}>
                  <ItemIcon type={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.text }]}>{t(item.nameKey)}</Text>
                  <View style={styles.itemPriceRow}>
                    <GoldPrisms size={14} />
                    <Text style={[styles.itemPriceText, { color: colors.ouro }]}>{item.price}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    if (!canAfford) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handlePurchase(item.id);
                  }}
                  disabled={!canAfford || purchaseMutation.isPending}
                  style={[
                    styles.buyPill,
                    canAfford
                      ? { backgroundColor: colors.primary[500] }
                      : { backgroundColor: theme.isDark ? "#1E2D45" : "#E2E8F0" },
                  ]}
                >
                  <GoldPrisms size={12} />
                  <Text style={[
                    styles.buyPillText,
                    canAfford
                      ? { color: "#FFFFFF" }
                      : { color: theme.textMuted },
                  ]}>
                    {item.price}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.lg }]}>
        {t("ouro.section")}
      </Text>
      <Text style={[styles.ouroDesc, { color: theme.textMuted }]}>
        {t("ouro.desc")}
      </Text>
      <View style={styles.ouroGrid}>
        {OURO_PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            onPress={() => handleOuroPurchase(pack)}
            disabled={!!purchasingOuro}
            style={[styles.ouroPackCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
          >
            <GoldPrisms size={24} />
            <Text style={styles.ouroPackAmount}>{pack.amount.toLocaleString()}</Text>
            <Text style={[styles.ouroPackName, { color: theme.textSecondary }]}>{pack.name}</Text>
            {pack.bonus && (
              <View style={[styles.ouroPackBonusBadge, { backgroundColor: theme.bgAccent }]}>
                <Text style={[styles.ouroPackBonusText, { color: theme.isDark ? colors.primary[400] : colors.primary[700] }]}>{pack.bonus}</Text>
              </View>
            )}
            <View style={[styles.ouroPackPrice, { backgroundColor: colors.primary[600] }]}>
              <Text style={styles.ouroPackPriceText}>{pack.priceLabel}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xs,
    borderWidth: 1,
  },
  balanceValue: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  superBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  superGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
    backgroundColor: "#1A1040",
  },
  superLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  superLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "800",
    color: colors.ouro,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  superTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  superSubtitle: {
    fontSize: typography.sizes.sm,
    color: "#B0A0D0",
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  superCtaRow: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    backgroundColor: colors.primary[500],
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  superCtaText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  itemsList: {
    paddingHorizontal: spacing.lg,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemPriceText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  buyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  buyPillText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  ouroDesc: {
    fontSize: typography.sizes.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  ouroGrid: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  ouroPackCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  ouroPackAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    color: colors.ouro,
    marginTop: spacing.xs,
  },
  ouroPackName: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  ouroPackBonusBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  ouroPackBonusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  ouroPackPrice: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  ouroPackPriceText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
