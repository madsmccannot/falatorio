import Svg, { Circle, Line, Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function TimerIcon({ size = 24, color }: Props) {
  const c = color ?? "#6366F1";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={9} stroke={c} strokeWidth={2} />
      <Path d="M12 9v4l3 2" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={10} y1={2} x2={14} y2={2} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={2} x2={12} y2={4} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
