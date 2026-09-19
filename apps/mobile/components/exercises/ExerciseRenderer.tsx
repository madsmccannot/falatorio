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
};

export type ExerciseProps = {
  exercise: ExerciseData;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
};

const RENDERERS: Record<string, React.ComponentType<ExerciseProps>> = {
  translate: TranslateExercise,
  fill_blank: FillBlank,
  listen_type: ListenAndType,
  match_pairs: MatchPairs,
  pick_correct: PickCorrect,
  reorder: ReorderWords,
  speak: SpeakAndScore,
};

export function ExerciseRenderer({ exercise, onAnswer, disabled }: ExerciseProps) {
  const Component = RENDERERS[exercise.type];

  if (!Component) {
    return <PickCorrect exercise={exercise} onAnswer={onAnswer} disabled={disabled} />;
  }

  return <Component exercise={exercise} onAnswer={onAnswer} disabled={disabled} />;
}
