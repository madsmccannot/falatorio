import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { colors } from "@falatorio/ui/tokens";

type Props = {
  active: boolean;
  bars?: number;
  color?: string;
};

export function WaveformVisualizer({ active, bars = 5, color = colors.primary[500] }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: bars }).map((_, i) => (
        <Bar key={i} index={i} active={active} color={color} />
      ))}
    </View>
  );
}

function Bar({ index, active, color }: { index: number; active: boolean; color: string }) {
  const height = useSharedValue(8);

  React.useEffect(() => {
    if (active) {
      height.value = withDelay(
        index * 80,
        withRepeat(
          withTiming(20 + Math.random() * 16, { duration: 300 + Math.random() * 200 }),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(8, { duration: 200 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: 40,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
