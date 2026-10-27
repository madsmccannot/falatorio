import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { trackExerciseAnswer, trackExerciseExplain } from "@/lib/analytics";
import { useOffline } from "@/components/OfflineSyncProvider";

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && /network|fetch|abort/i.test(err.message)) return true;
  if (err instanceof Error && /ECONNREFUSED|ETIMEDOUT|network/i.test(err.message)) return true;
  return false;
}

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

function extractTargetText(prompt: unknown): string {
  if (typeof prompt === "string") {
    try { const obj = JSON.parse(prompt); return obj.targetText ?? obj.sentence ?? obj.text ?? prompt; }
    catch { return prompt; }
  }
  if (typeof prompt === "object" && prompt !== null) {
    const p = prompt as Record<string, unknown>;
    return String(p["targetText"] ?? p["sentence"] ?? p["text"] ?? JSON.stringify(prompt));
  }
  return String(prompt);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function speechToReorder(ex: Exercise): Exercise {
  const sentence = extractTargetText(ex.prompt);
  return { ...ex, type: "reorder_words", words: shuffle(sentence.split(/\s+/)), sentence };
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

  const { enqueue, markOffline } = useOffline();
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

  const skipSpeech = useCallback(() => {
    setState((prev) => {
      const exercises = prev.exercises.map((ex, i) => {
        if (i < prev.currentIndex || ex.type !== "speak_and_score") return ex;
        return speechToReorder(ex);
      });
      return {
        ...prev,
        exercises,
        feedback: null,
        explain: { loading: false, explanation: null, remaining: null, error: null },
      };
    });
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    const exercise = state.exercises[state.currentIndex];
    if (!state.sessionId || !exercise) return null;

    const answerStartMs = Date.now();
    setState((prev) => ({ ...prev, phase: "submitting" as const }));

    try {
      const result = await submitMutation.mutateAsync({
        sessionId: state.sessionId,
        exerciseId: exercise.id,
        answer,
      });

      trackExerciseAnswer(exercise.type, result.correct, Date.now() - answerStartMs);

      if (!result.correct) {
        utils.hearts.getState.invalidate();
      }

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
      if (isNetworkError(err)) {
        enqueue("exerciseResult", {
          sessionId: state.sessionId,
          exerciseId: exercise.id,
          answer,
        });
        markOffline();
        setState((prev) => ({
          ...prev,
          phase: "feedback" as const,
          feedback: {
            correct: true,
            userAnswer: answer,
          },
          results: [...prev.results, {
            correct: true,
            score: 0,
            feedback: null,
          }],
        }));
        return { correct: true, offlineQueued: true };
      }
      setState((prev) => ({
        ...prev,
        phase: "answering" as const,
        error: err instanceof Error ? err.message : "Submit failed",
      }));
      return null;
    }
  }, [state.sessionId, state.exercises, state.currentIndex, submitMutation, enqueue, markOffline]);

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

      trackExerciseExplain(exercise.id, result.remaining);

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

    try {
      const result = await completeMutation.mutateAsync({
        sessionId: state.sessionId,
      });

      await utils.hearts.getState.invalidate();
      await utils.economy.getBalance.invalidate();
      await utils.gamification.getStreak.invalidate();
      await utils.content.getSectionMap.invalidate();

      return result;
    } catch (err) {
      if (isNetworkError(err)) {
        enqueue("lessonComplete", { sessionId: state.sessionId });
        markOffline();
        return { offlineQueued: true };
      }
      throw err;
    }
  }, [state.sessionId, completeMutation, utils, enqueue, markOffline]);

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
    skipSpeech,
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
