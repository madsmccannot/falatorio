import type { ExerciseType, Tier } from "../constants.js";
import { LESSON } from "../constants.js";

export interface ExerciseItem {
  id: string;
  type: ExerciseType;
  isReview: boolean;
  isCultural: boolean;
}

export type SessionStatus =
  | "ready"
  | "in_progress"
  | "out_of_hearts"
  | "completed"
  | "abandoned";

export interface SessionState {
  lessonId: string;
  exercises: readonly ExerciseItem[];
  currentIndex: number;
  hearts: number | null;
  correctCount: number;
  incorrectCount: number;
  xpEarned: number;
  status: SessionStatus;
  tier: Tier;
}

export interface AnswerResult {
  correct: boolean;
  score: number;
  heartsRemaining: number | null;
  outOfHearts: boolean;
  feedback: string;
  l1Tip: string | null;
}

export function createSession(
  lessonId: string,
  exercises: readonly ExerciseItem[],
  hearts: number | null,
  tier: Tier,
): SessionState {
  return {
    lessonId,
    exercises,
    currentIndex: 0,
    hearts,
    correctCount: 0,
    incorrectCount: 0,
    xpEarned: 0,
    status: "ready",
    tier,
  };
}

export function startSession(session: SessionState): SessionState {
  if (session.tier === "free" && session.hearts !== null && session.hearts <= 0) {
    return { ...session, status: "out_of_hearts" };
  }
  return { ...session, status: "in_progress" };
}

export function recordAnswer(
  session: SessionState,
  correct: boolean,
  score: number,
  l1Tip: string | null,
): { session: SessionState; result: AnswerResult } {
  if (session.status !== "in_progress") {
    throw new Error(`Cannot record answer in status: ${session.status}`);
  }

  let newHearts = session.hearts;
  let outOfHearts = false;

  if (!correct && newHearts !== null) {
    newHearts = Math.max(0, newHearts - 1);
    if (newHearts === 0) {
      outOfHearts = true;
    }
  }

  const xpGained = correct ? Math.round(10 * score) : 0;

  const updatedSession: SessionState = {
    ...session,
    currentIndex: outOfHearts ? session.currentIndex : session.currentIndex + 1,
    hearts: newHearts,
    correctCount: session.correctCount + (correct ? 1 : 0),
    incorrectCount: session.incorrectCount + (correct ? 0 : 1),
    xpEarned: session.xpEarned + xpGained,
    status: outOfHearts ? "out_of_hearts" : session.status,
  };

  const result: AnswerResult = {
    correct,
    score,
    heartsRemaining: newHearts,
    outOfHearts,
    feedback: correct ? "correct" : "incorrect",
    l1Tip,
  };

  return { session: updatedSession, result };
}

export function continueWithCrystals(session: SessionState): SessionState {
  if (session.status !== "out_of_hearts") {
    throw new Error("Session is not out of hearts");
  }
  return {
    ...session,
    hearts: null,
    status: "in_progress",
    currentIndex: session.currentIndex + 1,
  };
}

export function abandonSession(session: SessionState): SessionState {
  return { ...session, status: "abandoned" };
}

export function completeSession(session: SessionState): SessionState {
  if (session.currentIndex < session.exercises.length) {
    throw new Error("Not all exercises completed");
  }
  return { ...session, status: "completed" };
}

export function isSessionComplete(session: SessionState): boolean {
  return session.currentIndex >= session.exercises.length;
}

export function getAccuracy(session: SessionState): number {
  const total = session.correctCount + session.incorrectCount;
  return total > 0 ? session.correctCount / total : 0;
}

export function didPass(session: SessionState): boolean {
  return getAccuracy(session) >= LESSON.PASS_THRESHOLD;
}

export function getCurrentExercise(session: SessionState): ExerciseItem | null {
  return session.exercises[session.currentIndex] ?? null;
}
