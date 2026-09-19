import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  days: number;
  frozen?: boolean;
  compact?: boolean;
};

export function StreakBadge({ days, frozen, compact }: Props) {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactIcon}>⚡</Text>
        <Text style={styles.compactCount}>{days}</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={ZoomIn.duration(300)} style={[styles.container, frozen && styles.frozen]}>
      <Text style={styles.icon}>⚡</Text>
      <Text style={styles.count}>{days}</Text>
      <Text style={styles.label}>day streak</Text>
      {frozen && <Text style={styles.frozenLabel}>Frozen</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.streak,
    borderRadius: radii.lg,
    padding: spacing.lg,
    minWidth: 100,
  },
  frozen: {
    backgroundColor: colors.neutral[300],
  },
  icon: {
    fontSize: 28,
  },
  count: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  frozenLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: spacing.xs,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  compactIcon: {
    fontSize: 14,
    color: colors.streak,
  },
  compactCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.streak,
  },
});
