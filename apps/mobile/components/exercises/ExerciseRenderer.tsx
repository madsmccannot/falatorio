import React, { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { TranslateExercise } from "./TranslateExercise";
import { FillBlank } from "./FillBlank";
import { MatchPairs } from "./MatchPairs";
import { PickCorrect } from "./PickCorrect";
import { ReorderWords } from "./ReorderWords";

const ListenAndType = React.lazy(() =>
  import("./ListenAndType").then((m) => ({ default: m.ListenAndType }))
);
const SpeakAndScore = React.lazy(() =>
  import("./SpeakAndScore").then((m) => ({ default: m.SpeakAndScore }))
);

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

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Component exercise={exercise} onAnswer={onAnswer} disabled={disabled} />
    </Suspense>
  );
}
