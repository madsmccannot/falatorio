import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, G, Line, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";

const C = {
  bg: "#1A0A10",
  nasal: "#301420",
  tissue: "#E8A0A0",
  tissueStroke: "#B87078",
  palate: "#D08888",
  palateStroke: "#A86068",
  tongue: "#D05868",
  tongueLight: "#E07080",
  tongueStroke: "#983848",
  teeth: "#F5F5E0",
  teethStroke: "#B8B8A0",
  lip: "#C04858",
  lipLight: "#D86070",
  skin: "#F0C8A8",
  skinStroke: "#B89878",
  uvula: "#D88890",
  airflow: "#68B8F0",
  label: "#D0B0B8",
};

interface TongueCtrl {
  tip: [number, number];
  blade: [number, number];
  front: [number, number];
  dorsum: [number, number];
  back: [number, number];
}

interface PosData {
  tongue: TongueCtrl;
  jawDrop: number;
  velumDrop: number;
  lipOpen: number;
  lipRound: number;
}

const POSITIONS: Record<MouthPosition, PosData> = {
  rest: {
    tongue: { tip: [52, 130], blade: [64, 124], front: [86, 120], dorsum: [114, 118], back: [148, 126] },
    jawDrop: 0, velumDrop: 0, lipOpen: 5, lipRound: 0,
  },
  nasal_ao: {
    tongue: { tip: [52, 136], blade: [68, 128], front: [90, 112], dorsum: [120, 102], back: [150, 118] },
    jawDrop: 16, velumDrop: 14, lipOpen: 18, lipRound: 0.7,
  },
  nasal_vowel: {
    tongue: { tip: [52, 134], blade: [66, 126], front: [88, 114], dorsum: [116, 106], back: [150, 120] },
    jawDrop: 12, velumDrop: 12, lipOpen: 14, lipRound: 0.4,
  },
  palatal_lateral: {
    tongue: { tip: [48, 84], blade: [58, 76], front: [80, 66], dorsum: [110, 62], back: [146, 100] },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  palatal_nasal: {
    tongue: { tip: [48, 82], blade: [58, 74], front: [80, 64], dorsum: [110, 58], back: [146, 96] },
    jawDrop: 5, velumDrop: 12, lipOpen: 7, lipRound: 0,
  },
  uvular_r: {
    tongue: { tip: [52, 128], blade: [64, 122], front: [86, 114], dorsum: [120, 104], back: [155, 74] },
    jawDrop: 8, velumDrop: 0, lipOpen: 10, lipRound: 0.2,
  },
  alveolar_tap: {
    tongue: { tip: [46, 80], blade: [58, 92], front: [80, 104], dorsum: [110, 106], back: [146, 114] },
    jawDrop: 5, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  open_e: {
    tongue: { tip: [52, 132], blade: [66, 124], front: [86, 112], dorsum: [114, 106], back: [148, 122] },
    jawDrop: 14, velumDrop: 0, lipOpen: 16, lipRound: 0,
  },
  closed_e: {
    tongue: { tip: [50, 120], blade: [62, 108], front: [82, 94], dorsum: [110, 86], back: [146, 112] },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  open_o: {
    tongue: { tip: [52, 140], blade: [68, 132], front: [90, 124], dorsum: [122, 116], back: [152, 122] },
    jawDrop: 18, velumDrop: 0, lipOpen: 20, lipRound: 0.85,
  },
  closed_o: {
    tongue: { tip: [52, 134], blade: [66, 126], front: [88, 116], dorsum: [116, 110], back: [150, 122] },
    jawDrop: 6, velumDrop: 0, lipOpen: 9, lipRound: 0.9,
  },
  sibilant_s: {
    tongue: { tip: [46, 84], blade: [56, 90], front: [78, 98], dorsum: [108, 100], back: [146, 116] },
    jawDrop: 3, velumDrop: 0, lipOpen: 5, lipRound: 0,
  },
  sibilant_sh: {
    tongue: { tip: [48, 88], blade: [60, 94], front: [82, 96], dorsum: [112, 96], back: [146, 114] },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0.3,
  },
  labiodental_v: {
    tongue: { tip: [52, 128], blade: [64, 124], front: [86, 120], dorsum: [114, 118], back: [148, 128] },
    jawDrop: 3, velumDrop: 0, lipOpen: 3, lipRound: 0,
  },
};

function buildTonguePath(tc: TongueCtrl, jawDrop: number): string {
  const floorY = 158 + jawDrop;
  const rootY = 155 + jawDrop * 0.6;
  return [
    `M ${tc.tip[0]} ${tc.tip[1]}`,
    `C ${tc.blade[0] - 2} ${tc.blade[1] - 4}, ${tc.blade[0]} ${tc.blade[1]}, ${tc.front[0]} ${tc.front[1]}`,
    `C ${(tc.front[0] + tc.dorsum[0]) / 2} ${(tc.front[1] + tc.dorsum[1]) / 2 - 4}, ${tc.dorsum[0]} ${tc.dorsum[1]}, ${(tc.dorsum[0] + tc.back[0]) / 2} ${(tc.dorsum[1] + tc.back[1]) / 2}`,
    `C ${tc.back[0] - 4} ${tc.back[1]}, ${tc.back[0]} ${tc.back[1]}, ${tc.back[0] + 8} ${rootY}`,
    `L ${tc.back[0] + 12} ${floorY}`,
    `Q ${110} ${floorY + 4}, ${tc.tip[0] - 4} ${Math.min(tc.tip[1] + 14, floorY)}`,
    `Z`,
  ].join(" ");
}

interface MouthDiagramProps {
  position: MouthPosition;
  size?: number;
  showLabels?: boolean;
  t?: (key: string) => string;
}

export function MouthDiagram({ position, size = 200, showLabels = true, t }: MouthDiagramProps) {
  const p = POSITIONS[position];
  const tonguePath = buildTonguePath(p.tongue, p.jawDrop);
  const lipProtrude = p.lipRound * 6;
  const upperLipY = 76;
  const lowerLipY = 76 + p.lipOpen;
  const velumEndY = 58 + p.velumDrop;
  const uvulaY = velumEndY + 10;
  const jawFloorY = 158 + p.jawDrop;
  const upperTeethBottom = 78;
  const lowerTeethTop = 134 + p.jawDrop;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 210 195">
        <Defs>
          <LinearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.tongueLight} />
            <Stop offset="1" stopColor={C.tongue} />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="210" height="195" rx="12" fill={C.bg} />

        <Path d={`M 30 20 Q 50 18, 80 22 Q 120 18, 145 28 L 145 45 Q 120 36, 80 40 Q 50 38, 30 42 Z`} fill={C.nasal} />

        <Path d={`M 170 48 Q 174 50, 176 55 L 176 ${jawFloorY} Q 174 ${jawFloorY + 5}, 170 ${jawFloorY + 6}`} fill="none" stroke={C.tissueStroke} strokeWidth={3} />

        <Path d={`M 42 74 Q 42 68, 46 62 Q 60 42, 95 36 Q 130 32, 148 42`} fill="none" stroke={C.palate} strokeWidth={5} strokeLinecap="round" />
        <Path d={`M 44 72 Q 60 46, 95 40 Q 128 36, 146 44`} fill="none" stroke={C.palateStroke} strokeWidth={1.5} />

        <Path d={`M 148 42 Q 155 ${44 + p.velumDrop * 0.3}, 160 ${48 + p.velumDrop * 0.6} Q 166 ${52 + p.velumDrop}, 164 ${velumEndY}`} fill="none" stroke={C.palate} strokeWidth={4.5} strokeLinecap="round" />
        <Path d={`M 164 ${velumEndY} Q 166 ${velumEndY + 3}, 164 ${uvulaY} Q 162 ${uvulaY + 3}, 160 ${uvulaY}`} fill={C.uvula} stroke={C.palateStroke} strokeWidth={1} />

        <Path d={`M 36 ${134 + p.jawDrop} Q 38 ${142 + p.jawDrop}, 44 ${148 + p.jawDrop} Q 80 ${jawFloorY + 8}, 130 ${jawFloorY + 6} Q 158 ${jawFloorY + 4}, 170 ${jawFloorY}`} fill="none" stroke={C.skinStroke} strokeWidth={2.5} />
        <Path d={`M 44 ${148 + p.jawDrop} Q 80 ${jawFloorY + 4}, 130 ${jawFloorY + 2} Q 155 ${jawFloorY}, 170 ${jawFloorY - 2} L 170 ${jawFloorY + 6} Q 155 ${jawFloorY + 8}, 130 ${jawFloorY + 8} Q 80 ${jawFloorY + 10}, 44 ${150 + p.jawDrop} Z`} fill={C.tissue} opacity={0.4} />

        <Path d={tonguePath} fill="url(#tGrad)" stroke={C.tongueStroke} strokeWidth={2} strokeLinejoin="round" />

        <Path d={`M 38 ${upperTeethBottom - 12} L 38 ${upperTeethBottom} L 44 ${upperTeethBottom + 2} L 44 ${upperTeethBottom - 10} Z`} fill={C.teeth} stroke={C.teethStroke} strokeWidth={0.8} />
        <Path d={`M 38 ${lowerTeethTop} L 38 ${lowerTeethTop + 10} L 44 ${lowerTeethTop + 8} L 44 ${lowerTeethTop} Z`} fill={C.teeth} stroke={C.teethStroke} strokeWidth={0.8} />

        <Path d={`M 28 22 Q 22 30, 18 40 L 12 50 Q 8 55, 10 58 L 16 60 Q 20 62, 22 58 L 24 54 Q 26 48, 28 42`} fill={C.skin} stroke={C.skinStroke} strokeWidth={1.5} />
        <Path d={`M 22 66 Q 18 70, ${16 - lipProtrude} ${upperLipY - 2} Q ${12 - lipProtrude} ${upperLipY}, ${14 - lipProtrude} ${upperLipY + 2} L 36 ${upperLipY + 1}`} fill={C.lip} stroke={C.lipLight} strokeWidth={0.8} />
        <Path d={`M 36 ${lowerLipY} L ${14 - lipProtrude} ${lowerLipY - 1} Q ${10 - lipProtrude} ${lowerLipY + 1}, ${14 - lipProtrude} ${lowerLipY + 4} Q ${18 - lipProtrude * 0.5} ${lowerLipY + 8 + p.jawDrop * 0.3}, 26 ${lowerLipY + 12 + p.jawDrop * 0.4}`} fill={C.lip} stroke={C.lipLight} strokeWidth={0.8} />
        <Path d={`M 26 ${lowerLipY + 12 + p.jawDrop * 0.4} Q 30 ${100 + p.jawDrop * 0.5}, 34 ${110 + p.jawDrop * 0.5} Q 38 ${120 + p.jawDrop * 0.6}, 36 ${134 + p.jawDrop}`} fill="none" stroke={C.skinStroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M 28 22 Q 32 16, 40 12" fill="none" stroke={C.skinStroke} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M 22 58 Q 22 62, 22 66" fill="none" stroke={C.skinStroke} strokeWidth={1.5} />

        {p.velumDrop > 0 && (
          <G opacity={0.8}>
            <Line x1={100} y1={34} x2={90} y2={18} stroke={C.airflow} strokeWidth={2} strokeDasharray="4,3" />
            <Line x1={115} y1={32} x2={108} y2={16} stroke={C.airflow} strokeWidth={2} strokeDasharray="4,3" />
            <Path d="M 90 18 L 87 24 M 90 18 L 94 23" stroke={C.airflow} strokeWidth={1.5} strokeLinecap="round" />
            <Path d="M 108 16 L 105 22 M 108 16 L 112 21" stroke={C.airflow} strokeWidth={1.5} strokeLinecap="round" />
          </G>
        )}

        {showLabels && t && (
          <SVGLabel x={80} y={12} text={t(`mouth.${position}`)} />
        )}
      </Svg>
    </View>
  );
}

function SVGLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <SvgText x={x} y={y} fontSize={10} fill={C.label} fontWeight="600" textAnchor="middle">{text}</SvgText>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
