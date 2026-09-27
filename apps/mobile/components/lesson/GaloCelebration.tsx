import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Path,
  Circle,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = [
  "#FFD700", "#B8860B", "#FFE066", "#DAA520",
  "#006600", "#FF0000", "#FFFFFF", "#FFA500",
];

function GaloSvg({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="galo_body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFE066" />
          <Stop offset="40%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
        <LinearGradient id="galo_wing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#DAA520" />
          <Stop offset="100%" stopColor="#8B6914" />
        </LinearGradient>
        <LinearGradient id="galo_tail" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFEC99" />
          <Stop offset="50%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#DAA520" />
        </LinearGradient>
        <LinearGradient id="galo_comb" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#CC0000" />
          <Stop offset="100%" stopColor="#FF3333" />
        </LinearGradient>
        <LinearGradient id="galo_heart" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#FF4444" />
          <Stop offset="100%" stopColor="#CC0000" />
        </LinearGradient>
      </Defs>

      {/* Tail feathers */}
      <Path
        d="M20,45 Q10,30 18,15 Q22,25 25,35 Z"
        fill="url(#galo_tail)"
      />
      <Path
        d="M22,48 Q8,35 12,18 Q18,28 24,38 Z"
        fill="url(#galo_tail)"
        opacity={0.9}
      />
      <Path
        d="M24,50 Q5,40 8,22 Q16,32 23,42 Z"
        fill="url(#galo_tail)"
        opacity={0.8}
      />

      {/* Legs */}
      <Path
        d="M45,82 L42,95 L38,95 M45,82 L48,95 L52,95"
        stroke="#DAA520"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Body */}
      <Path
        d="M30,50 Q30,40 40,35 Q50,30 60,35 Q70,40 70,55 Q70,70 60,78 Q50,85 40,78 Q30,70 30,55 Z"
        fill="url(#galo_body)"
      />

      {/* Wing */}
      <Path
        d="M38,50 Q42,42 52,45 Q58,48 55,58 Q52,65 42,62 Q36,58 38,50 Z"
        fill="url(#galo_wing)"
      />

      {/* Wing pattern lines */}
      <Path
        d="M42,48 Q48,46 52,50"
        stroke="#8B6914"
        strokeWidth={0.8}
        fill="none"
      />
      <Path
        d="M40,54 Q47,52 53,55"
        stroke="#8B6914"
        strokeWidth={0.8}
        fill="none"
      />

      {/* Heart on breast */}
      <Path
        d="M48,62 C48,60 46,58 44,58 C42,58 40,60 40,62 C40,60 38,58 36,58 C34,58 32,60 32,62 C32,66 40,72 40,72 C40,72 48,66 48,62 Z"
        fill="url(#galo_heart)"
        transform="translate(8,-2) scale(0.6)"
      />

      {/* Neck */}
      <Path
        d="M55,38 Q58,32 60,28 Q62,25 58,22 Q55,28 52,34 Z"
        fill="url(#galo_body)"
      />

      {/* Head */}
      <Circle cx="58" cy="20" r="8" fill="url(#galo_body)" />

      {/* Comb */}
      <Path
        d="M52,14 Q54,8 56,12 Q58,6 60,12 Q62,8 64,14 Q60,16 56,16 Q52,16 52,14 Z"
        fill="url(#galo_comb)"
      />

      {/* Eye */}
      <Circle cx="60" cy="19" r="2" fill="#1A1A1A" />
      <Circle cx="60.5" cy="18.5" r="0.7" fill="#FFFFFF" />

      {/* Beak */}
      <Polygon
        points="66,20 72,22 66,24"
        fill="#DAA520"
      />

      {/* Wattle */}
      <Path
        d="M62,24 Q64,28 60,28"
        fill="#CC0000"
      />

      {/* Decorative dots on body (traditional Barcelos pattern) */}
      <Circle cx="40" cy="55" r="1.2" fill="#FFEC99" opacity={0.7} />
      <Circle cx="55" cy="60" r="1.2" fill="#FFEC99" opacity={0.7} />
      <Circle cx="48" cy="70" r="1.2" fill="#FFEC99" opacity={0.7} />
      <Circle cx="35" cy="65" r="1.2" fill="#FFEC99" opacity={0.7} />
      <Circle cx="60" cy="50" r="1.2" fill="#FFEC99" opacity={0.7} />
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

type GaloCelebrationProps = {
  onFinish?: () => void;
};

export function GaloCelebration({ onFinish }: GaloCelebrationProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(0);

  const confetti = React.useMemo(() => generateConfetti(), []);

  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 120 }),
      withSpring(1, { damping: 12, stiffness: 100 }),
    );

    rotate.value = withSequence(
      withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(360, { duration: 100 }),
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

  const galoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.3,
    transform: [{ scale: 1 + glow.value * 0.5 }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {confetti.map((piece, i) => (
        <ConfettiPieceView key={i} piece={piece} />
      ))}

      <View style={styles.galoCenter}>
        <Animated.View style={[styles.glowCircle, glowStyle]} />
        <Animated.View style={galoStyle}>
          <GaloSvg size={140} />
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
  galoCenter: {
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
    backgroundColor: "#FFD700",
  },
});
