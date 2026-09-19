import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  variant: "pt-PT" | "pt-BR";
  textPT: string;
  textBR: string;
};

export function PTEUvsBRToggle({ variant: initialVariant, textPT, textBR }: Props) {
  const [variant, setVariant] = React.useState(initialVariant);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withTiming(variant === "pt-PT" ? 0 : 1, { duration: 200 });
  }, [variant]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${translateX.value * 50}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <Pressable
          style={styles.option}
          onPress={() => {
            Haptics.selectionAsync();
            setVariant("pt-PT");
          }}
        >
          <Text style={[styles.optionText, variant === "pt-PT" && styles.activeText]}>
            PT-EU
          </Text>
        </Pressable>
        <Pressable
          style={styles.option}
          onPress={() => {
            Haptics.selectionAsync();
            setVariant("pt-BR");
          }}
        >
          <Text style={[styles.optionText, variant === "pt-BR" && styles.activeText]}>
            PT-BR
          </Text>
        </Pressable>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {variant === "pt-PT" ? textPT : textBR}
        </Text>
        {variant === "pt-BR" && (
          <Text style={styles.note}>
            Note: Fala PT teaches European Portuguese (PT-EU).
            This shows the Brazilian variant for comparison.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    position: "relative",
    marginBottom: spacing.sm,
  },
  indicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    zIndex: 1,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  activeText: {
    color: colors.neutral[900],
  },
  textContainer: {
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
  },
  text: {
    fontSize: typography.sizes.md,
    color: colors.neutral[800],
    lineHeight: 22,
  },
  note: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
});
