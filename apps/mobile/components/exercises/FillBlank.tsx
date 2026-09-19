import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function FillBlank({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [text, setText] = React.useState("");
  const parts = (exercise.sentence ?? exercise.prompt).split("___");

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fill in the blank</Text>

      <View style={styles.sentenceContainer}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <Text style={styles.sentencePart}>{part}</Text>
            {i < parts.length - 1 && (
              <TextInput
                style={styles.blankInput}
                value={text}
                onChangeText={setText}
                placeholder="..."
                placeholderTextColor={colors.neutral[400]}
                editable={!disabled}
                autoCorrect={false}
                autoCapitalize="none"
                autoFocus
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {exercise.options && (
        <View style={styles.hints}>
          {exercise.options.map((opt, i) => (
            <Button
              key={i}
              title={opt}
              onPress={() => {
                Haptics.selectionAsync();
                setText(opt);
              }}
              variant={text === opt ? "secondary" : "outline"}
              size="sm"
              disabled={disabled}
            />
          ))}
        </View>
      )}

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
    marginBottom: spacing.xl,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  sentencePart: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    color: colors.neutral[800],
    lineHeight: 36,
  },
  blankInput: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
    minWidth: 80,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    color: colors.primary[700],
    textAlign: "center",
  },
  hints: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: "auto",
  },
});
