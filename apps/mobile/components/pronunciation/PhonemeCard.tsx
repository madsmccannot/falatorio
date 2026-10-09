import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { LayoutChangeEvent } from "react-native";
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
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { AnimatedMouthDiagram } from "./AnimatedMouthDiagram";

interface PhonemeCardProps {
  phoneme: PhoneticDifficulty;
  onPress?: () => void;
}

export function PhonemeCard({ phoneme, onPress }: PhonemeCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const contentHeight = useSharedValue(320);

  const handlePress = () => {
    const next = !expanded;
    setExpanded(next);
    expandProgress.value = withSpring(next ? 1 : 0, {
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

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) contentHeight.value = h;
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    height: interpolate(
      expandProgress.value,
      [0, 1],
      [0, contentHeight.value],
      Extrapolation.CLAMP,
    ),
    opacity: expandProgress.value,
    overflow: "hidden" as const,
  }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }, containerStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.header}>
          <View style={[styles.ipaContainer, { backgroundColor: colors.primary[500] + "18" }]}>
            <Text style={[styles.ipa, { color: colors.primary[400] }]}>{phoneme.ipa}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.sound, { color: theme.text }]}>{phoneme.sound}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={expanded ? undefined : 1}>
              {phoneme.description}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.textMuted }]}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </Pressable>

      <Animated.View style={detailStyle}>
        <View style={styles.detailContent} onLayout={onContentLayout}>
          {phoneme.mouthPosition && (
            <View style={styles.diagramContainer}>
              <AnimatedMouthDiagram
                position={phoneme.mouthPosition}
                size={160}
                autoPlay={expanded}
              />
            </View>
          )}
          <View style={[styles.tipContainer, { backgroundColor: colors.primary[500] + "12" }]}>
            <Text style={[styles.tipLabel, { color: colors.primary[400] }]}>{t("reference.tip_label")}</Text>
            <Text style={[styles.tipText, { color: theme.text }]}>{phoneme.tip}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  ipa: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
  },
  headerText: {
    flex: 1,
  },
  sound: {
    fontWeight: "700",
    fontSize: typography.sizes.md,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.sizes.sm,
  },
  chevron: {
    fontSize: 10,
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
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tipLabel: {
    fontWeight: "700",
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
