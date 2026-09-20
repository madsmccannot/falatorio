import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

type MatchState = "idle" | "selected" | "matched" | "wrong";

export function MatchPairs({ exercise, onAnswer, disabled }: ExerciseProps) {
  const pairs = exercise.pairs ?? [];
  const [leftSelected, setLeftSelected] = React.useState<number | null>(null);
  const [rightSelected, setRightSelected] = React.useState<number | null>(null);
  const [matched, setMatched] = React.useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = React.useState<[number, number] | null>(null);

  const shuffledRight = React.useMemo(() => {
    const indices = pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j]!, indices[i]!];
    }
    return indices;
  }, [pairs.length]);

  React.useEffect(() => {
    if (leftSelected !== null && rightSelected !== null) {
      if (leftSelected === rightSelected) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const next = new Set(matched).add(leftSelected);
        setMatched(next);
        setLeftSelected(null);
        setRightSelected(null);

        if (next.size === pairs.length) {
          const result = pairs.map((p) => `${p.left}=${p.right}`).join(",");
          onAnswer(result);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setWrongPair([leftSelected, rightSelected]);
        setTimeout(() => {
          setWrongPair(null);
          setLeftSelected(null);
          setRightSelected(null);
        }, 600);
      }
    }
  }, [leftSelected, rightSelected]);

  const getLeftState = (i: number): MatchState => {
    if (matched.has(i)) return "matched";
    if (wrongPair && wrongPair[0] === i) return "wrong";
    if (leftSelected === i) return "selected";
    return "idle";
  };

  const getRightState = (origIdx: number): MatchState => {
    if (matched.has(origIdx)) return "matched";
    if (wrongPair && wrongPair[1] === origIdx) return "wrong";
    if (rightSelected === origIdx) return "selected";
    return "idle";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Match the pairs</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {pairs.map((pair, i) => (
            <Pressable
              key={`l-${i}`}
              onPress={() => {
                if (disabled || matched.has(i)) return;
                Haptics.selectionAsync();
                setLeftSelected(i);
              }}
              disabled={disabled || matched.has(i)}
            >
              <Animated.View
                entering={FadeIn.delay(i * 50)}
                style={[styles.card, stateStyle(getLeftState(i))]}
              >
                <Text style={[styles.cardText, matched.has(i) && styles.matchedText]}>
                  {pair.left}
                </Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
        <View style={styles.column}>
          {shuffledRight.map((origIdx, i) => (
            <Pressable
              key={`r-${origIdx}`}
              onPress={() => {
                if (disabled || matched.has(origIdx)) return;
                Haptics.selectionAsync();
                setRightSelected(origIdx);
              }}
              disabled={disabled || matched.has(origIdx)}
            >
              <Animated.View
                entering={FadeIn.delay(i * 50 + 200)}
                style={[styles.card, stateStyle(getRightState(origIdx))]}
              >
                <Text style={[styles.cardText, matched.has(origIdx) && styles.matchedText]}>
                  {pairs[origIdx]?.right}
                </Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function stateStyle(state: MatchState) {
  switch (state) {
    case "selected":
      return { borderColor: colors.primary[500], backgroundColor: colors.primary[50] };
    case "matched":
      return { borderColor: colors.success, backgroundColor: "#ECFDF5", opacity: 0.6 };
    case "wrong":
      return { borderColor: colors.accent[500], backgroundColor: "#FFF1F2" };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xl,
  },
  columns: {
    flexDirection: "row",
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  card: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    alignItems: "center",
  },
  cardText: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  matchedText: {
    color: colors.neutral[400],
  },
});
