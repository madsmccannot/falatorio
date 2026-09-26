import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Polygon } from "react-native-svg";
import { useTheme } from "@/lib/theme";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

interface WordTooltipProps {
  word: string;
  translation: string;
  isNew: boolean;
  position: { x: number; y: number };
  onDismiss: () => void;
}

const TOOLTIP_WIDTH = 180;
const ARROW_SIZE = 8;
const AUTO_DISMISS_MS = 3000;

export function WordTooltip({ word, translation, isNew, position, onDismiss }: WordTooltipProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  let left = position.x - TOOLTIP_WIDTH / 2;
  if (left < 16) left = 16;
  if (left + TOOLTIP_WIDTH > screenWidth - 16) left = screenWidth - 16 - TOOLTIP_WIDTH;
  const top = position.y - 60;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
      <Animated.View
        entering={FadeIn.duration(150)}
        style={[
          styles.tooltip,
          {
            top,
            left,
            width: TOOLTIP_WIDTH,
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.ptWord, { color: theme.text }]}>{word}</Text>
        <Text style={[styles.translation, { color: theme.textSecondary }]}>{translation}</Text>
        {isNew && (
          <View style={[styles.newBadge, { backgroundColor: colors.primary[100] }]}>
            <Text style={[styles.newLabel, { color: colors.primary[700] }]}>Novo</Text>
          </View>
        )}
        <View style={[styles.arrow, { left: TOOLTIP_WIDTH / 2 - ARROW_SIZE }]}>
          <Svg width={ARROW_SIZE * 2} height={ARROW_SIZE} viewBox={`0 0 ${ARROW_SIZE * 2} ${ARROW_SIZE}`}>
            <Polygon
              points={`0,0 ${ARROW_SIZE},${ARROW_SIZE} ${ARROW_SIZE * 2},0`}
              fill={theme.bgCard}
              stroke={theme.border}
              strokeWidth={1}
            />
          </Svg>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  ptWord: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  translation: {
    fontSize: typography.sizes.sm,
    fontStyle: "italic",
  },
  newBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  newLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  arrow: {
    position: "absolute",
    bottom: -ARROW_SIZE,
  },
});
