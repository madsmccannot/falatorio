import React from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";
import { colors, typography } from "@falatorio/ui/tokens";

type Props = {
  hearts: number;
  unlimited: boolean;
};

export function HeartIndicator({ hearts, unlimited }: Props) {
  const scale = useSharedValue(1);
  const prevHearts = React.useRef(hearts);

  React.useEffect(() => {
    if (hearts < prevHearts.current) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withTiming(0.8, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
    prevHearts.current = hearts;
  }, [hearts]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.icon}>♥</Text>
      <Text style={styles.count}>{unlimited ? "∞" : hearts}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  icon: {
    fontSize: 16,
    color: colors.heart,
  },
  count: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.heart,
  },
});
