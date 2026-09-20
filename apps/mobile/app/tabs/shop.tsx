import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useCrystals } from "@/hooks/useCrystals";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { GoldPrisms, AppIcon } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balance } = useCrystals();
  const { isSuper } = useEntitlements();
  const items = trpc.shop.listItems.useQuery();
  const purchaseMutation = trpc.shop.purchaseWithCrystals.useMutation();
  const utils = trpc.useUtils();

  const handlePurchase = async (itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await purchaseMutation.mutateAsync({ itemId });
    await utils.economy.getBalance.invalidate();
    await utils.hearts.getState.invalidate();
    await utils.shop.listItems.invalidate();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.balanceChip}>
          <GoldPrisms size={16} />
          <Text style={styles.balanceValue}>{balance}</Text>
        </View>
      </View>

      {!isSuper && (
        <Pressable
          onPress={() => router.push("/shop/super-detail")}
          style={styles.superBanner}
        >
          <Text style={styles.superTitle}>Upgrade to Super</Text>
          <Text style={styles.superSubtitle}>
            Unlimited hearts, no ads, AI error review
          </Text>
          <Text style={styles.superCta}>Start free trial →</Text>
        </Pressable>
      )}

      {items.isLoading ? (
        <Loading message="Loading shop..." />
      ) : (
        <FlatList
          data={items.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const name = (item.name as Record<string, string>)["en"] ?? item.id;
            const canAfford = item.priceCrystals !== null && balance >= item.priceCrystals;

            return (
              <Card style={styles.itemCard}>
                {item.icon && (
                  <View style={styles.itemIconContainer}>
                    <AppIcon name={item.icon} size={28} />
                  </View>
                )}
                <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
                {item.priceCrystals !== null && (
                  <Button
                    title={`${item.priceCrystals} ouro`}
                    onPress={() => handlePurchase(item.id)}
                    variant={canAfford ? "primary" : "secondary"}
                    size="sm"
                    disabled={!canAfford || purchaseMutation.isPending}
                    loading={purchaseMutation.isPending}
                    style={styles.buyButton}
                  />
                )}
                {item.priceEur !== null && item.priceCrystals === null && (
                  <Button
                    title={`€${item.priceEur}`}
                    onPress={() => router.push("/shop/crystal-packs")}
                    variant="outline"
                    size="sm"
                    style={styles.buyButton}
                  />
                )}
              </Card>
            );
          }}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  balanceValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  superBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral[900],
  },
  superTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  superSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
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
    padding: spacing.md,
  },
  itemIconContainer: {
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[900],
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  buyButton: {
    width: "100%",
  },
});
