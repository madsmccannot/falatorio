import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useHearts } from "@/hooks/useHearts";
import { useCrystals } from "@/hooks/useCrystals";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { HEARTS } from "@falatorio/core";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  context: "lesson" | "start";
};

export function OutOfHeartsModal({ visible, onDismiss, context }: Props) {
  const router = useRouter();
  const { refillWithCrystals, nextRefillIn } = useHearts();
  const { balance } = useCrystals();
  const refillCost = HEARTS.REFILL_COST;
  const canAfford = balance >= refillCost;

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <View style={styles.iconRow}>
        <Text style={styles.heartIcon}>♥</Text>
      </View>
      <Text style={styles.title}>Out of hearts</Text>
      <Text style={styles.subtitle}>
        {context === "lesson"
          ? "You need hearts to continue this lesson."
          : "You need hearts to start a lesson."}
      </Text>

      {nextRefillIn && (
        <Text style={styles.timer}>Next free heart in {nextRefillIn}</Text>
      )}

      <Button
        title={`Refill hearts (${refillCost} ouro)`}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await refillWithCrystals();
          onDismiss();
        }}
        disabled={!canAfford}
        style={styles.action}
      />

      <Button
        title="Watch an ad for a heart"
        onPress={() => {
          onDismiss();
        }}
        variant="outline"
        style={styles.action}
      />

      <Button
        title="Get Super — unlimited hearts"
        onPress={() => {
          onDismiss();
          router.push("/shop/super-detail");
        }}
        variant="secondary"
        style={styles.action}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heartIcon: {
    fontSize: 48,
    color: colors.heart,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  timer: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  action: {
    width: "100%",
    marginBottom: spacing.sm,
  },
});
