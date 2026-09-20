import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function ChatIcon({ size = 24, color }: Props) {
  const c = color ?? "#6366F1";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a9 9 0 01-9 9 9.07 9.07 0 01-4.25-1.06L3 21l1.06-4.75A9 9 0 1121 12z"
        fill={c}
        opacity={0.2}
      />
      <Path
        d="M21 12a9 9 0 01-9 9 9.07 9.07 0 01-4.25-1.06L3 21l1.06-4.75A9 9 0 1121 12z"
        stroke={c}
        strokeWidth={2}
      />
      <Path d="M8 10h8M8 14h5" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
