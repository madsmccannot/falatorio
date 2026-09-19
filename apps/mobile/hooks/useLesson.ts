import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface Exercise {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  audioUrl: string | null;
  audioNativeUrl: string | null;
  difficulty: number;
}

interface FeedbackState {
  correct: boolean;
  correctAnswer?: string;
  l1Tip?: string;
}

type LessonPhase = "loading" | "answering" | "complete";

interface LessonState {
  sessionId: string | null;
  exercises: Exercise[];
  currentIndex: number;
  results: Array<{
    correct: boolean;
    score: number;
    feedback: string | null;
  }>;
  phase: LessonPhase;
  selectedAnswer: string | null;
  feedback: FeedbackState | null;
  error: string | null;
}

export function useLesson(lessonId?: string) {
  const [state, setState] = useState<LessonState>({
    sessionId: null,
    exercises: [],
    currentIndex: 0,
    results: [],
    phase: "loading",
    selectedAnswer: null,
    feedback: null,
    error: null,
  });

  const startMutation = trpc.lesson.startLesson.useMutation();
  const submitMutation = trpc.lesson.submitAnswer.useMutation();
  const completeMutation = trpc.lesson.completeLesson.useMutation();
  const utils = trpc.useUtils();

  const startLesson = useCallback(async (id?: string) => {
    const targetId = id ?? lessonId;
    if (!targetId) return null;
    try {
      const result = await startMutation.mutateAsync({ lessonId: targetId });
      setState((prev) => ({
        ...prev,
        sessionId: result.sessionId,
        exercises: result.exercises as Exercise[],
        currentIndex: 0,
        results: [],
        phase: "answering" as const,
        error: null,
      }));
      return result;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to start lesson",
      }));
      return null;
    }
  }, [lessonId, startMutation]);

  const setSelectedAnswer = useCallback((answer: string) => {
    setState((prev) => ({ ...prev, selectedAnswer: answer }));
  }, []);

  const submitCurrentAnswer = useCallback(async () => {
    if (!state.sessionId || !state.exercises[state.currentIndex] || !state.selectedAnswer) return null;

    const exercise = state.exercises[state.currentIndex]!;
    const result = await submitMutation.mutateAsync({
      sessionId: state.sessionId,
      exerciseId: exercise.id,
      answer: state.selectedAnswer,
    });

    setState((prev) => ({
      ...prev,
      feedback: {
        correct: result.correct,
        correctAnswer: (result as Record<string, unknown>)["correctAnswer"] as string | undefined,
        l1Tip: (result as Record<string, unknown>)["l1Tip"] as string | undefined,
      },
      results: [...prev.results, {
        correct: result.correct,
        score: result.score,
        feedback: result.feedback,
      }],
    }));

    return result;
  }, [state.sessionId, state.exercises, state.currentIndex, state.selectedAnswer, submitMutation]);

  const nextExercise = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= prev.exercises.length;
      return {
        ...prev,
        currentIndex: nextIndex,
        selectedAnswer: null,
        feedback: null,
        phase: isComplete ? "complete" as const : "answering" as const,
      };
    });
  }, []);

  const completeLesson = useCallback(async () => {
    if (!state.sessionId) return null;

    const result = await completeMutation.mutateAsync({
      sessionId: state.sessionId,
    });

    await utils.hearts.getState.invalidate();
    await utils.economy.getBalance.invalidate();
    await utils.gamification.getStreak.invalidate();

    return result;
  }, [state.sessionId, completeMutation, utils]);

  const currentExercise = state.exercises[state.currentIndex] ?? null;
  const progress = state.exercises.length > 0
    ? state.currentIndex / state.exercises.length
    : 0;

  return {
    sessionId: state.sessionId,
    state: state.phase,
    exercises: state.exercises,
    currentExercise,
    currentIndex: state.currentIndex,
    results: state.results,
    progress,
    totalExercises: state.exercises.length,
    selectedAnswer: state.selectedAnswer,
    setSelectedAnswer,
    submitCurrentAnswer,
    submitAnswer: submitCurrentAnswer,
    isSubmitting: submitMutation.isPending,
    feedback: state.feedback,
    nextExercise,
    isComplete: state.phase === "complete",
    startLesson,
    completeLesson,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    error: state.error,
  };
}
