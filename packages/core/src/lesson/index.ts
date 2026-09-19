export {
  createSession,
  startSession,
  recordAnswer,
  continueWithCrystals,
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
  type CandidateExercise,
  type SelectionConfig,
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
