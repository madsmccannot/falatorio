export {
  hasFeature,
  getFeatures,
  getLockedFeatures,
  FEATURES,
  type Feature,
} from "./feature-gates.js";
export {
  checkAccess,
  getExplainLimit,
  isSuperActive,
  getEffectiveTier,
  type UserEntitlements,
} from "./check-access.js";
export {
  getHearts,
  spendHeart,
  refillOneHeart,
  refillAllHearts,
  canStartLesson,
  getTimeUntilRefill,
  type HeartState,
} from "./heart-system.js";
