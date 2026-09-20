import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function FlameIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="flameGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FBBF24"} />
          <Stop offset="60%" stopColor={color ?? "#F97316"} />
          <Stop offset="100%" stopColor={color ?? "#DC2626"} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2c0 4-4 6-4 10a6 6 0 0012 0c0-4-4-6-4-10-1 2-3 3-4 0z"
        fill="url(#flameGrad)"
      />
      <Path
        d="M12 22a3 3 0 003-3c0-2-3-4-3-4s-3 2-3 4a3 3 0 003 3z"
        fill={color ?? "#FBBF24"}
        opacity={0.8}
      />
    </Svg>
  );
}
