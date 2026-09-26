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
for (const k of KNOWLEDGE_ITEMS) {
  if (k.exerciseTypes?.length) withExerciseTypes++;
  if (k.l1Difficulty && Object.keys(k.l1Difficulty).length) withL1Difficulty++;
  if (k.relatedTo?.length) withRelatedTo++;
  if (k.confusableWith?.length) withConfusableWith++;
}
console.log("\nKI coverage:");
console.log("  exerciseTypes:", withExerciseTypes, "/", KNOWLEDGE_ITEMS.length);
console.log("  l1Difficulty:", withL1Difficulty, "/", KNOWLEDGE_ITEMS.length);
console.log("  relatedTo:", withRelatedTo, "/", KNOWLEDGE_ITEMS.length);
console.log("  confusableWith:", withConfusableWith, "/", KNOWLEDGE_ITEMS.length);
