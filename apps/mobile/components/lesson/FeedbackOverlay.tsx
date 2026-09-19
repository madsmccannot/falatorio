import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  correct: boolean;
  correctAnswer?: string;
  l1Tip?: string;
  onContinue: () => void;
};

export function FeedbackOverlay({ correct, correctAnswer, l1Tip, onContinue }: Props) {
  React.useEffect(() => {
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  return (
    <Animated.View
      entering={SlideInDown.duration(250)}
      style={[styles.container, correct ? styles.correct : styles.wrong]}
    >
      <Text style={styles.title}>
        {correct ? "Correct!" : "Not quite"}
      </Text>

      {!correct && correctAnswer && (
        <Text style={styles.answer}>Correct answer: {correctAnswer}</Text>
      )}

      {l1Tip && (
        <Text style={styles.tip}>{l1Tip}</Text>
      )}

      <Button
        title="Continue"
        onPress={onContinue}
        variant="ghost"
        style={styles.button}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  correct: {
    backgroundColor: "#ECFDF5",
  },
  wrong: {
    backgroundColor: "#FFF1F2",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  answer: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  tip: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  button: {
    alignSelf: "flex-end",
  },
});
