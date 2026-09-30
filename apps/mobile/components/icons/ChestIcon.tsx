import Svg, { Rect, Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function ChestIcon({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="chest_body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#B8860B" />
          <Stop offset="100%" stopColor="#8B6914" />
        </LinearGradient>
        <LinearGradient id="chest_lid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#DAA520" />
          <Stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="12" width="18" height="9" rx="1" fill="url(#chest_body)" />
      <Path d="M2 12 C2 9 5 7 12 7 C19 7 22 9 22 12 L22 12 L2 12Z" fill="url(#chest_lid)" />
      <Rect x="10" y="10" width="4" height="4" rx="1" fill="#FFD700" />
      <Rect x="11" y="11" width="2" height="2" rx="0.5" fill="#FFEC99" />
    </Svg>
  );
}
