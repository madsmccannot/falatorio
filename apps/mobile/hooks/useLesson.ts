import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

export interface Exercise {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  words?: string[];
  sentence?: string;
  audioUrl?: string | null;
  audioNativeUrl?: string | null;
  difficulty: number;
}

interface PunctuationWarning {
  type: "missing_accent" | "missing_punctuation";
  message: string;
}

interface FeedbackState {
  correct: boolean;
  correctAnswer?: string;
  userAnswer: string;
  l1Tip?: string;
  warnings?: PunctuationWarning[];
}

interface ExplainState {
  loading: boolean;
  explanation: string | null;
  remaining: number | null;
  error: string | null;
}

type LessonPhase = "loading" | "answering" | "submitting" | "feedback" | "complete";

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
  feedback: FeedbackState | null;
  explain: ExplainState;
  error: string | null;
}

export function useLesson(lessonId?: string) {
  const startTimeRef = useRef<number>(Date.now());

  const [state, setState] = useState<LessonState>({
    sessionId: null,
    exercises: [],
    currentIndex: 0,
    results: [],
    phase: "loading",
    feedback: null,
    explain: { loading: false, explanation: null, remaining: null, error: null },
    error: null,
  });

  const startMutation = trpc.lesson.startLesson.useMutation();
  const submitMutation = trpc.lesson.submitAnswer.useMutation();
  const completeMutation = trpc.lesson.completeLesson.useMutation();
  const explainMutation = trpc.lesson.explainExercise.useMutation();
  const utils = trpc.useUtils();

  const startLesson = useCallback(async (id?: string) => {
    const targetId = id ?? lessonId;
    if (!targetId) return null;
    try {
      const result = await startMutation.mutateAsync({ lessonId: targetId });
      startTimeRef.current = Date.now();
      setState((prev) => ({
        ...prev,
        sessionId: result.sessionId,
        exercises: result.exercises as Exercise[],
        currentIndex: 0,
        results: [],
        phase: "answering" as const,
        feedback: null,
        explain: { loading: false, explanation: null, remaining: null, error: null },
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

  const submitAnswer = useCallback(async (answer: string) => {
    const exercise = state.exercises[state.currentIndex];
    if (!state.sessionId || !exercise) return null;

    setState((prev) => ({ ...prev, phase: "submitting" as const }));

    try {
      const result = await submitMutation.mutateAsync({
        sessionId: state.sessionId,
        exerciseId: exercise.id,
        answer,
      });

      setState((prev) => ({
        ...prev,
        phase: "feedback" as const,
        feedback: {
          correct: result.correct,
          correctAnswer: result.matchedAnswer ?? undefined,
          userAnswer: answer,
          l1Tip: result.l1Tip ?? undefined,
          warnings: result.warnings as PunctuationWarning[] | undefined,
        },
        explain: { loading: false, explanation: null, remaining: null, error: null },
        results: [...prev.results, {
          correct: result.correct,
          score: result.score,
          feedback: result.feedback,
        }],
      }));

      return result;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        phase: "answering" as const,
        error: err instanceof Error ? err.message : "Submit failed",
      }));
      return null;
    }
  }, [state.sessionId, state.exercises, state.currentIndex, submitMutation]);

  const requestExplanation = useCallback(async () => {
    const exercise = state.exercises[state.currentIndex];
    if (!exercise || !state.feedback) return;

    setState((prev) => ({
      ...prev,
      explain: { ...prev.explain, loading: true, error: null },
    }));

    try {
      const result = await explainMutation.mutateAsync({
        exerciseId: exercise.id,
        userAnswer: state.feedback.userAnswer,
        correctAnswer: state.feedback.correctAnswer ?? "",
      });

      setState((prev) => ({
        ...prev,
        explain: {
          loading: false,
          explanation: result.explanation,
          remaining: result.remaining,
          error: null,
        },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Explain failed";
      const isLimit = message.includes("daily_explain_limit_reached");
      setState((prev) => ({
        ...prev,
        explain: {
          loading: false,
          explanation: null,
          remaining: isLimit ? 0 : prev.explain.remaining,
          error: isLimit ? "limit_reached" : message,
        },
      }));
    }
  }, [state.exercises, state.currentIndex, state.feedback, explainMutation]);

  const nextExercise = useCallback(() => {
    setState((prev) => {
      const wrongExercise = prev.feedback && !prev.feedback.correct
        ? prev.exercises[prev.currentIndex]
        : null;

      const exercises = wrongExercise
        ? [...prev.exercises, wrongExercise]
        : prev.exercises;

      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= exercises.length;

      return {
        ...prev,
        exercises,
        currentIndex: nextIndex,
        feedback: null,
        explain: { loading: false, explanation: null, remaining: null, error: null },
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
  const elapsedMs = Date.now() - startTimeRef.current;

  return {
    sessionId: state.sessionId,
    phase: state.phase,
    exercises: state.exercises,
    currentExercise,
    currentIndex: state.currentIndex,
    results: state.results,
    progress,
    totalExercises: state.exercises.length,
    feedback: state.feedback,
    explain: state.explain,
    submitAnswer,
    isSubmitting: state.phase === "submitting",
    requestExplanation,
    nextExercise,
    isComplete: state.phase === "complete",
    startLesson,
    completeLesson,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    error: state.error,
    elapsedMs,
    startTimeRef,
  };
}
