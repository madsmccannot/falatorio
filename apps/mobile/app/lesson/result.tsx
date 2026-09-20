import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

export default function LessonResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    score: string;
    xpEarned: string;
    crystalsEarned: string;
    totalExercises: string;
    correctCount: string;
    passed: string;
  }>();

  const xpEarned = Number(params.xpEarned ?? 0);
  const crystalsEarned = Number(params.crystalsEarned ?? 0);
  const totalExercises = Number(params.totalExercises ?? 0);
  const correctCount = Number(params.correctCount ?? 0);
  const passed = params.passed === "true";
  const percentage = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;

  React.useEffect(() => {
    if (passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
    >
      <Animated.View entering={ZoomIn.delay(200).duration(400)} style={styles.heroSection}>
        <View style={[styles.scoreCircle, passed ? styles.scorePassed : styles.scoreFailed]}>
          <Text style={styles.scoreNumber}>{percentage}%</Text>
          <Text style={styles.scoreLabel}>
            {passed ? "Passed" : "Try again"}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(300)}>
        <Text style={styles.resultTitle}>
          {passed ? "Lesson complete!" : "Almost there"}
        </Text>
        <Text style={styles.resultSubtitle}>
          {passed
            ? "Great work. Keep up the momentum."
            : "You need 80% to pass. Review and try again."}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(300)} style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{correctCount}/{totalExercises}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.xp }]}>+{xpEarned}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.crystal }]}>+{crystalsEarned}</Text>
          <Text style={styles.statLabel}>Ouro</Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).duration(300)} style={styles.actions}>
        <Button
          title={passed ? "Continue" : "Try again"}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/tabs/learn");
          }}
          size="lg"
          style={styles.primaryAction}
        />
        {passed && (
          <Button
            title="Review mistakes"
            onPress={() => router.replace("/tabs/practice")}
            variant="outline"
            style={styles.secondaryAction}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    alignItems: "center",
  },
  heroSection: {
    paddingVertical: spacing["3xl"],
    alignItems: "center",
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
  },
  scorePassed: {
    borderColor: colors.success,
    backgroundColor: "#ECFDF5",
  },
  scoreFailed: {
    borderColor: colors.accent[400],
    backgroundColor: "#FFF7ED",
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  scoreLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[600],
    marginTop: 2,
  },
  resultTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing["2xl"],
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryAction: {
    width: "100%",
  },
  secondaryAction: {
    width: "100%",
  },
});
