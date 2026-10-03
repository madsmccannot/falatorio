import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Props = {
  uri: string;
  label?: string;
  compact?: boolean;
};

export function AudioPlayer({ uri, label, compact }: Props) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${withTiming(progress * 100, { duration: 100 })}%`,
  }));

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= status.duration && status.duration > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  if (compact) {
    return (
      <Pressable onPress={toggle} style={styles.compactButton}>
        <Text style={styles.compactIcon}>{status.playing ? "||" : ">"}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={toggle} style={styles.playButton}>
        <Text style={styles.playIcon}>{status.playing ? "||" : ">"}</Text>
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
