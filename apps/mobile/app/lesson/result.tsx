import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { GoldPrisms, TimerIcon, BoltIcon } from "@/components/icons";
import { GaloCelebration } from "@/components/lesson/GaloCelebration";
import { PastelNataCelebration } from "@/components/lesson/PastelNataCelebration";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { trackScreenView, trackFunnelFirstLesson } from "@/lib/analytics";
import { getString, setString } from "@/lib/storage";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LessonResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{
    xpEarned: string;
    ouroEarned: string;
    elapsedSeconds: string;
    combo: string;
  }>();

  const { t } = useTranslation();
  const xpEarned = Number(params.xpEarned ?? 0);
  const ouroEarned = Number(params.ouroEarned ?? 0);
  const elapsedSeconds = Number(params.elapsedSeconds ?? 0);
  const combo = Number(params.combo ?? 0);

  const [showCelebration, setShowCelebration] = React.useState(true);
  const [contentVisible, setContentVisible] = React.useState(false);
  const celebrationType = React.useMemo(() => (Math.random() < 0.5 ? "galo" : "pastel"), []);

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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      {showCelebration &&
        (celebrationType === "galo" ? (
          <GaloCelebration onFinish={handleCelebrationFinish} />
        ) : (
          <PastelNataCelebration onFinish={handleCelebrationFinish} />
        ))}

      {contentVisible && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{t("result.complete_title")}</Text>
            <Text style={[styles.resultSubtitle, { color: theme.textMuted }]}>{t("result.complete_text")}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: colors.xp }]}>
              <Text style={styles.statLabel}>TOTAL DE XP</Text>
              <View style={styles.statValueRow}>
                <BoltIcon size={18} color={colors.xp} />
                <Text style={[styles.statValue, { color: colors.xp }]}>+{xpEarned}</Text>
              </View>
            </View>
            {combo > 0 && (
              <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: colors.primary[400] }]}>
                <Text style={styles.statLabel}>COMBO</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statValue, { color: colors.primary[400] }]}>x{combo}</Text>
                </View>
              </View>
            )}
            <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: colors.success }]}>
              <Text style={styles.statLabel}>{t("result.time").toUpperCase()}</Text>
              <View style={styles.statValueRow}>
                <TimerIcon size={16} color={colors.success} />
                <Text style={[styles.statValue, { color: colors.success }]}>{formatTime(elapsedSeconds)}</Text>
              </View>
            </View>
          </Animated.View>

          {ouroEarned > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.ouroRow}>
              <GoldPrisms size={20} />
              <Text style={[styles.ouroText, { color: colors.ouro }]}>+{ouroEarned} ouro</Text>
            </Animated.View>
          )}

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
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing["2xl"],
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 2,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  ouroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  ouroText: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryAction: {
    width: "100%",
  },
});
