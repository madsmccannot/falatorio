import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function VolcanoIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="volcGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#78716C"} />
          <Stop offset="100%" stopColor={color ?? "#44403C"} />
        </LinearGradient>
      </Defs>
      <Path d="M2 22l6-12h8l6 12H2z" fill="url(#volcGrad)" />
      <Path d="M8 10l2-4h4l2 4H8z" fill="#DC2626" opacity={0.8} />
      <Path d="M10 6l1-3h2l1 3" fill="#F97316" opacity={0.9} />
      <Path d="M11 3l.5-1.5h1L13 3" fill="#FBBF24" />
    </Svg>
  );
}
