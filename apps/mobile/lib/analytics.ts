import { addBreadcrumb } from "./sentry";
import { getString, KEYS } from "./storage";

type EventName =
  | "onboarding_start"
  | "onboarding_l1_selected"
  | "onboarding_goal_selected"
  | "onboarding_level_selected"
  | "onboarding_placement_complete"
  | "onboarding_plan_selected"
  | "onboarding_complete"
  | "lesson_start"
  | "lesson_complete"
  | "lesson_quit"
  | "lesson_out_of_hearts"
  | "exercise_answer"
  | "exercise_explain"
  | "review_start"
  | "review_complete"
  | "conversation_start"
  | "conversation_end"
  | "shop_view"
  | "shop_purchase"
  | "shop_subscribe"
  | "super_trial_start"
  | "super_subscribe"
  | "ad_shown"
  | "ad_reward_earned"
  | "streak_achieved"
  | "streak_lost"
  | "achievement_unlocked"
  | "leaderboard_view"
  | "profile_view"
  | "reference_view"
  | "settings_change"
  | "error_boundary";

type EventProperties = Record<string, string | number | boolean | null>;

const queue: Array<{ name: EventName; properties: EventProperties; timestamp: number }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL = 30_000;
const MAX_QUEUE = 50;

function getBaseProperties(): EventProperties {
  return {
    l1: getString(KEYS.SELECTED_L1) ?? "unknown",
    platform: require("react-native").Platform.OS,
    app_version: require("expo-application").nativeApplicationVersion ?? "0.1.0",
  };
}

export function track(name: EventName, properties: EventProperties = {}) {
  const event = {
    name,
    properties: { ...getBaseProperties(), ...properties },
    timestamp: Date.now(),
  };

  addBreadcrumb("analytics", name, event.properties);

  queue.push(event);

  if (queue.length >= MAX_QUEUE) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL);
  }
}

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (queue.length === 0) return;

  const batch = queue.splice(0, queue.length);

  const endpoint = process.env["EXPO_PUBLIC_ANALYTICS_ENDPOINT"];
  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    queue.unshift(...batch);
  }
}

export function flushSync() {
  flush();
}

export function trackScreenView(screenName: string) {
  addBreadcrumb("navigation", `Viewed ${screenName}`);
}

export function trackLessonStart(lessonId: string, exerciseCount: number) {
  track("lesson_start", { lesson_id: lessonId, exercise_count: exerciseCount });
}

export function trackLessonComplete(
  lessonId: string,
  elapsedSeconds: number,
  xpEarned: number,
  ouroEarned: number,
  accuracy: number,
) {
  track("lesson_complete", {
    lesson_id: lessonId,
    elapsed_seconds: elapsedSeconds,
    xp_earned: xpEarned,
    ouro_earned: ouroEarned,
    accuracy,
  });
}

export function trackLessonQuit(lessonId: string, exerciseIndex: number, totalExercises: number) {
  track("lesson_quit", {
    lesson_id: lessonId,
    exercise_index: exerciseIndex,
    total_exercises: totalExercises,
    completion_pct: Math.round((exerciseIndex / totalExercises) * 100),
  });
}

export function trackExerciseAnswer(
  exerciseType: string,
  correct: boolean,
  elapsedMs: number,
) {
  track("exercise_answer", {
    exercise_type: exerciseType,
    correct,
    elapsed_ms: elapsedMs,
  });
}

export function trackExerciseExplain(exerciseId: string, remaining: number | null) {
  track("exercise_explain", { exercise_id: exerciseId, remaining: remaining ?? -1 });
}

export function trackPurchase(itemId: string, currency: "ouro" | "money", amount: number) {
  track("shop_purchase", { item_id: itemId, currency, amount });
}

export function trackOnboardingStep(
  step: string,
  value?: string,
) {
  const name = `onboarding_${step}` as EventName;
  track(name, value ? { value } : {});
}

export function trackError(error: string, context?: string) {
  track("error_boundary", { error, context: context ?? "" });
}
