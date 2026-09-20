import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "@falatorio/ui/tokens";

type Props = {
  size?: number;
  color?: string;
};

export function LockIcon({ size = 24, color }: Props) {
  const c = color ?? colors.neutral[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 10V7A5 5 0 007 7v3"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect x={5} y={10} width={14} height={11} rx={2} fill={c} />
    </Svg>
  );
}
