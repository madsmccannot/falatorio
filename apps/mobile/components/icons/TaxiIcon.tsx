import Svg, { Path, Rect, Circle } from "react-native-svg";

type Props = { size?: number; color?: string };

export function TaxiIcon({ size = 24, color }: Props) {
  const c = color ?? "#F59E0B";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={4} width={6} height={3} rx={1} fill={c} />
      <Path d="M3 11l2-4h14l2 4v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" fill={c} />
      <Path d="M5 7h14l2 4H3l2-4z" fill={c} opacity={0.7} />
      <Circle cx={7} cy={14} r={1.5} fill="#1C1917" />
      <Circle cx={17} cy={14} r={1.5} fill="#1C1917" />
    </Svg>
  );
}
