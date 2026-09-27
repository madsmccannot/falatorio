import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useLesson } from "@/hooks/useLesson";
import { useHearts } from "@/hooks/useHearts";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { FeedbackOverlay } from "@/components/lesson/FeedbackOverlay";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { HeartIcon } from "@/components/icons";
import { useTranslation } from "@/lib/i18n";
import { trackLessonStart, trackLessonComplete, trackLessonQuit, trackScreenView } from "@/lib/analytics";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
    isStarting,
    completeLesson,
    isCompleting,
    error,
    results,
    startTimeRef,
  } = useLesson(lessonId!);

  const [showQuit, setShowQuit] = React.useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = React.useState(false);

  useEffect(() => {
    trackScreenView("lesson");
    if (totalExercises > 0 && lessonId) {
      trackLessonStart(lessonId, totalExercises);
    }
  }, [totalExercises]);

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
      const result = await completeLesson();
      if (!result) return;

      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const correctCount = results.filter((r) => r.correct).length;
      const accuracy = totalExercises > 0 ? correctCount / totalExercises : 0;
      trackLessonComplete(lessonId!, elapsed, result.xpEarned, result.ouroEarned, accuracy);

      router.replace({
        pathname: "/lesson/result",
        params: {
          xpEarned: String(result.xpEarned),
          ouroEarned: String(result.ouroEarned),
          elapsedSeconds: String(elapsed),
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
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>{t("lesson.error_title")}</Text>
        <Text style={styles.errorText}>{String(error)}</Text>
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
        {!unlimited && (
          <View style={styles.heartsChip}>
            <HeartIcon size={16} />
            <Text style={styles.heartCount}>{hearts}</Text>
          </View>
        )}
      </View>

      {currentExercise ? (
        <Animated.View
          key={currentExercise.id}
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
        <Loading message="Loading exercise..." />
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
        <Text style={styles.modalText}>
          {t("lesson.quit_text")}
        </Text>
        <Button
          title={t("lesson.keep_learning")}
          onPress={() => setShowQuit(false)}
          style={styles.modalButton}
        />
        <Button
          title={t("lesson.quit")}
          onPress={() => {
            trackLessonQuit(lessonId!, currentIndex, totalExercises);
            router.back();
          }}
          variant="danger"
          style={styles.modalButton}
        />
      </Modal>

      <Modal visible={showOutOfHearts} onDismiss={() => {}}>
        <Text style={styles.modalTitle}>{t("lesson.out_of_hearts")}</Text>
        <Text style={styles.modalText}>
          {t("lesson.out_of_hearts_text")}
        </Text>
        <Button
          title={t("lesson.continue_ouro")}
          onPress={async () => {
            await continueWithOuro(lessonId!);
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
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
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
