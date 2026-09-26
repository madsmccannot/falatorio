export { scoreTextAnswer, type TextScoreResult } from "./text-scorer.js";
export { scoreSpeechAnswer, type SpeechScoreResult } from "./speech-scorer.js";
export {
  normalizeForComparison,
  arePhoneticEquivalents,
  PTEU_PHONETIC_RULES,
  type PhoneticRule,
} from "./phonetic-rules-pteu.js";
export {
  selectRegionalAudio,
  getRandomRegion,
  PT_REGIONS,
  type PTRegion,
  type RegionalAudioConfig,
} from "./regional-audio.js";
