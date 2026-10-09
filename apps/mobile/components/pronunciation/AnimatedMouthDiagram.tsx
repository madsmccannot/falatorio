import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Ellipse, Line, G, Circle } from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

interface MouthParams {
  tongueCY: number;
  tongueRX: number;
  tongueTipCY: number;
  jaw: number;
  lipRY: number;
  hasAirflow: boolean;
}

const REST: MouthParams = {
  tongueCY: 138, tongueRX: 35, tongueTipCY: 132,
  jaw: 0, lipRY: 5, hasAirflow: false,
};

const PARAMS: Record<MouthPosition, MouthParams> = {
  rest: REST,
  nasal_ao: {
    tongueCY: 118, tongueRX: 44, tongueTipCY: 108,
    jaw: 14, lipRY: 14, hasAirflow: true,
  },
  nasal_vowel: {
    tongueCY: 120, tongueRX: 40, tongueTipCY: 110,
    jaw: 10, lipRY: 12, hasAirflow: true,
  },
  palatal_lateral: {
    tongueCY: 105, tongueRX: 26, tongueTipCY: 88,
    jaw: 4, lipRY: 7, hasAirflow: false,
  },
  palatal_nasal: {
    tongueCY: 102, tongueRX: 26, tongueTipCY: 85,
    jaw: 5, lipRY: 7, hasAirflow: true,
  },
  uvular_r: {
    tongueCY: 115, tongueRX: 30, tongueTipCY: 112,
    jaw: 8, lipRY: 10, hasAirflow: false,
  },
  alveolar_tap: {
    tongueCY: 108, tongueRX: 24, tongueTipCY: 92,
    jaw: 5, lipRY: 7, hasAirflow: false,
  },
  open_e: {
    tongueCY: 122, tongueRX: 40, tongueTipCY: 116,
    jaw: 12, lipRY: 13, hasAirflow: false,
  },
  closed_e: {
    tongueCY: 112, tongueRX: 30, tongueTipCY: 100,
    jaw: 4, lipRY: 7, hasAirflow: false,
  },
  open_o: {
    tongueCY: 126, tongueRX: 44, tongueTipCY: 122,
    jaw: 14, lipRY: 15, hasAirflow: false,
  },
  closed_o: {
    tongueCY: 120, tongueRX: 36, tongueTipCY: 118,
    jaw: 6, lipRY: 10, hasAirflow: false,
  },
  sibilant_s: {
    tongueCY: 110, tongueRX: 24, tongueTipCY: 94,
    jaw: 3, lipRY: 6, hasAirflow: false,
  },
  sibilant_sh: {
    tongueCY: 114, tongueRX: 26, tongueTipCY: 100,
    jaw: 4, lipRY: 7, hasAirflow: false,
  },
  labiodental_v: {
    tongueCY: 130, tongueRX: 34, tongueTipCY: 126,
    jaw: 3, lipRY: 2, hasAirflow: false,
  },
};

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
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

const CYCLE_MS = 5300;

export function AnimatedMouthDiagram({
  position,
  size = 200,
  showLabel = true,
  autoPlay = true,
}: AnimatedMouthDiagramProps) {
  const [progress, setProgress] = useState(0);
  const p = PARAMS[position];

  useEffect(() => {
    if (!autoPlay) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) % CYCLE_MS;
      let t: number;
      if (elapsed < 800) {
        t = easeInOut(elapsed / 800);
      } else if (elapsed < 2000) {
        t = 1;
      } else if (elapsed < 2800) {
        t = 1 - easeInOut((elapsed - 2000) / 800);
      } else {
        t = 0;
      }
      setProgress(t);
    }, 33);

    return () => clearInterval(id);
  }, [position, autoPlay]);

  const tongueCY = lerp(REST.tongueCY, p.tongueCY, progress);
  const tongueRX = lerp(REST.tongueRX, p.tongueRX, progress);
  const tongueTipCY = lerp(REST.tongueTipCY, p.tongueTipCY, progress);
  const jaw = lerp(0, p.jaw, progress);
  const lipSpread = lerp(REST.lipRY, p.lipRY, progress);
  const airflowOpacity = p.hasAirflow ? progress * 0.8 : 0;

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

          {/* Lower teeth */}
          <Circle
            cx={65}
            cy={140 + jaw}
            r={5}
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1}
          />

          {/* Lower jaw */}
          <Ellipse
            cx={120}
            cy={152 + jaw}
            rx={60}
            ry={16 + jaw * 0.5}
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Tongue body */}
          <Ellipse
            cx={125}
            cy={tongueCY}
            rx={tongueRX}
            ry={10}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={2}
          />

          {/* Tongue tip */}
          <Circle
            cx={90}
            cy={tongueTipCY}
            r={6}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={1.5}
          />

          {/* Upper lip */}
          <Ellipse
            cx={40}
            cy={105 - lipSpread * 0.5}
            rx={8}
            ry={3 + lipSpread * 0.2}
            fill={colors.accent[300]}
            stroke={colors.accent[500]}
            strokeWidth={1.5}
          />

          {/* Lower lip */}
          <Ellipse
            cx={40}
            cy={105 + lipSpread * 0.5}
            rx={8}
            ry={3 + lipSpread * 0.2}
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

          {/* Nasal airflow */}
          <G opacity={airflowOpacity}>
            <Line
              x1={148} y1={80} x2={152} y2={45}
              stroke={colors.info}
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
            <Line
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
