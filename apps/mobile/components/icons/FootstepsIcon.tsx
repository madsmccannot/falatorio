import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function FootstepsIcon({ size = 24, color }: Props) {
  const c = color ?? "#059669";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 3c-.5 0-1.5.5-2 2s-.5 3 0 4 1.5 1 2 1 1.5-.5 2-1 .5-3 0-4S8.5 3 8 3zM6 12c-.3 0-1 .3-1.2 1.2s0 2 .5 2.5.8.3 1.2.3.7-.5 1-.8 0-1.5-.2-2.2S6.3 12 6 12z"
        fill={c}
      />
      <Path
        d="M16 7c.5 0 1.5.5 2 2s.5 3 0 4-1.5 1-2 1-1.5-.5-2-1-.5-3 0-4S15.5 7 16 7zM18 16c.3 0 1 .3 1.2 1.2s0 2-.5 2.5-.8.3-1.2.3-.7-.5-1-.8 0-1.5.2-2.2S17.7 16 18 16z"
        fill={c}
        opacity={0.7}
      />
    </Svg>
  );
}
