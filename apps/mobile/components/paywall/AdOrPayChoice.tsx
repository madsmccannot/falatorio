import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  rewardLabel: string;
  ouroCost: number;
  canAfford: boolean;
  onWatchAd: () => void;
  onPayOuro: () => void;
};

export function AdOrPayChoice({
  visible,
  onDismiss,
  rewardLabel,
  ouroCost,
  canAfford,
  onWatchAd,
  onPayOuro,
}: Props) {
  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <Text style={styles.title}>{rewardLabel}</Text>
      <Text style={styles.subtitle}>Choose how you'd like to continue.</Text>

      <Button
        title="Watch a short ad"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onWatchAd();
        }}
        style={styles.action}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        title={`Spend ${ouroCost} ouro`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPayOuro();
        }}
        variant="secondary"
        disabled={!canAfford}
        style={styles.action}
      />

      <Button
        title="Cancel"
        onPress={onDismiss}
        variant="ghost"
        style={styles.action}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing.lg,
  },
  action: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    paddingHorizontal: spacing.md,
  },
});
