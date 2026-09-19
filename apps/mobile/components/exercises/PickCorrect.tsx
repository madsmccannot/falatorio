import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@fala-pt/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function PickCorrect({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pick the correct answer</Text>
      <Text style={styles.prompt}>{exercise.prompt}</Text>

      <View style={styles.options}>
        {(exercise.options ?? []).map((option, i) => (
          <Button
            key={`${exercise.id}-${i}`}
            title={option}
            onPress={() => {
              Haptics.selectionAsync();
              setSelected(option);
              onAnswer(option);
            }}
            variant={selected === option ? "secondary" : "outline"}
            disabled={disabled}
            style={styles.option}
          />
        ))}
      </View>
    </View>
  );
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
    marginBottom: spacing.lg,
  },
  prompt: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    color: colors.neutral[800],
    lineHeight: 32,
    marginBottom: spacing["2xl"],
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    width: "100%",
  },
});
