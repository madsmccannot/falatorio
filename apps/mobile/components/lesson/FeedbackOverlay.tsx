import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type PunctuationWarning = {
  type: "missing_accent" | "missing_punctuation";
  message: string;
};

type Props = {
  correct: boolean;
  correctAnswer?: string;
  l1Tip?: string;
  warnings?: PunctuationWarning[];
  onContinue: () => void;
};

export function FeedbackOverlay({ correct, correctAnswer, l1Tip, warnings, onContinue }: Props) {
  React.useEffect(() => {
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const hasWarnings = warnings && warnings.length > 0;

  return (
    <Animated.View
      entering={SlideInDown.duration(250)}
      style={[styles.container, correct ? (hasWarnings ? styles.correctWarning : styles.correct) : styles.wrong]}
    >
      <Text style={styles.title}>
        {correct ? (hasWarnings ? "Almost perfect!" : "Correct!") : "Not quite"}
      </Text>

      {!correct && correctAnswer && (
        <Text style={styles.answer}>Correct answer: {correctAnswer}</Text>
      )}

      {hasWarnings && (
        <View style={styles.warningBox}>
          {warnings.map((w, i) => (
            <Text key={i} style={styles.warningText}>{w.message}</Text>
          ))}
        </View>
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
  correctWarning: {
    backgroundColor: "#FFFBEB",
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
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: "#92400E",
    lineHeight: 18,
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
