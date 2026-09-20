import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { PhoneticDifficulty } from "@falatorio/core/l1-profiles/types";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { MouthDiagram } from "./MouthDiagram";

interface PhonemeCardProps {
  phoneme: PhoneticDifficulty;
  onPress?: () => void;
}

export function PhonemeCard({ phoneme, onPress }: PhonemeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const handlePress = () => {
    setExpanded((prev) => !prev);
    expandProgress.value = withSpring(expanded ? 0 : 1, {
      damping: 15,
      stiffness: 120,
    });
    onPress?.();
  };

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    height: interpolate(
      expandProgress.value,
      [0, 1],
      [0, 280],
      Extrapolation.CLAMP,
    ),
    opacity: expandProgress.value,
    overflow: "hidden" as const,
  }));

  return (
    <Animated.View style={[styles.card, containerStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.header}>
          <View style={styles.ipaContainer}>
            <Text style={styles.ipa}>{phoneme.ipa}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sound}>{phoneme.sound}</Text>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 1}>
              {phoneme.description}
            </Text>
          </View>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </Pressable>

      <Animated.View style={detailStyle}>
        <View style={styles.detailContent}>
          {phoneme.mouthPosition && (
            <View style={styles.diagramContainer}>
              <MouthDiagram position={phoneme.mouthPosition} size={160} />
            </View>
          )}
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>Dica:</Text>
            <Text style={styles.tipText}>{phoneme.tip}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  ipaContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  ipa: {
    fontFamily: typography.mono.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.primary[700],
  },
  headerText: {
    flex: 1,
  },
  sound: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: typography.heading.fontWeight,
    fontSize: typography.sizes.md,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  chevron: {
    fontSize: 10,
    color: colors.neutral[400],
    marginLeft: spacing.sm,
  },
  detailContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  diagramContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  tipContainer: {
    backgroundColor: colors.primary[50],
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tipLabel: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: typography.heading.fontWeight,
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.primary[800],
    lineHeight: 20,
  },
});
