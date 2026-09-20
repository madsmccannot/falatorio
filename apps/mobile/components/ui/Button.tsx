import type React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  type ViewStyle,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary[600], text: "#FFFFFF" },
  secondary: { bg: colors.neutral[100], text: colors.neutral[900] },
  outline: { bg: "transparent", text: colors.primary[600], border: colors.primary[600] },
  ghost: { bg: "transparent", text: colors.primary[600] },
  danger: { bg: colors.accent[600], text: "#FFFFFF" },
};

const SIZE_STYLES: Record<Size, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: spacing.md, paddingV: spacing.xs, fontSize: typography.sizes.sm },
  md: { paddingH: spacing.lg, paddingV: spacing.sm + 2, fontSize: typography.sizes.md },
  lg: { paddingH: spacing.xl, paddingV: spacing.md, fontSize: typography.sizes.lg },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? colors.neutral[200] : v.bg,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border ?? "transparent",
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? colors.neutral[400] : v.text,
                fontSize: s.fontSize,
                marginLeft: icon ? spacing.xs : 0,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    minHeight: 44,
  },
  text: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
});
