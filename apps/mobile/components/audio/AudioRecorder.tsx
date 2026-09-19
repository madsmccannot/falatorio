import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

type Props = {
  onRecordingComplete: (base64: string) => void;
  maxDuration?: number;
};

export function AudioRecorder({ onRecordingComplete, maxDuration = 30 }: Props) {
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(withTiming(1.15, { duration: 600 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [isRecording]);

  React.useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      handleStop();
    }
  }, [duration, maxDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleStop = async () => {
    const base64 = await stopRecording();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (base64) {
      onRecordingComplete(base64);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          if (isRecording) {
            handleStop();
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            startRecording();
          }
        }}
      >
        <Animated.View
          style={[
            styles.button,
            isRecording && styles.buttonRecording,
            animatedStyle,
          ]}
        >
          <View style={[styles.inner, isRecording && styles.innerRecording]} />
        </Animated.View>
      </Pressable>

      <Text style={styles.duration}>
        {isRecording ? `${duration}s / ${maxDuration}s` : "Tap to record"}
      </Text>

      {isRecording && (
        <Pressable onPress={cancelRecording} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: spacing.lg,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  buttonRecording: {
    borderColor: colors.accent[500],
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent[500],
  },
  innerRecording: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
  },
  duration: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  cancel: {
    marginTop: spacing.sm,
  },
  cancelText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
  },
});
