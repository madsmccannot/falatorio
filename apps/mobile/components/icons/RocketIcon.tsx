import Svg, { Path, Circle } from "react-native-svg";

type Props = { size?: number; color?: string };

export function RocketIcon({ size = 24, color }: Props) {
  const c = color ?? "#6366F1";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c-2.5 4-4 8-4 12l2 2h4l2-2c0-4-1.5-8-4-12z"
        fill={c}
      />
      <Circle cx={12} cy={11} r={2} fill="#FFFFFF" />
      <Path d="M8 16l-2 4 3-1 1-3zM16 16l2 4-3-1-1-3z" fill={c} opacity={0.7} />
      <Path d="M10 20h4v2h-4z" fill="#F97316" />
    </Svg>
  );
}
