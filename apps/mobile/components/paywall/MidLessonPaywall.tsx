import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useHearts } from "@/hooks/useHearts";
import { useOuro } from "@/hooks/useOuro";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { HEARTS } from "@falatorio/core";

type Props = {
  visible: boolean;
  sessionId?: string;
  onContinue: () => void;
  onQuit: () => void;
};

export function MidLessonPaywall({ visible, sessionId, onContinue, onQuit }: Props) {
  const router = useRouter();
  const { continueWithOuro } = useHearts();
  const { balance } = useOuro();
  const cost = HEARTS.CONTINUE_COST;
  const canAfford = balance >= cost;

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await continueWithOuro(sessionId ?? "");
    onContinue();
  };

  return (
    <Modal visible={visible} onDismiss={() => {}}>
      <Text style={styles.title}>Keep going?</Text>
      <Text style={styles.subtitle}>
        You've run out of hearts mid-lesson. Spend {cost} ouro to continue
        where you left off.
      </Text>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Your balance:</Text>
        <Text style={styles.balanceValue}>{balance} ouro</Text>
      </View>

      <Button
        title={`Continue (${cost} ouro)`}
        onPress={handleContinue}
        disabled={!canAfford}
        style={styles.action}
      />

      <Button
        title="Get Super — never run out"
        onPress={() => {
          onQuit();
          router.push("/shop/super-detail");
        }}
        variant="secondary"
        style={styles.action}
      />

      <Button
        title="Leave lesson"
        onPress={onQuit}
        variant="danger"
        style={styles.action}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral[100],
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  balanceValue: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.ouro,
  },
  action: {
    width: "100%",
    marginBottom: spacing.sm,
  },
});
