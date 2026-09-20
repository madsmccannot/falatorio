import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function BoltIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="boltGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FBBF24"} />
          <Stop offset="100%" stopColor={color ?? "#F59E0B"} />
        </LinearGradient>
      </Defs>
      <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="url(#boltGrad)" />
    </Svg>
  );
}
