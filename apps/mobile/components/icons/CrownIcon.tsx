import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function CrownIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="crownGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFEC80"} />
          <Stop offset="50%" stopColor={color ?? "#FFD700"} />
          <Stop offset="100%" stopColor={color ?? "#B8860B"} />
        </LinearGradient>
      </Defs>
      <Path
        d="M3 18h18v2H3v-2zM3 18l2-12 4 5 3-7 3 7 4-5 2 12H3z"
        fill="url(#crownGrad)"
      />
    </Svg>
  );
}
