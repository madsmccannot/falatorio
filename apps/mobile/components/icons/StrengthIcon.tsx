import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function StrengthIcon({ size = 24, color }: Props) {
  const c = color ?? "#F97316";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 11h2v6H5a1 1 0 01-1-1v-4a1 1 0 011-1zM17 11h2a1 1 0 011 1v4a1 1 0 01-1 1h-2v-6z"
        fill={c}
      />
      <Path
        d="M7 8h3a2 2 0 012 2v6a2 2 0 01-2 2H7V8zM17 8h-3a2 2 0 00-2 2v6a2 2 0 002 2h3V8z"
        fill={c}
        opacity={0.6}
      />
      <Path d="M10 12h4" stroke={c} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
