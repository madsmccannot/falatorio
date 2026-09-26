import Svg, { Polygon, Defs, LinearGradient, Stop, Line } from "react-native-svg";

type Props = {
  size?: number;
};

export function GoldPrisms({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="gp_front" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFE066" />
          <Stop offset="40%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
        <LinearGradient id="gp_side" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#DAA520" />
          <Stop offset="50%" stopColor="#B8860B" />
          <Stop offset="100%" stopColor="#8B6914" />
        </LinearGradient>
        <LinearGradient id="gp_topFront" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FFEC99" />
        </LinearGradient>
        <LinearGradient id="gp_topSide" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#B8860B" />
          <Stop offset="100%" stopColor="#DAA520" />
        </LinearGradient>
      </Defs>

      {/* Left prism — smallest */}
      <Polygon points="0.5,22 4,22 4,14 0.5,14" fill="url(#gp_front)" />
      <Polygon points="4,22 6.5,21.5 6.5,13.5 4,14" fill="url(#gp_side)" />
      <Polygon points="0.5,14 4,14 2.5,10.5" fill="url(#gp_topFront)" />
      <Polygon points="4,14 6.5,13.5 2.5,10.5" fill="url(#gp_topSide)" />
      <Line x1="0.5" y1="14" x2="2.5" y2="10.5" stroke="#FFEC99" strokeWidth={0.3} opacity={0.6} />

      {/* Center prism — tallest */}
      <Polygon points="7.5,22 12,22 12,8 7.5,8" fill="url(#gp_front)" />
      <Polygon points="12,22 15.5,21 15.5,7 12,8" fill="url(#gp_side)" />
      <Polygon points="7.5,8 12,8 10,3" fill="url(#gp_topFront)" />
      <Polygon points="12,8 15.5,7 10,3" fill="url(#gp_topSide)" />
      <Line x1="7.5" y1="8" x2="10" y2="3" stroke="#FFEC99" strokeWidth={0.4} opacity={0.7} />
      <Line x1="12" y1="8" x2="10" y2="3" stroke="#DAA520" strokeWidth={0.3} opacity={0.5} />

      {/* Right prism — mid-size */}
      <Polygon points="16.5,22 20,22 20,11.5 16.5,11.5" fill="url(#gp_front)" />
      <Polygon points="20,22 23,21.5 23,11 20,11.5" fill="url(#gp_side)" />
      <Polygon points="16.5,11.5 20,11.5 18.5,7.5" fill="url(#gp_topFront)" />
      <Polygon points="20,11.5 23,11 18.5,7.5" fill="url(#gp_topSide)" />
      <Line x1="16.5" y1="11.5" x2="18.5" y2="7.5" stroke="#FFEC99" strokeWidth={0.3} opacity={0.6} />
    </Svg>
  );
}
