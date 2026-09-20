import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useLesson } from "@/hooks/useLesson";
import { useHearts } from "@/hooks/useHearts";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hearts, unlimited, continueWithCrystals } = useHearts();

  const {
    state,
    currentExercise,
    progress,
    totalExercises,
    selectedAnswer,
    setSelectedAnswer,
    submitCurrentAnswer,
    isSubmitting,
    feedback,
    nextExercise,
    isStarting,
    error,
  } = useLesson(lessonId!);

  const [showQuit, setShowQuit] = React.useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setShowQuit(true);
        return true;
      });
      return () => sub.remove();
    }, [])
  );

  React.useEffect(() => {
    if (!unlimited && hearts <= 0 && state === "answering") {
      setShowOutOfHearts(true);
    }
  }, [hearts, unlimited, state]);

  if (isStarting) {
    return <Loading fullScreen message="Preparing lesson..." />;
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{String(error)}</Text>
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  if (state === "complete") {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Button
          title="X"
          onPress={() => setShowQuit(true)}
          variant="ghost"
          size="sm"
        />
        <View style={styles.progressBarOuter}>
          <Animated.View
            style={[
              styles.progressBarInner,
              { width: `${(progress / totalExercises) * 100}%` },
            ]}
          />
        </View>
        {!unlimited && (
          <View style={styles.heartsChip}>
            <Text style={styles.heartIcon}>♥</Text>
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
            {formatExerciseType(currentExercise.type)}
          </Text>
          <Text style={styles.prompt}>
            {currentExercise.prompt}
          </Text>

          {currentExercise.options && (
            <View style={styles.options}>
              {currentExercise.options.map((option: string, i: number) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = feedback?.correctAnswer === option;
                const isWrong = feedback && isSelected && !feedback.correct;

                return (
                  <Button
                    key={`${currentExercise.id}-${i}`}
                    title={option}
                    onPress={() => {
                      if (!feedback) {
                        Haptics.selectionAsync();
                        setSelectedAnswer(option);
                      }
                    }}
                    variant={
                      feedback
                        ? isCorrect
                          ? "primary"
                          : isWrong
                            ? "danger"
                            : "outline"
                        : isSelected
                          ? "secondary"
                          : "outline"
                    }
                    style={styles.optionButton}
                    disabled={!!feedback}
                  />
                );
              })}
            </View>
          )}

          {!currentExercise.options && !feedback && (
            <View style={styles.textInputArea}>
              <Text style={styles.inputPlaceholder}>
                Type your answer...
              </Text>
            </View>
          )}
        </Animated.View>
      ) : (
        <Loading message="Loading exercise..." />
      )}

      {feedback && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.feedbackBar,
            feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {feedback.correct ? "Correct!" : "Not quite"}
          </Text>
          {!feedback.correct && feedback.correctAnswer && (
            <Text style={styles.feedbackAnswer}>
              Correct answer: {feedback.correctAnswer}
            </Text>
          )}
          {feedback.l1Tip && (
            <Text style={styles.feedbackTip}>{feedback.l1Tip}</Text>
          )}
          <Button
            title="Continue"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              nextExercise();
            }}
            variant="ghost"
            style={styles.continueButton}
          />
        </Animated.View>
      )}

      {!feedback && selectedAnswer && (
        <View style={styles.submitArea}>
          <Button
            title="Check"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              submitCurrentAnswer();
            }}
            loading={isSubmitting}
            size="lg"
            style={styles.submitButton}
          />
        </View>
      )}

      <Modal visible={showQuit} onDismiss={() => setShowQuit(false)}>
        <Text style={styles.modalTitle}>Quit lesson?</Text>
        <Text style={styles.modalText}>
          Your progress on this lesson won't be saved.
        </Text>
        <Button
          title="Keep learning"
          onPress={() => setShowQuit(false)}
          style={styles.modalButton}
        />
        <Button
          title="Quit"
          onPress={() => router.back()}
          variant="danger"
          style={styles.modalButton}
        />
      </Modal>

      <Modal visible={showOutOfHearts} onDismiss={() => {}}>
        <Text style={styles.modalTitle}>Out of hearts</Text>
        <Text style={styles.modalText}>
          You need hearts to continue. Spend 50 ouro to keep going, or wait for
          hearts to refill.
        </Text>
        <Button
          title="Continue (50 ouro)"
          onPress={async () => {
            await continueWithCrystals(lessonId!);
            setShowOutOfHearts(false);
          }}
          style={styles.modalButton}
        />
        <Button
          title="Leave lesson"
          onPress={() => router.back()}
          variant="outline"
          style={styles.modalButton}
        />
      </Modal>
    </View>
  );
}

function formatExerciseType(type: string): string {
  const labels: Record<string, string> = {
    translate: "Translate this sentence",
    fill_blank: "Fill in the blank",
    listen_type: "Listen and type",
    match_pairs: "Match the pairs",
    pick_correct: "Pick the correct answer",
    reorder: "Put the words in order",
    speak: "Say this in Portuguese",
  };
  return labels[type] ?? type;
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
  progressBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: radii.full,
  },
  heartsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  heartIcon: {
    fontSize: 16,
    color: colors.heart,
  },
  heartCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.heart,
  },
  exerciseArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  exerciseType: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  prompt: {
    fontSize: typography.sizes.xl,
    fontWeight: "500",
    color: colors.neutral[800],
    lineHeight: 32,
    marginBottom: spacing["2xl"],
  },
  options: {
    gap: spacing.sm,
  },
  optionButton: {
    width: "100%",
  },
  textInputArea: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 100,
  },
  inputPlaceholder: {
    fontSize: typography.sizes.md,
    color: colors.neutral[400],
  },
  feedbackBar: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  feedbackCorrect: {
    backgroundColor: "#ECFDF5",
  },
  feedbackWrong: {
    backgroundColor: "#FFF1F2",
  },
  feedbackTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  feedbackAnswer: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  feedbackTip: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  continueButton: {
    alignSelf: "flex-end",
  },
  submitArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    width: "100%",
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
