import type { CEFRLevel, CognitiveLevel } from "../constants.js";
import { CEFR_LEVELS, COGNITIVE_LEVELS } from "../constants.js";
import type { KnowledgeItem, Skill, SkillDomain } from "./types.js";
import { SKILL_DOMAINS } from "./types.js";

export type QAResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateKnowledgeItemSchema(ki: KnowledgeItem): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ki.code || !ki.code.startsWith("PT.")) {
    errors.push(`Invalid code format: ${ki.code} (must start with PT.)`);
  }

  if (!CEFR_LEVELS.includes(ki.cefrLevel as CEFRLevel)) {
    errors.push(`Invalid CEFR level: ${ki.cefrLevel}`);
  }

  if (!ki.rule || ki.rule.trim().length === 0) {
    errors.push("Missing rule");
  }

  if (!ki.examples || ki.examples.length === 0) {
    errors.push("Missing examples (at least one required)");
  }

  if (!ki.masteryCriteria) {
    warnings.push("Missing mastery criteria");
  } else {
    const c = ki.masteryCriteria;
    if (c.minAccuracy < 0 || c.minAccuracy > 1) {
      errors.push(`Invalid minAccuracy: ${c.minAccuracy} (must be 0-1)`);
    }
    if (c.minVariety < 0 || c.minVariety > 1) {
      errors.push(`Invalid minVariety: ${c.minVariety} (must be 0-1)`);
    }
    if (c.minReps < 1) {
      errors.push(`Invalid minReps: ${c.minReps} (must be >= 1)`);
    }
  }

  if (!ki.exerciseTypes || ki.exerciseTypes.length === 0) {
    warnings.push("No exercise types specified");
  } else {
    for (const et of ki.exerciseTypes) {
      if (!COGNITIVE_LEVELS.includes(et as CognitiveLevel)) {
        errors.push(`Invalid exercise type: ${et}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateSkillSchema(skill: Skill): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!skill.code || !skill.code.startsWith("PT.")) {
    errors.push(`Invalid code format: ${skill.code}`);
  }

  if (!SKILL_DOMAINS.includes(skill.domain as SkillDomain)) {
    errors.push(`Invalid domain: ${skill.domain}`);
  }

  if (!CEFR_LEVELS.includes(skill.cefrLevel as CEFRLevel)) {
    errors.push(`Invalid CEFR level: ${skill.cefrLevel}`);
  }

  if (!skill.name || !skill.name["pt"]) {
    errors.push("Missing PT name");
  }

  if (!skill.name || !skill.name["en"]) {
    warnings.push("Missing EN name");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateGraphIntegrity(
  skills: Skill[],
  knowledgeItems: KnowledgeItem[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const skillIds = new Set(skills.map((s) => s.id));

  for (const ki of knowledgeItems) {
    if (!skillIds.has(ki.skillId)) {
      errors.push(`KI ${ki.code} references unknown skill ID: ${ki.skillId}`);
    }
  }

  for (const p of prerequisites) {
    if (!skillIds.has(p.skillId)) {
      errors.push(`Prerequisite references unknown skill: ${p.skillId}`);
    }
    if (!skillIds.has(p.prerequisiteId)) {
      errors.push(`Prerequisite references unknown prerequisite: ${p.prerequisiteId}`);
    }
    if (p.skillId === p.prerequisiteId) {
      errors.push(`Self-referencing prerequisite: ${p.skillId}`);
    }
  }

  const adjList = new Map<string, string[]>();
  for (const p of prerequisites) {
    if (!adjList.has(p.skillId)) adjList.set(p.skillId, []);
    adjList.get(p.skillId)!.push(p.prerequisiteId);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  function hasCycle(node: string): boolean {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    inStack.add(node);
    for (const neighbor of adjList.get(node) ?? []) {
      if (hasCycle(neighbor)) return true;
    }
    inStack.delete(node);
    return false;
  }
  for (const id of skillIds) {
    if (hasCycle(id)) {
      errors.push(`Cycle detected in prerequisite graph involving: ${id}`);
      break;
    }
  }

  const skillsWithKIs = new Set(knowledgeItems.map((k) => k.skillId));
  for (const s of skills) {
    if (!skillsWithKIs.has(s.id)) {
      warnings.push(`Skill ${s.code} has no KnowledgeItems`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateLinguisticCompleteness(ki: KnowledgeItem): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ki.rule || ki.rule.length < 10) {
    errors.push("Rule too short or missing");
  }

  if (!ki.examples || ki.examples.length < 1) {
    errors.push("At least one example required");
  }

  if (!ki.masteryCriteria) {
    errors.push("Mastery criteria required for published KI");
  }

  if (!ki.exerciseTypes || ki.exerciseTypes.length === 0) {
    errors.push("At least one exercise type required");
  }

  if (!ki.counterexamples || ki.counterexamples.length === 0) {
    warnings.push("No counterexamples provided");
  }

  if (!ki.commonErrors || ki.commonErrors.length === 0) {
    warnings.push("No common errors documented");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function runFullQA(
  skills: Skill[],
  knowledgeItems: KnowledgeItem[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): QAResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const s of skills) {
    const r = validateSkillSchema(s);
    allErrors.push(...r.errors.map((e) => `[${s.code}] ${e}`));
    allWarnings.push(...r.warnings.map((w) => `[${s.code}] ${w}`));
  }

  for (const ki of knowledgeItems) {
    const schema = validateKnowledgeItemSchema(ki);
    allErrors.push(...schema.errors.map((e) => `[${ki.code}] ${e}`));
    allWarnings.push(...schema.warnings.map((w) => `[${ki.code}] ${w}`));

    const linguistic = validateLinguisticCompleteness(ki);
    allErrors.push(...linguistic.errors.map((e) => `[${ki.code}] ${e}`));
    allWarnings.push(...linguistic.warnings.map((w) => `[${ki.code}] ${w}`));
  }

  const graph = validateGraphIntegrity(skills, knowledgeItems, prerequisites);
  allErrors.push(...graph.errors);
  allWarnings.push(...graph.warnings);

  return { valid: allErrors.length === 0, errors: allErrors, warnings: allWarnings };
}
