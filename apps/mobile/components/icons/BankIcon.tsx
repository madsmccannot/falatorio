import Svg, { Path, Rect, Line } from "react-native-svg";

type Props = { size?: number; color?: string };

export function BankIcon({ size = 24, color }: Props) {
  const c = color ?? "#78716C";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10l9-7 9 7H3z" fill={c} />
      <Rect x={3} y={19} width={18} height={2} rx={0.5} fill={c} />
      <Line x1={6} y1={10} x2={6} y2={19} stroke={c} strokeWidth={2} />
      <Line x1={10} y1={10} x2={10} y2={19} stroke={c} strokeWidth={2} />
      <Line x1={14} y1={10} x2={14} y2={19} stroke={c} strokeWidth={2} />
      <Line x1={18} y1={10} x2={18} y2={19} stroke={c} strokeWidth={2} />
    </Svg>
  );
}
