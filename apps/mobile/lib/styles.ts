import { StyleSheet } from "react-native";
import { spacing, radii, typography } from "@falatorio/ui/tokens";
import { type Theme } from "./theme";

type Themed = Theme & { isDark: boolean };

export function onboardingStyles(theme: Themed) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bg,
      paddingHorizontal: spacing.lg,
    },
    title: {
      fontSize: typography.sizes["2xl"],
      fontWeight: "700",
      color: theme.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.sizes.sm,
      color: theme.textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 20,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.optionBg,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: theme.optionBorder,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCardVertical: {
      backgroundColor: theme.optionBg,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: theme.optionBorder,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    optionSelected: {
      borderColor: theme.optionSelectedBorder,
      backgroundColor: theme.optionSelectedBg,
    },
    optionLabel: {
      fontSize: typography.sizes.md,
      fontWeight: "600",
      color: theme.text,
    },
    optionLabelSelected: {
      color: theme.optionSelectedText,
    },
    optionDesc: {
      fontSize: typography.sizes.xs,
      color: theme.textMuted,
      marginTop: 1,
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.optionSelectedBorder,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    checkmarkText: {
      color: "#FFFFFF",
      fontWeight: "700" as const,
      fontSize: 14,
    },
    footer: {
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.footerBorder,
    },
    card: {
      backgroundColor: theme.optionBg,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: theme.optionBorder,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.sizes.md,
      fontWeight: "600",
      color: theme.text,
      marginBottom: spacing.xs,
    },
    cardText: {
      fontSize: typography.sizes.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
}
