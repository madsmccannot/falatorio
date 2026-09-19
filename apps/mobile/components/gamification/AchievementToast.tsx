import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radii, typography, shadows } from "@fala-pt/ui/tokens";

type Props = {
  title: string;
  description?: string;
  visible: boolean;
  onDismiss: () => void;
  autoHideMs?: number;
};

export function AchievementToast({
  title,
  description,
  visible,
  onDismiss,
  autoHideMs = 4000,
}: Props) {
  React.useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(onDismiss, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(400)}
      exiting={SlideOutUp.duration(300)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>★</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[900],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.lg,
    zIndex: 1000,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.xp,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
});
