import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radii, typography, shadows } from "@fala-pt/ui/tokens";

type Props = {
  title: string;
  description: string;
  priceCrystals: number;
  onPurchase: () => void;
  disabled?: boolean;
};

export function ChestOffer({ title, description, priceCrystals, onPurchase, disabled }: Props) {
  const glow = useSharedValue(0);

  React.useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255, 215, 0, ${0.3 + glow.value * 0.4})`,
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPurchase();
      }}
    >
      <Animated.View
        entering={ZoomIn.duration(400)}
        style={[styles.container, glowStyle]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceIcon}>◆</Text>
          <Text style={styles.priceValue}>{priceCrystals}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[900],
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
    ...shadows.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  priceIcon: {
    fontSize: 16,
    color: colors.crystal,
  },
  priceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
