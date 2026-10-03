import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function ListenAndType({ exercise, onAnswer, disabled }: ExerciseProps) {
  const [text, setText] = React.useState("");

  const player = useAudioPlayer(exercise.audioUrl ?? null);
  const status = useAudioPlayerStatus(player);

  const playAudio = () => {
    if (!exercise.audioUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status.currentTime >= status.duration && status.duration > 0) {
      player.seekTo(0);
    }
    player.play();
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(text.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Listen and type what you hear</Text>

      <Pressable onPress={playAudio} style={styles.playButton} disabled={status.playing}>
        <View style={[styles.playCircle, status.playing && styles.playCircleActive]}>
          <Text style={styles.playIcon}>{status.playing ? "..." : ">"}</Text>
        </View>
        <Text style={styles.playText}>
          {status.playing ? "Playing..." : "Tap to listen"}
        </Text>
      </Pressable>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type what you hear..."
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
    marginBottom: spacing.xl,
  },
  playButton: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  playCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  playCircleActive: {
    backgroundColor: colors.primary[200],
  },
  playIcon: {
    fontSize: 28,
    color: colors.primary[700],
  },
  playText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  input: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 80,
    fontSize: typography.sizes.md,
    color: colors.neutral[900],
    textAlignVertical: "top",
  },
  submit: {
    marginTop: spacing.lg,
  },
});
