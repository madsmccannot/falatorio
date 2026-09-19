export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export const EXERCISE_TYPES = [
  "translate_l1_to_pt",
  "translate_pt_to_l1",
  "listen_and_type",
  "speak_and_score",
  "fill_blank",
  "match_pairs",
  "pick_correct",
  "reorder_words",
] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const L1_CODES = [
  "en", "es", "fr", "hi", "ur", "ar", "bn",
  "de", "zh", "ru", "uk", "tr", "pl", "ko", "ja",
] as const;
export type L1Code = (typeof L1_CODES)[number];

export const L1_PHASE_1: readonly L1Code[] = ["en", "es", "fr", "hi", "ur", "ar", "bn"];
export const L1_PHASE_2: readonly L1Code[] = ["de", "zh", "ru", "uk", "tr", "pl", "ko", "ja"];

export const USER_GOALS = [
  "tourism",
  "residency",
  "work",
  "citizenship",
  "family",
  "academic",
] as const;
export type UserGoal = (typeof USER_GOALS)[number];

export const TIERS = ["free", "super"] as const;
export type Tier = (typeof TIERS)[number];

export const LEAGUE_TIERS = [
  "bronze", "silver", "gold", "diamond", "obsidian",
] as const;
export type LeagueTier = (typeof LEAGUE_TIERS)[number];

export const CONTENT_STATUS = ["draft", "in_review", "published"] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];

export const EXERCISE_STATUS = ["draft", "review", "live"] as const;
export type ExerciseStatus = (typeof EXERCISE_STATUS)[number];

export const AUDIO_REGIONS = [
  "lisboa", "porto", "algarve", "acores", "madeira",
] as const;
export type AudioRegion = (typeof AUDIO_REGIONS)[number];

export const CULTURAL_CONTENT_TYPES = [
  "joke", "expression", "meme", "reference",
] as const;
export type CulturalContentType = (typeof CULTURAL_CONTENT_TYPES)[number];

export const TRANSACTION_TYPES = [
  "earn", "spend", "iap", "refund",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const AD_TYPES = ["banner", "interstitial", "reward"] as const;
export type AdType = (typeof AD_TYPES)[number];

export const AD_REWARD_TYPES = ["heart", "crystal"] as const;
export type AdRewardType = (typeof AD_REWARD_TYPES)[number];

export const SHOP_ITEM_TYPES = ["consumable", "subscription"] as const;
export type ShopItemType = (typeof SHOP_ITEM_TYPES)[number];

// ─── Game economy constants ───

export const HEARTS = {
  MAX: 5,
  REFILL_INTERVAL_MS: 4 * 60 * 60 * 1000,
  COST_REFILL_ONE: 30,
  COST_CONTINUE_LESSON: 50,
  CONTINUE_COST: 50,
  REFILL_COST: 30,
  REWARD_AD_AMOUNT: 1,
} as const;

export const CRYSTALS = {
  EARN_LESSON_COMPLETE: 5,
  EARN_PERFECT_LESSON: 10,
  EARN_DAILY_STREAK: 2,
  EARN_REWARD_AD: 15,
  EARN_MILESTONE_100_LESSONS: 50,
  COST_STREAK_FREEZE: 50,
  COST_HEART_REFILL: 30,
  COST_CONTINUE_LESSON: 50,
  COST_XP_BOOST: 100,
  COST_TIME_EXTEND: 450,
  COST_FULL_ENERGY: 120,
} as const;

export const IAP_TIERS = [
  { id: "crystals_1200", amount: 1200, priceEur: 4.99 },
  { id: "crystals_3000", amount: 3000, priceEur: 9.99 },
  { id: "crystals_6500", amount: 6500, priceEur: 20.99 },
] as const;

export const SUPER_PRICING = {
  MONTHLY_EUR: 7.99,
  YEARLY_EUR: 59.99,
  TRIAL_DAYS: 7,
} as const;

export const XP = {
  BASE_PER_EXERCISE: 10,
  BONUS_PERFECT: 5,
  BONUS_FIRST_OF_DAY: 10,
  STREAK_MULTIPLIER_WEEK: 1.0,
  STREAK_MULTIPLIER_MONTH: 1.5,
  STREAK_MULTIPLIER_BEYOND: 2.0,
  BOOST_MULTIPLIER: 2,
  BOOST_DURATION_MS: 15 * 60 * 1000,
} as const;

export const LEAGUE = {
  USERS_PER_LEAGUE: 30,
  PROMOTE_TOP: 10,
  DEMOTE_BOTTOM: 5,
} as const;

export const LESSON = {
  EXERCISES_PER_LESSON: 15,
  NEW_RATIO: 0.6,
  REVIEW_RATIO: 0.4,
  CULTURAL_ITEMS_PER_SESSION: 2,
  PASS_THRESHOLD: 0.8,
  REVIEW_ITEMS_MAX: 20,
} as const;

export const ADS = {
  BANNER_HEIGHT_PX: 50,
  INTERSTITIAL_EVERY_N_LESSONS: 5,
  INTERSTITIAL_COOLDOWN_MS: 30 * 60 * 1000,
  REWARD_COOLDOWN_MS: 30 * 60 * 1000,
  SKIP_DELAY_SECONDS: 5,
} as const;

export const PLACEMENT_TEST = {
  QUESTIONS: 20,
} as const;

export const EXPLAINS = {
  FREE_DAILY_LIMIT: 3,
  SUPER_LIMIT: Infinity,
} as const;
