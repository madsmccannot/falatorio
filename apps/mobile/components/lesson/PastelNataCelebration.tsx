import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = [
  "#FFD700", "#B8860B", "#FFE066", "#DAA520",
  "#F5E6CA", "#D4A76A", "#8B5E3C", "#FFA500",
];

function PastelNataSvg({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="pn_crust_outer" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D4A76A" />
          <Stop offset="50%" stopColor="#C4943C" />
          <Stop offset="100%" stopColor="#8B6914" />
        </LinearGradient>
        <LinearGradient id="pn_crust_inner" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#E8C88A" />
          <Stop offset="100%" stopColor="#D4A76A" />
        </LinearGradient>
        <RadialGradient id="pn_custard" cx="50%" cy="45%" r="45%">
          <Stop offset="0%" stopColor="#FFF3D6" />
          <Stop offset="40%" stopColor="#FFE8A0" />
          <Stop offset="100%" stopColor="#F0C050" />
        </RadialGradient>
        <RadialGradient id="pn_caramel_1" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#8B4513" />
          <Stop offset="100%" stopColor="#A0522D" stopOpacity={0.7} />
        </RadialGradient>
        <RadialGradient id="pn_caramel_2" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#6B3410" />
          <Stop offset="100%" stopColor="#8B4513" stopOpacity={0.6} />
        </RadialGradient>
        <LinearGradient id="pn_rim_highlight" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#E8D5A8" stopOpacity={0.8} />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.4} />
          <Stop offset="100%" stopColor="#E8D5A8" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Shadow beneath */}
      <Ellipse cx="50" cy="88" rx="32" ry="5" fill="#000" opacity={0.1} />

      {/* Outer crust wall */}
      <Path
        d="M18,45 Q18,30 30,24 Q40,20 50,19 Q60,20 70,24 Q82,30 82,45 L82,75 Q82,82 75,85 Q65,88 50,88 Q35,88 25,85 Q18,82 18,75 Z"
        fill="url(#pn_crust_outer)"
      />

      {/* Crust fluted ridges */}
      <Path d="M20,45 Q20,42 22,40" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M26,32 Q28,30 30,29" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M35,24 Q38,22 40,22" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M60,22 Q62,22 65,24" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M70,29 Q72,30 74,32" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />
      <Path d="M78,40 Q80,42 80,45" stroke="#8B6914" strokeWidth={0.8} opacity={0.5} fill="none" />

      {/* Inner crust rim */}
      <Ellipse cx="50" cy="42" rx="28" ry="14" fill="url(#pn_crust_inner)" />

      {/* Custard filling */}
      <Ellipse cx="50" cy="42" rx="25" ry="12" fill="url(#pn_custard)" />

      {/* Caramelised burn marks */}
      <Ellipse cx="42" cy="38" rx="6" ry="4" fill="url(#pn_caramel_1)" opacity={0.7} />
      <Ellipse cx="56" cy="40" rx="7" ry="3.5" fill="url(#pn_caramel_2)" opacity={0.6} />
      <Ellipse cx="48" cy="45" rx="5" ry="3" fill="url(#pn_caramel_1)" opacity={0.5} />
      <Circle cx="38" cy="43" r="2.5" fill="#6B3410" opacity={0.4} />
      <Circle cx="60" cy="36" r="2" fill="#8B4513" opacity={0.35} />

      {/* Custard shine highlight */}
      <Ellipse cx="45" cy="36" rx="8" ry="3" fill="#FFFFFF" opacity={0.2} />

      {/* Rim highlight */}
      <Path
        d="M25,42 Q35,30 50,28 Q65,30 75,42"
        stroke="url(#pn_rim_highlight)"
        strokeWidth={1.5}
        fill="none"
      />

      {/* Crust texture dots */}
      <Circle cx="22" cy="55" r="0.8" fill="#A07030" opacity={0.4} />
      <Circle cx="25" cy="65" r="0.8" fill="#A07030" opacity={0.4} />
      <Circle cx="78" cy="55" r="0.8" fill="#A07030" opacity={0.4} />
      <Circle cx="75" cy="65" r="0.8" fill="#A07030" opacity={0.4} />
      <Circle cx="30" cy="75" r="0.8" fill="#A07030" opacity={0.4} />
      <Circle cx="70" cy="75" r="0.8" fill="#A07030" opacity={0.4} />
    </Svg>
  );
}

interface ConfettiPiece {
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

function generateConfetti(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / CONFETTI_COUNT + (Math.random() - 0.5) * 0.5;
    const speed = 200 + Math.random() * 300;
    pieces.push({
      x: SCREEN_WIDTH / 2,
      y: 200,
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
      size: 6 + Math.random() * 8,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 400,
      delay: Math.random() * 200,
    });
  }
  return pieces;
}

function ConfettiPieceView({ piece }: { piece: ConfettiPiece }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    translateX.value = withDelay(
      piece.delay,
      withTiming(piece.velocityX, { duration: 1200, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(piece.velocityY, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(piece.velocityY + 600, { duration: 800, easing: Easing.in(Easing.quad) }),
      ),
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, { duration: 1400 }),
    );
    opacity.value = withDelay(
      piece.delay + 800,
      withTiming(0, { duration: 600 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: piece.x,
          top: piece.y,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

type PastelNataCelebrationProps = {
  onFinish?: () => void;
};

export function PastelNataCelebration({ onFinish }: PastelNataCelebrationProps) {
  const scale = useSharedValue(0);
  const spinY = useSharedValue(0);
  const glow = useSharedValue(0);

  const confetti = React.useMemo(() => generateConfetti(), []);

  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 120 }),
      withSpring(1, { damping: 12, stiffness: 100 }),
    );

    spinY.value = withRepeat(
      withTiming(360, { duration: 1600, easing: Easing.linear }),
      -1,
      false,
    );

    glow.value = withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(1200, withTiming(0, { duration: 400 })),
    );

    if (onFinish) {
      const timer = setTimeout(onFinish, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const pastelStyle = useAnimatedStyle(() => {
    const perspective = 800;
    const rad = (spinY.value * Math.PI) / 180;
    const scaleX = Math.abs(Math.cos(rad));
    const tiltFactor = Math.sin(rad) * 0.15;

    return {
      transform: [
        { scale: scale.value },
        { scaleX: Math.max(scaleX, 0.15) },
        { skewY: `${tiltFactor * 10}deg` },
        { perspective },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.3,
    transform: [{ scale: 1 + glow.value * 0.5 }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {confetti.map((piece, i) => (
        <ConfettiPieceView key={i} piece={piece} />
      ))}

      <View style={styles.center}>
        <Animated.View style={[styles.glowCircle, glowStyle]} />
        <Animated.View style={pastelStyle}>
          <PastelNataSvg size={140} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  center: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F0C050",
  },
});
