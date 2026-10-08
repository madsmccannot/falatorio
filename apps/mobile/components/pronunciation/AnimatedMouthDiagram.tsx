import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, Ellipse, Line, G, Circle } from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface MouthParams {
  tongueCY: number;
  tongueRX: number;
  tongueTipCY: number;
  jaw: number;
  lipRY: number;
  hasAirflow: boolean;
}

const REST: MouthParams = {
  tongueCY: 132, tongueRX: 35, tongueTipCY: 128,
  jaw: 0, lipRY: 5, hasAirflow: false,
};

const PARAMS: Record<MouthPosition, MouthParams> = {
  rest: REST,
  nasal_ao: {
    tongueCY: 128, tongueRX: 38, tongueTipCY: 118,
    jaw: 8, lipRY: 9, hasAirflow: true,
  },
  nasal_vowel: {
    tongueCY: 126, tongueRX: 36, tongueTipCY: 116,
    jaw: 6, lipRY: 8, hasAirflow: true,
  },
  palatal_lateral: {
    tongueCY: 115, tongueRX: 30, tongueTipCY: 100,
    jaw: 2, lipRY: 6, hasAirflow: false,
  },
  palatal_nasal: {
    tongueCY: 112, tongueRX: 30, tongueTipCY: 98,
    jaw: 3, lipRY: 6, hasAirflow: true,
  },
  uvular_r: {
    tongueCY: 125, tongueRX: 32, tongueTipCY: 120,
    jaw: 4, lipRY: 7, hasAirflow: false,
  },
  alveolar_tap: {
    tongueCY: 118, tongueRX: 28, tongueTipCY: 105,
    jaw: 3, lipRY: 6, hasAirflow: false,
  },
  open_e: {
    tongueCY: 128, tongueRX: 36, tongueTipCY: 122,
    jaw: 7, lipRY: 9, hasAirflow: false,
  },
  closed_e: {
    tongueCY: 118, tongueRX: 32, tongueTipCY: 110,
    jaw: 3, lipRY: 6, hasAirflow: false,
  },
  open_o: {
    tongueCY: 132, tongueRX: 38, tongueTipCY: 128,
    jaw: 8, lipRY: 10, hasAirflow: false,
  },
  closed_o: {
    tongueCY: 128, tongueRX: 34, tongueTipCY: 124,
    jaw: 4, lipRY: 7, hasAirflow: false,
  },
  sibilant_s: {
    tongueCY: 118, tongueRX: 28, tongueTipCY: 106,
    jaw: 2, lipRY: 5, hasAirflow: false,
  },
  sibilant_sh: {
    tongueCY: 120, tongueRX: 30, tongueTipCY: 110,
    jaw: 3, lipRY: 6, hasAirflow: false,
  },
  labiodental_v: {
    tongueCY: 130, tongueRX: 34, tongueTipCY: 126,
    jaw: 2, lipRY: 3, hasAirflow: false,
  },
};

function lerp(a: number, b: number, t: number): number {
  "worklet";
  return a + (b - a) * t;
}

interface AnimatedMouthDiagramProps {
  position: MouthPosition;
  size?: number;
  showLabel?: boolean;
  autoPlay?: boolean;
}

const LABEL_MAP: Record<MouthPosition, string> = {
  rest: "Repouso",
  nasal_ao: "Nasal -ao",
  nasal_vowel: "Vogal nasal",
  palatal_lateral: "Lateral palatal (lh)",
  palatal_nasal: "Nasal palatal (nh)",
  uvular_r: "R uvular (rr)",
  alveolar_tap: "Vibrante simples (r)",
  open_e: "E aberto",
  closed_e: "E fechado",
  open_o: "O aberto",
  closed_o: "O fechado",
  sibilant_s: "S sibilante",
  sibilant_sh: "X / ch",
  labiodental_v: "V labiodental",
};

export function AnimatedMouthDiagram({
  position,
  size = 200,
  showLabel = true,
  autoPlay = true,
}: AnimatedMouthDiagramProps) {
  const progress = useSharedValue(0);
  const p = PARAMS[position];

  const tCY = p.tongueCY;
  const tRX = p.tongueRX;
  const tTipCY = p.tongueTipCY;
  const tJaw = p.jaw;
  const tLipRY = p.lipRY;
  const tAirflow = p.hasAirflow;

  useEffect(() => {
    if (autoPlay) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 300 });
    }
    return () => cancelAnimation(progress);
  }, [position, autoPlay]);

  const tongueBodyProps = useAnimatedProps(() => {
    const t = progress.value;
    return {
      cy: lerp(REST.tongueCY, tCY, t),
      rx: lerp(REST.tongueRX, tRX, t),
    };
  });

  const tongueTipProps = useAnimatedProps(() => {
    const t = progress.value;
    return {
      cy: lerp(REST.tongueTipCY, tTipCY, t),
    };
  });

  const jawCurveProps = useAnimatedProps(() => {
    const t = progress.value;
    const jaw = lerp(0, tJaw, t);
    return {
      cy: 152 + jaw,
      ry: 16 + jaw * 0.5,
    };
  });

  const lowerTeethProps = useAnimatedProps(() => {
    const t = progress.value;
    const jaw = lerp(0, tJaw, t);
    return {
      cy: 140 + jaw,
    };
  });

  const upperLipProps = useAnimatedProps(() => {
    const t = progress.value;
    const spread = lerp(REST.lipRY, tLipRY, t);
    return {
      cy: 105 - spread * 0.5,
      ry: 3 + spread * 0.2,
    };
  });

  const lowerLipProps = useAnimatedProps(() => {
    const t = progress.value;
    const spread = lerp(REST.lipRY, tLipRY, t);
    return {
      cy: 105 + spread * 0.5,
      ry: 3 + spread * 0.2,
    };
  });

  const airflowProps = useAnimatedProps(() => {
    const t = progress.value;
    return {
      opacity: tAirflow ? t * 0.8 : 0,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size + 40 }]}>
      <View style={styles.svgWrap}>
        <Svg width={size} height={size} viewBox="0 0 220 180">
          {/* Palate */}
          <Path
            d="M 60 100 Q 80 50 120 40 Q 160 50 180 100"
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Nasal cavity */}
          <Path
            d="M 120 35 Q 140 25 160 30 Q 165 35 160 40"
            fill="none"
            stroke={colors.neutral[300]}
            strokeWidth={1.5}
          />

          {/* Upper teeth */}
          <Path
            d="M 55 100 L 65 95 L 75 100"
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1.5}
          />

          {/* Lower teeth (animated) */}
          <AnimatedCircle
            animatedProps={lowerTeethProps}
            cx={65}
            r={5}
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1}
          />

          {/* Lower jaw (animated) */}
          <AnimatedEllipse
            animatedProps={jawCurveProps}
            cx={120}
            rx={60}
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Tongue body (animated) */}
          <AnimatedEllipse
            animatedProps={tongueBodyProps}
            cx={125}
            ry={10}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={2}
          />

          {/* Tongue tip (animated) */}
          <AnimatedCircle
            animatedProps={tongueTipProps}
            cx={90}
            r={6}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={1.5}
          />

          {/* Upper lip (animated) */}
          <AnimatedEllipse
            animatedProps={upperLipProps}
            cx={40}
            rx={8}
            fill={colors.accent[300]}
            stroke={colors.accent[500]}
            strokeWidth={1.5}
          />

          {/* Lower lip (animated) */}
          <AnimatedEllipse
            animatedProps={lowerLipProps}
            cx={40}
            rx={8}
            fill={colors.accent[300]}
            stroke={colors.accent[500]}
            strokeWidth={1.5}
          />

          {/* Uvula */}
          <Ellipse
            cx={175}
            cy={95}
            rx={5}
            ry={8}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={1}
          />

          {/* Nasal airflow (animated) */}
          <G>
            <AnimatedLine
              animatedProps={airflowProps}
              x1={148} y1={80} x2={152} y2={45}
              stroke={colors.info}
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
            <AnimatedLine
              animatedProps={airflowProps}
              x1={155} y1={78} x2={160} y2={42}
              stroke={colors.info}
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
          </G>

        </Svg>
      </View>

      {showLabel && (
        <Text style={styles.label}>{LABEL_MAP[position]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svgWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: spacing.xs,
    fontFamily: typography.heading.fontFamily,
    fontWeight: "600",
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: "center",
  },
});
