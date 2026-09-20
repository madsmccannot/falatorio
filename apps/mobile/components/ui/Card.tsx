import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { colors, spacing, radii, shadows } from "@falatorio/ui/tokens";

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ children, elevated = false, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
  },
});
