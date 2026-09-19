import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, radii } from "@fala-pt/ui/tokens";

type Props = {
  current: number;
  total: number;
  height?: number;
};

export function ProgressBar({ current, total, height = 8 }: Props) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(total > 0 ? current / total : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { height }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: colors.primary[500],
    borderRadius: radii.full,
  },
});
