import { useColorScheme, Appearance } from "react-native";
import { colors } from "@falatorio/ui/tokens";
import { getString, setString, KEYS } from "./storage";

export type ThemePref = "system" | "light" | "dark";

const light = {
  bg: "#F8FAFC",
  bgElevated: "#FFFFFF",
  bgCard: "#FFFFFF",
  bgAccent: "#ECFEFF",
  bgInput: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",
  border: "#E2E8F0",
  borderAccent: colors.primary[200],
  tabBar: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  tabActive: colors.primary[600],
  tabInactive: "#94A3B8",
  headerBg: "#FFFFFF",
  statCard: "#FFFFFF",
  dueCard: "#ECFEFF",
  dueBorder: colors.primary[200],
  superBanner: "#0F172A",
  superBannerText: "#FFFFFF",
  settingsBg: "#F1F5F9",
  settingsCard: "#FFFFFF",
  settingsBorder: "#E2E8F0",
  settingsHeader: "#64748B",
  switchTrack: "#CBD5E1",
  switchTrackActive: colors.primary[500],
  optionBg: "#FFFFFF",
  optionBorder: "#E2E8F0",
  optionSelectedBg: colors.primary[50],
  optionSelectedBorder: colors.primary[600],
  optionSelectedText: colors.primary[700],
  footerBorder: "#E2E8F0",
} as const;

const dark = {
  bg: "#0C1524",
  bgElevated: "#131F36",
  bgCard: "#172032",
  bgAccent: "#0C2933",
  bgInput: "#172032",
  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#0C1524",
  border: "#1E2D45",
  borderAccent: colors.primary[800],
  tabBar: "#0F1926",
  tabBarBorder: "#1E2D45",
  tabActive: colors.primary[400],
  tabInactive: "#475569",
  headerBg: "#131F36",
  statCard: "#172032",
  dueCard: "#0C2933",
  dueBorder: colors.primary[800],
  superBanner: "#1E2D45",
  superBannerText: "#E2E8F0",
  settingsBg: "#0C1524",
  settingsCard: "#172032",
  settingsBorder: "#1E2D45",
  settingsHeader: "#64748B",
  switchTrack: "#1E2D45",
  switchTrackActive: colors.primary[600],
  optionBg: "#172032",
  optionBorder: "#1E2D45",
  optionSelectedBg: "#0C2933",
  optionSelectedBorder: colors.primary[400],
  optionSelectedText: colors.primary[300],
  footerBorder: "#1E2D45",
} as const;

export type Theme = { [K in keyof typeof light]: string };

export function getThemePref(): ThemePref {
  const v = getString(KEYS.THEME_PREF);
  if (v === "light" || v === "dark") return v;
  return "system";
}

export function setThemePref(pref: ThemePref): void {
  setString(KEYS.THEME_PREF, pref);
  applyThemePref();
}

export function applyThemePref(): void {
  const pref = getThemePref();
  Appearance.setColorScheme(pref === "system" ? "unspecified" : pref);
}

export function useTheme(): Theme & { isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return { ...(isDark ? dark : light), isDark };
}
