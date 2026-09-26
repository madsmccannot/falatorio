import type { ExerciseType, CognitiveLevel, L1Code } from "../constants.js";

export interface ErrorRecord {
  knowledgeItemId: string;
  exerciseType: ExerciseType;
  cognitiveLevel: CognitiveLevel;
  score: number;
  answeredAt: Date;
}

export interface ErrorPattern {
  knowledgeItemId: string;
  totalErrors: number;
  consecutiveErrors: number;
  errorRate: number;
  lastErrorAt: Date;
  failingCognitiveLevels: CognitiveLevel[];
  severity: "low" | "medium" | "high" | "critical";
}

export interface ErrorEscalation {
  knowledgeItemId: string;
  action: "reteach" | "simplify" | "explain" | "drill";
  reason: string;
  targetCognitiveLevel: CognitiveLevel;
  priority: number;
}

const WINDOW_SIZE = 20;
const ERROR_THRESHOLD = 0.4;
const CONSECUTIVE_TRIGGER = 3;
const CRITICAL_CONSECUTIVE = 5;

export function analyzeErrors(
  records: readonly ErrorRecord[],
  windowSize: number = WINDOW_SIZE,
): ErrorPattern[] {
  const byKI = new Map<string, ErrorRecord[]>();
  for (const r of records) {
    const list = byKI.get(r.knowledgeItemId) ?? [];
    list.push(r);
    byKI.set(r.knowledgeItemId, list);
  }

  const patterns: ErrorPattern[] = [];

  for (const [kiId, recs] of byKI) {
    const recent = recs
      .sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime())
      .slice(0, windowSize);

    const errors = recent.filter((r) => r.score < 0.5);
    const errorRate = errors.length / recent.length;

    if (errorRate < 0.2 && errors.length < 2) continue;

    let consecutive = 0;
    for (const r of recent) {
      if (r.score < 0.5) consecutive++;
      else break;
    }

    const failingLevels = new Set<CognitiveLevel>();
    for (const e of errors) {
      failingLevels.add(e.cognitiveLevel);
    }

    const severity = classifySeverity(errorRate, consecutive);

    patterns.push({
      knowledgeItemId: kiId,
      totalErrors: errors.length,
      consecutiveErrors: consecutive,
      errorRate,
      lastErrorAt: recent[0]!.answeredAt,
      failingCognitiveLevels: [...failingLevels],
      severity,
    });
  }

  return patterns.sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity));
}

function classifySeverity(
  errorRate: number,
  consecutive: number,
): ErrorPattern["severity"] {
  if (consecutive >= CRITICAL_CONSECUTIVE || errorRate >= 0.8) return "critical";
  if (consecutive >= CONSECUTIVE_TRIGGER || errorRate >= ERROR_THRESHOLD) return "high";
  if (errorRate >= 0.3) return "medium";
  return "low";
}

function severityOrder(s: ErrorPattern["severity"]): number {
  const map = { low: 0, medium: 1, high: 2, critical: 3 };
  return map[s];
}

const COGNITIVE_ORDER: CognitiveLevel[] = [
  "recognition",
  "comprehension",
  "controlled_production",
  "transformation",
  "translation",
  "free_production",
  "communication",
];

function cognitiveIndex(level: CognitiveLevel): number {
  return COGNITIVE_ORDER.indexOf(level);
}

export function escalate(patterns: ErrorPattern[]): ErrorEscalation[] {
  const escalations: ErrorEscalation[] = [];

  for (const p of patterns) {
    if (p.severity === "low") continue;

    const highestFailing = p.failingCognitiveLevels.reduce((a, b) =>
      cognitiveIndex(a) >= cognitiveIndex(b) ? a : b,
    );
    const highestIdx = cognitiveIndex(highestFailing);

    if (p.severity === "critical") {
      const targetLevel = COGNITIVE_ORDER[Math.max(0, highestIdx - 2)] ?? "recognition";
      escalations.push({
        knowledgeItemId: p.knowledgeItemId,
        action: "reteach",
        reason: `${p.consecutiveErrors} consecutive errors, ${Math.round(p.errorRate * 100)}% error rate`,
        targetCognitiveLevel: targetLevel,
        priority: 10 + p.consecutiveErrors,
      });
    } else if (p.severity === "high") {
      const targetLevel = COGNITIVE_ORDER[Math.max(0, highestIdx - 1)] ?? "recognition";
      escalations.push({
        knowledgeItemId: p.knowledgeItemId,
        action: highestIdx >= 3 ? "simplify" : "explain",
        reason: `${p.totalErrors} errors in window, failing at ${p.failingCognitiveLevels.join(", ")}`,
        targetCognitiveLevel: targetLevel,
        priority: 5 + p.totalErrors,
      });
    } else {
      escalations.push({
        knowledgeItemId: p.knowledgeItemId,
        action: "drill",
        reason: `${Math.round(p.errorRate * 100)}% error rate, needs reinforcement`,
        targetCognitiveLevel: highestFailing,
        priority: 2,
      });
    }
  }

  return escalations.sort((a, b) => b.priority - a.priority);
}

export function shouldTriggerExplanation(pattern: ErrorPattern): boolean {
  return (
    pattern.severity === "critical" ||
    (pattern.severity === "high" && pattern.consecutiveErrors >= CONSECUTIVE_TRIGGER)
  );
}

export function getExplanationContext(
  pattern: ErrorPattern,
  l1: L1Code,
): { knowledgeItemId: string; l1: L1Code; failingLevels: CognitiveLevel[]; errorRate: number } {
  return {
    knowledgeItemId: pattern.knowledgeItemId,
    l1,
    failingLevels: pattern.failingCognitiveLevels,
    errorRate: pattern.errorRate,
  };
}
