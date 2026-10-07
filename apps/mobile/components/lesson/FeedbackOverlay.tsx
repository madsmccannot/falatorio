import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { SlideInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type PunctuationWarning = {
  type: "missing_accent" | "missing_punctuation";
  message: string;
};

type ExplainState = {
  loading: boolean;
  explanation: string | null;
  remaining: number | null;
  error: string | null;
};

type Props = {
  correct: boolean;
  correctAnswer?: string;
  l1Tip?: string;
  warnings?: PunctuationWarning[];
  explain: ExplainState;
  onContinue: () => void;
  onExplain: () => void;
};

export function FeedbackOverlay({
  correct,
  correctAnswer,
  l1Tip,
  warnings,
  explain,
  onContinue,
  onExplain,
}: Props) {
  React.useEffect(() => {
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const hasWarnings = warnings && warnings.length > 0;
  const showExplainButton = !explain.explanation && !explain.loading && explain.error !== "limit_reached";

  return (
    <Animated.View
      entering={SlideInDown.duration(250)}
      style={[styles.container, correct ? (hasWarnings ? styles.correctWarning : styles.correct) : styles.wrong]}
    >
      <Text style={styles.title}>
        {correct ? (hasWarnings ? "Quase perfeito!" : "Correto!") : "Não foi desta"}
      </Text>

      {!correct && correctAnswer && (
        <Text style={styles.answer}>Resposta correta: {correctAnswer}</Text>
      )}

      {hasWarnings && (
        <View style={styles.warningBox}>
          {warnings.map((w, i) => (
            <Text key={i} style={styles.warningText}>{w.message}</Text>
          ))}
        </View>
      )}

      {l1Tip && (
        <Text style={styles.tip}>{l1Tip}</Text>
      )}

      {explain.loading && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.explainBox}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={styles.explainLoading}>A explicar...</Text>
        </Animated.View>
      )}

      {explain.explanation && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.explainBox}>
          <Text style={styles.explainText}>{explain.explanation}</Text>
          {explain.remaining !== null && (
            <Text style={styles.explainRemaining}>
              {explain.remaining} {explain.remaining === 1 ? "explicação restante" : "explicações restantes"} hoje
            </Text>
          )}
        </Animated.View>
      )}

      {explain.error === "limit_reached" && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.limitBox}>
          <Text style={styles.limitText}>
            Limite diário de explicações atingido. Atualiza para Super para mais!
          </Text>
        </Animated.View>
      )}

      <View style={styles.actions}>
        {showExplainButton && (
          <Button
            title="Porquê?"
            onPress={onExplain}
            variant="outline"
            size="sm"
            style={styles.explainButton}
          />
        )}
        <Button
          title="Continuar"
          onPress={onContinue}
          variant="ghost"
          style={styles.continueButton}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  correct: {
    backgroundColor: "#ECFDF5",
  },
  correctWarning: {
    backgroundColor: "#FFFBEB",
  },
  wrong: {
    backgroundColor: "#FFF1F2",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  answer: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: "#92400E",
    lineHeight: 18,
  },
  tip: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  explainBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  explainLoading: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
  },
  explainText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[800],
    lineHeight: 20,
  },
  explainRemaining: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  limitBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  limitText: {
    fontSize: typography.sizes.sm,
    color: "#92400E",
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  explainButton: {
    minWidth: 80,
  },
  continueButton: {
    marginLeft: "auto",
  },
});
