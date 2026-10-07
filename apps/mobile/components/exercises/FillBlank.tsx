import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "./SpeakButton";
import { useTheme } from "@/lib/theme";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { TappableText } from "./TappableText";
import type { ExerciseProps } from "./ExerciseRenderer";

export function FillBlank({ exercise, onAnswer, disabled }: ExerciseProps) {
  const theme = useTheme();
  const [text, setText] = React.useState("");
  const fullSentence = exercise.sentence ?? exercise.prompt;
  const parts = fullSentence.split("___");

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.text }]}>Completa a frase</Text>
        <SpeakButton text={fullSentence.replace("___", "")} size={32} variant="circle" />
      </View>

      <View style={styles.sentenceContainer}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part.trim().length > 0 && (
              <TappableText
                text={part}
                direction="pt-to-l1"
                newWords={exercise.newWords}
                glossary={exercise.glossary}
                genderPairs={exercise.genderPairs}
                textStyle={styles.sentencePartText}
              />
            )}
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
        title="Verificar"
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  sentencePartText: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
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
