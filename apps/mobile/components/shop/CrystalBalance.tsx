import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCrystals } from "@/hooks/useCrystals";
import { GoldPrisms } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Props = {
  onPress?: () => void;
  compact?: boolean;
};

export function CrystalBalance({ onPress, compact }: Props) {
  const router = useRouter();
  const { balance } = useCrystals();

  const handlePress = onPress ?? (() => router.push("/shop/crystal-packs"));

  if (compact) {
    return (
      <Pressable onPress={handlePress} style={styles.compactContainer}>
        <GoldPrisms size={14} />
        <Text style={styles.compactValue}>{balance}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <GoldPrisms size={20} />
      <View>
        <Text style={styles.value}>{balance.toLocaleString()}</Text>
        <Text style={styles.label}>ouro</Text>
      </View>
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.sm,
  },
  value: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
  },
  plus: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: colors.primary[600],
    marginLeft: spacing.xs,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  compactValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.neutral[900],
  },
});
