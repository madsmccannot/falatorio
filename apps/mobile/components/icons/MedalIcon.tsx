import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function MedalIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="medalGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFD700"} />
          <Stop offset="100%" stopColor={color ?? "#B8860B"} />
        </LinearGradient>
      </Defs>
      <Path d="M8 2l2 6h-2l-3 4h0L8 2zM16 2l-2 6h2l3 4h0L16 2z" fill="#DC2626" opacity={0.7} />
      <Circle cx={12} cy={15} r={6} fill="url(#medalGrad)" />
      <Circle cx={12} cy={15} r={4} stroke="#FFFFFF" strokeWidth={1} opacity={0.5} />
      <Path d="M12 12v2l1.5 1" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" opacity={0.7} />
    </Svg>
  );
}
