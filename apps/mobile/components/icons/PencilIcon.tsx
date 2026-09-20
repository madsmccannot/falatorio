import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function PencilIcon({ size = 24, color }: Props) {
  const c = color ?? "#059669";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z"
        fill={c}
        opacity={0.2}
      />
      <Path
        d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z"
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M13 7l4 4" stroke={c} strokeWidth={2} />
    </Svg>
  );
}
