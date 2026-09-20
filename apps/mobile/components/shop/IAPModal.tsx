import { View, Text, StyleSheet } from "react-native";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  status: "loading" | "success" | "error";
  productName?: string;
  errorMessage?: string;
};

export function IAPModal({ visible, onDismiss, status, productName, errorMessage }: Props) {
  return (
    <Modal visible={visible} onDismiss={status === "loading" ? () => {} : onDismiss}>
      {status === "loading" && (
        <View style={styles.centered}>
          <Loading message="Processing purchase..." />
        </View>
      )}

      {status === "success" && (
        <View style={styles.centered}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.title}>Purchase complete</Text>
          <Text style={styles.subtitle}>
            {productName ?? "Your item"} has been added to your account.
          </Text>
          <Button
            title="Done"
            onPress={onDismiss}
            style={styles.action}
          />
        </View>
      )}

      {status === "error" && (
        <View style={styles.centered}>
          <Text style={styles.title}>Purchase failed</Text>
          <Text style={styles.subtitle}>
            {errorMessage ?? "Something went wrong. You were not charged."}
          </Text>
          <Button
            title="OK"
            onPress={onDismiss}
            variant="outline"
            style={styles.action}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  action: {
    width: "100%",
  },
});
