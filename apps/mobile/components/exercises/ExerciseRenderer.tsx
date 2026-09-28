import React from "react";
import { TranslateExercise } from "./TranslateExercise";
import { FillBlank } from "./FillBlank";
import { ListenAndType } from "./ListenAndType";
import { MatchPairs } from "./MatchPairs";
import { PickCorrect } from "./PickCorrect";
import { ReorderWords } from "./ReorderWords";
import { SpeakAndScore } from "./SpeakAndScore";

export type ExerciseData = {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  pairs?: Array<{ left: string; right: string }>;
  sentence?: string;
  words?: string[];
  audioUrl?: string;
  l1Tip?: string;
  newWords?: string[];
};

export type ExerciseProps = {
  exercise: ExerciseData;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
};

const RENDERERS: Record<string, React.ComponentType<ExerciseProps>> = {
  translate: TranslateExercise,
  translate_l1_to_pt: TranslateExercise,
  translate_pt_to_l1: TranslateExercise,
  fill_blank: FillBlank,
  listen_type: ListenAndType,
  listen_and_type: ListenAndType,
  match_pairs: MatchPairs,
  pick_correct: PickCorrect,
  reorder: ReorderWords,
  reorder_words: ReorderWords,
  speak: SpeakAndScore,
  speak_and_score: SpeakAndScore,
};

export function ExerciseRenderer({ exercise, onAnswer, disabled }: ExerciseProps) {
  const Component = RENDERERS[exercise.type];

  if (!Component) {
    return <PickCorrect exercise={exercise} onAnswer={onAnswer} disabled={disabled} />;
  }

  return <Component exercise={exercise} onAnswer={onAnswer} disabled={disabled} />;
}
