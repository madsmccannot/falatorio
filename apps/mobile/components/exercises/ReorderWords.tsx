import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function ReorderWords({ exercise, onAnswer, disabled }: ExerciseProps) {
  const words = exercise.words ?? exercise.prompt.split(" ");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [available, setAvailable] = React.useState<number[]>(
    () => {
      const indices = words.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j]!, indices[i]!];
      }
      return indices;
    }
  );

  const addWord = (idx: number) => {
    if (disabled) return;
    Haptics.selectionAsync();
    setSelected([...selected, idx]);
    setAvailable(available.filter((i) => i !== idx));
  };

  const removeWord = (pos: number) => {
    if (disabled) return;
    Haptics.selectionAsync();
    const idx = selected[pos]!;
    setSelected(selected.filter((_, i) => i !== pos));
    setAvailable([...available, idx]);
  };

  const handleSubmit = () => {
    const answer = selected.map((i) => words[i]).join(" ");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(answer);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Put the words in order</Text>

      <View style={styles.sentenceArea}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
        ) : (
          <View style={styles.wordRow}>
            {selected.map((idx, pos) => (
              <Pressable key={`s-${idx}`} onPress={() => removeWord(pos)}>
                <Animated.View
                  entering={FadeIn.duration(150)}
                  layout={Layout.springify()}
                  style={styles.selectedWord}
                >
                  <Text style={styles.selectedWordText}>{words[idx]}</Text>
                </Animated.View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.wordBank}>
        {available.map((idx) => (
          <Pressable key={`a-${idx}`} onPress={() => addWord(idx)}>
            <Animated.View
              layout={Layout.springify()}
              style={styles.bankWord}
            >
              <Text style={styles.bankWordText}>{words[idx]}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </View>

      <Button
        title="Check"
        onPress={handleSubmit}
        disabled={disabled || available.length > 0}
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
  sentenceArea: {
    minHeight: 80,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    justifyContent: "center",
  },
  placeholder: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    textAlign: "center",
  },
  wordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  selectedWord: {
    backgroundColor: colors.primary[600],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedWordText: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  wordBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  bankWord: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bankWordText: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  submit: {
    marginTop: "auto",
  },
});
