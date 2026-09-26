import { validateTaxonomy, SKILLS, KNOWLEDGE_ITEMS } from "./taxonomy.js";

const errors = validateTaxonomy();
if (errors.length) {
  console.log("ERRORS:");
  errors.forEach((e: string) => console.log("  -", e));
  process.exit(1);
} else {
  console.log("Taxonomy valid.");
}

const domains = new Map<string, number>();
for (const s of SKILLS) {
  domains.set(s.domain, (domains.get(s.domain) || 0) + 1);
}
const levels = new Map<string, number>();
for (const s of SKILLS) {
  levels.set(s.cefrLevel, (levels.get(s.cefrLevel) || 0) + 1);
}
console.log("\nSkills:", SKILLS.length);
console.log("KnowledgeItems:", KNOWLEDGE_ITEMS.length);
console.log("\nBy domain:");
for (const [d, c] of [...domains].sort()) console.log(" ", d, c);
console.log("\nBy CEFR:");
for (const [l, c] of [...levels].sort()) console.log(" ", l, c);

let withExerciseTypes = 0;
let withL1Difficulty = 0;
let withRelatedTo = 0;
let withConfusableWith = 0;
let withCounterexamples = 0;
let withCommonErrors = 0;
let withMasteryCriteria = 0;
for (const k of KNOWLEDGE_ITEMS) {
  if (k.exerciseTypes?.length) withExerciseTypes++;
  if (k.l1Difficulty && Object.keys(k.l1Difficulty).length) withL1Difficulty++;
  if (k.relatedTo?.length) withRelatedTo++;
  if (k.confusableWith?.length) withConfusableWith++;
  if (k.counterexamples?.length) withCounterexamples++;
  if (k.commonErrors?.length) withCommonErrors++;
  if (k.masteryCriteria) withMasteryCriteria++;
}
console.log("\nKI coverage:");
console.log("  exerciseTypes:", withExerciseTypes, "/", KNOWLEDGE_ITEMS.length);
console.log("  l1Difficulty:", withL1Difficulty, "/", KNOWLEDGE_ITEMS.length);
console.log("  relatedTo:", withRelatedTo, "/", KNOWLEDGE_ITEMS.length);
console.log("  confusableWith:", withConfusableWith, "/", KNOWLEDGE_ITEMS.length);
console.log("  counterexamples:", withCounterexamples, "/", KNOWLEDGE_ITEMS.length);
console.log("  commonErrors:", withCommonErrors, "/", KNOWLEDGE_ITEMS.length);
console.log("  masteryCriteria:", withMasteryCriteria, "/", KNOWLEDGE_ITEMS.length);

// --- Vertical slice completeness (#57/#58) ---
const VERTICAL_SLICES = [
  "PT.TENSES.PRESENT",
  "PT.PREP.BASIC",
  "PT.SYNTAX.DIRECT_OBJECT",
  "PT.SYNTAX.SUB.CAUSAL",
  "PT.SEM.ASPECT.HABITUAL",
  "PT.DISCOURSE.COHESION.LEXICAL",
  "PT.RHETORIC.METAPHOR",
];

console.log("\nVertical slices:");
for (const skillCode of VERTICAL_SLICES) {
  const skill = SKILLS.find((s) => s.code === skillCode);
  if (!skill) {
    console.log(`  ${skillCode}: MISSING SKILL`);
    continue;
  }
  const kis = KNOWLEDGE_ITEMS.filter((k) => k.skillCode === skillCode);
  const hasCounterex = kis.some((k) => k.counterexamples?.length);
  const hasErrors = kis.some((k) => k.commonErrors?.length);
  const hasL1 = kis.some((k) => k.l1Difficulty && Object.keys(k.l1Difficulty).length);
  const uniqueTypes = new Set(kis.flatMap((k) => k.exerciseTypes ?? []));
  const allHaveCriteria = kis.every((k) => k.masteryCriteria);
  const complete = kis.length >= 2 && hasCounterex && hasErrors && hasL1 && uniqueTypes.size >= 3 && allHaveCriteria;
  console.log(
    `  ${skillCode}: ${kis.length} KIs, ${uniqueTypes.size} types, ` +
    `counterex=${hasCounterex}, errors=${hasErrors}, l1=${hasL1}, criteria=${allHaveCriteria} ` +
    `→ ${complete ? "COMPLETE" : "INCOMPLETE"}`,
  );
}
