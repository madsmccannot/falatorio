import { createDb } from "@falatorio/db/client";
import { skills, knowledgeItems } from "@falatorio/db/schema";
import type { CEFRLevel } from "@falatorio/core";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

interface KITemplate {
  suffix: string;
  rule: string;
  examples: string[];
  exerciseTypes: string[];
}

function generateKIsForSkill(skillCode: string, domain: string, cefr: string): KITemplate[] {
  const base = skillCode.replace(/^PT\./, "");

  const templates: KITemplate[] = [];

  switch (domain) {
    case "phonetics":
      templates.push(
        { suffix: "RECOG", rule: `Reconhecer o som ${base} em palavras portuguesas`, examples: [], exerciseTypes: ["pick_correct", "match_pairs"] },
        { suffix: "PROD", rule: `Produzir o som ${base} correctamente`, examples: [], exerciseTypes: ["fill_blank", "pick_correct"] },
      );
      if (cefr !== "A1") {
        templates.push(
          { suffix: "CONTRAST", rule: `Distinguir ${base} de sons semelhantes`, examples: [], exerciseTypes: ["pick_correct", "match_pairs"] },
        );
      }
      break;

    case "morphology":
      templates.push(
        { suffix: "FORM", rule: `Formar corretamente ${base}`, examples: [], exerciseTypes: ["fill_blank", "reorder_words"] },
        { suffix: "USE", rule: `Usar ${base} em contexto`, examples: [], exerciseTypes: ["fill_blank", "translate_l1_to_pt"] },
        { suffix: "RECOG", rule: `Reconhecer ${base} em frases`, examples: [], exerciseTypes: ["pick_correct", "match_pairs"] },
      );
      break;

    case "tenses_moods":
      templates.push(
        { suffix: "CONJ", rule: `Conjugar verbos em ${base}`, examples: [], exerciseTypes: ["fill_blank", "reorder_words"] },
        { suffix: "USE", rule: `Usar ${base} em contexto adequado`, examples: [], exerciseTypes: ["translate_l1_to_pt", "fill_blank"] },
        { suffix: "RECOG", rule: `Reconhecer quando usar ${base}`, examples: [], exerciseTypes: ["pick_correct", "translate_pt_to_l1"] },
      );
      break;

    case "determiners":
    case "pronouns":
    case "prepositions":
      templates.push(
        { suffix: "CHOOSE", rule: `Escolher o/a ${base} correcto/a`, examples: [], exerciseTypes: ["pick_correct", "fill_blank"] },
        { suffix: "USE", rule: `Usar ${base} em frases`, examples: [], exerciseTypes: ["fill_blank", "translate_l1_to_pt"] },
      );
      break;

    case "syntax":
      templates.push(
        { suffix: "ORDER", rule: `Ordenar palavras em ${base}`, examples: [], exerciseTypes: ["reorder_words", "fill_blank"] },
        { suffix: "RECOG", rule: `Reconhecer ${base} em frases`, examples: [], exerciseTypes: ["pick_correct", "translate_pt_to_l1"] },
        { suffix: "PROD", rule: `Construir frases com ${base}`, examples: [], exerciseTypes: ["translate_l1_to_pt", "reorder_words"] },
      );
      break;

    case "lexicon":
      templates.push(
        { suffix: "MEANING", rule: `Compreender o significado de ${base}`, examples: [], exerciseTypes: ["pick_correct", "match_pairs", "translate_pt_to_l1"] },
        { suffix: "USE", rule: `Usar ${base} em contexto`, examples: [], exerciseTypes: ["fill_blank", "translate_l1_to_pt"] },
        { suffix: "SPELL", rule: `Escrever correctamente ${base}`, examples: [], exerciseTypes: ["listen_and_type", "fill_blank"] },
      );
      break;

    case "pragmatics":
      templates.push(
        { suffix: "RECOG", rule: `Reconhecer quando usar ${base}`, examples: [], exerciseTypes: ["pick_correct", "translate_pt_to_l1"] },
        { suffix: "PROD", rule: `Produzir expressoes com ${base}`, examples: [], exerciseTypes: ["translate_l1_to_pt", "reorder_words"] },
      );
      break;

    case "orthography":
      templates.push(
        { suffix: "RULES", rule: `Aplicar regras de ${base}`, examples: [], exerciseTypes: ["fill_blank", "pick_correct"] },
        { suffix: "WRITE", rule: `Escrever correctamente com ${base}`, examples: [], exerciseTypes: ["listen_and_type", "fill_blank"] },
      );
      break;

    default:
      templates.push(
        { suffix: "CORE", rule: `Dominar ${base}`, examples: [], exerciseTypes: ["pick_correct", "fill_blank"] },
        { suffix: "APPLY", rule: `Aplicar ${base} em contexto`, examples: [], exerciseTypes: ["translate_l1_to_pt", "reorder_words"] },
      );
  }

  return templates;
}

async function main() {
  console.log("Connecting to database...");
  const db = createDb(DATABASE_URL!);

  const existingKIs = await db.select({ id: knowledgeItems.id }).from(knowledgeItems);
  if (existingKIs.length > 0) {
    console.log(`Already ${existingKIs.length} knowledge items in DB. Skipping.`);
    return;
  }

  const allSkills = await db.select().from(skills);
  console.log(`Found ${allSkills.length} skills. Generating knowledge items...\n`);

  let totalCreated = 0;
  const batch: Array<{
    skillId: string;
    code: string;
    cefrLevel: CEFRLevel;
    rule: string;
    examples: string[];
    exerciseTypes: string[];
    status: "live";
  }> = [];

  for (const skill of allSkills) {
    const templates = generateKIsForSkill(skill.code, skill.domain, skill.cefrLevel);

    for (const tmpl of templates) {
      const code = `${skill.code}.${tmpl.suffix}`;
      batch.push({
        skillId: skill.id,
        code,
        cefrLevel: skill.cefrLevel as CEFRLevel,
        rule: tmpl.rule,
        examples: tmpl.examples,
        exerciseTypes: tmpl.exerciseTypes,
        status: "live",
      });
    }
  }

  const CHUNK_SIZE = 100;
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);
    await db.insert(knowledgeItems).values(chunk);
    totalCreated += chunk.length;
    process.stdout.write(`  Inserted ${totalCreated}/${batch.length}\r`);
  }

  console.log(`\nCreated ${totalCreated} knowledge items across ${allSkills.length} skills.`);

  const byDomain: Record<string, number> = {};
  for (const skill of allSkills) {
    const count = generateKIsForSkill(skill.code, skill.domain, skill.cefrLevel).length;
    byDomain[skill.domain] = (byDomain[skill.domain] ?? 0) + count;
  }
  for (const [domain, count] of Object.entries(byDomain)) {
    console.log(`  ${domain}: ${count} KIs`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
