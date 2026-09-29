import type { Database } from "@falatorio/db/client";
import { courses, units, lessons, lessonSkills, skills } from "@falatorio/db/schema";

import { L1_PHASE_1, type L1Code, type CEFRLevel } from "@falatorio/core";
import { getProfile } from "@falatorio/core/l1-profiles";

export interface UnitDef {
  title: string;
  theme: string;
  description: string;
  grammarFocus: string[];
  vocabTarget: string[];
  skillCodes?: string[];
}

const GRAMMAR_TO_SKILLS: Record<string, string[]> = {
  "ser present": ["PT.TENSES.PRESENT", "PT.TENSES.SER_ESTAR"],
  "articles": ["PT.DET.ARTICLES.DEFINITE", "PT.DET.ARTICLES.INDEFINITE"],
  "cardinal numbers": ["PT.ADJ.NUMERAL"],
  "ordinal numbers": ["PT.ADJ.NUMERAL"],
  "possessives": ["PT.DET.POSSESSIVE", "PT.PRON.POSSESSIVE"],
  "gender agreement": ["PT.MORPH.GENDER", "PT.MORPH.AGREEMENT", "PT.ADJ.AGREEMENT"],
  "querer present": ["PT.TENSES.PRESENT"],
  "partitive": ["PT.DET.ARTICLES.INDEFINITE"],
  "estar present": ["PT.TENSES.PRESENT", "PT.TENSES.SER_ESTAR"],
  "prepositions em/de": ["PT.PREP.BASIC", "PT.PREP.DE_POSSESSION", "PT.PREP.CONTRACTIONS"],
  "ter present": ["PT.TENSES.PRESENT", "PT.TENSES.TER_HAVER"],
  "doer": ["PT.PRON.PERSONAL.SUBJECT"],
  "ir present": ["PT.TENSES.PRESENT"],
  "imperative basic": ["PT.TENSES.IMPERATIVE"],
  "poder present": ["PT.TENSES.PRESENT"],
  "demonstratives": ["PT.DET.DEMONSTRATIVE", "PT.PRON.DEMONSTRATIVE.BASIC"],
  "reflexive verbs": ["PT.PRON.REFLEXIVE"],
  "frequency adverbs": ["PT.ADV.TIME"],
  "fazer weather": ["PT.TENSES.PRESENT"],
  "comparative": ["PT.ADJ.DEGREE"],
  "preterite regular": ["PT.TENSES.PRETERITE_PERFECT"],
  "porque/por que": ["PT.CONJ.CAUSAL", "PT.ADV.INTERROGATIVE"],
  "preterite irregular": ["PT.TENSES.PRETERITE_PERFECT"],
  "prepositions para/a": ["PT.PREP.POR_PARA", "PT.PREP.A_MOVEMENT"],
  "gostar de": ["PT.PREP.DE_POSSESSION"],
  "imperfect introduction": ["PT.TENSES.IMPERFECT"],
  "imperfect regular": ["PT.TENSES.IMPERFECT"],
  "object pronouns direct": ["PT.PRON.PERSONAL.DIRECT_OBJECT"],
  "imperfect irregular": ["PT.TENSES.IMPERFECT"],
  "subjunctive present intro": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "preterite vs imperfect": ["PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT"],
  "indirect objects": ["PT.PRON.PERSONAL.INDIRECT_OBJECT", "PT.SYNTAX.INDIRECT_OBJECT"],
  "subjunctive present": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "conjunctions": ["PT.CONJ.COPULATIVE", "PT.CONJ.ADVERSATIVE", "PT.CONJ.CAUSAL"],
  "passive voice": ["PT.SYNTAX.PASSIVE_AGENT"],
  "reported speech intro": ["PT.SYNTAX.SUB.COMPLETIVE", "PT.CONJ.COMPLETIVE"],
  "relative pronouns": ["PT.PRON.RELATIVE", "PT.DET.RELATIVE"],
  "subjunctive with emotions": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "conditional": ["PT.TENSES.CONDITIONAL"],
  "por/para distinction": ["PT.PREP.POR_PARA"],
  "future subjunctive": ["PT.TENSES.SUBJUNCTIVE_FUTURE"],
  "personal infinitive": ["PT.TENSES.PERSONAL_INFINITIVE"],
  "imperfect subjunctive": ["PT.TENSES.SUBJUNCTIVE_IMPERFECT"],
  "conditional sentences": ["PT.CONJ.CONDITIONAL", "PT.SYNTAX.SUB.CONDITIONAL"],
  "compound tenses intro": ["PT.TENSES.COMPOUND_PAST"],
  "gerund vs infinitive": ["PT.TENSES.GERUND"],
  "subjunctive with doubt": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.ADV.DOUBT"],
  "pronoun placement": ["PT.PRON.PERSONAL.CLITIC_PLACEMENT"],
  "pluperfect subjunctive": ["PT.TENSES.PLUPERFECT"],
  "complex conditionals": ["PT.CONJ.CONDITIONAL", "PT.SYNTAX.SUB.CONDITIONAL"],
  "future perfect": ["PT.TENSES.COMPOUND_PAST", "PT.TENSES.FUTURE"],
  "formal register": ["PT.LEX.REGISTER.FORMAL"],
  "subjunctive in relative clauses": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.PRON.RELATIVE"],
  "passive se": ["PT.SYNTAX.PASSIVE_AGENT"],
  "literary tenses": ["PT.TENSES.PLUPERFECT"],
  "mesoclisis": ["PT.PRON.PERSONAL.CLITIC_PLACEMENT", "PT.PRON.MESOCLISIS"],
  "compound subjunctive": ["PT.TENSES.SUBJUNCTIVE_IMPERFECT", "PT.TENSES.COMPOUND_PAST"],
  "abstract nominalization": ["PT.MORPH.DERIVATION.SUFFIX"],
  "narrative tenses": ["PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT", "PT.TENSES.PLUPERFECT"],
  "discourse connectors": ["PT.ADV.CONNECTIVE", "PT.CONJ.CONCLUSIVE"],
  "idiomatic usage": ["PT.LEX.REGISTER.FORMAL", "PT.LEX.IDIOMS.ADVANCED"],
  "register variation": ["PT.LEX.REGISTER.FORMAL", "PT.LEX.COLLOCATIONS.SPECIALIZED"],
  "formal subjunctive": ["PT.TENSES.SUBJUNCTIVE_FUTURE", "PT.TENSES.COMPOUND_SUBJUNCTIVE"],
  "impersonal constructions": ["PT.SYNTAX.SUBJECT", "PT.SYNTAX.TOPICALIZATION"],
  "stylistic devices": ["PT.RHETORIC.ADVANCED_ANALYSIS"],
  "archaic forms": ["PT.LEX.ETYMOLOGY", "PT.TENSES.LITERARY_PLUPERFECT", "PT.SYNTAX.ARCHAIC_FORMS"],
  "advanced connectors": ["PT.ADV.CONNECTIVE", "PT.CONJ.CONCESSIVE", "PT.CONJ.CONSECUTIVE"],
  "subjunctive nuances": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.TENSES.SUBJUNCTIVE_IMPERFECT", "PT.TENSES.COMPOUND_SUBJUNCTIVE"],
  "all tenses review": ["PT.TENSES.PRESENT", "PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT"],
  "regional variation": ["PT.SYNTAX.STYLISTIC_VARIATION", "PT.DISCOURSE.DIALECTAL_AWARENESS", "PT.PHON.DIALECTAL_VARIATION"],
  "stylistic choices": ["PT.DISCOURSE.STYLISTICS", "PT.DISCOURSE.LITERARY_ANALYSIS"],
  "creative grammar": ["PT.SYNTAX.STYLISTIC_VARIATION", "PT.LEX.CREATIVE_NEOLOGY", "PT.SYNTAX.ARCHAIC_FORMS"],
};

export const COURSE_UNITS: Record<CEFRLevel, UnitDef[]> = {
  A1: [
    { title: "Cumprimentos e apresentações", theme: "greetings", description: "Olá, como te chamas, de onde és", grammarFocus: ["ser present", "articles"], vocabTarget: ["greetings", "introductions"] },
    { title: "Números e datas", theme: "numbers", description: "Contar, dias da semana, meses", grammarFocus: ["cardinal numbers", "ordinal numbers"], vocabTarget: ["numbers", "dates", "time"] },
    { title: "Família e relações", theme: "family", description: "Mãe, pai, irmãos, amigos", grammarFocus: ["possessives", "gender agreement"], vocabTarget: ["family", "relationships"] },
    { title: "Comida e bebida", theme: "food", description: "No restaurante, no café, no supermercado", grammarFocus: ["querer present", "partitive"], vocabTarget: ["food", "drinks", "restaurant"] },
    { title: "A casa", theme: "home", description: "Divisões, mobília, rotina em casa", grammarFocus: ["estar present", "prepositions em/de"], vocabTarget: ["rooms", "furniture", "daily objects"] },
    { title: "O corpo e a saúde", theme: "body", description: "Partes do corpo, dizer como te sentes", grammarFocus: ["ter present", "doer"], vocabTarget: ["body parts", "health", "feelings"] },
    { title: "Transportes e direções", theme: "transport", description: "Autocarro, comboio, telemóvel, pedir direções", grammarFocus: ["ir present", "imperative basic"], vocabTarget: ["transport", "directions", "city"] },
    { title: "Compras e dinheiro", theme: "shopping", description: "Na loja, preços, pagar", grammarFocus: ["poder present", "demonstratives"], vocabTarget: ["shopping", "clothes", "money"] },
  ],
  A2: [
    { title: "Rotina diária", theme: "routine", description: "O meu dia, horas, hábitos", grammarFocus: ["reflexive verbs", "frequency adverbs"], vocabTarget: ["daily routine", "time expressions"] },
    { title: "Tempo e estações", theme: "weather", description: "Como está o tempo, estações do ano", grammarFocus: ["fazer weather", "comparative"], vocabTarget: ["weather", "seasons", "nature"] },
    { title: "Profissões e trabalho", theme: "work", description: "O que fazes, o escritório, entrevistas", grammarFocus: ["preterite regular", "porque/por que"], vocabTarget: ["professions", "workplace"] },
    { title: "Viagens e férias", theme: "travel", description: "No aeroporto, no hotel, férias", grammarFocus: ["preterite irregular", "prepositions para/a"], vocabTarget: ["travel", "accommodation", "tourism"] },
    { title: "Lazer e passatempos", theme: "leisure", description: "Desporto, música, cinema, hobbies", grammarFocus: ["gostar de", "imperfect introduction"], vocabTarget: ["hobbies", "sports", "entertainment"] },
    { title: "A cidade e serviços", theme: "city", description: "Correios, banco, hospital, polícia", grammarFocus: ["imperfect regular", "object pronouns direct"], vocabTarget: ["city services", "public places"] },
    { title: "Saúde e bem-estar", theme: "health", description: "No médico, na farmácia, emergências", grammarFocus: ["imperfect irregular", "subjunctive present intro"], vocabTarget: ["medical", "pharmacy", "emergency"] },
    { title: "Festas e tradições", theme: "traditions", description: "Santos Populares, Natal, Páscoa, casamentos", grammarFocus: ["preterite vs imperfect", "indirect objects"], vocabTarget: ["celebrations", "traditions", "culture"] },
  ],
  B1: [
    { title: "Opinião e debate", theme: "opinion", description: "Concordar, discordar, argumentar", grammarFocus: ["subjunctive present", "conjunctions"], vocabTarget: ["opinions", "debate", "connectors"] },
    { title: "Notícias e media", theme: "news", description: "Jornais, televisão, redes sociais", grammarFocus: ["passive voice", "reported speech intro"], vocabTarget: ["media", "news", "technology"] },
    { title: "Cultura portuguesa", theme: "culture", description: "Fado, literatura, cinema, arte", grammarFocus: ["relative pronouns", "subjunctive with emotions"], vocabTarget: ["arts", "music", "literature"] },
    { title: "Trabalho e carreira", theme: "career", description: "CV, entrevista, promoção, reuniões", grammarFocus: ["conditional", "por/para distinction"], vocabTarget: ["career", "business", "meetings"] },
    { title: "Educação e formação", theme: "education", description: "Universidade, cursos, aprender", grammarFocus: ["future subjunctive", "personal infinitive"], vocabTarget: ["education", "studying", "exams"] },
    { title: "Ambiente e natureza", theme: "environment", description: "Reciclagem, alterações climáticas, ecologia", grammarFocus: ["imperfect subjunctive", "conditional sentences"], vocabTarget: ["environment", "ecology", "sustainability"] },
    { title: "Tecnologia e inovação", theme: "technology", description: "Internet, apps, inteligência artificial", grammarFocus: ["compound tenses intro", "gerund vs infinitive"], vocabTarget: ["technology", "innovation", "digital"] },
    { title: "Relações e emoções", theme: "relationships", description: "Amizade, amor, conflitos, emoções", grammarFocus: ["subjunctive with doubt", "pronoun placement"], vocabTarget: ["emotions", "relationships", "personality"] },
  ],
  B2: [
    { title: "Política e sociedade", theme: "politics", description: "Democracia, eleições, problemas sociais", grammarFocus: ["pluperfect subjunctive", "complex conditionals"], vocabTarget: ["politics", "society", "government"] },
    { title: "Economia e negócios", theme: "economy", description: "Mercado, investimento, empreendedorismo", grammarFocus: ["future perfect", "formal register"], vocabTarget: ["economics", "business", "finance"] },
    { title: "Arte e estética", theme: "art", description: "Pintura, escultura, fotografia, design", grammarFocus: ["subjunctive in relative clauses", "passive se"], vocabTarget: ["art", "aesthetics", "criticism"] },
    { title: "Literatura portuguesa", theme: "literature", description: "Pessoa, Saramago, Camões, poesia", grammarFocus: ["literary tenses", "mesoclisis"], vocabTarget: ["literature", "poetry", "authors"] },
    { title: "Ciência e descoberta", theme: "science", description: "Investigação, descobertas, medicina", grammarFocus: ["compound subjunctive", "abstract nominalization"], vocabTarget: ["science", "research", "discovery"] },
    { title: "Portugal no mundo", theme: "world", description: "Descobrimentos, CPLP, emigração, diáspora", grammarFocus: ["narrative tenses", "discourse connectors"], vocabTarget: ["history", "diaspora", "lusophone world"] },
  ],
  C1: [
    { title: "Expressões idiomáticas", theme: "idioms", description: "Estar-se nas tintas, dar o litro, ficar a ver navios", grammarFocus: ["idiomatic usage", "register variation"], vocabTarget: ["idioms", "colloquialisms", "slang"] },
    { title: "Registo formal e académico", theme: "formal", description: "Textos académicos, correspondência formal, discursos", grammarFocus: ["formal subjunctive", "impersonal constructions"], vocabTarget: ["academic", "formal writing", "correspondence"] },
    { title: "Textos literários", theme: "literary", description: "Análise de textos, crítica, interpretação", grammarFocus: ["stylistic devices", "archaic forms"], vocabTarget: ["literary analysis", "criticism", "interpretation"] },
    { title: "Argumentação e retórica", theme: "rhetoric", description: "Persuasão, debate formal, ensaio", grammarFocus: ["advanced connectors", "subjunctive nuances"], vocabTarget: ["argumentation", "rhetoric", "persuasion"] },
  ],
  C2: [
    { title: "Domínio nativo", theme: "mastery", description: "Nuances, humor, duplo sentido, registos", grammarFocus: ["all tenses review", "regional variation"], vocabTarget: ["nuance", "humor", "register"] },
    { title: "Produção criativa", theme: "creative", description: "Escrita criativa, tradução, adaptação", grammarFocus: ["stylistic choices", "creative grammar"], vocabTarget: ["creative writing", "translation", "adaptation"] },
  ],
};

export async function seedCourseStructure(
  l1: L1Code,
  db: Database,
): Promise<{ courseId: string; unitCount: number; lessonCount: number }> {
  const profile = getProfile(l1);
  const startLevel = profile.transfer.startingCEFR;

  const cefrOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const startIdx = cefrOrder.indexOf(startLevel);

  const [course] = await db
    .insert(courses)
    .values({
      title: { pt: `Português europeu para falantes de ${profile.nativeName}`, [l1]: `European Portuguese for ${profile.name} speakers` },
      description: { pt: `Curso completo de PT-EU adaptado para falantes de ${profile.name}`, [l1]: `Complete PT-EU course adapted for ${profile.name} speakers` },
      l1Source: l1,
      cefrMin: startLevel,
      cefrMax: "C2" as CEFRLevel,
      sortOrder: "0",
    })
    .returning({ id: courses.id });

  let unitCount = 0;
  let lessonCount = 0;
  let globalSort = 0;

  for (let lvlIdx = startIdx; lvlIdx < cefrOrder.length; lvlIdx++) {
    const level = cefrOrder[lvlIdx]!;
    const unitDefs = COURSE_UNITS[level];

    for (let uIdx = 0; uIdx < unitDefs.length; uIdx++) {
      const unitDef = unitDefs[uIdx]!;
      const [unit] = await db
        .insert(units)
        .values({
          courseId: course!.id,
          title: { pt: unitDef.title },
          theme: unitDef.theme,
          description: { pt: unitDef.description },
          sortOrder: globalSort++,
        })
        .returning({ id: units.id });

      unitCount++;

      const skillCodes = new Set<string>();
      for (const gf of unitDef.grammarFocus) {
        const mapped = GRAMMAR_TO_SKILLS[gf];
        if (mapped) mapped.forEach((c) => skillCodes.add(c));
      }

      let resolvedSkillIds: { id: string; code: string; isPrimary: boolean }[] = [];
      if (skillCodes.size > 0) {
        const allSkills = await db
          .select({ id: skills.id, code: skills.code })
          .from(skills);
        const firstGf = unitDef.grammarFocus[0];
        const primaryCodes = new Set(GRAMMAR_TO_SKILLS[firstGf ?? ""] ?? []);
        resolvedSkillIds = allSkills
          .filter((s) => skillCodes.has(s.code))
          .map((s) => ({ ...s, isPrimary: primaryCodes.has(s.code) }));
      }

      const lessonsPerUnit = level === "C2" ? 5 : level === "C1" ? 6 : 8;
      for (let lIdx = 0; lIdx < lessonsPerUnit; lIdx++) {
        const [lesson] = await db.insert(lessons).values({
          unitId: unit!.id,
          sortOrder: lIdx,
          grammarFocus: unitDef.grammarFocus,
          vocabTarget: unitDef.vocabTarget,
        }).returning({ id: lessons.id });

        if (resolvedSkillIds.length > 0 && lesson) {
          await db.insert(lessonSkills).values(
            resolvedSkillIds.map((s) => ({
              lessonId: lesson.id,
              skillId: s.id,
              isPrimary: s.isPrimary,
            })),
          );
        }
        lessonCount++;
      }
    }
  }

  return { courseId: course!.id, unitCount, lessonCount };
}

export async function seedAllPhase1Courses(
  db: Database,
): Promise<Record<string, { courseId: string; unitCount: number; lessonCount: number }>> {
  const results: Record<string, { courseId: string; unitCount: number; lessonCount: number }> = {};

  for (const l1 of L1_PHASE_1) {
    results[l1] = await seedCourseStructure(l1, db);
  }

  return results;
}
