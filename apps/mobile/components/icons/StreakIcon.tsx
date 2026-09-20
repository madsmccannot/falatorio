import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "@falatorio/ui/tokens";

type Props = {
  size?: number;
  color?: string;
};

export function StreakIcon({ size = 24, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="streakGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color ?? "#FBBF24"} />
          <Stop offset="100%" stopColor={color ?? colors.streak} />
        </LinearGradient>
      </Defs>
      <Path
        d="M13 2L4.09 12.11C3.68 12.59 3.92 13.34 4.53 13.47L10 14.76L8.29 21.24C8.05 22.08 9.1 22.68 9.7 22.06L19.91 11.89C20.32 11.41 20.08 10.66 19.47 10.53L14 9.24L15.71 2.76C15.95 1.92 14.9 1.32 14.3 1.94L13 2Z"
        fill="url(#streakGrad)"
      />
    </Svg>
  );
}
