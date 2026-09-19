import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCrystals } from "@/hooks/useCrystals";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

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
        <Text style={styles.compactIcon}>◆</Text>
        <Text style={styles.compactValue}>{balance}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Text style={styles.icon}>◆</Text>
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
  icon: {
    fontSize: 18,
    color: colors.crystal,
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
  compactIcon: {
    fontSize: 12,
    color: colors.crystal,
  },
  compactValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.neutral[900],
  },
});
