import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useOuro } from "@/hooks/useOuro";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Loading } from "@/components/ui/Loading";
import { GoldPrisms, CrownIcon, HeartIcon, FlameIcon, ShieldIcon } from "@/components/icons";
import { OuroBalance } from "@/components/shop/OuroBalance";
import { OuroPacks } from "@/components/shop/OuroPacks";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const PREVIEW_ITEMS: { id: string; nameKey: TKey; descKey: TKey | null; price: number; icon: string; color: string }[] = [
  { id: "hearts_refill", nameKey: "shop.hearts_refill", descKey: null, price: 350, icon: "heart", color: colors.heart },
  { id: "streak_freeze", nameKey: "shop.streak_freeze", descKey: null, price: 200, icon: "shield", color: colors.info },
  { id: "double_xp", nameKey: "shop.double_xp", descKey: null, price: 500, icon: "flame", color: colors.xp },
];

function ItemIcon({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case "heart": return <HeartIcon size={size} color={color} />;
    case "shield": return <ShieldIcon size={size} color={color} />;
    case "flame": return <FlameIcon size={size} color={color} />;
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
  const items = trpc.shop.listItems.useQuery();
  const purchaseMutation = trpc.shop.purchaseWithOuro.useMutation();
  const utils = trpc.useUtils();

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
        <OuroBalance />
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

      <OuroPacks />
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
});
