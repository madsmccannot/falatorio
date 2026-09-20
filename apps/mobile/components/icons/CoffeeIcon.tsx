import Svg, { Path, Rect } from "react-native-svg";

type Props = { size?: number; color?: string };

export function CoffeeIcon({ size = 24, color }: Props) {
  const c = color ?? "#92400E";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={8} width={12} height={12} rx={2} fill={c} opacity={0.8} />
      <Path d="M16 10h2a2 2 0 010 4h-2" stroke={c} strokeWidth={2} />
      <Path d="M4 20h12" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 4c0 1.5 1 2 1 3M12 4c0 1.5 1 2 1 3" stroke={c} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}
