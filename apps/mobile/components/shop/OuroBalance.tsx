import { View, Text, StyleSheet } from "react-native";
import { GoldPrisms } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useOuro } from "@/hooks/useOuro";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

interface OuroBalanceProps {
  size?: "sm" | "md";
}

export function OuroBalance({ size = "md" }: OuroBalanceProps) {
  const theme = useTheme();
  const { balance } = useOuro();
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <View
      style={[
        styles.chip,
        size === "sm" && styles.chipSm,
        { backgroundColor: theme.bgCard, borderColor: theme.border },
      ]}
    >
      <GoldPrisms size={iconSize} />
      <Text
        style={[
          styles.value,
          size === "sm" && styles.valueSm,
          { color: colors.ouro },
        ]}
      >
        {balance}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xs,
    borderWidth: 1,
  },
  chipSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  valueSm: {
    fontSize: typography.sizes.sm,
  },
});
