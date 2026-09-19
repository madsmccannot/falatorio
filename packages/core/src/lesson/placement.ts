import type { CEFRLevel, L1Code } from "../constants.js";
import { CEFR_LEVELS, PLACEMENT_TEST } from "../constants.js";

export interface PlacementQuestion {
  id: string;
  difficulty: number;
  cefrTarget: CEFRLevel;
}

export interface PlacementState {
  questions: readonly PlacementQuestion[];
  currentIndex: number;
  responses: readonly PlacementResponse[];
  estimatedAbility: number;
}

export interface PlacementResponse {
  questionId: string;
  correct: boolean;
  difficulty: number;
}

export interface PlacementResult {
  cefrLevel: CEFRLevel;
  ability: number;
  questionsAnswered: number;
  accuracy: number;
}

const L1_STARTING_ABILITY: Partial<Record<L1Code, number>> = {
  es: 2.5,
  fr: 1.5,
  en: 1.0,
  de: 1.0,
  hi: 0.5,
  ur: 0.5,
  ar: 0.5,
  bn: 0.5,
  zh: 0.5,
  ja: 0.5,
  ko: 0.5,
  ru: 0.5,
  uk: 0.5,
  tr: 0.5,
  pl: 0.8,
};

export function getStartingAbility(l1: L1Code): number {
  return L1_STARTING_ABILITY[l1] ?? 0.5;
}

export function createPlacementState(
  questions: readonly PlacementQuestion[],
  l1: L1Code,
): PlacementState {
  return {
    questions,
    currentIndex: 0,
    responses: [],
    estimatedAbility: getStartingAbility(l1),
  };
}

export function selectNextQuestion(
  state: PlacementState,
): PlacementQuestion | null {
  if (state.currentIndex >= PLACEMENT_TEST.QUESTIONS) return null;
  if (state.currentIndex >= state.questions.length) return null;

  const remaining = state.questions.filter(
    (q) => !state.responses.some((r) => r.questionId === q.id),
  );

  let best: PlacementQuestion | null = null;
  let bestDiff = Infinity;

  for (const q of remaining) {
    const diff = Math.abs(q.difficulty - state.estimatedAbility);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = q;
    }
  }

  return best;
}

export function recordPlacementResponse(
  state: PlacementState,
  questionId: string,
  correct: boolean,
  difficulty: number,
): PlacementState {
  const response: PlacementResponse = { questionId, correct, difficulty };
  const responses = [...state.responses, response];

  const step = correct ? 0.3 : -0.3;
  const damping = 1 / (1 + responses.length * 0.1);
  const estimatedAbility = Math.max(
    0,
    Math.min(6, state.estimatedAbility + step * damping),
  );

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    responses,
    estimatedAbility,
  };
}

export function getPlacementResult(state: PlacementState): PlacementResult {
  const ability = state.estimatedAbility;
  const correctCount = state.responses.filter((r) => r.correct).length;
  const accuracy = state.responses.length > 0
    ? correctCount / state.responses.length
    : 0;

  let cefrLevel: CEFRLevel;
  if (ability < 1) cefrLevel = "A1";
  else if (ability < 2) cefrLevel = "A2";
  else if (ability < 3) cefrLevel = "B1";
  else if (ability < 4) cefrLevel = "B2";
  else if (ability < 5) cefrLevel = "C1";
  else cefrLevel = "C2";

  return {
    cefrLevel,
    ability,
    questionsAnswered: state.responses.length,
    accuracy,
  };
}
