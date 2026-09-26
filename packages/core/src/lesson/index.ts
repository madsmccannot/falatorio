export {
  createSession,
  startSession,
  recordAnswer,
  continueWithOuro,
  abandonSession,
  completeSession,
  isSessionComplete,
  getAccuracy,
  didPass,
  getCurrentExercise,
  type SessionState,
  type SessionStatus,
  type ExerciseItem,
  type AnswerResult,
} from "./session-state.js";
export {
  selectExercises,
  selectAdaptive,
  type CandidateExercise,
  type SelectionConfig,
  type AdaptiveSelectionInput,
} from "./adaptive-selector.js";
export {
  createPlacementState,
  selectNextQuestion,
  recordPlacementResponse,
  getPlacementResult,
  getStartingAbility,
  type PlacementState,
  type PlacementQuestion,
  type PlacementResult,
} from "./placement.js";
export {
  analyzeErrors,
  escalate,
  shouldTriggerExplanation,
  getExplanationContext,
  type ErrorRecord,
  type ErrorPattern,
  type ErrorEscalation,
} from "./error-engine.js";
export {
  computeDifficulty,
  selectCognitiveLevel,
  type DifficultyProfile,
  type DifficultyInput,
} from "./difficulty-controller.js";
