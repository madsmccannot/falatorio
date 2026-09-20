import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Props = {
  current: number;
  target: number;
  label?: string;
};

export function XPBar({ current, target, label }: Props) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(target > 0 ? Math.min(current / target, 1) : 0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label ?? "XP"}</Text>
        <Text style={styles.count}>{current} / {target}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  count: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.xp,
  },
  track: {
    height: 10,
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.xp,
    borderRadius: radii.full,
  },
});
