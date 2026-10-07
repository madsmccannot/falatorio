import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { SpeakButton } from "./SpeakButton";
import { useTheme } from "@/lib/theme";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { TappableText } from "./TappableText";
import type { ExerciseProps } from "./ExerciseRenderer";

export function SpeakAndScore({ exercise, onAnswer, disabled }: ExerciseProps) {
  const theme = useTheme();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [finalTranscript, setFinalTranscript] = React.useState<string | null>(null);
  const pulse = useSharedValue(1);

  const prompt = exercise.prompt as Record<string, unknown> | string;
  const targetText = typeof prompt === "string"
    ? prompt
    : typeof prompt === "object" && prompt !== null
      ? String(prompt["targetText"] ?? prompt["sentence"] ?? prompt["text"] ?? JSON.stringify(prompt))
      : String(prompt);

  React.useEffect(() => {
    if (isListening) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isListening]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFinalTranscript(null);
      const result = await startListening();
      if (result) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFinalTranscript(result);
        onAnswer(result);
      }
    }
  };

  const displayTranscript = isListening ? transcript : finalTranscript;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        Diz isto em portugues
      </Text>

      <View style={styles.promptWrap}>
        <TappableText
          text={targetText}
          direction="pt-to-l1"
          newWords={exercise.newWords}
          glossary={exercise.glossary}
          genderPairs={exercise.genderPairs}
          textStyle={[styles.promptText, { color: theme.text }]}
        />
        <View style={styles.listenRow}>
          <SpeakButton text={targetText} size={36} variant="circle" />
          <SpeakButton text={targetText} speed="slow" size={28} variant="circle" />
        </View>
      </View>

      <View style={styles.recordArea}>
        <Pressable onPress={handleToggle} disabled={disabled}>
          <Animated.View
            style={[
              styles.recordButton,
              {
                backgroundColor: isListening
                  ? colors.accent[500] + "30"
                  : colors.primary[500] + "18",
              },
              animatedStyle,
            ]}
          >
            {isListening ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={[styles.micIcon, { backgroundColor: colors.primary[500] }]} />
            )}
          </Animated.View>
        </Pressable>

        <Text style={[styles.recordText, { color: theme.textMuted }]}>
          {isListening ? "A ouvir..." : "Toca para falar"}
        </Text>

        {displayTranscript ? (
          <View style={[styles.transcriptionBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.transcriptionLabel, { color: theme.textSecondary }]}>
              {isListening ? "A reconhecer:" : "O que disseste:"}
            </Text>
            <Text style={[styles.transcriptionText, { color: theme.text }]}>
              {displayTranscript}
            </Text>
          </View>
        ) : null}
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
    marginBottom: spacing.lg,
  },
  promptWrap: {
    marginBottom: spacing["2xl"],
    alignItems: "center",
  },
  promptText: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    lineHeight: 32,
    textAlign: "center",
  },
  listenRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  micIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.accent[500],
  },
  recordText: {
    fontSize: typography.sizes.sm,
  },
  transcriptionBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    width: "100%",
  },
  transcriptionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transcriptionText: {
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
});
