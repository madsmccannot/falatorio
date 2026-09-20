import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function ShieldIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="shieldGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#60A5FA"} />
          <Stop offset="100%" stopColor={color ?? "#2563EB"} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.25C16.6 21.15 20 16.25 20 11V6l-8-4z"
        fill="url(#shieldGrad)"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
