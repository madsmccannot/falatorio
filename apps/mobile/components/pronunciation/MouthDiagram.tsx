import { View, StyleSheet } from "react-native";
import Svg, { Path, Ellipse, G, Text as SvgText } from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";
import { colors } from "@falatorio/ui/tokens";

interface MouthDiagramProps {
  position: MouthPosition;
  size?: number;
  showLabels?: boolean;
}

const MOUTH_CONFIGS: Record<MouthPosition, {
  tongue: string;
  jaw: number;
  lips: string;
  airflow?: string;
  label: string;
}> = {
  rest: {
    tongue: "M 80 130 Q 100 125 130 130 Q 150 132 170 135",
    jaw: 0,
    lips: "M 40 100 Q 35 105 40 110",
    label: "Repouso",
  },
  nasal_ao: {
    tongue: "M 80 135 Q 110 120 140 128 Q 160 132 170 138",
    jaw: 8,
    lips: "M 40 96 Q 30 105 40 114",
    airflow: "M 150 80 Q 155 60 160 40",
    label: "Nasal ao",
  },
  nasal_vowel: {
    tongue: "M 80 132 Q 105 118 135 125 Q 155 130 170 136",
    jaw: 6,
    lips: "M 40 97 Q 32 105 40 113",
    airflow: "M 148 78 Q 152 58 156 38",
    label: "Vogal nasal",
  },
  palatal_lateral: {
    tongue: "M 80 130 Q 100 115 130 108 Q 145 105 150 108 Q 165 115 170 130",
    jaw: 2,
    lips: "M 40 99 Q 36 105 40 111",
    label: "Lateral palatal",
  },
  palatal_nasal: {
    tongue: "M 80 130 Q 100 112 135 105 Q 150 102 155 105 Q 165 115 170 130",
    jaw: 3,
    lips: "M 40 99 Q 36 105 40 111",
    airflow: "M 145 75 Q 150 55 155 35",
    label: "Nasal palatal",
  },
  uvular_r: {
    tongue: "M 80 132 Q 105 128 130 130 Q 155 125 165 118 Q 172 112 175 120",
    jaw: 4,
    lips: "M 40 98 Q 34 105 40 112",
    label: "R uvular",
  },
  alveolar_tap: {
    tongue: "M 80 130 Q 100 120 125 112 Q 135 108 140 112 Q 155 120 170 132",
    jaw: 3,
    lips: "M 40 99 Q 36 105 40 111",
    label: "Vibrante simples",
  },
  open_e: {
    tongue: "M 80 132 Q 105 122 130 125 Q 155 128 170 133",
    jaw: 7,
    lips: "M 40 96 Q 32 105 40 114",
    label: "E aberto",
  },
  closed_e: {
    tongue: "M 80 128 Q 105 116 135 112 Q 155 115 170 125",
    jaw: 3,
    lips: "M 40 99 Q 37 105 40 111",
    label: "E fechado",
  },
  open_o: {
    tongue: "M 80 135 Q 110 128 140 132 Q 160 134 170 138",
    jaw: 8,
    lips: "M 40 95 Q 28 105 40 115",
    label: "O aberto",
  },
  closed_o: {
    tongue: "M 80 130 Q 110 125 140 128 Q 160 130 170 134",
    jaw: 4,
    lips: "M 40 98 Q 33 105 40 112",
    label: "O fechado",
  },
  sibilant_s: {
    tongue: "M 80 130 Q 100 118 130 112 Q 140 110 145 112 Q 160 120 170 130",
    jaw: 2,
    lips: "M 40 100 Q 37 105 40 110",
    label: "S sibilante",
  },
  sibilant_sh: {
    tongue: "M 80 130 Q 100 120 125 115 Q 138 112 142 115 Q 160 122 170 132",
    jaw: 3,
    lips: "M 40 99 Q 34 105 40 111",
    label: "X / ch",
  },
  labiodental_v: {
    tongue: "M 80 130 Q 100 125 130 128 Q 155 130 170 134",
    jaw: 2,
    lips: "M 40 102 Q 38 105 42 108",
    label: "V labiodental",
  },
};

export function MouthDiagram({ position, size = 200, showLabels = true }: MouthDiagramProps) {
  const config = MOUTH_CONFIGS[position];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 220 180">
        <G transform={`translate(0, ${config.jaw})`}>
          {/* Cavidade oral - palato */}
          <Path
            d="M 60 100 Q 80 50 120 40 Q 160 50 180 100"
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Dentes superiores */}
          <Path
            d="M 55 100 L 65 95 L 75 100"
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1.5}
          />

          {/* Dentes inferiores */}
          <Path
            d={`M 55 ${140 + config.jaw} L 65 ${145 + config.jaw} L 75 ${140 + config.jaw}`}
            fill={colors.neutral[0]}
            stroke={colors.neutral[400]}
            strokeWidth={1.5}
          />

          {/* Maxilar inferior */}
          <Path
            d={`M 60 ${140 + config.jaw} Q 80 ${160 + config.jaw} 120 ${165 + config.jaw} Q 160 ${160 + config.jaw} 180 ${140 + config.jaw}`}
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* Lingua */}
          <Path
            d={config.tongue}
            fill={colors.accent[200]}
            stroke={colors.accent[400]}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Labios */}
          <Path
            d={config.lips}
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

          {/* Fluxo de ar nasal */}
          {config.airflow && (
            <Path
              d={config.airflow}
              fill="none"
              stroke={colors.info}
              strokeWidth={1.5}
              strokeDasharray="4,3"
              opacity={0.7}
            />
          )}

          {/* Nariz (cavidade nasal) */}
          <Path
            d="M 120 35 Q 140 25 160 30 Q 165 35 160 40"
            fill="none"
            stroke={colors.neutral[300]}
            strokeWidth={1.5}
          />
        </G>

        {showLabels && (
          <SvgText
            x={110}
            y={16}
            textAnchor="middle"
            fill={colors.neutral[600]}
            fontSize={11}
            fontWeight="600"
          >
            {config.label}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
