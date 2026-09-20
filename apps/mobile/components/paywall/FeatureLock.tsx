import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { Feature } from "@falatorio/core/entitlements";
import { SuperUpsell } from "./SuperUpsell";
import { LockIcon } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

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
            <LockIcon size={24} />
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
    marginBottom: spacing.sm,
  },
  lockText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
  },
});
