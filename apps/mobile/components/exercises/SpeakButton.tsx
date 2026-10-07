import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTTS } from "@/hooks/useTTS";
import { colors, spacing } from "@falatorio/ui/tokens";

interface SpeakButtonProps {
  text: string;
  speed?: "slow" | "normal";
  size?: number;
  variant?: "circle" | "inline";
}

function SpeakerIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2v6h4l5 4V5z"
        fill={color}
      />
      <Path
        d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SpeakButton({ text, speed = "normal", size = 44, variant = "circle" }: SpeakButtonProps) {
  const { speak, isSpeaking } = useTTS();
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      scale.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1,
      );
    }
    speak(text, { speed });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCircle = variant === "circle";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          isCircle ? [styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: isSpeaking ? colors.primary[500] + "30" : colors.primary[500] + "18" }] : styles.inline,
        ]}
        accessibilityLabel={isSpeaking ? "Parar áudio" : "Ouvir pronúncia"}
        accessibilityRole="button"
      >
        <SpeakerIcon
          size={isCircle ? size * 0.45 : 18}
          color={isSpeaking ? colors.primary[600] : colors.primary[400]}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  inline: {
    padding: spacing.xs,
  },
});
