import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Props = {
  uri: string;
  label?: string;
  compact?: boolean;
};

export function AudioPlayer({ uri, label, compact }: Props) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [, setDuration] = React.useState(0);
  const [, setPosition] = React.useState(0);
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const play = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.didJustFinish) {
          await soundRef.current.replayAsync();
        } else if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        } else {
          await soundRef.current.playAsync();
        }
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);
          setDuration(status.durationMillis ?? 0);
          setPosition(status.positionMillis ?? 0);
          progress.value = withTiming(
            status.durationMillis ? status.positionMillis / status.durationMillis : 0,
            { duration: 100 }
          );
          if (status.didJustFinish) {
            setIsPlaying(false);
            progress.value = withTiming(0, { duration: 300 });
          }
        });
      }
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  if (compact) {
    return (
      <Pressable onPress={play} style={styles.compactButton}>
        <Text style={styles.compactIcon}>{isPlaying ? "⏸" : "▶"}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={play} style={styles.playButton}>
        <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
      </Pressable>
      <View style={styles.trackArea}>
        {label && <Text style={styles.label} numberOfLines={1}>{label}</Text>}
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, progressStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  trackArea: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: "500",
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  track: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: radii.full,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  compactIcon: {
    fontSize: 14,
    color: colors.primary[700],
  },
});
