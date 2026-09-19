import { Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@fala-pt/ui/tokens";

type Props = {
  name: string;
  description?: string;
  icon?: string;
  priceCrystals: number | null;
  priceLabel?: string;
  canAfford: boolean;
  onPurchase: () => void;
  isPurchasing?: boolean;
};

export function ShopItemCard({
  name,
  description,
  icon,
  priceCrystals,
  priceLabel,
  canAfford,
  onPurchase,
  isPurchasing,
}: Props) {
  return (
    <Card style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.name}>{name}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {priceCrystals !== null ? (
        <Button
          title={`◆ ${priceCrystals}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPurchase();
          }}
          variant={canAfford ? "primary" : "secondary"}
          size="sm"
          disabled={!canAfford || isPurchasing}
          loading={isPurchasing}
          style={styles.button}
        />
      ) : priceLabel ? (
        <Button
          title={priceLabel}
          onPress={onPurchase}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: spacing.md,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[900],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  button: {
    width: "100%",
  },
});
