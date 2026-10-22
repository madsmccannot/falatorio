import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path, Rect, G, Circle, Defs, LinearGradient,
  RadialGradient, Stop,
} from "react-native-svg";
import type { MouthPosition } from "@falatorio/core/l1-profiles/types";
import { useTranslation } from "@/lib/i18n";
import { spacing, typography } from "@falatorio/ui/tokens";

const C = {
  bg: "#1A0A10",
  cavity: "#2A1018",
  nasal: "#301420",
  tissue: "#E8A0A0",
  tissueLight: "#F0B8B8",
  tissueStroke: "#B87078",
  palate: "#D08888",
  palateInner: "#C07878",
  palateStroke: "#A86068",
  tongue: "#D05868",
  tongueLight: "#E07080",
  tongueDark: "#B04050",
  tongueStroke: "#983848",
  teeth: "#F5F5E0",
  teethStroke: "#B8B8A0",
  lip: "#C04858",
  lipLight: "#D86070",
  skin: "#F0C8A8",
  skinStroke: "#B89878",
  uvula: "#D88890",
  airflow: "#68B8F0",
  airflowOral: "#90D8A0",
  contact: "#FFD080",
  contactGlow: "#FFE8B0",
  label: "#D0B0B8",
  epiglottis: "#D89898",
  alveolarRidge: "#D89090",
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

interface ContactPoint {
  x: number;
  y: number;
}

const REST: PosData = {
  tongue: {
    tip: [52, 130], blade: [64, 124], front: [86, 120],
    dorsum: [114, 118], back: [148, 126],
  },
  jawDrop: 0, velumDrop: 0, lipOpen: 5, lipRound: 0,
};

const POS: Record<MouthPosition, PosData> = {
  rest: REST,
  nasal_ao: {
    tongue: {
      tip: [52, 136], blade: [68, 128], front: [90, 112],
      dorsum: [120, 102], back: [150, 118],
    },
    jawDrop: 16, velumDrop: 14, lipOpen: 18, lipRound: 0.7,
  },
  nasal_vowel: {
    tongue: {
      tip: [52, 134], blade: [66, 126], front: [88, 114],
      dorsum: [116, 106], back: [150, 120],
    },
    jawDrop: 12, velumDrop: 12, lipOpen: 14, lipRound: 0.4,
  },
  palatal_lateral: {
    tongue: {
      tip: [48, 84], blade: [58, 76], front: [80, 66],
      dorsum: [110, 62], back: [146, 100],
    },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  palatal_nasal: {
    tongue: {
      tip: [48, 82], blade: [58, 74], front: [80, 64],
      dorsum: [110, 58], back: [146, 96],
    },
    jawDrop: 5, velumDrop: 12, lipOpen: 7, lipRound: 0,
  },
  uvular_r: {
    tongue: {
      tip: [52, 128], blade: [64, 122], front: [86, 114],
      dorsum: [120, 104], back: [155, 74],
    },
    jawDrop: 8, velumDrop: 0, lipOpen: 10, lipRound: 0.2,
  },
  alveolar_tap: {
    tongue: {
      tip: [46, 80], blade: [58, 92], front: [80, 104],
      dorsum: [110, 106], back: [146, 114],
    },
    jawDrop: 5, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  open_e: {
    tongue: {
      tip: [52, 132], blade: [66, 124], front: [86, 112],
      dorsum: [114, 106], back: [148, 122],
    },
    jawDrop: 14, velumDrop: 0, lipOpen: 16, lipRound: 0,
  },
  closed_e: {
    tongue: {
      tip: [50, 120], blade: [62, 108], front: [82, 94],
      dorsum: [110, 86], back: [146, 112],
    },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0,
  },
  open_o: {
    tongue: {
      tip: [52, 140], blade: [68, 132], front: [90, 124],
      dorsum: [122, 116], back: [152, 122],
    },
    jawDrop: 18, velumDrop: 0, lipOpen: 20, lipRound: 0.85,
  },
  closed_o: {
    tongue: {
      tip: [52, 134], blade: [66, 126], front: [88, 116],
      dorsum: [116, 110], back: [150, 122],
    },
    jawDrop: 6, velumDrop: 0, lipOpen: 9, lipRound: 0.9,
  },
  sibilant_s: {
    tongue: {
      tip: [46, 84], blade: [56, 90], front: [78, 98],
      dorsum: [108, 100], back: [146, 116],
    },
    jawDrop: 3, velumDrop: 0, lipOpen: 5, lipRound: 0,
  },
  sibilant_sh: {
    tongue: {
      tip: [48, 88], blade: [60, 94], front: [82, 96],
      dorsum: [112, 96], back: [146, 114],
    },
    jawDrop: 4, velumDrop: 0, lipOpen: 7, lipRound: 0.3,
  },
  labiodental_v: {
    tongue: {
      tip: [52, 128], blade: [64, 124], front: [86, 120],
      dorsum: [114, 118], back: [148, 128],
    },
    jawDrop: 3, velumDrop: 0, lipOpen: 3, lipRound: 0,
  },
};

const CONTACT_POINTS: Partial<Record<MouthPosition, ContactPoint>> = {
  alveolar_tap: { x: 44, y: 70 },
  sibilant_s: { x: 44, y: 72 },
  sibilant_sh: { x: 50, y: 68 },
  palatal_lateral: { x: 80, y: 58 },
  palatal_nasal: { x: 80, y: 56 },
  uvular_r: { x: 158, y: 62 },
  labiodental_v: { x: 24, y: 76 },
};

const ORAL_AIRFLOW: Set<MouthPosition> = new Set([
  "open_e", "closed_e", "open_o", "closed_o",
  "sibilant_s", "sibilant_sh", "labiodental_v",
]);

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPt(a: [number, number], b: [number, number], t: number): [number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function settleOvershoot(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const overshoot = 1 + 0.08 * Math.sin(t * Math.PI * 3) * (1 - t);
  return easeInOut(t) * overshoot;
}

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

function buildTongueMusclePath(tc: TongueCtrl): string {
  const midX = (tc.front[0] + tc.dorsum[0]) / 2;
  const midY = (tc.front[1] + tc.dorsum[1]) / 2 + 4;
  return [
    `M ${tc.tip[0] + 8} ${tc.tip[1] + 4}`,
    `Q ${tc.front[0]} ${tc.front[1] + 6}, ${midX} ${midY}`,
    `Q ${tc.dorsum[0]} ${tc.dorsum[1] + 6}, ${tc.back[0] - 6} ${tc.back[1] + 2}`,
  ].join(" ");
}

const CYCLE_MS = 5200;

interface AnimatedMouthDiagramProps {
  position: MouthPosition;
  size?: number;
  showLabel?: boolean;
  autoPlay?: boolean;
}

export function AnimatedMouthDiagram({
  position,
  size = 200,
  showLabel = true,
  autoPlay = true,
}: AnimatedMouthDiagramProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [glowPulse, setGlowPulse] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const p = POS[position];

  useEffect(() => {
    if (!autoPlay) {
      setProgress(0);
      setGlowPulse(0);
      return;
    }
    startRef.current = Date.now();

    function tick() {
      const elapsed = (Date.now() - startRef.current) % CYCLE_MS;
      let prog: number;
      if (elapsed < 800) prog = settleOvershoot(elapsed / 800);
      else if (elapsed < 2600) prog = 1;
      else if (elapsed < 3400) prog = 1 - easeInOut((elapsed - 2600) / 800);
      else prog = 0;

      const glow = prog > 0.5 ? 0.4 + 0.6 * Math.sin((elapsed / 400) * Math.PI) : 0;

      setProgress(prog);
      setGlowPulse(Math.max(0, glow));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [position, autoPlay]);

  const tc: TongueCtrl = {
    tip: lerpPt(REST.tongue.tip, p.tongue.tip, progress),
    blade: lerpPt(REST.tongue.blade, p.tongue.blade, progress),
    front: lerpPt(REST.tongue.front, p.tongue.front, progress),
    dorsum: lerpPt(REST.tongue.dorsum, p.tongue.dorsum, progress),
    back: lerpPt(REST.tongue.back, p.tongue.back, progress),
  };
  const jawDrop = lerp(0, p.jawDrop, progress);
  const velumDrop = lerp(0, p.velumDrop, progress);
  const lipOpen = lerp(REST.lipOpen, p.lipOpen, progress);
  const lipRound = lerp(0, p.lipRound, progress);
  const nasalAirflow = p.velumDrop > 0 ? progress * 0.85 : 0;
  const oralAirflow = ORAL_AIRFLOW.has(position) ? progress * 0.6 : 0;

  const tonguePath = buildTonguePath(tc, jawDrop);
  const tongueMusclePath = buildTongueMusclePath(tc);

  const upperLipY = 76;
  const lowerLipY = 76 + lipOpen;
  const lipProtrude = lipRound * 6;

  const velumEndY = 58 + velumDrop;
  const uvulaY = velumEndY + 10;

  const jawFloorY = 158 + jawDrop;

  const upperTeethBottom = 78;
  const lowerTeethTop = 134 + jawDrop;

  const contact = CONTACT_POINTS[position];

  return (
    <View style={[styles.container, { width: size, height: size + (showLabel ? 30 : 0) }]}>
      <View style={[styles.svgWrap, { borderRadius: 16 }]}>
        <Svg width={size} height={size} viewBox="0 0 210 195">
          <Defs>
            <LinearGradient id="tongueGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.tongueLight} />
              <Stop offset="0.6" stopColor={C.tongue} />
              <Stop offset="1" stopColor={C.tongueDark} />
            </LinearGradient>
            <LinearGradient id="palateGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.palate} />
              <Stop offset="1" stopColor={C.palateInner} />
            </LinearGradient>
            <LinearGradient id="velumGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.palate} />
              <Stop offset="1" stopColor={C.tissue} />
            </LinearGradient>
            <RadialGradient id="contactGlow" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor={C.contactGlow} stopOpacity="0.9" />
              <Stop offset="0.6" stopColor={C.contact} stopOpacity="0.4" />
              <Stop offset="1" stopColor={C.contact} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Background */}
          <Rect x="0" y="0" width="210" height="195" rx="12" fill={C.bg} />

          {/* Nasal cavity */}
          <Path
            d="M 30 20 Q 50 18, 80 22 Q 120 18, 145 28 L 145 45 Q 120 36, 80 40 Q 50 38, 30 42 Z"
            fill={C.nasal}
          />
          {/* Nasal septum hint */}
          <Path
            d="M 88 22 L 88 40"
            fill="none"
            stroke={C.palateStroke}
            strokeWidth={0.8}
            opacity={0.4}
          />

          {/* Pharynx wall */}
          <Path
            d={`M 170 48 Q 174 50, 176 55 L 176 ${jawFloorY + 10} Q 174 ${jawFloorY + 14}, 170 ${jawFloorY + 16}`}
            fill="none"
            stroke={C.tissueStroke}
            strokeWidth={3}
          />
          {/* Pharynx tissue fill */}
          <Path
            d={`M 170 48 Q 174 50, 176 55 L 176 ${jawFloorY + 10} Q 174 ${jawFloorY + 14}, 170 ${jawFloorY + 16} L 168 ${jawFloorY + 14} L 168 50 Z`}
            fill={C.tissue}
            opacity={0.3}
          />

          {/* Hard palate - thick tissue fill (matching reference) */}
          <Path
            d={`M 42 74 Q 42 68, 46 62 Q 60 42, 95 36 Q 130 32, 148 42 L 146 48 Q 128 38, 95 42 Q 62 48, 44 70 Z`}
            fill="url(#palateGrad)"
            stroke={C.palateStroke}
            strokeWidth={1}
          />
          {/* Palate rugae (ridges on hard palate) */}
          <G opacity={0.25}>
            <Path d="M 54 64 Q 66 60, 78 62" fill="none" stroke={C.palateStroke} strokeWidth={0.8} />
            <Path d="M 60 58 Q 74 54, 88 56" fill="none" stroke={C.palateStroke} strokeWidth={0.8} />
            <Path d="M 68 52 Q 84 48, 100 50" fill="none" stroke={C.palateStroke} strokeWidth={0.8} />
          </G>

          {/* Alveolar ridge - the bump between teeth and hard palate */}
          <Path
            d={`M 42 74 Q 40 70, 42 66 Q 44 62, 46 62`}
            fill={C.alveolarRidge}
            stroke={C.palateStroke}
            strokeWidth={1.2}
          />
          {/* Alveolar ridge highlight */}
          <Path
            d="M 42 72 Q 41 68, 43 64"
            fill="none"
            stroke={C.tissueLight}
            strokeWidth={0.8}
            opacity={0.5}
          />

          {/* Soft palate / velum - filled tissue */}
          <Path
            d={`M 148 42 Q 155 ${44 + velumDrop * 0.3}, 160 ${48 + velumDrop * 0.6} Q 166 ${52 + velumDrop}, 164 ${velumEndY} L 160 ${velumEndY - 2} Q 162 ${50 + velumDrop * 0.8}, 156 ${46 + velumDrop * 0.4} Q 150 ${42 + velumDrop * 0.2}, 146 42 Z`}
            fill="url(#velumGrad)"
            stroke={C.palateStroke}
            strokeWidth={1}
          />
          {/* Velum muscle line */}
          <Path
            d={`M 148 44 Q 156 ${46 + velumDrop * 0.3}, 162 ${52 + velumDrop * 0.7}`}
            fill="none"
            stroke={C.palateStroke}
            strokeWidth={0.6}
            opacity={0.4}
          />

          {/* Uvula */}
          <Path
            d={`M 164 ${velumEndY} Q 167 ${velumEndY + 4}, 165 ${uvulaY} Q 163 ${uvulaY + 4}, 160 ${uvulaY} Q 161 ${uvulaY - 2}, 160 ${velumEndY - 2}`}
            fill={C.uvula}
            stroke={C.palateStroke}
            strokeWidth={1}
          />

          {/* Epiglottis */}
          <Path
            d={`M ${tc.back[0] + 14} ${jawFloorY - 6} Q ${tc.back[0] + 18} ${jawFloorY - 14}, ${tc.back[0] + 16} ${jawFloorY - 22} Q ${tc.back[0] + 14} ${jawFloorY - 26}, ${tc.back[0] + 10} ${jawFloorY - 22}`}
            fill={C.epiglottis}
            stroke={C.palateStroke}
            strokeWidth={1}
            opacity={0.7}
          />

          {/* Lower jaw / mandible */}
          <Path
            d={`M 36 ${134 + jawDrop} Q 38 ${142 + jawDrop}, 44 ${148 + jawDrop} Q 80 ${jawFloorY + 8}, 130 ${jawFloorY + 6} Q 158 ${jawFloorY + 4}, 170 ${jawFloorY}`}
            fill="none"
            stroke={C.skinStroke}
            strokeWidth={2.5}
          />

          {/* Floor of mouth tissue */}
          <Path
            d={`M 44 ${148 + jawDrop} Q 80 ${jawFloorY + 4}, 130 ${jawFloorY + 2} Q 155 ${jawFloorY}, 170 ${jawFloorY - 2} L 170 ${jawFloorY + 6} Q 155 ${jawFloorY + 8}, 130 ${jawFloorY + 8} Q 80 ${jawFloorY + 10}, 44 ${150 + jawDrop} Z`}
            fill={C.tissue}
            opacity={0.4}
          />

          {/* Tongue body */}
          <Path
            d={tonguePath}
            fill="url(#tongueGrad)"
            stroke={C.tongueStroke}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Tongue surface highlight */}
          <Path
            d={`M ${tc.tip[0] + 6} ${tc.tip[1] + 1} Q ${tc.front[0]} ${tc.front[1] + 1}, ${tc.dorsum[0]} ${tc.dorsum[1] + 1}`}
            fill="none"
            stroke={C.tongueLight}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.45}
          />
          {/* Tongue intrinsic muscle line */}
          <Path
            d={tongueMusclePath}
            fill="none"
            stroke={C.tongueDark}
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Upper teeth */}
          <G>
            <Path
              d={`M 38 ${upperTeethBottom - 14} L 38 ${upperTeethBottom} L 44 ${upperTeethBottom + 2} L 44 ${upperTeethBottom - 12} Z`}
              fill={C.teeth}
              stroke={C.teethStroke}
              strokeWidth={0.8}
            />
            {/* Tooth root hint */}
            <Path
              d={`M 40 ${upperTeethBottom - 14} L 40 ${upperTeethBottom - 18}`}
              stroke={C.teethStroke}
              strokeWidth={0.5}
              opacity={0.4}
            />
          </G>

          {/* Lower teeth */}
          <G>
            <Path
              d={`M 38 ${lowerTeethTop} L 38 ${lowerTeethTop + 12} L 44 ${lowerTeethTop + 10} L 44 ${lowerTeethTop} Z`}
              fill={C.teeth}
              stroke={C.teethStroke}
              strokeWidth={0.8}
            />
          </G>

          {/* Nose profile */}
          <Path
            d="M 28 22 Q 22 30, 18 40 L 12 50 Q 8 55, 10 58 L 16 60 Q 20 62, 22 58 L 24 54 Q 26 48, 28 42"
            fill={C.skin}
            stroke={C.skinStroke}
            strokeWidth={1.5}
          />
          {/* Nostril hint */}
          <Path
            d="M 14 56 Q 16 58, 18 56"
            fill="none"
            stroke={C.skinStroke}
            strokeWidth={0.8}
            opacity={0.5}
          />

          {/* Upper lip */}
          <Path
            d={`M 22 66 Q 18 70, ${16 - lipProtrude} ${upperLipY - 2} Q ${12 - lipProtrude} ${upperLipY}, ${14 - lipProtrude} ${upperLipY + 2} L 36 ${upperLipY + 1}`}
            fill={C.lip}
            stroke={C.lipLight}
            strokeWidth={0.8}
          />
          {/* Lip vermillion border */}
          <Path
            d={`M ${16 - lipProtrude} ${upperLipY - 2} Q ${14 - lipProtrude} ${upperLipY}, ${14 - lipProtrude} ${upperLipY + 2}`}
            fill="none"
            stroke={C.lipLight}
            strokeWidth={1.2}
            opacity={0.6}
          />

          {/* Lower lip */}
          <Path
            d={`M 36 ${lowerLipY} L ${14 - lipProtrude} ${lowerLipY - 1} Q ${10 - lipProtrude} ${lowerLipY + 1}, ${14 - lipProtrude} ${lowerLipY + 4} Q ${18 - lipProtrude * 0.5} ${lowerLipY + 8 + jawDrop * 0.3}, 26 ${lowerLipY + 12 + jawDrop * 0.4}`}
            fill={C.lip}
            stroke={C.lipLight}
            strokeWidth={0.8}
          />

          {/* Chin */}
          <Path
            d={`M 26 ${lowerLipY + 12 + jawDrop * 0.4} Q 30 ${100 + jawDrop * 0.5}, 34 ${110 + jawDrop * 0.5} Q 38 ${120 + jawDrop * 0.6}, 36 ${134 + jawDrop}`}
            fill="none"
            stroke={C.skinStroke}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Nose bridge */}
          <Path
            d="M 28 22 Q 32 16, 40 12"
            fill="none"
            stroke={C.skinStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* Philtrum */}
          <Path
            d="M 22 58 Q 22 62, 22 66"
            fill="none"
            stroke={C.skinStroke}
            strokeWidth={1.5}
          />

          {/* Contact point glow */}
          {contact && glowPulse > 0 && (
            <G opacity={glowPulse}>
              <Circle
                cx={contact.x}
                cy={contact.y}
                r={10}
                fill="url(#contactGlow)"
              />
              <Circle
                cx={contact.x}
                cy={contact.y}
                r={3}
                fill={C.contactGlow}
                opacity={0.9}
              />
            </G>
          )}

          {/* Nasal airflow arrows */}
          {nasalAirflow > 0 && (
            <G opacity={nasalAirflow}>
              <Path
                d="M 100 34 Q 96 26, 90 18"
                fill="none"
                stroke={C.airflow}
                strokeWidth={2}
                strokeDasharray="4,3"
              />
              <Path
                d="M 115 32 Q 112 24, 108 16"
                fill="none"
                stroke={C.airflow}
                strokeWidth={2}
                strokeDasharray="4,3"
              />
              <Path
                d="M 90 18 L 87 24 M 90 18 L 94 23"
                stroke={C.airflow}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Path
                d="M 108 16 L 105 22 M 108 16 L 112 21"
                stroke={C.airflow}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </G>
          )}

          {/* Oral airflow arrows */}
          {oralAirflow > 0 && (
            <G opacity={oralAirflow}>
              <Path
                d={`M 36 ${(upperLipY + lowerLipY) / 2} Q 26 ${(upperLipY + lowerLipY) / 2 - 2}, 14 ${(upperLipY + lowerLipY) / 2 - 4}`}
                fill="none"
                stroke={C.airflowOral}
                strokeWidth={1.8}
                strokeDasharray="3,3"
              />
              <Path
                d={`M 36 ${(upperLipY + lowerLipY) / 2 + 2} Q 26 ${(upperLipY + lowerLipY) / 2 + 1}, 16 ${(upperLipY + lowerLipY) / 2 - 1}`}
                fill="none"
                stroke={C.airflowOral}
                strokeWidth={1.5}
                strokeDasharray="3,3"
              />
              {/* Arrow tip */}
              <Path
                d={`M 14 ${(upperLipY + lowerLipY) / 2 - 4} L 18 ${(upperLipY + lowerLipY) / 2 - 8} M 14 ${(upperLipY + lowerLipY) / 2 - 4} L 19 ${(upperLipY + lowerLipY) / 2 - 1}`}
                stroke={C.airflowOral}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            </G>
          )}

        </Svg>
      </View>

      {showLabel && (
        <Text style={styles.label}>
          {t(`mouth.${position}` as any)}
        </Text>
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
    overflow: "hidden",
  },
  label: {
    marginTop: spacing.xs,
    fontWeight: "600",
    fontSize: typography.sizes.sm,
    color: "#94A3B8",
    textAlign: "center",
  },
});
