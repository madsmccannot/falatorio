import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useOuro } from "@/hooks/useOuro";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { GoldPrisms, CrownIcon, HeartIcon, FlameIcon, ShieldIcon, TimerIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const PREVIEW_ITEMS: { id: string; nameKey: TKey; price: number; icon: string; color: string }[] = [
  { id: "hearts_refill", nameKey: "shop.hearts_refill", price: 350, icon: "heart", color: colors.heart },
  { id: "streak_freeze", nameKey: "shop.streak_freeze", price: 200, icon: "shield", color: colors.info },
  { id: "double_xp", nameKey: "shop.double_xp", price: 500, icon: "flame", color: colors.xp },
  { id: "timer_boost", nameKey: "shop.timer_boost", price: 150, icon: "timer", color: colors.streak },
];

function ItemIcon({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case "heart": return <HeartIcon size={size} color={color} />;
    case "shield": return <ShieldIcon size={size} color={color} />;
    case "flame": return <FlameIcon size={size} color={color} />;
    case "timer": return <TimerIcon size={size} color={color} />;
    default: return <GoldPrisms size={size} color={color} />;
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

  const shopItems = (items.data && items.data.length > 0) ? items.data : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
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
          style={[styles.superBanner, { backgroundColor: theme.superBanner }]}
        >
          <View style={styles.superRow}>
            <View style={styles.superLeft}>
              <Text style={[styles.superTitle, { color: theme.superBannerText }]}>
                {t("shop.upgrade_title")}
              </Text>
              <Text style={[styles.superSubtitle, { color: theme.textMuted }]}>
                {t("shop.upgrade_desc")}
              </Text>
              <Text style={styles.superCta}>{t("shop.trial_cta")}</Text>
            </View>
            <CrownIcon size={40} color={colors.ouro} />
          </View>
        </Pressable>
      )}

      {items.isLoading ? (
        <Loading message={t("shop.loading")} />
      ) : shopItems ? (
        <FlatList
          data={shopItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const name = (item.name as Record<string, string>)["pt"] ?? (item.name as Record<string, string>)["en"] ?? item.id;
            const canAfford = item.priceOuro !== null && balance >= item.priceOuro;

            return (
              <View style={[styles.itemCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                  {name}
                </Text>
                {item.priceOuro !== null && (
                  <Button
                    title={`${item.priceOuro} ouro`}
                    onPress={() => handlePurchase(item.id)}
                    variant={canAfford ? "primary" : "secondary"}
                    size="sm"
                    disabled={!canAfford || purchaseMutation.isPending}
                    loading={purchaseMutation.isPending}
                    style={styles.buyButton}
                  />
                )}
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.previewList}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t("shop.available")}</Text>
          {PREVIEW_ITEMS.map(item => (
            <View
              key={item.id}
              style={[styles.previewCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <View style={[styles.previewIconBg, { backgroundColor: item.color + "20" }]}>
                <ItemIcon type={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewName, { color: theme.text }]}>{t(item.nameKey)}</Text>
                <View style={styles.previewPrice}>
                  <GoldPrisms size={14} />
                  <Text style={[styles.previewPriceText, { color: colors.ouro }]}>{item.price}</Text>
                </View>
              </View>
              <Button
                title={t("shop.buy")}
                variant={balance >= item.price ? "primary" : "secondary"}
                size="sm"
                disabled={balance < item.price}
                onPress={() => handlePurchase(item.id)}
                style={styles.previewButton}
              />
            </View>
          ))}
        </View>
      )}
    </View>
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
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
  },
  superRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  superLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  superTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  superSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  superCta: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.primary[400],
    marginTop: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  row: {
    gap: spacing.sm,
  },
  itemCard: {
    flex: 1,
    alignItems: "center",
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  buyButton: {
    width: "100%",
  },
  previewList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  previewIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewPriceText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  previewButton: {
    minWidth: 80,
  },
});
