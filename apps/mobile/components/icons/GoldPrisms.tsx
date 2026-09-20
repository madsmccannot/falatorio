import Svg, { Polygon, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function GoldPrisms({ size = 24, color }: Props) {
  const h = size;
  const w = size;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="prismGoldL" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFD700"} />
          <Stop offset="50%" stopColor={color ?? "#FFC200"} />
          <Stop offset="100%" stopColor={color ?? "#B8860B"} />
        </LinearGradient>
        <LinearGradient id="prismGoldC" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFEC80"} />
          <Stop offset="40%" stopColor={color ?? "#FFD700"} />
          <Stop offset="100%" stopColor={color ?? "#9B7500"} />
        </LinearGradient>
        <LinearGradient id="prismGoldR" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FFE040"} />
          <Stop offset="50%" stopColor={color ?? "#DAA520"} />
          <Stop offset="100%" stopColor={color ?? "#A07000"} />
        </LinearGradient>
      </Defs>
      {/* Left prism — smallest */}
      <Polygon points="5,20 2,20 3.5,10 5,20" fill="url(#prismGoldL)" />
      <Polygon points="3.5,10 5,20 7,20 5.5,10" fill="url(#prismGoldL)" opacity={0.85} />
      {/* Center prism — tallest */}
      <Polygon points="12,20 9,20 10.5,4 12,20" fill="url(#prismGoldC)" />
      <Polygon points="10.5,4 12,20 15,20 13.5,4" fill="url(#prismGoldC)" opacity={0.8} />
      {/* Right prism — mid-size */}
      <Polygon points="19,20 17,20 18,8 19,20" fill="url(#prismGoldR)" />
      <Polygon points="18,8 19,20 21,20 20,8" fill="url(#prismGoldR)" opacity={0.85} />
    </Svg>
  );
}
