import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { TappableText } from "./TappableText";
import type { ExerciseProps } from "./ExerciseRenderer";

export function PickCorrect({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pick the correct answer</Text>

      <View style={styles.promptWrap}>
        <TappableText
          text={exercise.prompt}
          direction="pt-to-l1"
          newWords={exercise.newWords}
          glossary={exercise.glossary}
          genderPairs={exercise.genderPairs}
          textStyle={styles.promptText}
        />
      </View>

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
  promptWrap: {
    marginBottom: spacing["2xl"],
  },
  promptText: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    lineHeight: 32,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    width: "100%",
  },
});
