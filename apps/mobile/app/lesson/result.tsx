import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GoldPrisms, TimerIcon } from "@/components/icons";
import { GaloCelebration } from "@/components/lesson/GaloCelebration";
import { useTranslation } from "@/lib/i18n";
import { trackScreenView, trackFunnelFirstLesson } from "@/lib/analytics";
import { getString, setString } from "@/lib/storage";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function LessonResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    xpEarned: string;
    ouroEarned: string;
    elapsedSeconds: string;
  }>();

  const { t } = useTranslation();
  const xpEarned = Number(params.xpEarned ?? 0);
  const ouroEarned = Number(params.ouroEarned ?? 0);
  const elapsedSeconds = Number(params.elapsedSeconds ?? 0);

  const [showCelebration, setShowCelebration] = React.useState(true);
  const [contentVisible, setContentVisible] = React.useState(false);

  React.useEffect(() => {
    trackScreenView("lesson_result");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const firstLessonKey = "falatorio_first_lesson_done" as any;
    if (!getString(firstLessonKey)) {
      trackFunnelFirstLesson("first", elapsedSeconds);
      setString(firstLessonKey, new Date().toISOString());
    }
  }, []);

  const handleCelebrationFinish = React.useCallback(() => {
    setShowCelebration(false);
    setContentVisible(true);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showCelebration && (
        <GaloCelebration onFinish={handleCelebrationFinish} />
      )}

      {contentVisible && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={styles.resultTitle}>{t("result.complete_title")}</Text>
            <Text style={styles.resultSubtitle}>{t("result.complete_text")}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.statsRow}>
            <Card style={styles.statCard}>
              <TimerIcon size={20} />
              <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
              <Text style={styles.statLabel}>{t("result.time")}</Text>
            </Card>
            <Card style={styles.statCard}>
              <GoldPrisms size={20} />
              <Text style={[styles.statValue, { color: colors.ouro }]}>+{ouroEarned}</Text>
              <Text style={styles.statLabel}>{t("result.ouro")}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.xp }]}>+{xpEarned}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.actions}>
            <Button
              title={t("result.continue")}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace("/tabs/learn");
              }}
              size="lg"
              style={styles.primaryAction}
            />
          </Animated.View>
        </ScrollView>
      )}
    </View>
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
    paddingTop: spacing["3xl"],
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
});
