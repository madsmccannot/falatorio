import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "./SpeakButton";
import { useTheme } from "@/lib/theme";
import { spacing, radii, typography } from "@falatorio/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function ListenAndType({ exercise, onAnswer, disabled }: ExerciseProps) {
  const theme = useTheme();
  const [text, setText] = React.useState("");

  const targetText = exercise.sentence ?? exercise.prompt;

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        Ouve e escreve o que ouves
      </Text>

      <View style={styles.playArea}>
        <SpeakButton text={targetText} size={80} variant="circle" />
        <Text style={[styles.tapHint, { color: theme.textMuted }]}>
          Toca para ouvir
        </Text>
        <SpeakButton text={targetText} speed="slow" size={48} variant="circle" />
        <Text style={[styles.tapHint, { color: theme.textMuted }]}>
          Mais devagar
        </Text>
      </View>

      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={text}
        onChangeText={setText}
        placeholder="Escreve o que ouviste..."
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
    marginBottom: spacing.xl,
  },
  playArea: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  tapHint: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 80,
    fontSize: typography.sizes.md,
    textAlignVertical: "top",
  },
  submit: {
    marginTop: spacing.lg,
  },
});
