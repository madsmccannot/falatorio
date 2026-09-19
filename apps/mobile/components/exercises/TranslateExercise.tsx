import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function TranslateExercise({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [text, setText] = React.useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Translate this sentence</Text>
      <Text style={styles.prompt}>{exercise.prompt}</Text>

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
  prompt: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    color: colors.neutral[800],
    lineHeight: 32,
    marginBottom: spacing["2xl"],
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
