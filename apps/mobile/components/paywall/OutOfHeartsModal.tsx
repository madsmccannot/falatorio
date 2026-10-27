import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useHearts } from "@/hooks/useHearts";
import { useOuro } from "@/hooks/useOuro";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HeartIcon } from "@/components/icons";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { HEARTS } from "@falatorio/core";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  visible: boolean;
  onDismiss: () => void;
  context: "lesson" | "start";
};

export function OutOfHeartsModal({ visible, onDismiss, context }: Props) {
  const router = useRouter();
  const { refillWithOuro, nextRefillAt } = useHearts();
  const { balance } = useOuro();
  const refillCost = HEARTS.REFILL_COST;
  const canAfford = balance >= refillCost;

  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!nextRefillAt) { setRemaining(null); return; }
    const target = new Date(nextRefillAt).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextRefillAt]);

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <View style={styles.iconRow}>
        <HeartIcon size={48} />
      </View>
      <Text style={styles.title}>Sem vidas</Text>
      <Text style={styles.subtitle}>
        {context === "lesson"
          ? "Precisas de vidas para continuar esta lição."
          : "Precisas de vidas para começar uma lição."}
      </Text>

      {remaining != null && remaining > 0 && (
        <Text style={styles.timer}>Próxima vida grátis em {formatCountdown(remaining)}</Text>
      )}

      <Button
        title={`Repor vidas (${refillCost} ouro)`}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await refillWithOuro();
          onDismiss();
        }}
        disabled={!canAfford}
        style={styles.action}
      />

      <Button
        title="Ver anúncio por uma vida"
        onPress={() => {
          onDismiss();
        }}
        variant="outline"
        style={styles.action}
      />

      <Button
        title="Obter Super — vidas ilimitadas"
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
