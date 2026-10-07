import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Props = {
  message?: string;
};

export function SuperUpsellBanner({ message }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/shop/super-detail")}
      style={styles.container}
    >
      <Text style={styles.text}>
        {message ?? "Passa para Super — vidas ilimitadas e sem anúncios"}
      </Text>
      <Text style={styles.cta}>Saber mais →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[900],
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.neutral[300],
    marginRight: spacing.md,
  },
  cta: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.primary[400],
  },
});
