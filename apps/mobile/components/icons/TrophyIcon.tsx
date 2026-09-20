import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = { size?: number; color?: string };

export function TrophyIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="trophyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFD700"} />
          <Stop offset="100%" stopColor={color ?? "#B8860B"} />
        </LinearGradient>
      </Defs>
      <Path
        d="M7 4h10v2a5 5 0 01-10 0V4zM5 4H3a1 1 0 00-1 1v1a3 3 0 003 3h.29A6.97 6.97 0 007 4H5zM19 4h2a1 1 0 011 1v1a3 3 0 01-3 3h-.29A6.97 6.97 0 0017 4h2zM12 13v3M9 20h6M10 16h4"
        stroke="url(#trophyGrad)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 4h10v3a5 5 0 01-10 0V4z" fill="url(#trophyGrad)" opacity={0.3} />
    </Svg>
  );
}
