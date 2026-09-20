import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function BookIcon({ size = 24, color }: Props) {
  const c = color ?? "#059669";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4.5A2.5 2.5 0 016.5 2H20v16H6.5A2.5 2.5 0 004 20.5v-16z"
        stroke={c}
        strokeWidth={2}
      />
      <Path d="M6.5 2H20v16H6.5" fill={c} opacity={0.15} />
      <Path d="M4 18a2.5 2.5 0 012.5-2.5H20V22H6.5A2.5 2.5 0 014 19.5V18z" fill={c} opacity={0.3} />
      <Path d="M8 6h8M8 10h5" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
