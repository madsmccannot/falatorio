import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { useHearts } from "@/hooks/useHearts";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { FeedbackOverlay } from "@/components/lesson/FeedbackOverlay";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { HeartIcon, StarIcon } from "@/components/icons";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

export default function MistakesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const theme = useTheme();
  const { hearts, unlimited, continueWithOuro } = useHearts();

  const {
    phase,
    currentExercise,
    currentIndex,
    totalExercises,
    feedback,
    explain,
    submitAnswer,
    isSubmitting,
    requestExplanation,
    nextExercise,
    isComplete,
    startSession,
    completeSession,
    isStarting,
    isCompleting,
    error,
    startTimeRef,
    xpMultiplier,
    dailyRemaining,
  } = usePracticeSession("mistakes");

  const [showQuit, setShowQuit] = React.useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = React.useState(false);

  useEffect(() => {
    startSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setShowQuit(true);
        return true;
      });
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    if (!unlimited && hearts <= 0 && phase === "answering") {
      setShowOutOfHearts(true);
    }
  }, [hearts, unlimited, phase]);

  useEffect(() => {
    if (!isComplete) return;

    (async () => {
      const result = await completeSession();
      if (!result) return;

      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

      router.replace({
        pathname: "/lesson/result",
        params: {
          xpEarned: String(result.xpEarned),
          ouroEarned: String(result.ouroEarned),
          elapsedSeconds: String(elapsed),
          sessionType: "mistakes",
        },
      });
    })();
  }, [isComplete]);

  const handleAnswer = useCallback((answer: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitAnswer(answer);
  }, [submitAnswer]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextExercise();
  }, [nextExercise]);

  if (isStarting) {
    return <Loading fullScreen message={t("lesson.preparing")} />;
  }

  if (error) {
    const isNoMistakes = error.includes("no_mistakes");
    const isDailyLimit = error.includes("daily_mistakes_limit_reached");
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        {isNoMistakes ? (
          <>
            <StarIcon size={48} color={colors.primary[400]} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t("practice.caught_up_title")}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {t("practice.mistakes_empty")}
            </Text>
          </>
        ) : isDailyLimit ? (
          <>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t("practice.mistakes_limit_title")}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {t("practice.mistakes_limit_text")}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.errorTitle, { color: theme.text }]}>{t("lesson.error_title")}</Text>
            <Text style={[styles.errorText, { color: theme.textMuted }]}>{String(error)}</Text>
          </>
        )}
        <Button
          title={t("lesson.go_back")}
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  if (isComplete || isCompleting) {
    return <Loading fullScreen message={t("lesson.finishing")} />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <Button
          title="X"
          onPress={() => setShowQuit(true)}
          variant="ghost"
          size="sm"
        />
        <ProgressBar current={currentIndex} total={totalExercises} />
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{xpMultiplier}x XP</Text>
        </View>
        {dailyRemaining !== null && dailyRemaining >= 0 && (
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>{dailyRemaining}</Text>
          </View>
        )}
        {!unlimited && (
          <View style={styles.heartsChip}>
            <HeartIcon size={16} />
            <Text style={styles.heartCount}>{hearts}</Text>
          </View>
        )}
      </View>

      {currentExercise ? (
        <Animated.View
          key={currentExercise.id + "-" + currentIndex}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
          style={styles.exerciseArea}
        >
          <Text style={styles.exerciseType}>
            {formatExerciseType(currentExercise.type, t)}
          </Text>

          <ExerciseRenderer
            exercise={{
              id: currentExercise.id,
              type: currentExercise.type,
              prompt: currentExercise.prompt,
              options: currentExercise.options,
              pairs: currentExercise.pairs,
              words: currentExercise.words,
              sentence: currentExercise.sentence,
              audioUrl: currentExercise.audioUrl ?? undefined,
            }}
            onAnswer={handleAnswer}
            disabled={phase !== "answering"}
          />
        </Animated.View>
      ) : (
        <Loading message="" />
      )}

      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <Loading message="" />
        </View>
      )}

      {feedback && (
        <FeedbackOverlay
          correct={feedback.correct}
          correctAnswer={feedback.correctAnswer}
          l1Tip={feedback.l1Tip}
          warnings={feedback.warnings}
          explain={explain}
          onContinue={handleContinue}
          onExplain={requestExplanation}
        />
      )}

      <Modal visible={showQuit} onDismiss={() => setShowQuit(false)}>
        <Text style={styles.modalTitle}>{t("lesson.quit_title")}</Text>
        <Text style={styles.modalText}>{t("lesson.quit_text")}</Text>
        <Button
          title={t("lesson.keep_learning")}
          onPress={() => setShowQuit(false)}
          style={styles.modalButton}
        />
        <Button
          title={t("lesson.quit")}
          onPress={() => router.back()}
          variant="danger"
          style={styles.modalButton}
        />
      </Modal>

      <Modal visible={showOutOfHearts} onDismiss={() => {}}>
        <Text style={styles.modalTitle}>{t("lesson.out_of_hearts")}</Text>
        <Text style={styles.modalText}>{t("lesson.out_of_hearts_text")}</Text>
        <Button
          title={t("lesson.continue_ouro")}
          onPress={async () => {
            await continueWithOuro("mistakes");
            setShowOutOfHearts(false);
          }}
          style={styles.modalButton}
        />
        <Button
          title={t("lesson.leave")}
          onPress={() => router.back()}
          variant="outline"
          style={styles.modalButton}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

function formatExerciseType(type: string, t: (k: any) => string): string {
  const map: Record<string, string> = {
    translate: t("lesson.type_translate"),
    translate_l1_to_pt: t("lesson.type_translate"),
    translate_pt_to_l1: t("lesson.type_translate"),
    fill_blank: t("lesson.type_fill_blank"),
    listen_type: t("lesson.type_listen_type"),
    listen_and_type: t("lesson.type_listen_type"),
    match_pairs: t("lesson.type_match_pairs"),
    pick_correct: t("lesson.type_pick_correct"),
    reorder: t("lesson.type_reorder"),
    reorder_words: t("lesson.type_reorder"),
    speak: t("lesson.type_speak"),
    speak_and_score: t("lesson.type_speak"),
  };
  return map[type] ?? type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  xpBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: colors.primary[700],
  },
  dailyBadge: {
    backgroundColor: colors.accent[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dailyBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: colors.accent[700],
  },
  heartsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  heartCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.heart,
  },
  exerciseArea: {
    flex: 1,
  },
  exerciseType: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.neutral[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  submittingOverlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  modalText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalButton: {
    width: "100%",
    marginBottom: spacing.sm,
  },
});
