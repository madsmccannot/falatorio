import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { Feature } from "@fala-pt/core/entitlements";
import { SuperUpsell } from "./SuperUpsell";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureLock({ feature, children, fallback }: Props) {
  const { can } = useEntitlements();

  if (can(feature)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.locked}>
        {fallback ?? (
          <View style={styles.defaultFallback}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockText}>
              This feature requires Super
            </Text>
          </View>
        )}
      </View>
      <SuperUpsell feature={feature} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  locked: {
    opacity: 0.5,
  },
  defaultFallback: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  lockText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
  },
});
