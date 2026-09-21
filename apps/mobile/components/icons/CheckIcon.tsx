import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function CheckIcon({ size = 20, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color ?? "#FFFFFF"}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
