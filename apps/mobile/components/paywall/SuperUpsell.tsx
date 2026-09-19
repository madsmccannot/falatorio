import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  feature: string;
  compact?: boolean;
};

export function SuperUpsell({ feature, compact }: Props) {
  const router = useRouter();

  if (compact) {
    return (
      <Pressable
        onPress={() => router.push("/shop/super-detail")}
        style={styles.compactContainer}
      >
        <Text style={styles.compactText}>
          Unlock with Super →
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push("/shop/super-detail")}
      style={styles.container}
    >
      <Text style={styles.title}>Upgrade to Super</Text>
      <Text style={styles.description}>
        Get {feature} and more with Fala PT Super.
      </Text>
      <Text style={styles.cta}>Learn more →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[900],
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cta: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.primary[400],
  },
  compactContainer: {
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  compactText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.primary[700],
  },
});
