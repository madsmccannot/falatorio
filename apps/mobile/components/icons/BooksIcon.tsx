import Svg, { Rect } from "react-native-svg";

type Props = { size?: number; color?: string };

export function BooksIcon({ size = 24, color }: Props) {
  const c = color ?? "#059669";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={3} width={4} height={18} rx={1} fill={c} opacity={0.9} />
      <Rect x={9} y={5} width={4} height={16} rx={1} fill={c} opacity={0.7} />
      <Rect x={14} y={2} width={4} height={19} rx={1} fill={c} opacity={0.5} />
      <Rect x={5} y={4} width={2} height={1} rx={0.5} fill="#FFFFFF" opacity={0.5} />
      <Rect x={10} y={6} width={2} height={1} rx={0.5} fill="#FFFFFF" opacity={0.5} />
      <Rect x={15} y={3} width={2} height={1} rx={0.5} fill="#FFFFFF" opacity={0.5} />
    </Svg>
  );
}
