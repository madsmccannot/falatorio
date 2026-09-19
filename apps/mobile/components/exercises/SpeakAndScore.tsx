import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { colors, spacing, typography } from "@fala-pt/ui/tokens";
import type { ExerciseProps } from "./ExerciseRenderer";

export function SpeakAndScore({ exercise, onAnswer, disabled }: ExerciseProps) {
  const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(withTiming(1.2, { duration: 800 }), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleToggle = async () => {
    if (isRecording) {
      const audioBase64 = await stopRecording();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (audioBase64) {
        onAnswer(audioBase64);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Say this in Portuguese</Text>
      <Text style={styles.prompt}>{exercise.prompt}</Text>

      <View style={styles.recordArea}>
        <Pressable onPress={handleToggle} disabled={disabled}>
          <Animated.View style={[styles.recordButton, isRecording && styles.recordButtonActive, animatedStyle]}>
            <Text style={styles.recordIcon}>{isRecording ? "■" : "●"}</Text>
          </Animated.View>
        </Pressable>

        <Text style={styles.recordText}>
          {isRecording
            ? `Recording... ${duration}s`
            : "Tap to start speaking"}
        </Text>
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
    marginBottom: spacing["3xl"],
    textAlign: "center",
  },
  recordArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  recordButtonActive: {
    backgroundColor: colors.accent[100],
  },
  recordIcon: {
    fontSize: 36,
    color: colors.primary[700],
  },
  recordText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
});
