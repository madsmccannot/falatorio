import Svg, { Rect, Path, Defs, LinearGradient, Stop, Circle, Ellipse, G } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function ChestIcon({ size = 64 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 58" fill="none">
      <Defs>
        <LinearGradient id="ch_wood" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C4884A" />
          <Stop offset="100%" stopColor="#9A6530" />
        </LinearGradient>
        <LinearGradient id="ch_wood_dark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#A06B35" />
          <Stop offset="100%" stopColor="#7A4E22" />
        </LinearGradient>
        <LinearGradient id="ch_lid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D9A05B" />
          <Stop offset="60%" stopColor="#C4884A" />
          <Stop offset="100%" stopColor="#A06B35" />
        </LinearGradient>
        <LinearGradient id="ch_band" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F2D49B" />
          <Stop offset="100%" stopColor="#D4AA60" />
        </LinearGradient>
        <LinearGradient id="ch_clasp" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FAE6B0" />
          <Stop offset="100%" stopColor="#D4AA60" />
        </LinearGradient>
      </Defs>

      {/* Ground shadow */}
      <Ellipse cx="32" cy="55" rx="22" ry="3" fill="rgba(0,0,0,0.12)" />

      {/* Body */}
      <Rect x="8" y="28" width="48" height="24" rx="3" fill="url(#ch_wood)" />
      {/* Bottom edge shadow */}
      <Rect x="8" y="48" width="48" height="4" rx="2" fill="url(#ch_wood_dark)" />

      {/* Body wood planks */}
      <Rect x="8" y="33" width="48" height="2" fill="#B07A3E" opacity="0.4" />
      <Rect x="8" y="40" width="48" height="2" fill="#B07A3E" opacity="0.3" />
      <Rect x="8" y="46" width="48" height="1.5" fill="#B07A3E" opacity="0.25" />

      {/* Body horizontal bands */}
      <Rect x="6" y="28" width="52" height="4" rx="2" fill="url(#ch_band)" />
      <Rect x="6" y="48" width="52" height="3.5" rx="1.5" fill="url(#ch_band)" />

      {/* Lid - dome shape */}
      <Path d="M6 28 C6 18 14 10 32 10 C50 10 58 18 58 28 L58 28 L6 28Z" fill="url(#ch_lid)" />
      {/* Lid highlight */}
      <Path d="M10 26 C10 18 17 12 32 12 C47 12 54 18 54 26" fill="rgba(255,255,255,0.1)" stroke="none" />

      {/* Lid horizontal band */}
      <Rect x="5" y="26" width="54" height="4" rx="2" fill="url(#ch_band)" />

      {/* Vertical bands - left */}
      <G opacity="0.7">
        <Rect x="17" y="12" width="4" height="40" rx="1.5" fill="url(#ch_band)" />
        <Rect x="43" y="12" width="4" height="40" rx="1.5" fill="url(#ch_band)" />
      </G>

      {/* Center clasp plate */}
      <Circle cx="32" cy="28" r="7" fill="url(#ch_clasp)" />
      <Circle cx="32" cy="28" r="5" fill="url(#ch_band)" />
      {/* Keyhole */}
      <Circle cx="32" cy="27" r="2" fill="#A06B35" />
      <Rect x="31" y="27" width="2" height="3.5" rx="0.5" fill="#A06B35" />

      {/* Lid top highlight */}
      <Path d="M14 24 C14 17 20 13 32 13 C44 13 50 17 50 24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    </Svg>
  );
}
