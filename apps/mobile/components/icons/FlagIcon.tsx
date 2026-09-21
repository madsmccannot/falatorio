import Svg, { Path, Rect, Circle, G, ClipPath, Defs } from "react-native-svg";

type Props = {
  code: string;
  size?: number;
};

export function FlagIcon({ code, size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="rounded">
          <Rect x="0" y="0" width="48" height="48" rx="6" ry="6" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#rounded)">{renderFlag(code)}</G>
    </Svg>
  );
}

function renderFlag(code: string) {
  switch (code) {
    case "GB":
      return <FlagGB />;
    case "ES":
      return <FlagES />;
    case "FR":
      return <FlagFR />;
    case "IN":
      return <FlagIN />;
    case "PK":
      return <FlagPK />;
    case "SA":
      return <FlagSA />;
    case "BD":
      return <FlagBD />;
    case "DE":
      return <FlagDE />;
    case "CN":
      return <FlagCN />;
    case "RU":
      return <FlagRU />;
    case "UA":
      return <FlagUA />;
    case "TR":
      return <FlagTR />;
    case "PL":
      return <FlagPL />;
    case "KR":
      return <FlagKR />;
    case "JP":
      return <FlagJP />;
    default:
      return <Rect x="0" y="0" width="48" height="48" fill="#94A3B8" />;
  }
}

function FlagGB() {
  return (
    <G>
      <Rect width="48" height="48" fill="#012169" />
      <Path d="M0 0L48 48M48 0L0 48" stroke="#FFFFFF" strokeWidth="8" />
      <Path d="M0 0L48 48M48 0L0 48" stroke="#C8102E" strokeWidth="4" />
      <Path d="M24 0V48M0 24H48" stroke="#FFFFFF" strokeWidth="12" />
      <Path d="M24 0V48M0 24H48" stroke="#C8102E" strokeWidth="6" />
    </G>
  );
}

function FlagES() {
  return (
    <G>
      <Rect width="48" height="12" fill="#AA151B" />
      <Rect y="12" width="48" height="24" fill="#F1BF00" />
      <Rect y="36" width="48" height="12" fill="#AA151B" />
    </G>
  );
}

function FlagFR() {
  return (
    <G>
      <Rect width="16" height="48" fill="#002395" />
      <Rect x="16" width="16" height="48" fill="#FFFFFF" />
      <Rect x="32" width="16" height="48" fill="#ED2939" />
    </G>
  );
}

function FlagIN() {
  return (
    <G>
      <Rect width="48" height="16" fill="#FF9933" />
      <Rect y="16" width="48" height="16" fill="#FFFFFF" />
      <Rect y="32" width="48" height="16" fill="#138808" />
      <Circle cx="24" cy="24" r="4.5" fill="none" stroke="#000080" strokeWidth="1" />
    </G>
  );
}

function FlagPK() {
  return (
    <G>
      <Rect width="48" height="48" fill="#01411C" />
      <Rect width="12" height="48" fill="#FFFFFF" />
      <Circle cx="30" cy="24" r="8" fill="#FFFFFF" />
      <Circle cx="32" cy="24" r="6.5" fill="#01411C" />
      <Path d="M33 17L34.5 21.5L31 19H36L32.5 21.5Z" fill="#FFFFFF" />
    </G>
  );
}

function FlagSA() {
  return (
    <G>
      <Rect width="48" height="48" fill="#006C35" />
      <Rect x="10" y="16" width="28" height="2" rx="1" fill="#FFFFFF" />
      <Rect x="14" y="20" width="20" height="1.5" rx="0.75" fill="#FFFFFF" />
      <Path d="M24 30L22 34H26Z" fill="#FFFFFF" />
      <Rect x="23" y="25" width="2" height="5" rx="1" fill="#FFFFFF" />
    </G>
  );
}

function FlagBD() {
  return (
    <G>
      <Rect width="48" height="48" fill="#006A4E" />
      <Circle cx="22" cy="24" r="11" fill="#F42A41" />
    </G>
  );
}

function FlagDE() {
  return (
    <G>
      <Rect width="48" height="16" fill="#000000" />
      <Rect y="16" width="48" height="16" fill="#DD0000" />
      <Rect y="32" width="48" height="16" fill="#FFCE00" />
    </G>
  );
}

function FlagCN() {
  return (
    <G>
      <Rect width="48" height="48" fill="#DE2910" />
      <Path d="M12 8L13.8 13.5L9 10.2H15L10.2 13.5Z" fill="#FFDE00" />
      <Path d="M20 5L20.6 7L19 5.8H21L19.4 7Z" fill="#FFDE00" />
      <Path d="M23 8L23.6 10L22 8.8H24L22.4 10Z" fill="#FFDE00" />
      <Path d="M23 13L23.6 15L22 13.8H24L22.4 15Z" fill="#FFDE00" />
      <Path d="M20 16L20.6 18L19 16.8H21L19.4 18Z" fill="#FFDE00" />
    </G>
  );
}

function FlagRU() {
  return (
    <G>
      <Rect width="48" height="16" fill="#FFFFFF" />
      <Rect y="16" width="48" height="16" fill="#0039A6" />
      <Rect y="32" width="48" height="16" fill="#D52B1E" />
    </G>
  );
}

function FlagUA() {
  return (
    <G>
      <Rect width="48" height="24" fill="#005BBB" />
      <Rect y="24" width="48" height="24" fill="#FFD500" />
    </G>
  );
}

function FlagTR() {
  return (
    <G>
      <Rect width="48" height="48" fill="#E30A17" />
      <Circle cx="19" cy="24" r="9" fill="#FFFFFF" />
      <Circle cx="21.5" cy="24" r="7" fill="#E30A17" />
      <Path d="M28 18L29.5 22.5L26 20H31L27.5 22.5Z" fill="#FFFFFF" />
    </G>
  );
}

function FlagPL() {
  return (
    <G>
      <Rect width="48" height="24" fill="#FFFFFF" />
      <Rect y="24" width="48" height="24" fill="#DC143C" />
    </G>
  );
}

function FlagKR() {
  return (
    <G>
      <Rect width="48" height="48" fill="#FFFFFF" />
      <Circle cx="24" cy="24" r="10" fill="#CD2E3A" />
      <Path d="M24 14A10 10 0 0 1 24 34A5 5 0 0 0 24 24A5 5 0 0 1 24 14Z" fill="#0047A0" />
    </G>
  );
}

function FlagJP() {
  return (
    <G>
      <Rect width="48" height="48" fill="#FFFFFF" />
      <Circle cx="24" cy="24" r="11" fill="#BC002D" />
    </G>
  );
}
