import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface LessonState {
  sessionId: string | null;
  exercises: Array<{
    id: string;
    type: string;
    prompt: unknown;
    audioUrl: string | null;
    audioNativeUrl: string | null;
    difficulty: number;
  }>;
  currentIndex: number;
  results: Array<{
    correct: boolean;
    score: number;
    feedback: string | null;
  }>;
}

export function useLesson() {
  const [state, setState] = useState<LessonState>({
    sessionId: null,
    exercises: [],
    currentIndex: 0,
    results: [],
  });

  const startMutation = trpc.lesson.startLesson.useMutation();
  const submitMutation = trpc.lesson.submitAnswer.useMutation();
  const completeMutation = trpc.lesson.completeLesson.useMutation();
  const utils = trpc.useUtils();

  const startLesson = useCallback(async (lessonId: string) => {
    const result = await startMutation.mutateAsync({ lessonId });
    setState({
      sessionId: result.sessionId,
      exercises: result.exercises,
      currentIndex: 0,
      results: [],
    });
    return result;
  }, [startMutation]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!state.sessionId || !state.exercises[state.currentIndex]) return null;

    const exercise = state.exercises[state.currentIndex]!;
    const result = await submitMutation.mutateAsync({
      sessionId: state.sessionId,
      exerciseId: exercise.id,
      answer,
    });

    setState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      results: [...prev.results, {
        correct: result.correct,
        score: result.score,
        feedback: result.feedback,
      }],
    }));

    return result;
  }, [state.sessionId, state.exercises, state.currentIndex, submitMutation]);

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
  const isComplete = state.currentIndex >= state.exercises.length && state.exercises.length > 0;

  return {
    sessionId: state.sessionId,
    exercises: state.exercises,
    currentExercise,
    currentIndex: state.currentIndex,
    results: state.results,
    progress,
    isComplete,
    startLesson,
    submitAnswer,
    completeLesson,
    isStarting: startMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}
