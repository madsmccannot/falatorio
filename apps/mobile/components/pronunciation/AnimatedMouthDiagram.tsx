import { useEffect } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, Ellipse, Circle } from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MouthParams {
  tongueY1: number;
  tongueY2: number;
  tongueY3: number;
  tongueY4: number;
  jaw: number;
  lipSpread: number;
  hasAirflow: boolean;
  airflowX: number;
}

const REST: MouthParams = {
  tongueY1: 130, tongueY2: 125, tongueY3: 130, tongueY4: 135,
  jaw: 0, lipSpread: 5, hasAirflow: false, airflowX: 150,
};

const PARAMS: Record<MouthPosition, MouthParams> = {
  rest: REST,
  nasal_ao: {
    tongueY1: 135, tongueY2: 120, tongueY3: 128, tongueY4: 138,
    jaw: 8, lipSpread: 9, hasAirflow: true, airflowX: 150,
  },
  nasal_vowel: {
    tongueY1: 132, tongueY2: 118, tongueY3: 125, tongueY4: 136,
    jaw: 6, lipSpread: 8, hasAirflow: true, airflowX: 148,
  },
  palatal_lateral: {
    tongueY1: 130, tongueY2: 108, tongueY3: 105, tongueY4: 130,
    jaw: 2, lipSpread: 6, hasAirflow: false, airflowX: 150,
  },
  palatal_nasal: {
    tongueY1: 130, tongueY2: 105, tongueY3: 102, tongueY4: 130,
    jaw: 3, lipSpread: 6, hasAirflow: true, airflowX: 145,
  },
  uvular_r: {
    tongueY1: 132, tongueY2: 128, tongueY3: 118, tongueY4: 120,
    jaw: 4, lipSpread: 7, hasAirflow: false, airflowX: 150,
  },
  alveolar_tap: {
    tongueY1: 130, tongueY2: 112, tongueY3: 108, tongueY4: 132,
    jaw: 3, lipSpread: 6, hasAirflow: false, airflowX: 150,
  },
  open_e: {
    tongueY1: 132, tongueY2: 122, tongueY3: 125, tongueY4: 133,
    jaw: 7, lipSpread: 9, hasAirflow: false, airflowX: 150,
  },
  closed_e: {
    tongueY1: 128, tongueY2: 112, tongueY3: 115, tongueY4: 125,
    jaw: 3, lipSpread: 6, hasAirflow: false, airflowX: 150,
  },
  open_o: {
    tongueY1: 135, tongueY2: 128, tongueY3: 132, tongueY4: 138,
    jaw: 8, lipSpread: 10, hasAirflow: false, airflowX: 150,
  },
  closed_o: {
    tongueY1: 130, tongueY2: 125, tongueY3: 128, tongueY4: 134,
    jaw: 4, lipSpread: 7, hasAirflow: false, airflowX: 150,
  },
  sibilant_s: {
    tongueY1: 130, tongueY2: 112, tongueY3: 110, tongueY4: 130,
    jaw: 2, lipSpread: 5, hasAirflow: false, airflowX: 150,
  },
  sibilant_sh: {
    tongueY1: 130, tongueY2: 115, tongueY3: 112, tongueY4: 132,
    jaw: 3, lipSpread: 6, hasAirflow: false, airflowX: 150,
  },
  labiodental_v: {
    tongueY1: 130, tongueY2: 125, tongueY3: 128, tongueY4: 134,
    jaw: 2, lipSpread: 3, hasAirflow: false, airflowX: 150,
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
  const target = PARAMS[position];

  useEffect(() => {
    if (autoPlay) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        false,
      );
    }
    return () => cancelAnimation(progress);
  }, [position, autoPlay]);

  const tongueProps = useAnimatedProps(() => {
    const t = progress.value;
    const y1 = lerp(REST.tongueY1, target.tongueY1, t);
    const y2 = lerp(REST.tongueY2, target.tongueY2, t);
    const y3 = lerp(REST.tongueY3, target.tongueY3, t);
    const y4 = lerp(REST.tongueY4, target.tongueY4, t);
    return {
      d: `M 80 ${y1} Q 110 ${y2} 140 ${y3} Q 160 ${y4 - 2} 170 ${y4}`,
    };
  });

  const jawProps = useAnimatedProps(() => {
    const t = progress.value;
    const jaw = lerp(0, target.jaw, t);
    return {
      d: `M 60 ${140 + jaw} Q 80 ${160 + jaw} 120 ${165 + jaw} Q 160 ${160 + jaw} 180 ${140 + jaw}`,
    };
  });

  const lowerTeethProps = useAnimatedProps(() => {
    const t = progress.value;
    const jaw = lerp(0, target.jaw, t);
    return {
      d: `M 55 ${140 + jaw} L 65 ${145 + jaw} L 75 ${140 + jaw}`,
    };
  });

  const lipProps = useAnimatedProps(() => {
    const t = progress.value;
    const spread = lerp(REST.lipSpread, target.lipSpread, t);
    return {
      d: `M 40 ${105 - spread} Q ${35 - spread * 0.4} 105 40 ${105 + spread}`,
    };
  });

  const airflowProps = useAnimatedProps(() => {
    const t = progress.value;
    const opacity = target.hasAirflow ? t * 0.7 : 0;
    return {
      opacity,
      d: `M ${target.airflowX} 80 Q ${target.airflowX + 5} 60 ${target.airflowX + 10} 40`,
    };
  });

  const handleToggle = () => {
    if (progress.value === 0) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 400 });
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size + 40 }]}>
      <Pressable onPress={handleToggle} style={styles.svgWrap}>
        <Svg width={size} height={size} viewBox="0 0 220 180">
          {/* Palate */}
          <Path
            d="M 60 100 Q 80 50 120 40 Q 160 50 180 100"
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Upper teeth */}
          <Path
            d="M 55 100 L 65 95 L 75 100"
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1.5}
          />

          {/* Lower teeth (animated) */}
          <AnimatedPath
            animatedProps={lowerTeethProps}
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1.5}
          />

          {/* Lower jaw (animated) */}
          <AnimatedPath
            animatedProps={jawProps}
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Tongue (animated) */}
          <AnimatedPath
            animatedProps={tongueProps}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Lips (animated) */}
          <AnimatedPath
            animatedProps={lipProps}
            fill={colors.accent[300]}
            stroke={colors.accent[500]}
            strokeWidth={2}
            strokeLinecap="round"
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
          <AnimatedPath
            animatedProps={airflowProps}
            fill="none"
            stroke={colors.info}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />

          {/* Nasal cavity */}
          <Path
            d="M 120 35 Q 140 25 160 30 Q 165 35 160 40"
            fill="none"
            stroke={colors.neutral[300]}
            strokeWidth={1.5}
          />

          {/* Play indicator */}
          <Circle cx={15} cy={15} r={10} fill={colors.primary[100]} opacity={0.8} />
          <Path d="M 12 10 L 20 15 L 12 20 Z" fill={colors.primary[600]} />
        </Svg>
      </Pressable>

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
