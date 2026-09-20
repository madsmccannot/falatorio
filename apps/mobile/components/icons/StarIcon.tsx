import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function StarIcon({ size = 20, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color ?? "#FFFFFF"}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </Svg>
  );
}
