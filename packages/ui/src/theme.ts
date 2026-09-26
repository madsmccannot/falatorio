import { colors } from "./tokens.js";

export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryBackground: string;
    accent: string;
    accentBackground: string;
    ouro: string;
    heart: string;
    xp: string;
    streak: string;
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    error: string;
    errorBackground: string;
    overlay: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: colors.neutral[50],
    surface: colors.neutral[0],
    surfaceElevated: colors.neutral[0],
    border: colors.neutral[200],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    textMuted: colors.neutral[400],
    primary: colors.primary[600],
    primaryBackground: colors.primary[50],
    accent: colors.accent[600],
    accentBackground: colors.accent[50],
    ouro: colors.ouro,
    heart: colors.heart,
    xp: colors.xp,
    streak: colors.streak,
    success: colors.success,
    successBackground: "#ECFDF5",
    warning: colors.warning,
    warningBackground: "#FFFBEB",
    error: colors.error,
    errorBackground: "#FEF2F2",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: colors.neutral[900],
    surface: colors.neutral[800],
    surfaceElevated: colors.neutral[700],
    border: colors.neutral[700],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    textMuted: colors.neutral[500],
    primary: colors.primary[400],
    primaryBackground: "#052E16",
    accent: colors.accent[400],
    accentBackground: "#2D1111",
    ouro: "#A78BFA",
    heart: "#F87171",
    xp: "#FBBF24",
    streak: "#FB923C",
    success: "#34D399",
    successBackground: "#052E16",
    warning: "#FBBF24",
    warningBackground: "#291A05",
    error: "#F87171",
    errorBackground: "#2D1111",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};
