import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "./SpeakButton";
import { useTheme } from "@/lib/theme";
import { spacing, radii, typography } from "@falatorio/ui/tokens";
import { TappableText } from "./TappableText";
import type { ExerciseProps } from "./ExerciseRenderer";

export function TranslateExercise({ exercise, onAnswer, disabled }: ExerciseProps) {
  const theme = useTheme();
  const [text, setText] = React.useState("");

  const direction = exercise.type === "translate_l1_to_pt" ? "l1-to-pt" as const : "pt-to-l1" as const;
  const isPtSource = exercise.type === "translate_pt_to_l1";

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Traduz esta frase</Text>

      <View style={styles.promptWrap}>
        <TappableText
          text={exercise.prompt}
          direction={direction}
          newWords={exercise.newWords}
          glossary={exercise.glossary}
          genderPairs={exercise.genderPairs}
          textStyle={[styles.promptText, { color: theme.text }]}
        />
        {isPtSource && (
          <View style={styles.speakRow}>
            <SpeakButton text={exercise.prompt} size={36} variant="circle" />
          </View>
        )}
      </View>

      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={text}
        onChangeText={setText}
        placeholder="Escreve a tua traducao..."
        placeholderTextColor={theme.textMuted}
        multiline
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
      />

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
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
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
  speakRow: {
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 100,
    fontSize: typography.sizes.md,
    textAlignVertical: "top",
  },
  submit: {
    marginTop: spacing.lg,
  },
});
