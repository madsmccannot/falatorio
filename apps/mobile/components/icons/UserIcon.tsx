import Svg, { Path, Circle } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function UserIcon({ size = 24, color = "#94A3B8" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={8}
        r={4}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M20 21a8 8 0 00-16 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
