import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { TappableText } from "./TappableText";
import type { ExerciseProps } from "./ExerciseRenderer";

export function TranslateExercise({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [text, setText] = React.useState("");

  const direction = exercise.type === "translate_l1_to_pt" ? "l1-to-pt" as const : "pt-to-l1" as const;

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Translate this sentence</Text>

      <View style={styles.promptWrap}>
        <TappableText
          text={exercise.prompt}
          direction={direction}
          newWords={exercise.newWords}
          glossary={exercise.glossary}
          genderPairs={exercise.genderPairs}
          textStyle={styles.promptText}
        />
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type your translation..."
        placeholderTextColor={colors.neutral[400]}
        multiline
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <Button
        title="Check"
        onPress={handleSubmit}
        disabled={disabled || !text.trim()}
        size="lg"
        style={styles.submit}
      />
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
  input: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 100,
    fontSize: typography.sizes.md,
    color: colors.neutral[900],
    textAlignVertical: "top",
  },
  submit: {
    marginTop: spacing.lg,
  },
});
