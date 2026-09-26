/**
 * Falatorio — Taxonomia Canónica do Knowledge Graph PT-EU
 *
 * Roadmap 5, Fases 5.2–5.3: taxonomia versionada de Skills e KnowledgeItems.
 * Cada Skill tem um código canónico (PT.*), domínio, nível CEFR e pré-requisitos.
 * Cada KnowledgeItem decompõe a Skill em unidades atómicas de conhecimento.
 *
 * Regras:
 *  - CEFR level = posição curricular, NÃO dificuldade do exercício.
 *  - Pre-requisitos formam uma DAG (sem ciclos).
 *  - O mesmo domínio pode existir em vários níveis com complexidade crescente.
 *  - Códigos são estáveis e versionáveis.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkillDomain =
  | "phonetics"
  | "morphology"
  | "tenses_moods"
  | "determiners"
  | "pronouns"
  | "prepositions"
  | "syntax"
  | "lexicon"
  | "pragmatics"
  | "orthography";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type SkillSeed = {
  code: string;
  domain: SkillDomain;
  cefrLevel: CEFRLevel;
  name: Record<string, string>;
  description?: Record<string, string>;
  prerequisites: string[];
};

type CognitiveLevel =
  | "recognition"
  | "comprehension"
  | "controlled_production"
  | "transformation"
  | "translation"
  | "free_production"
  | "communication";

type L1DifficultyEntry = {
  difficulty: "low" | "medium" | "high";
  reason: string;
  expectedErrors?: string[];
};

export type KnowledgeItemSeed = {
  code: string;
  skillCode: string;
  cefrLevel: CEFRLevel;
  rule: string;
  examples: string[];
  counterexamples?: string[];
  commonErrors?: string[];
  masteryCriteria?: { minAccuracy: number; minVariety: number; minReps: number };
  exerciseTypes?: CognitiveLevel[];
  relatedTo?: string[];
  confusableWith?: string[];
  l1Difficulty?: Record<string, L1DifficultyEntry>;
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function skill(
  code: string,
  domain: SkillDomain,
  cefrLevel: CEFRLevel,
  namePt: string,
  nameEn: string,
  prerequisites: string[] = [],
): SkillSeed {
  return {
    code,
    domain,
    cefrLevel,
    name: { pt: namePt, en: nameEn },
    prerequisites,
  };
}

function ki(
  code: string,
  skillCode: string,
  cefrLevel: CEFRLevel,
  rule: string,
  examples: string[],
  extras?: {
    counterexamples?: string[];
    commonErrors?: string[];
    criteria?: { minAccuracy: number; minVariety: number; minReps: number };
    exerciseTypes?: CognitiveLevel[];
    relatedTo?: string[];
    confusableWith?: string[];
    l1Difficulty?: Record<string, L1DifficultyEntry>;
  },
): KnowledgeItemSeed {
  return {
    code,
    skillCode,
    cefrLevel,
    rule,
    examples,
    counterexamples: extras?.counterexamples,
    commonErrors: extras?.commonErrors,
    masteryCriteria: extras?.criteria,
    exerciseTypes: extras?.exerciseTypes,
    relatedTo: extras?.relatedTo,
    confusableWith: extras?.confusableWith,
    l1Difficulty: extras?.l1Difficulty,
  };
}

// ===========================================================================
// SKILLS
// ===========================================================================

export const SKILLS: SkillSeed[] = [

  // =========================================================================
  // PHONETICS — PT.PHON.*
  // =========================================================================

  // A1
  skill("PT.PHON.VOWELS.ORAL", "phonetics", "A1", "Vogais orais", "Oral vowels"),
  skill("PT.PHON.VOWELS.NASAL", "phonetics", "A1", "Vogais nasais", "Nasal vowels"),
  skill("PT.PHON.CONSONANTS.LH_NH", "phonetics", "A1", "Consoantes lh e nh", "Consonants lh and nh"),
  skill("PT.PHON.CONSONANTS.S_SOUNDS", "phonetics", "A1", "Sons do s", "S sounds"),
  skill("PT.PHON.DIPHTHONGS.BASIC", "phonetics", "A1", "Ditongos básicos", "Basic diphthongs"),

  // A2
  skill("PT.PHON.VOWELS.OPEN_CLOSED", "phonetics", "A2", "Vogais abertas e fechadas", "Open and closed vowels", ["PT.PHON.VOWELS.ORAL"]),
  skill("PT.PHON.REDUCTION.UNSTRESSED", "phonetics", "A2", "Redução vocálica", "Vowel reduction", ["PT.PHON.VOWELS.ORAL"]),
  skill("PT.PHON.CONSONANTS.R_SOUNDS", "phonetics", "A2", "Sons do r", "R sounds"),
  skill("PT.PHON.RHYTHM", "phonetics", "A2", "Ritmo e entoação", "Rhythm and intonation"),

  // B1
  skill("PT.PHON.PROCESS.VOICING", "phonetics", "B1", "Sonorização", "Voicing", ["PT.PHON.CONSONANTS.S_SOUNDS"]),
  skill("PT.PHON.PROCESS.ASSIMILATION", "phonetics", "B1", "Assimilação", "Assimilation", ["PT.PHON.REDUCTION.UNSTRESSED"]),
  skill("PT.PHON.PROCESS.PALATALIZATION", "phonetics", "B1", "Palatalização", "Palatalization"),
  skill("PT.PHON.DIPHTHONGS.NASAL", "phonetics", "B1", "Ditongos nasais", "Nasal diphthongs", ["PT.PHON.VOWELS.NASAL", "PT.PHON.DIPHTHONGS.BASIC"]),

  // B2
  skill("PT.PHON.PROCESS.METATHESIS", "phonetics", "B2", "Metátese", "Metathesis"),
  skill("PT.PHON.PROCESS.ELISION", "phonetics", "B2", "Elisão e supressão", "Elision and suppression", ["PT.PHON.REDUCTION.UNSTRESSED"]),
  skill("PT.PHON.PROCESS.CONTRACTION", "phonetics", "B2", "Contração fonética", "Phonetic contraction", ["PT.PHON.PROCESS.ASSIMILATION"]),
  skill("PT.PHON.HISTORICAL", "phonetics", "B2", "Processos históricos", "Historical processes", ["PT.PHON.PROCESS.VOICING", "PT.PHON.PROCESS.PALATALIZATION"]),

  // =========================================================================
  // MORPHOLOGY — PT.MORPH.*
  // =========================================================================

  // A1
  skill("PT.MORPH.GENDER", "morphology", "A1", "Género", "Gender"),
  skill("PT.MORPH.NUMBER", "morphology", "A1", "Número", "Number"),

  // A2
  skill("PT.MORPH.AGREEMENT", "morphology", "A2", "Concordância nominal", "Nominal agreement", ["PT.MORPH.GENDER", "PT.MORPH.NUMBER"]),
  skill("PT.MORPH.DERIVATION.PREFIX", "morphology", "A2", "Prefixação", "Prefixation"),
  skill("PT.MORPH.DERIVATION.SUFFIX", "morphology", "A2", "Sufixação", "Suffixation"),

  // B1
  skill("PT.MORPH.DERIVATION.PARASYNTHESIS", "morphology", "B1", "Parassíntese", "Parasynthesis", ["PT.MORPH.DERIVATION.PREFIX", "PT.MORPH.DERIVATION.SUFFIX"]),
  skill("PT.MORPH.DERIVATION.CONVERSION", "morphology", "B1", "Conversão", "Conversion"),
  skill("PT.MORPH.COMPOSITION", "morphology", "B1", "Composição", "Composition"),

  // B2
  skill("PT.MORPH.DERIVATION.NON_AFFIX", "morphology", "B2", "Derivação não afixal", "Non-affixal derivation", ["PT.MORPH.DERIVATION.SUFFIX"]),
  skill("PT.MORPH.INFLECTION.VERBAL", "morphology", "B2", "Flexão verbal avançada", "Advanced verbal inflection"),

  // =========================================================================
  // TENSES & MOODS — PT.TENSES.*
  // =========================================================================

  // A1
  skill("PT.TENSES.PRESENT", "tenses_moods", "A1", "Presente do indicativo", "Present indicative"),
  skill("PT.TENSES.SER_ESTAR", "tenses_moods", "A1", "Ser e estar", "Ser and estar"),
  skill("PT.TENSES.TER_HAVER", "tenses_moods", "A1", "Ter e haver", "Ter and haver"),

  // A2
  skill("PT.TENSES.PRETERITE_PERFECT", "tenses_moods", "A2", "Pretérito perfeito simples", "Simple past", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.IMPERFECT", "tenses_moods", "A2", "Pretérito imperfeito", "Imperfect", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.PERIPHRASTIC_FUTURE", "tenses_moods", "A2", "Futuro perifrástico (ir + infinitivo)", "Periphrastic future", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.IMPERATIVE", "tenses_moods", "A2", "Imperativo", "Imperative", ["PT.TENSES.PRESENT"]),

  // B1
  skill("PT.TENSES.FUTURE", "tenses_moods", "B1", "Futuro do indicativo", "Future indicative", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.CONDITIONAL", "tenses_moods", "B1", "Condicional", "Conditional", ["PT.TENSES.FUTURE"]),
  skill("PT.TENSES.SUBJUNCTIVE_PRESENT", "tenses_moods", "B1", "Presente do conjuntivo", "Present subjunctive", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.COMPOUND_PAST", "tenses_moods", "B1", "Pretérito perfeito composto", "Compound past", ["PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.TER_HAVER"]),
  skill("PT.TENSES.PLUPERFECT", "tenses_moods", "B1", "Mais-que-perfeito", "Pluperfect", ["PT.TENSES.PRETERITE_PERFECT"]),

  // B2
  skill("PT.TENSES.SUBJUNCTIVE_IMPERFECT", "tenses_moods", "B2", "Imperfeito do conjuntivo", "Imperfect subjunctive", ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.TENSES.IMPERFECT"]),
  skill("PT.TENSES.SUBJUNCTIVE_FUTURE", "tenses_moods", "B2", "Futuro do conjuntivo", "Future subjunctive", ["PT.TENSES.SUBJUNCTIVE_PRESENT"]),
  skill("PT.TENSES.PERSONAL_INFINITIVE", "tenses_moods", "B2", "Infinitivo pessoal", "Personal infinitive", ["PT.TENSES.PRESENT"]),
  skill("PT.TENSES.GERUND", "tenses_moods", "B2", "Gerúndio", "Gerund"),

  // =========================================================================
  // DETERMINERS — PT.DET.*
  // =========================================================================

  // A1
  skill("PT.DET.ARTICLES.DEFINITE", "determiners", "A1", "Artigos definidos", "Definite articles"),
  skill("PT.DET.ARTICLES.INDEFINITE", "determiners", "A1", "Artigos indefinidos", "Indefinite articles"),

  // A2
  skill("PT.DET.DEMONSTRATIVE", "determiners", "A2", "Determinantes demonstrativos", "Demonstrative determiners", ["PT.DET.ARTICLES.DEFINITE"]),
  skill("PT.DET.POSSESSIVE", "determiners", "A2", "Determinantes possessivos", "Possessive determiners", ["PT.DET.ARTICLES.DEFINITE"]),
  skill("PT.DET.ARTICLES.CONTRACTIONS", "determiners", "A2", "Contrações (de+o, em+a, a+a, etc.)", "Contractions", ["PT.DET.ARTICLES.DEFINITE"]),

  // B1
  skill("PT.DET.INDEFINITE", "determiners", "B1", "Determinantes indefinidos", "Indefinite determiners"),
  skill("PT.DET.INTERROGATIVE", "determiners", "B1", "Determinantes interrogativos", "Interrogative determiners"),
  skill("PT.DET.RELATIVE", "determiners", "B1", "Determinante relativo (cujo)", "Relative determiner (cujo)"),

  // =========================================================================
  // PRONOUNS — PT.PRON.*
  // =========================================================================

  // A1
  skill("PT.PRON.PERSONAL.SUBJECT", "pronouns", "A1", "Pronomes pessoais sujeito", "Subject personal pronouns"),
  skill("PT.PRON.DEMONSTRATIVE.BASIC", "pronouns", "A1", "Pronomes demonstrativos básicos", "Basic demonstrative pronouns"),

  // A2
  skill("PT.PRON.PERSONAL.DIRECT_OBJECT", "pronouns", "A2", "Pronomes de complemento direto", "Direct object pronouns", ["PT.PRON.PERSONAL.SUBJECT"]),
  skill("PT.PRON.PERSONAL.INDIRECT_OBJECT", "pronouns", "A2", "Pronomes de complemento indireto", "Indirect object pronouns", ["PT.PRON.PERSONAL.SUBJECT"]),
  skill("PT.PRON.POSSESSIVE", "pronouns", "A2", "Pronomes possessivos", "Possessive pronouns"),
  skill("PT.PRON.REFLEXIVE", "pronouns", "A2", "Pronomes reflexos", "Reflexive pronouns", ["PT.PRON.PERSONAL.SUBJECT"]),

  // B1
  skill("PT.PRON.PERSONAL.OBLIQUE", "pronouns", "B1", "Pronomes de complemento oblíquo", "Oblique complement pronouns", ["PT.PRON.PERSONAL.DIRECT_OBJECT", "PT.PRON.PERSONAL.INDIRECT_OBJECT"]),
  skill("PT.PRON.PERSONAL.CLITIC_PLACEMENT", "pronouns", "B1", "Colocação dos pronomes clíticos", "Clitic placement", ["PT.PRON.PERSONAL.DIRECT_OBJECT"]),
  skill("PT.PRON.RELATIVE", "pronouns", "B1", "Pronomes relativos", "Relative pronouns"),
  skill("PT.PRON.INTERROGATIVE", "pronouns", "B1", "Pronomes interrogativos", "Interrogative pronouns"),
  skill("PT.PRON.INDEFINITE", "pronouns", "B1", "Pronomes indefinidos", "Indefinite pronouns"),

  // B2
  skill("PT.PRON.DEMONSTRATIVE.ADVANCED", "pronouns", "B2", "Pronomes demonstrativos avançados", "Advanced demonstrative pronouns", ["PT.PRON.DEMONSTRATIVE.BASIC"]),
  skill("PT.PRON.PERSONAL.COMBINED", "pronouns", "B2", "Combinação de clíticos (mo, lho, etc.)", "Combined clitics", ["PT.PRON.PERSONAL.DIRECT_OBJECT", "PT.PRON.PERSONAL.INDIRECT_OBJECT"]),

  // =========================================================================
  // PREPOSITIONS — PT.PREP.*
  // =========================================================================

  // A1
  skill("PT.PREP.BASIC", "prepositions", "A1", "Preposições básicas (a, de, em, para, com)", "Basic prepositions"),
  skill("PT.PREP.CONTRACTIONS", "prepositions", "A1", "Contrações com preposições", "Prepositional contractions", ["PT.PREP.BASIC", "PT.DET.ARTICLES.DEFINITE"]),

  // A2
  skill("PT.PREP.POR_PARA", "prepositions", "A2", "Por vs para", "Por vs para", ["PT.PREP.BASIC"]),
  skill("PT.PREP.A_MOVEMENT", "prepositions", "A2", "A (direção e movimento)", "A (direction and movement)", ["PT.PREP.BASIC"]),
  skill("PT.PREP.DE_POSSESSION", "prepositions", "A2", "De (posse e origem)", "De (possession and origin)", ["PT.PREP.BASIC"]),

  // B1
  skill("PT.PREP.REGENCY", "prepositions", "B1", "Regência preposicional", "Prepositional regency", ["PT.PREP.BASIC"]),
  skill("PT.PREP.LOCUTIONS", "prepositions", "B1", "Locuções prepositivas", "Prepositional locutions", ["PT.PREP.BASIC"]),

  // B2
  skill("PT.PREP.ADVANCED_USAGE", "prepositions", "B2", "Usos avançados e contrastes", "Advanced usage and contrasts", ["PT.PREP.REGENCY"]),

  // =========================================================================
  // SYNTAX — PT.SYNTAX.*
  // =========================================================================

  // A1
  skill("PT.SYNTAX.WORD_ORDER", "syntax", "A1", "Ordem básica SVO", "Basic SVO word order"),
  skill("PT.SYNTAX.NEGATION", "syntax", "A1", "Negação", "Negation"),
  skill("PT.SYNTAX.QUESTIONS", "syntax", "A1", "Perguntas", "Questions"),

  // A2
  skill("PT.SYNTAX.SUBJECT", "syntax", "A2", "Sujeito", "Subject", ["PT.SYNTAX.WORD_ORDER"]),
  skill("PT.SYNTAX.PREDICATE", "syntax", "A2", "Predicado", "Predicate", ["PT.SYNTAX.WORD_ORDER"]),
  skill("PT.SYNTAX.DIRECT_OBJECT", "syntax", "A2", "Complemento direto", "Direct object", ["PT.SYNTAX.PREDICATE"]),
  skill("PT.SYNTAX.INDIRECT_OBJECT", "syntax", "A2", "Complemento indireto", "Indirect object", ["PT.SYNTAX.PREDICATE"]),

  // B1
  skill("PT.SYNTAX.OBLIQUE", "syntax", "B1", "Complemento oblíquo", "Oblique complement", ["PT.SYNTAX.DIRECT_OBJECT", "PT.SYNTAX.INDIRECT_OBJECT"]),
  skill("PT.SYNTAX.PASSIVE_AGENT", "syntax", "B1", "Complemento agente da passiva", "Passive agent complement", ["PT.SYNTAX.DIRECT_OBJECT"]),
  skill("PT.SYNTAX.PREDICATIVE_SUBJECT", "syntax", "B1", "Predicativo do sujeito", "Subject predicative", ["PT.SYNTAX.SUBJECT", "PT.SYNTAX.PREDICATE"]),
  skill("PT.SYNTAX.PREDICATIVE_DO", "syntax", "B1", "Predicativo do complemento direto", "Direct object predicative", ["PT.SYNTAX.DIRECT_OBJECT"]),
  skill("PT.SYNTAX.MODIFIER_VERB", "syntax", "B1", "Modificador do grupo verbal", "Verb group modifier", ["PT.SYNTAX.PREDICATE"]),
  skill("PT.SYNTAX.MODIFIER_NOUN.RESTRICTIVE", "syntax", "B1", "Modificador restritivo do nome", "Restrictive noun modifier", ["PT.SYNTAX.SUBJECT"]),
  skill("PT.SYNTAX.COMPLEMENT_NOUN", "syntax", "B1", "Complemento do nome", "Noun complement", ["PT.SYNTAX.SUBJECT"]),
  skill("PT.SYNTAX.COMPLEMENT_ADJ", "syntax", "B1", "Complemento do adjetivo", "Adjective complement"),

  // B2
  skill("PT.SYNTAX.MODIFIER_NOUN.APPOSITIVE", "syntax", "B2", "Modificador apositivo do nome", "Appositive noun modifier", ["PT.SYNTAX.MODIFIER_NOUN.RESTRICTIVE"]),
  skill("PT.SYNTAX.MODIFIER_SENTENCE", "syntax", "B2", "Modificador de frase", "Sentence modifier"),
  skill("PT.SYNTAX.VOCATIVE", "syntax", "B2", "Vocativo", "Vocative"),

  // --- Coordination ---
  // A2
  skill("PT.SYNTAX.COORD.COPULATIVE", "syntax", "A2", "Coordenação copulativa", "Copulative coordination"),
  skill("PT.SYNTAX.COORD.ADVERSATIVE", "syntax", "A2", "Coordenação adversativa", "Adversative coordination"),

  // B1
  skill("PT.SYNTAX.COORD.CONCLUSIVE", "syntax", "B1", "Coordenação conclusiva", "Conclusive coordination", ["PT.SYNTAX.COORD.COPULATIVE"]),
  skill("PT.SYNTAX.COORD.DISJUNCTIVE", "syntax", "B1", "Coordenação disjuntiva", "Disjunctive coordination"),
  skill("PT.SYNTAX.COORD.EXPLICATIVE", "syntax", "B1", "Coordenação explicativa", "Explicative coordination"),

  // --- Subordination ---
  // B1
  skill("PT.SYNTAX.SUB.CAUSAL", "syntax", "B1", "Subordinação causal", "Causal subordination", ["PT.SYNTAX.COORD.COPULATIVE"]),
  skill("PT.SYNTAX.SUB.TEMPORAL", "syntax", "B1", "Subordinação temporal", "Temporal subordination"),
  skill("PT.SYNTAX.SUB.CONDITIONAL", "syntax", "B1", "Subordinação condicional", "Conditional subordination"),
  skill("PT.SYNTAX.SUB.FINAL", "syntax", "B1", "Subordinação final", "Final subordination"),
  skill("PT.SYNTAX.SUB.COMPLETIVE", "syntax", "B1", "Subordinação completiva", "Completive subordination"),

  // B2
  skill("PT.SYNTAX.SUB.CONCESSIVE", "syntax", "B2", "Subordinação concessiva", "Concessive subordination", ["PT.SYNTAX.SUB.CAUSAL"]),
  skill("PT.SYNTAX.SUB.CONSECUTIVE", "syntax", "B2", "Subordinação consecutiva", "Consecutive subordination", ["PT.SYNTAX.SUB.CAUSAL"]),
  skill("PT.SYNTAX.SUB.COMPARATIVE", "syntax", "B2", "Subordinação comparativa", "Comparative subordination"),
  skill("PT.SYNTAX.SUB.RELATIVE.RESTRICTIVE", "syntax", "B2", "Oração relativa restritiva", "Restrictive relative clause", ["PT.PRON.RELATIVE"]),
  skill("PT.SYNTAX.SUB.RELATIVE.EXPLICATIVE", "syntax", "B2", "Oração relativa explicativa", "Explicative relative clause", ["PT.SYNTAX.SUB.RELATIVE.RESTRICTIVE"]),
  skill("PT.SYNTAX.SUB.RELATIVE.FREE", "syntax", "B2", "Oração relativa sem antecedente", "Free relative clause", ["PT.SYNTAX.SUB.RELATIVE.RESTRICTIVE"]),

  // =========================================================================
  // LEXICON — PT.LEX.*
  // =========================================================================

  // A1
  skill("PT.LEX.FREQUENCY.BASIC", "lexicon", "A1", "Vocabulário de alta frequência", "High-frequency vocabulary"),

  // A2
  skill("PT.LEX.SEMANTIC_FIELD", "lexicon", "A2", "Campos semânticos", "Semantic fields", ["PT.LEX.FREQUENCY.BASIC"]),
  skill("PT.LEX.LEXICAL_FIELD", "lexicon", "A2", "Campos lexicais", "Lexical fields", ["PT.LEX.FREQUENCY.BASIC"]),
  skill("PT.LEX.SYNONYMY_ANTONYMY", "lexicon", "A2", "Sinonímia e antonímia", "Synonymy and antonymy", ["PT.LEX.FREQUENCY.BASIC"]),
  skill("PT.LEX.FALSE_FRIENDS", "lexicon", "A2", "Falsos amigos", "False friends", ["PT.LEX.FREQUENCY.BASIC"]),

  // B1
  skill("PT.LEX.HYPERONYMY_HYPONYMY", "lexicon", "B1", "Hiperonímia e hiponímia", "Hyperonymy and hyponymy", ["PT.LEX.SYNONYMY_ANTONYMY"]),
  skill("PT.LEX.HOLONYMY_MERONYMY", "lexicon", "B1", "Holonímia e meronímia", "Holonymy and meronymy", ["PT.LEX.HYPERONYMY_HYPONYMY"]),
  skill("PT.LEX.COLLOCATION", "lexicon", "B1", "Colocação", "Collocation", ["PT.LEX.FREQUENCY.BASIC"]),
  skill("PT.LEX.POLYSEMY", "lexicon", "B1", "Polissemia", "Polysemy", ["PT.LEX.SEMANTIC_FIELD"]),

  // B2
  skill("PT.LEX.ARCHAISM_NEOLOGISM", "lexicon", "B2", "Arcaísmos e neologismos", "Archaisms and neologisms"),
  skill("PT.LEX.REGISTER", "lexicon", "B2", "Registo de língua", "Language register", ["PT.LEX.COLLOCATION"]),

  // =========================================================================
  // SEMANTICS — PT.SEM.*
  // =========================================================================

  // A2
  skill("PT.SEM.TEMPORAL.PAST_PRESENT_FUTURE", "syntax", "A2", "Localização temporal básica", "Basic temporal location"),
  skill("PT.SEM.ASPECT.PERFECTIVE", "syntax", "A2", "Valor perfetivo", "Perfective aspect", ["PT.TENSES.PRETERITE_PERFECT"]),

  // B1
  skill("PT.SEM.TEMPORAL.ANTERIORITY", "syntax", "B1", "Anterioridade", "Anteriority", ["PT.SEM.TEMPORAL.PAST_PRESENT_FUTURE"]),
  skill("PT.SEM.TEMPORAL.SIMULTANEITY", "syntax", "B1", "Simultaneidade", "Simultaneity", ["PT.SEM.TEMPORAL.PAST_PRESENT_FUTURE"]),
  skill("PT.SEM.TEMPORAL.POSTERIORITY", "syntax", "B1", "Posterioridade", "Posteriority", ["PT.SEM.TEMPORAL.PAST_PRESENT_FUTURE"]),
  skill("PT.SEM.ASPECT.IMPERFECTIVE", "syntax", "B1", "Valor imperfetivo", "Imperfective aspect", ["PT.SEM.ASPECT.PERFECTIVE", "PT.TENSES.IMPERFECT"]),
  skill("PT.SEM.ASPECT.HABITUAL", "syntax", "B1", "Situação habitual", "Habitual situation", ["PT.SEM.ASPECT.IMPERFECTIVE"]),
  skill("PT.SEM.ASPECT.GENERIC", "syntax", "B1", "Situação genérica", "Generic situation"),
  skill("PT.SEM.MODALITY.DEONTIC", "syntax", "B1", "Modalidade deôntica", "Deontic modality", ["PT.TENSES.PRESENT"]),

  // B2
  skill("PT.SEM.ASPECT.ITERATIVE", "syntax", "B2", "Situação iterativa", "Iterative situation", ["PT.SEM.ASPECT.HABITUAL"]),
  skill("PT.SEM.MODALITY.EPISTEMIC", "syntax", "B2", "Modalidade epistémica", "Epistemic modality", ["PT.SEM.MODALITY.DEONTIC"]),
  skill("PT.SEM.MODALITY.APPRECIATIVE", "syntax", "B2", "Modalidade apreciativa", "Appreciative modality"),
  skill("PT.SEM.TEMPORAL.INTER_EVENT", "syntax", "B2", "Relações temporais entre eventos", "Inter-event temporal relations", ["PT.SEM.TEMPORAL.ANTERIORITY", "PT.SEM.TEMPORAL.POSTERIORITY"]),

  // =========================================================================
  // PRAGMATICS / DISCOURSE — PT.DISCOURSE.*
  // =========================================================================

  // A2
  skill("PT.DISCOURSE.REGISTER.FORMAL_INFORMAL", "pragmatics", "A2", "Registo formal e informal", "Formal and informal register"),
  skill("PT.DISCOURSE.POLITENESS", "pragmatics", "A2", "Cortesia e tratamento", "Politeness and forms of address"),

  // B1
  skill("PT.DISCOURSE.COHESION.LEXICAL", "pragmatics", "B1", "Coesão lexical", "Lexical cohesion", ["PT.LEX.SYNONYMY_ANTONYMY"]),
  skill("PT.DISCOURSE.COHESION.GRAMMATICAL", "pragmatics", "B1", "Coesão gramatical", "Grammatical cohesion"),
  skill("PT.DISCOURSE.COHESION.REFERENTIAL", "pragmatics", "B1", "Coesão referencial", "Referential cohesion", ["PT.PRON.PERSONAL.DIRECT_OBJECT"]),
  skill("PT.DISCOURSE.COHESION.TEMPORAL", "pragmatics", "B1", "Coesão temporal", "Temporal cohesion", ["PT.SEM.TEMPORAL.PAST_PRESENT_FUTURE"]),
  skill("PT.DISCOURSE.DEIXIS.PERSONAL", "pragmatics", "B1", "Deixis pessoal", "Personal deixis", ["PT.PRON.PERSONAL.SUBJECT"]),
  skill("PT.DISCOURSE.DEIXIS.TEMPORAL", "pragmatics", "B1", "Deixis temporal", "Temporal deixis"),
  skill("PT.DISCOURSE.DEIXIS.SPATIAL", "pragmatics", "B1", "Deixis espacial", "Spatial deixis"),
  skill("PT.DISCOURSE.CONNECTORS", "pragmatics", "B1", "Conectores discursivos", "Discourse connectors"),

  // B2
  skill("PT.DISCOURSE.COHERENCE.LOGICAL", "pragmatics", "B2", "Coerência lógico-conceptual", "Logical-conceptual coherence", ["PT.DISCOURSE.COHESION.GRAMMATICAL"]),
  skill("PT.DISCOURSE.COHERENCE.PRAGMATIC", "pragmatics", "B2", "Coerência pragmático-funcional", "Pragmatic-functional coherence"),
  skill("PT.DISCOURSE.SPEECH.DIRECT", "pragmatics", "B2", "Discurso direto", "Direct speech"),
  skill("PT.DISCOURSE.SPEECH.INDIRECT", "pragmatics", "B2", "Discurso indireto", "Indirect speech", ["PT.DISCOURSE.SPEECH.DIRECT"]),
  skill("PT.DISCOURSE.SPEECH.FREE_INDIRECT", "pragmatics", "B2", "Discurso indireto livre", "Free indirect speech", ["PT.DISCOURSE.SPEECH.INDIRECT"]),
  skill("PT.DISCOURSE.TEXT_SEQUENCE.NARRATIVE", "pragmatics", "B2", "Sequência narrativa", "Narrative sequence"),
  skill("PT.DISCOURSE.TEXT_SEQUENCE.DESCRIPTIVE", "pragmatics", "B2", "Sequência descritiva", "Descriptive sequence"),
  skill("PT.DISCOURSE.TEXT_SEQUENCE.ARGUMENTATIVE", "pragmatics", "B2", "Sequência argumentativa", "Argumentative sequence"),
  skill("PT.DISCOURSE.TEXT_SEQUENCE.EXPLICATIVE", "pragmatics", "B2", "Sequência explicativa", "Explicative sequence"),
  skill("PT.DISCOURSE.TEXT_SEQUENCE.DIALOGAL", "pragmatics", "B2", "Sequência dialogal", "Dialogal sequence"),
  skill("PT.DISCOURSE.INTERTEXTUALITY", "pragmatics", "B2", "Intertextualidade", "Intertextuality"),

  // =========================================================================
  // ORTHOGRAPHY — PT.ORTH.*
  // =========================================================================

  // A1
  skill("PT.ORTH.ACCENTS.BASIC", "orthography", "A1", "Acentuação básica", "Basic accentuation"),
  skill("PT.ORTH.CEDILLA", "orthography", "A1", "Cedilha", "Cedilla"),

  // A2
  skill("PT.ORTH.ACCENTS.ACUTE_CIRCUMFLEX", "orthography", "A2", "Acento agudo vs circunflexo", "Acute vs circumflex accent", ["PT.ORTH.ACCENTS.BASIC"]),
  skill("PT.ORTH.TILDE", "orthography", "A2", "Til", "Tilde", ["PT.ORTH.ACCENTS.BASIC"]),
  skill("PT.ORTH.HYPHEN", "orthography", "A2", "Uso do hífen", "Hyphen usage"),

  // B1
  skill("PT.ORTH.CAPITALIZATION", "orthography", "B1", "Maiúsculas e minúsculas", "Capitalization"),
  skill("PT.ORTH.PUNCTUATION", "orthography", "B1", "Pontuação", "Punctuation"),

  // B2
  skill("PT.ORTH.SPELLING_REFORM", "orthography", "B2", "Acordo ortográfico", "Spelling reform"),

  // =========================================================================
  // WRITING & COMMUNICATION — PT.COMM.*
  // =========================================================================

  // B2
  skill("PT.COMM.EXPOSITION", "pragmatics", "B2", "Exposição sobre um tema", "Exposition on a topic", ["PT.DISCOURSE.COHERENCE.LOGICAL", "PT.DISCOURSE.CONNECTORS"]),
  skill("PT.COMM.CRITICAL_APPRAISAL", "pragmatics", "B2", "Apreciação crítica", "Critical appraisal", ["PT.DISCOURSE.TEXT_SEQUENCE.ARGUMENTATIVE"]),
  skill("PT.COMM.OPINION_TEXT", "pragmatics", "B2", "Texto de opinião", "Opinion text", ["PT.DISCOURSE.TEXT_SEQUENCE.ARGUMENTATIVE"]),

  // =========================================================================
  // RHETORIC — PT.RHETORIC.*
  // =========================================================================

  // B1
  skill("PT.RHETORIC.COMPARISON", "lexicon", "B1", "Comparação", "Comparison"),
  skill("PT.RHETORIC.ENUMERATION", "lexicon", "B1", "Enumeração", "Enumeration"),
  skill("PT.RHETORIC.HYPERBOLE", "lexicon", "B1", "Hipérbole", "Hyperbole"),

  // B2
  skill("PT.RHETORIC.METAPHOR", "lexicon", "B2", "Metáfora", "Metaphor", ["PT.RHETORIC.COMPARISON"]),
  skill("PT.RHETORIC.METONYMY", "lexicon", "B2", "Metonímia", "Metonymy"),
  skill("PT.RHETORIC.PERSONIFICATION", "lexicon", "B2", "Personificação", "Personification", ["PT.RHETORIC.METAPHOR"]),
  skill("PT.RHETORIC.IRONY", "lexicon", "B2", "Ironia", "Irony"),
  skill("PT.RHETORIC.EUPHEMISM", "lexicon", "B2", "Eufemismo", "Euphemism"),
  skill("PT.RHETORIC.ANTITHESIS", "lexicon", "B2", "Antítese", "Antithesis"),
  skill("PT.RHETORIC.ANAPHORA", "lexicon", "B2", "Anáfora", "Anaphora"),
  skill("PT.RHETORIC.APOSTROPHE", "lexicon", "B2", "Apóstrofe", "Apostrophe"),
  skill("PT.RHETORIC.RHETORICAL_QUESTION", "lexicon", "B2", "Interrogação retórica", "Rhetorical question"),
  skill("PT.RHETORIC.GRADATION", "lexicon", "B2", "Gradação", "Gradation", ["PT.RHETORIC.ENUMERATION"]),
  skill("PT.RHETORIC.SYNECDOCHE", "lexicon", "B2", "Sinédoque", "Synecdoche", ["PT.RHETORIC.METONYMY"]),
  skill("PT.RHETORIC.ALLITERATION", "lexicon", "B2", "Aliteração", "Alliteration"),
  skill("PT.RHETORIC.ONOMATOPOEIA", "lexicon", "B2", "Onomatopeia", "Onomatopoeia"),
  skill("PT.RHETORIC.SYNESTHESIA", "lexicon", "B2", "Sinestesia", "Synesthesia"),
  skill("PT.RHETORIC.ALLEGORY", "lexicon", "B2", "Alegoria", "Allegory", ["PT.RHETORIC.METAPHOR"]),
  skill("PT.RHETORIC.PERIPHRASIS", "lexicon", "B2", "Perífrase", "Periphrasis"),
  skill("PT.RHETORIC.PLEONASM", "lexicon", "B2", "Pleonasmo", "Pleonasm"),
  skill("PT.RHETORIC.ANASTROPHE", "lexicon", "B2", "Anástrofe", "Anastrophe"),

  // =========================================================================
  // VERBS — Additional classes (PT.VERBS.*)
  // =========================================================================

  // A2
  skill("PT.VERBS.TRANSITIVITY.INTRANSITIVE", "tenses_moods", "A2", "Verbos intransitivos", "Intransitive verbs", ["PT.TENSES.PRESENT"]),
  skill("PT.VERBS.TRANSITIVITY.DIRECT", "tenses_moods", "A2", "Verbos transitivos diretos", "Direct transitive verbs", ["PT.TENSES.PRESENT", "PT.SYNTAX.DIRECT_OBJECT"]),

  // B1
  skill("PT.VERBS.TRANSITIVITY.INDIRECT", "tenses_moods", "B1", "Verbos transitivos indiretos", "Indirect transitive verbs", ["PT.VERBS.TRANSITIVITY.DIRECT", "PT.SYNTAX.INDIRECT_OBJECT"]),
  skill("PT.VERBS.TRANSITIVITY.DITRANSITIVE", "tenses_moods", "B1", "Verbos transitivos diretos e indiretos", "Ditransitive verbs", ["PT.VERBS.TRANSITIVITY.DIRECT", "PT.VERBS.TRANSITIVITY.INDIRECT"]),
  skill("PT.VERBS.COPULATIVE", "tenses_moods", "B1", "Verbos copulativos", "Copulative verbs", ["PT.TENSES.SER_ESTAR"]),
  skill("PT.VERBS.AUXILIARY.TEMPORAL", "tenses_moods", "B1", "Auxiliares temporais", "Temporal auxiliaries", ["PT.TENSES.TER_HAVER"]),
  skill("PT.VERBS.AUXILIARY.MODAL", "tenses_moods", "B1", "Auxiliares modais", "Modal auxiliaries", ["PT.TENSES.PRESENT"]),
  skill("PT.VERBS.AUXILIARY.ASPECTUAL", "tenses_moods", "B1", "Auxiliares aspetuais", "Aspectual auxiliaries", ["PT.TENSES.PRESENT"]),

  // B2
  skill("PT.VERBS.TRANSITIVITY.PREDICATIVE", "tenses_moods", "B2", "Verbos transitivos-predicativos", "Predicative transitive verbs", ["PT.VERBS.TRANSITIVITY.DIRECT", "PT.SYNTAX.PREDICATIVE_DO"]),
];

// ===========================================================================
// KNOWLEDGE ITEMS — representative sample per domain
// ===========================================================================

const DEFAULT_CRITERIA = { minAccuracy: 0.80, minVariety: 0.50, minReps: 5 };
const SPEECH_CRITERIA = { minAccuracy: 0.75, minVariety: 0.40, minReps: 8 };
const PRODUCTION_CRITERIA = { minAccuracy: 0.80, minVariety: 0.60, minReps: 6 };

export const KNOWLEDGE_ITEMS: KnowledgeItemSeed[] = [

  // --- PHONETICS ---
  ki("PT.PHON.VOWELS.ORAL.A_OPEN_CLOSED", "PT.PHON.VOWELS.ORAL", "A1",
    "O 'a' tónico é aberto [a]; o 'a' átono reduz-se a [ɐ] ou quase desaparece.",
    ["cama [ˈkɐmɐ]", "casa [ˈkazɐ]", "mapa [ˈmapɐ]"],
    {
      commonErrors: ["Pronunciar todos os 'a' como abertos (influência PT-BR ou L1)"],
      criteria: SPEECH_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "communication"],
      relatedTo: ["PT.PHON.VOWELS.ORAL.E_VARIANTS", "PT.PHON.REDUCTION.UNSTRESSED.RULES"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não tem a distinção aberto/fechado em vogais centrais." },
        bn: { difficulty: "high", reason: "O bengali não distingue graus de abertura vocálica como o PT-EU." },
        en: { difficulty: "medium", reason: "O inglês tem schwa mas a redução PT-EU é mais extrema." },
        es: { difficulty: "medium", reason: "O espanhol mantém vogais claras em posição átona." },
      },
    },
  ),
  ki("PT.PHON.VOWELS.ORAL.E_VARIANTS", "PT.PHON.VOWELS.ORAL", "A1",
    "O 'e' tónico pode ser aberto [ɛ] ou fechado [e]; o 'e' átono reduz-se a [ɨ] (quase mudo).",
    ["café [kɐˈfɛ]", "mesa [ˈmezɐ]", "pequeno [pɨˈkenu]"],
    {
      commonErrors: ["Pronunciar o 'e' final como [i] (influência PT-BR)"],
      criteria: SPEECH_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "communication"],
      relatedTo: ["PT.PHON.VOWELS.ORAL.A_OPEN_CLOSED"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não possui o [ɨ] (schwa alto central)." },
        ur: { difficulty: "high", reason: "O urdu não tem equivalente para [ɨ]." },
        ar: { difficulty: "high", reason: "O sistema vocálico árabe tem apenas 3 vogais base." },
      },
    },
  ),
  ki("PT.PHON.VOWELS.NASAL.BASIC", "PT.PHON.VOWELS.NASAL", "A1",
    "As vogais nasais produzem-se com passagem de ar pelo nariz: ã [ɐ̃], õ [õ], etc.",
    ["mãe [mɐ̃j]", "põe [põj]", "fim [fĩ]"],
    {
      criteria: SPEECH_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "communication"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi tem nasalidade vocálica (anunasika) mas com distribuição diferente." },
        en: { difficulty: "high", reason: "O inglês não tem vogais nasais fonémicas." },
        es: { difficulty: "high", reason: "O espanhol não tem vogais nasais distintivas." },
        fr: { difficulty: "low", reason: "O francês também tem vogais nasais." },
        ar: { difficulty: "high", reason: "O árabe não tem vogais nasais." },
      },
    },
  ),
  ki("PT.PHON.REDUCTION.UNSTRESSED.RULES", "PT.PHON.REDUCTION.UNSTRESSED", "A2",
    "Em posição átona, as vogais do PT-EU sofrem forte redução: 'e' → [ɨ], 'o' → [u], 'a' → [ɐ].",
    ["telefone [tɨlɨˈfɔnɨ]", "bonito [buˈnitu]", "Portugal [puɾtuˈɣal]"],
    {
      counterexamples: ["No PT-BR a redução é menor: 'telefone' pronuncia-se com [e] aberto."],
      criteria: SPEECH_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production"],
      relatedTo: ["PT.PHON.VOWELS.ORAL.A_OPEN_CLOSED", "PT.PHON.VOWELS.ORAL.E_VARIANTS"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "As línguas indo-arianas mantêm vogais mais estáveis." },
        bn: { difficulty: "high", reason: "O bengali tem schwa deletion mas sem a mesma sistematicidade." },
        es: { difficulty: "high", reason: "O espanhol quase não reduz vogais átonas.", expectedErrors: ["Pronunciar todas as vogais com a mesma clareza"] },
      },
    },
  ),

  // --- MORPHOLOGY ---
  ki("PT.MORPH.GENDER.REGULAR", "PT.MORPH.GENDER", "A1",
    "Geralmente, palavras terminadas em -o são masculinas e em -a são femininas.",
    ["o gato / a gata", "o menino / a menina", "o livro"],
    {
      counterexamples: ["o dia (masculino apesar de terminar em -a)", "a tribo (feminino apesar de terminar em -o)"],
      commonErrors: ["Assumir que todas as palavras em -a são femininas"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation"],
      confusableWith: ["PT.MORPH.GENDER.IRREGULAR"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês não tem género gramatical.", expectedErrors: ["Usar artigo errado com nomes de género opaco"] },
        hi: { difficulty: "medium", reason: "O hindi tem género gramatical mas as regras diferem." },
        ur: { difficulty: "medium", reason: "O urdu tem género mas com padrões distintos." },
        ar: { difficulty: "medium", reason: "O árabe tem género mas com terminações e regras diferentes." },
        es: { difficulty: "low", reason: "O espanhol segue regras semelhantes de género." },
      },
    },
  ),
  ki("PT.MORPH.GENDER.IRREGULAR", "PT.MORPH.GENDER", "A1",
    "Alguns nomes têm género imprevisível ou formas completamente diferentes.",
    ["o homem / a mulher", "o pai / a mãe", "o cão / a cadela"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production"],
      confusableWith: ["PT.MORPH.GENDER.REGULAR"],
    },
  ),
  ki("PT.MORPH.NUMBER.REGULAR", "PT.MORPH.NUMBER", "A1",
    "O plural regular forma-se acrescentando -s ao singular.",
    ["gato → gatos", "casa → casas", "livro → livros"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation"],
      confusableWith: ["PT.MORPH.NUMBER.IRREGULAR"],
    },
  ),
  ki("PT.MORPH.NUMBER.IRREGULAR", "PT.MORPH.NUMBER", "A1",
    "Palavras terminadas em -ão, -l, -r, -z e -s têm plurais irregulares.",
    ["cão → cães", "animal → animais", "luz → luzes", "país → países"],
    {
      commonErrors: ["Formar o plural de -ão sempre com -ões (pão → pães, não pões)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      confusableWith: ["PT.MORPH.NUMBER.REGULAR"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês tem poucos plurais irregulares e nenhum com alternância como -ão." },
        hi: { difficulty: "high", reason: "Os padrões de plural do hindi são completamente diferentes." },
        es: { difficulty: "medium", reason: "O espanhol tem -ión → -iones mas sem a variedade do português." },
      },
    },
  ),

  // --- TENSES ---
  ki("PT.TENSES.PRESENT.REGULAR_AR", "PT.TENSES.PRESENT", "A1",
    "Verbos regulares em -ar: falo, falas, fala, falamos, falam.",
    ["Eu falo português.", "Tu trabalhas muito.", "Eles moram em Lisboa."],
    {
      counterexamples: ["Eu *fálo (a sílaba tónica não muda na conjugação regular)"],
      commonErrors: ["Omitir a desinência: *Eu fal português", "Confundir -am (presente) com -ão (futuro)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation"],
      relatedTo: ["PT.TENSES.PRESENT.REGULAR_ER", "PT.TENSES.PRESENT.REGULAR_IR"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi tem conjugação verbal mas com padrões diferentes.", expectedErrors: ["Omitir a conjugação e usar o infinitivo"] },
        bn: { difficulty: "medium", reason: "O bengali tem conjugação por pessoa mas com menos formas." },
        ur: { difficulty: "medium", reason: "O urdu conjuga por género e pessoa, padrão diferente." },
        en: { difficulty: "high", reason: "O inglês quase não conjuga no presente (apenas -s na 3.a pessoa).", expectedErrors: ["Usar a mesma forma para todas as pessoas"] },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.REGULAR_ER", "PT.TENSES.PRESENT", "A1",
    "Verbos regulares em -er: como, comes, come, comemos, comem.",
    ["Eu como pão ao pequeno-almoço.", "Ela bebe café.", "Nós aprendemos português."],
    {
      counterexamples: ["Eu *comemos (usar a forma correta para cada pessoa)"],
      commonErrors: ["Trocar desinências -er com -ar: *Eu como → *Eu como (de comer, não de comprar)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation"],
      relatedTo: ["PT.TENSES.PRESENT.REGULAR_AR", "PT.TENSES.PRESENT.REGULAR_IR"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "As desinências -er diferem das do hindi." },
        bn: { difficulty: "medium", reason: "O bengali tem menos distinção entre classes de verbos." },
        ur: { difficulty: "medium", reason: "O urdu não distingue classes de conjugação do mesmo modo." },
        en: { difficulty: "high", reason: "O inglês não distingue classes de verbos regulares.", expectedErrors: ["Usar desinências de -ar em verbos -er"] },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.REGULAR_IR", "PT.TENSES.PRESENT", "A1",
    "Verbos regulares em -ir: parto, partes, parte, partimos, partem.",
    ["Eu abro a porta.", "Ele parte amanhã.", "Elas decidem juntas."],
    {
      counterexamples: ["Eu *parti (isto é pretérito perfeito, não presente)"],
      commonErrors: ["Confundir 1.a conjugação (-ar) com 3.a (-ir): *Eu parto → *Eu parta"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation"],
      relatedTo: ["PT.TENSES.PRESENT.REGULAR_AR", "PT.TENSES.PRESENT.REGULAR_ER"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi não distingue classes de conjugação como o português." },
        bn: { difficulty: "medium", reason: "O bengali usa sufixos verbais diferentes." },
        ur: { difficulty: "medium", reason: "O urdu não divide verbos em conjugações -ar/-er/-ir." },
        en: { difficulty: "high", reason: "O inglês não tem sistema de conjugações.", expectedErrors: ["Misturar desinências entre as três conjugações"] },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.IRREGULAR_SER", "PT.TENSES.PRESENT", "A1",
    "Ser: sou, és, é, somos, são.",
    ["Eu sou português.", "Tu és estudante.", "Nós somos amigos."],
    {
      counterexamples: ["Eu *sejo (a forma não segue nenhum padrão regular)"],
      commonErrors: ["Confundir 'é' com 'e': *Ele e alto (correto: Ele é alto)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      confusableWith: ["PT.TENSES.PRESENT.IRREGULAR_ESTAR"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi tem 'hona' para ser/estar sem distinção.", expectedErrors: ["Usar 'estar' onde se deveria usar 'ser'"] },
        bn: { difficulty: "high", reason: "O bengali usa um único verbo copulativo." },
        ur: { difficulty: "high", reason: "O urdu usa 'hona' sem distinção ser/estar." },
        en: { difficulty: "medium", reason: "O inglês usa 'to be' para ambos, mas a conjugação (am/are/is) ajuda a memorizar formas." },
        ar: { difficulty: "high", reason: "O árabe não usa cópula no presente.", expectedErrors: ["Omitir o verbo 'ser' completamente no presente"] },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.IRREGULAR_ESTAR", "PT.TENSES.PRESENT", "A1",
    "Estar: estou, estás, está, estamos, estão.",
    ["Eu estou bem.", "Ela está em casa.", "Vocês estão cansados?"],
    {
      counterexamples: ["Eu *esto (a forma correta é 'estou')"],
      commonErrors: ["Omitir o acento em 'está' e 'estão'", "Confundir com 'ser' em contextos de localização"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      confusableWith: ["PT.TENSES.PRESENT.IRREGULAR_SER"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não distingue ser de estar.", expectedErrors: ["Usar 'ser' para estados temporários"] },
        bn: { difficulty: "high", reason: "O bengali não tem essa distinção." },
        ur: { difficulty: "high", reason: "O urdu usa 'hona' para ambos." },
        en: { difficulty: "medium", reason: "O inglês usa 'to be' para ambos." },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.IRREGULAR_TER", "PT.TENSES.PRESENT", "A1",
    "Ter: tenho, tens, tem, temos, têm.",
    ["Eu tenho dois irmãos.", "Tu tens fome?", "Eles têm aulas."],
    {
      counterexamples: ["Eles *tem (sem circunflexo — a 3.a pessoa do plural é 'têm')"],
      commonErrors: ["Escrever 'tem' em vez de 'têm' no plural", "Confundir 'tem' com 'vem'"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi usa 'paas hona' (ter junto) para posse, conceito diferente." },
        bn: { difficulty: "medium", reason: "O bengali usa construção diferente para posse." },
        ur: { difficulty: "medium", reason: "O urdu usa 'ke paas' para posse." },
        en: { difficulty: "low", reason: "O inglês tem 'have/has', conceito semelhante." },
        ar: { difficulty: "high", reason: "O árabe usa construção preposicional para posse, sem verbo 'ter'.", expectedErrors: ["Tentar usar preposição em vez do verbo 'ter'"] },
      },
    },
  ),
  ki("PT.TENSES.PRESENT.IRREGULAR_IR", "PT.TENSES.PRESENT", "A1",
    "Ir: vou, vais, vai, vamos, vão.",
    ["Eu vou ao supermercado.", "Nós vamos à praia.", "Eles vão trabalhar."],
    {
      counterexamples: ["Eu *io (a forma correta é 'vou', completamente irregular)"],
      commonErrors: ["Confundir 'vão' (ir) com 'são' (ser) na 3.a pessoa do plural"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi 'jaana' também é irregular, mas com padrão diferente." },
        bn: { difficulty: "medium", reason: "O bengali 'jaowa' segue padrão diferente." },
        ur: { difficulty: "medium", reason: "O urdu 'jaana' tem conjugação diferente." },
        en: { difficulty: "low", reason: "O inglês 'go' é regular no presente (go/goes)." },
      },
    },
  ),
  ki("PT.TENSES.SER_ESTAR.CONTRAST", "PT.TENSES.SER_ESTAR", "A1",
    "Ser descreve características permanentes ou identidade; estar descreve estados temporários ou localização.",
    ["Ele é alto. (permanente)", "Ele está doente. (temporário)", "Lisboa é a capital. (identidade)"],
    {
      commonErrors: ["Usar 'ser' para estados temporários: *Eu sou cansado (correto: estou cansado)"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation", "communication"],
      confusableWith: ["PT.TENSES.PRESENT.IRREGULAR_SER", "PT.TENSES.PRESENT.IRREGULAR_ESTAR"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês usa 'to be' para ambos.", expectedErrors: ["Usar 'ser' com adjetivos de estado temporário"] },
        hi: { difficulty: "high", reason: "O hindi tem 'hona' para ambos os conceitos." },
        ur: { difficulty: "high", reason: "O urdu tem 'hona' sem distinção ser/estar." },
        bn: { difficulty: "high", reason: "O bengali tem um único verbo 'ser'." },
        ar: { difficulty: "high", reason: "O árabe não usa cópula no presente.", expectedErrors: ["Omitir o verbo completamente em frases no presente"] },
        es: { difficulty: "low", reason: "O espanhol também distingue ser/estar." },
        fr: { difficulty: "high", reason: "O francês usa 'être' para ambos." },
      },
    },
  ),

  // --- DETERMINERS ---
  ki("PT.DET.ARTICLES.DEFINITE.FORMS", "PT.DET.ARTICLES.DEFINITE", "A1",
    "Os artigos definidos são: o, a, os, as.",
    ["o livro", "a casa", "os amigos", "as aulas"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não tem artigos.", expectedErrors: ["Omitir o artigo por completo"] },
        bn: { difficulty: "high", reason: "O bengali não tem artigos definidos separados." },
        ur: { difficulty: "high", reason: "O urdu não tem artigos." },
        ar: { difficulty: "medium", reason: "O árabe tem al- como artigo definido único, sem género/número." },
        en: { difficulty: "medium", reason: "O inglês tem 'the' sem flexão de género/número." },
      },
    },
  ),
  ki("PT.DET.ARTICLES.CONTRACTIONS.DE", "PT.DET.ARTICLES.CONTRACTIONS", "A2",
    "A preposição 'de' contrai-se com artigos: do, da, dos, das.",
    ["o livro do professor", "a cor da casa", "os nomes dos alunos"],
    {
      commonErrors: ["Escrever 'de o' separado em vez de 'do'"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      relatedTo: ["PT.DET.ARTICLES.CONTRACTIONS.EM", "PT.DET.ARTICLES.CONTRACTIONS.A"],
    },
  ),
  ki("PT.DET.ARTICLES.CONTRACTIONS.EM", "PT.DET.ARTICLES.CONTRACTIONS", "A2",
    "A preposição 'em' contrai-se com artigos: no, na, nos, nas.",
    ["no supermercado", "na escola", "nos livros"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      relatedTo: ["PT.DET.ARTICLES.CONTRACTIONS.DE", "PT.DET.ARTICLES.CONTRACTIONS.A"],
    },
  ),
  ki("PT.DET.ARTICLES.CONTRACTIONS.A", "PT.DET.ARTICLES.CONTRACTIONS", "A2",
    "A preposição 'a' contrai-se com artigo feminino: à, às. Masculino mantém 'ao, aos'.",
    ["Vou à escola.", "Vamos ao cinema.", "Refere-se às regras."],
    {
      commonErrors: ["Omitir o acento grave na contração à"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      relatedTo: ["PT.DET.ARTICLES.CONTRACTIONS.DE", "PT.DET.ARTICLES.CONTRACTIONS.EM"],
    },
  ),

  // --- PRONOUNS ---
  ki("PT.PRON.PERSONAL.SUBJECT.FORMS", "PT.PRON.PERSONAL.SUBJECT", "A1",
    "Pronomes pessoais sujeito: eu, tu, ele/ela/você, nós, eles/elas/vocês.",
    ["Eu moro em Lisboa.", "Tu falas português?", "Eles são simpáticos."],
    {
      commonErrors: ["Usar 'você' em contextos informais onde 'tu' é preferido em PT-EU"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      l1Difficulty: {
        en: { difficulty: "medium", reason: "O inglês não distingue tu/você.", expectedErrors: ["Usar 'você' sempre, ignorando o registo informal"] },
        hi: { difficulty: "medium", reason: "O hindi tem tu/tum/aap mas a pragmática difere." },
        ar: { difficulty: "medium", reason: "O árabe distingue género na 2.a pessoa mas não formalidade do mesmo modo." },
      },
    },
  ),
  ki("PT.PRON.PERSONAL.DIRECT_OBJECT.FORMS", "PT.PRON.PERSONAL.DIRECT_OBJECT", "A2",
    "Pronomes de complemento direto: me, te, o/a, nos, os/as.",
    ["Eu vejo-a todos os dias.", "Ele comprou-os ontem.", "Ela ajudou-me."],
    {
      commonErrors: ["Usar 'lhe' como complemento direto em vez de 'o/a'"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation"],
      confusableWith: ["PT.PRON.PERSONAL.CLITIC_PLACEMENT.ENCLISIS"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês usa a mesma forma (him/her) para direto e indireto.", expectedErrors: ["Confundir o/a com lhe"] },
        hi: { difficulty: "high", reason: "O hindi usa postposições, não clíticos pronominais." },
        ur: { difficulty: "high", reason: "O urdu usa postposições em vez de clíticos." },
      },
    },
  ),
  ki("PT.PRON.PERSONAL.CLITIC_PLACEMENT.ENCLISIS", "PT.PRON.PERSONAL.CLITIC_PLACEMENT", "B1",
    "Em PT-EU, a ênclise (pronome após o verbo) é a posição padrão em frases afirmativas simples.",
    ["Dou-te o livro.", "Comprei-o ontem.", "Vejo-a amanhã."],
    {
      counterexamples: ["No PT-BR a próclise é preferida: 'Te dou o livro.'"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      confusableWith: ["PT.PRON.PERSONAL.CLITIC_PLACEMENT.PROCLISIS"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês não tem clíticos verbais." },
        hi: { difficulty: "high", reason: "O hindi não tem clíticos pronominais pós-verbais." },
        es: { difficulty: "medium", reason: "O espanhol tem ênclise no imperativo e infinitivo, mas próclise em frases finitas." },
        fr: { difficulty: "medium", reason: "O francês usa próclise na maioria dos casos." },
      },
    },
  ),
  ki("PT.PRON.PERSONAL.CLITIC_PLACEMENT.PROCLISIS", "PT.PRON.PERSONAL.CLITIC_PLACEMENT", "B1",
    "A próclise (pronome antes do verbo) ocorre após negação, subordinadas, advérbios, pronomes interrogativos e relativos.",
    ["Não te vi.", "Que me dizes?", "Nunca o encontrei.", "O livro que te emprestei."],
    {
      commonErrors: ["Usar ênclise após negação: *Não vi-te (correto: Não te vi)"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      confusableWith: ["PT.PRON.PERSONAL.CLITIC_PLACEMENT.ENCLISIS"],
    },
  ),

  // --- PREPOSITIONS ---
  ki("PT.PREP.BASIC.A_DE_EM_PARA_COM", "PT.PREP.BASIC", "A1",
    "As preposições mais frequentes: a (direção), de (origem/posse), em (localização), para (destino/finalidade), com (companhia).",
    ["Vou a Lisboa.", "O livro de português.", "Moro em Portugal.", "É para ti.", "Vou com a Ana."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi usa postposições (após o nome), não preposições.", expectedErrors: ["Colocar a preposição após o nome"] },
        bn: { difficulty: "high", reason: "O bengali usa postposições." },
        ur: { difficulty: "high", reason: "O urdu usa postposições." },
        en: { difficulty: "medium", reason: "Preposições existem mas os usos divergem (in/at/to vs a/em/para)." },
      },
    },
  ),
  ki("PT.PREP.BASIC.EM_LOCATION", "PT.PREP.BASIC", "A1",
    "A preposição 'em' (e as suas contrações no/na/nos/nas) indica localização estática.",
    ["Eu moro em Lisboa.", "O livro está na mesa.", "Ela trabalha no hospital."],
    {
      counterexamples: ["Eu vou *em Lisboa. (para movimento, usa-se 'a' ou 'para', não 'em')"],
      commonErrors: ["Usar 'em' para indicar movimento/destino", "Esquecer a contração: *em o hospital (correto: no hospital)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation", "communication"],
      confusableWith: ["PT.PREP.BASIC.A_DE_EM_PARA_COM"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi usa postposições ('mein' = em) após o nome, não antes.", expectedErrors: ["Colocar 'em' após o nome"] },
        bn: { difficulty: "high", reason: "O bengali usa postposições para localização." },
        ur: { difficulty: "high", reason: "O urdu usa postposições ('mein')." },
        en: { difficulty: "medium", reason: "O inglês distingue in/at/on, que se traduzem todos como 'em' em muitos contextos.", expectedErrors: ["Tentar distinguir in/at/on em português quando 'em' serve para todos"] },
      },
    },
  ),
  ki("PT.PREP.BASIC.A_DIRECTION", "PT.PREP.BASIC", "A1",
    "A preposição 'a' indica direção, destino pontual ou localização temporária.",
    ["Vou ao cinema.", "Ele foi à escola.", "Cheguei a casa."],
    {
      counterexamples: ["Vou *no cinema. (para destino, usa-se 'a' ou 'para', não 'em')"],
      commonErrors: ["Usar 'em' em vez de 'a' para destino: *Vou no cinema", "Confundir 'a' com 'para' (a = ida pontual; para = mudança duradoura)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "translation", "communication"],
      confusableWith: ["PT.PREP.BASIC.EM_LOCATION"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi usa postposições diferentes para destino ('ko')." },
        en: { difficulty: "medium", reason: "O inglês usa 'to' para destino, conceito semelhante mas usos não se sobrepõem completamente." },
        es: { difficulty: "low", reason: "O espanhol usa 'a' de forma muito semelhante para destino." },
      },
    },
  ),
  ki("PT.PREP.POR_PARA.CONTRAST", "PT.PREP.POR_PARA", "A2",
    "'Por' indica causa, passagem ou agente; 'para' indica destino, finalidade ou destinatário.",
    ["Estudo por prazer. (causa)", "Passo por Lisboa. (passagem)", "Estudo para aprender. (finalidade)", "Isto é para ti. (destinatário)"],
    {
      commonErrors: ["Trocar 'por' e 'para' em contextos de causa vs finalidade"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês usa 'for' para muitos usos de 'por' e 'para'.", expectedErrors: ["Usar 'para' em contextos de causa onde se deveria usar 'por'"] },
        es: { difficulty: "medium", reason: "O espanhol tem por/para com usos semelhantes mas não idênticos." },
      },
    },
  ),

  // --- SYNTAX — DIRECT OBJECT (#58 vertical slice) ---
  ki("PT.SYNTAX.DIRECT_OBJECT.IDENTIFICATION", "PT.SYNTAX.DIRECT_OBJECT", "A2",
    "O complemento direto responde à pergunta 'o quê?' ou 'quem?' após o verbo. Não é precedido de preposição.",
    ["Eu li o livro. (li o quê? → o livro)", "Ela viu a Maria. (viu quem? → a Maria)", "Nós compramos pão."],
    {
      counterexamples: ["Eu gosto de música. (de música é complemento oblíquo, não direto — tem preposição)"],
      commonErrors: ["Confundir complemento direto com sujeito", "Identificar complemento oblíquo (com preposição) como direto"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      confusableWith: ["PT.SYNTAX.DIRECT_OBJECT.PRONOUN_REPLACE"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi marca o objeto direto com postposição 'ko', conceito diferente.", expectedErrors: ["Adicionar preposição ao complemento direto"] },
        bn: { difficulty: "high", reason: "O bengali usa postposição 'ke' para marcar o objeto." },
        ur: { difficulty: "high", reason: "O urdu marca o objeto com 'ko', diferente do português." },
        en: { difficulty: "low", reason: "O inglês identifica o objeto direto pela posição, semelhante ao português." },
      },
    },
  ),
  ki("PT.SYNTAX.DIRECT_OBJECT.PRONOUN_REPLACE", "PT.SYNTAX.DIRECT_OBJECT", "A2",
    "O complemento direto pode ser substituído por um pronome clítico: o, a, os, as (3.a pessoa) ou me, te, nos.",
    ["Eu li o livro. → Eu li-o.", "Ela viu a Maria. → Ela viu-a.", "Eles compraram as flores. → Eles compraram-nas."],
    {
      counterexamples: ["Eu *li-lhe o livro. ('lhe' é complemento indireto, não direto)"],
      commonErrors: ["Usar 'lhe' como pronome de complemento direto", "Esquecer a transformação -o → -no após formas verbais em nasal"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation"],
      confusableWith: ["PT.SYNTAX.DIRECT_OBJECT.IDENTIFICATION"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não tem clíticos pronominais.", expectedErrors: ["Repetir o nome em vez de usar o pronome clítico"] },
        bn: { difficulty: "high", reason: "O bengali não usa clíticos verbais." },
        ur: { difficulty: "high", reason: "O urdu não tem pronomes clíticos." },
        en: { difficulty: "medium", reason: "O inglês usa pronomes objeto (him, her, it) mas sem ênclise.", expectedErrors: ["Colocar o pronome antes do verbo em frases afirmativas simples"] },
      },
    },
  ),
  ki("PT.SYNTAX.DIRECT_OBJECT.A_PESSOAL", "PT.SYNTAX.DIRECT_OBJECT", "A2",
    "Em PT-EU, o complemento direto de pessoa geralmente não leva preposição 'a', ao contrário do espanhol.",
    ["Eu vi a Maria. (a = artigo, não preposição)", "Encontrei o João ontem."],
    {
      counterexamples: ["Em espanhol: Vi a María. (com 'a pessoal' obrigatório — em PT-EU não se usa)"],
      commonErrors: ["Acrescentar 'a' antes de complemento direto de pessoa por interferência do espanhol"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production"],
      l1Difficulty: {
        es: { difficulty: "high", reason: "O espanhol obriga o uso de 'a pessoal', inexistente em PT-EU.", expectedErrors: ["Escrever *Vi a o João (com preposição desnecessária)"] },
        hi: { difficulty: "low", reason: "O hindi não tem 'a pessoal', logo não há interferência negativa." },
        en: { difficulty: "low", reason: "O inglês não usa preposição antes do objeto direto." },
      },
    },
  ),

  // --- SYNTAX — GENERAL ---
  ki("PT.SYNTAX.WORD_ORDER.SVO", "PT.SYNTAX.WORD_ORDER", "A1",
    "A ordem básica da frase em português é Sujeito-Verbo-Objeto (SVO).",
    ["O João come a sopa.", "A Maria lê o livro.", "Os alunos estudam português."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi usa SOV.", expectedErrors: ["Colocar o verbo no final da frase"] },
        bn: { difficulty: "high", reason: "O bengali usa SOV." },
        ur: { difficulty: "high", reason: "O urdu usa SOV." },
        ar: { difficulty: "medium", reason: "O árabe usa VSO como ordem básica." },
      },
    },
  ),
  ki("PT.SYNTAX.NEGATION.NAO", "PT.SYNTAX.NEGATION", "A1",
    "A negação faz-se com 'não' antes do verbo.",
    ["Eu não falo francês.", "Ela não está em casa.", "Nós não sabemos."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation", "translation"],
    },
  ),
  ki("PT.SYNTAX.SUB.CAUSAL.PORQUE", "PT.SYNTAX.SUB.CAUSAL", "B1",
    "'Porque' introduz a causa; 'como' (causal) aparece no início da frase.",
    ["Estudo porque quero aprender.", "Como estava a chover, fiquei em casa."],
    {
      counterexamples: ["Estudo *por que quero aprender. ('por que' separado é interrogativo ou relativo, não causal)"],
      commonErrors: ["Confundir 'porque' (causa) com 'por que' (interrogativo) ou 'porquê' (nome)"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation"],
      confusableWith: ["PT.SYNTAX.SUB.CAUSAL.JA_QUE"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi usa 'kyonki' para causa, conceito semelhante mas posição diferente na frase." },
        en: { difficulty: "low", reason: "O inglês usa 'because' de forma muito semelhante." },
        ur: { difficulty: "medium", reason: "O urdu usa 'kyonke' com estrutura de frase diferente." },
        bn: { difficulty: "medium", reason: "O bengali usa 'karon' com posição diferente." },
      },
    },
  ),
  ki("PT.SYNTAX.SUB.CAUSAL.JA_QUE", "PT.SYNTAX.SUB.CAUSAL", "B1",
    "'Já que', 'visto que', 'uma vez que' introduzem causa com valor explicativo ou justificativo.",
    ["Já que estás aqui, ajuda-me.", "Visto que chove, levo o guarda-chuva."],
    {
      counterexamples: ["*Já que estás aqui. (frase incompleta — 'já que' exige uma oração principal)"],
      commonErrors: ["Usar 'já que' e 'porque' de forma intercambiável (já que tem valor mais justificativo)"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "translation"],
      confusableWith: ["PT.SYNTAX.SUB.CAUSAL.PORQUE"],
      l1Difficulty: {
        hi: { difficulty: "high", reason: "O hindi não tem equivalente direto para 'já que' / 'visto que' como conectores causais-justificativos." },
        en: { difficulty: "medium", reason: "O inglês tem 'since' / 'given that' com valor semelhante." },
        ur: { difficulty: "high", reason: "O urdu expressa justificação de forma diferente." },
      },
    },
  ),

  // --- SEMANTICS ---
  ki("PT.SEM.ASPECT.HABITUAL.MARKERS", "PT.SEM.ASPECT.HABITUAL", "B1",
    "Expressões como 'geralmente', 'sempre', 'todos os dias', 'costumar' constroem o valor habitual.",
    ["Geralmente, almoço às 13h.", "Costumo ler antes de dormir.", "Levanto-me cedo todos os dias."],
    {
      counterexamples: ["Ontem almocei às 13h. (pontual, não habitual)"],
      commonErrors: ["Usar 'costumar' no pretérito perfeito: *Costumei ir (correto: Costumava ir)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "free_production"],
      confusableWith: ["PT.SEM.ASPECT.HABITUAL.VS_PUNCTUAL"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi marca o habitual com sufixos específicos, conceito existe mas formas diferem." },
        en: { difficulty: "medium", reason: "O inglês usa 'usually', 'always' de forma semelhante, mas 'costumar' não tem equivalente direto." },
        bn: { difficulty: "medium", reason: "O bengali usa partículas para o habitual." },
      },
    },
  ),
  ki("PT.SEM.ASPECT.HABITUAL.VS_PUNCTUAL", "PT.SEM.ASPECT.HABITUAL", "B1",
    "A situação habitual repete-se regularmente; a situação pontual ocorre uma vez. O imperfeito expressa o habitual; o perfeito expressa o pontual.",
    ["Eu ia ao parque todos os dias. (habitual — imperfeito)", "Eu fui ao parque ontem. (pontual — perfeito)"],
    {
      counterexamples: ["Eu *ia ao parque ontem. (o imperfeito não serve para ações pontuais passadas)"],
      commonErrors: ["Usar o pretérito perfeito para ações habituais: *Todos os dias fui ao parque"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "translation"],
      confusableWith: ["PT.SEM.ASPECT.HABITUAL.MARKERS"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês usa 'used to' ou 'would' para o habitual passado, sem distinção morfológica no verbo.", expectedErrors: ["Usar o pretérito perfeito para hábitos passados"] },
        hi: { difficulty: "medium", reason: "O hindi distingue aspeto habitual (imperfetivo) de perfectivo." },
        ur: { difficulty: "medium", reason: "O urdu tem distinção aspetual semelhante." },
      },
    },
  ),
  ki("PT.SEM.ASPECT.HABITUAL.COSTUMAR", "PT.SEM.ASPECT.HABITUAL", "B1",
    "O verbo 'costumar' é auxiliar aspetual habitual. Usa-se com infinitivo: costumo + infinitivo.",
    ["Costumo acordar cedo.", "Ela costumava correr à noite.", "Não costumamos sair à segunda-feira."],
    {
      commonErrors: ["Conjugar 'costumar' no perfeito: *Costumei acordar cedo (o perfeito contradiz o valor habitual)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "translation"],
      l1Difficulty: {
        en: { difficulty: "medium", reason: "O inglês não tem auxiliar equivalente direto (usa 'usually' como advérbio)." },
        es: { difficulty: "low", reason: "O espanhol tem 'soler' com o mesmo uso." },
      },
    },
  ),
  ki("PT.SEM.MODALITY.DEONTIC.OBLIGATION", "PT.SEM.MODALITY.DEONTIC", "B1",
    "A obrigação exprime-se com 'dever', 'ter de/que', 'é obrigatório', 'é proibido'.",
    ["Tens de entregar o trabalho até sexta.", "É obrigatório usar cinto.", "Deves estudar mais."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "translation", "communication"],
      confusableWith: ["PT.SEM.MODALITY.DEONTIC.PERMISSION"],
    },
  ),
  ki("PT.SEM.MODALITY.DEONTIC.PERMISSION", "PT.SEM.MODALITY.DEONTIC", "B1",
    "A permissão exprime-se com 'poder', 'deixar', 'é permitido'.",
    ["Podes sair mais cedo.", "O professor deixou-nos ouvir música."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "communication"],
      confusableWith: ["PT.SEM.MODALITY.DEONTIC.OBLIGATION"],
    },
  ),
  ki("PT.SEM.MODALITY.EPISTEMIC.CERTAINTY", "PT.SEM.MODALITY.EPISTEMIC", "B2",
    "A certeza epistémica exprime-se com verbos como 'saber', 'achar', 'considerar', e advérbios como 'certamente'.",
    ["Sei que tens razão.", "Acho que estamos sem Internet.", "Certamente virá."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "free_production"],
      confusableWith: ["PT.SEM.MODALITY.EPISTEMIC.PROBABILITY"],
    },
  ),
  ki("PT.SEM.MODALITY.EPISTEMIC.PROBABILITY", "PT.SEM.MODALITY.EPISTEMIC", "B2",
    "A probabilidade exprime-se com 'talvez', 'é possível que', 'provavelmente', 'dever' (epistémico).",
    ["Talvez chova amanhã.", "É possível que ele venha.", "Deve estar avariado."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "free_production"],
      confusableWith: ["PT.SEM.MODALITY.EPISTEMIC.CERTAINTY"],
    },
  ),

  // --- DISCOURSE — COHESION (#58 vertical slice) ---
  ki("PT.DISCOURSE.COHESION.LEXICAL.REPETITION", "PT.DISCOURSE.COHESION.LEXICAL", "B1",
    "A coesão lexical por repetição consiste em retomar a mesma palavra ou expressão para manter a referência ao longo do texto.",
    ["O João comprou um carro. O carro é vermelho.", "Portugal é um país bonito. Este país tem praias magníficas."],
    {
      counterexamples: ["O João comprou um carro. O veículo é vermelho. (isto é substituição por sinónimo/hiperónimo, não repetição)"],
      commonErrors: ["Repetir excessivamente sem variação, tornando o texto pobre"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      confusableWith: ["PT.DISCOURSE.COHESION.LEXICAL.SUBSTITUTION"],
      l1Difficulty: {
        en: { difficulty: "low", reason: "O inglês usa repetição de forma semelhante." },
        hi: { difficulty: "low", reason: "O hindi usa repetição lexical frequentemente." },
      },
    },
  ),
  ki("PT.DISCOURSE.COHESION.LEXICAL.SUBSTITUTION", "PT.DISCOURSE.COHESION.LEXICAL", "B1",
    "A coesão lexical por substituição usa sinónimos, hiperónimos ou pronomes para evitar repetição mantendo a referência.",
    ["O gato dormia no sofá. O animal parecia tranquilo.", "Lisboa é uma cidade antiga. A capital portuguesa foi fundada há séculos."],
    {
      counterexamples: ["O gato dormia. O cão ladrou. (não é substituição — são referentes diferentes)"],
      commonErrors: ["Usar um sinónimo que altera o significado", "Perder a referência ao mudar de termo"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation", "free_production"],
      confusableWith: ["PT.DISCOURSE.COHESION.LEXICAL.REPETITION"],
      l1Difficulty: {
        en: { difficulty: "low", reason: "O inglês também usa substituição por sinónimos e hiperónimos." },
        hi: { difficulty: "medium", reason: "O hindi prefere repetição a substituição em muitos contextos." },
        ur: { difficulty: "medium", reason: "O urdu tende a repetir mais do que substituir." },
      },
    },
  ),
  ki("PT.DISCOURSE.COHESION.LEXICAL.FIELD", "PT.DISCOURSE.COHESION.LEXICAL", "B1",
    "Palavras do mesmo campo lexical ou semântico criam coesão por associação temática.",
    ["O hospital estava cheio. Os médicos corriam pelos corredores. As enfermeiras tratavam dos doentes.", "Na praia, o mar estava calmo. A areia brilhava ao sol."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "free_production"],
      l1Difficulty: {
        en: { difficulty: "low", reason: "O conceito de campo lexical funciona de forma idêntica." },
        hi: { difficulty: "low", reason: "O hindi também usa campos lexicais para coesão." },
      },
    },
  ),

  // --- DISCOURSE — SPEECH ---
  ki("PT.DISCOURSE.SPEECH.DIRECT.STRUCTURE", "PT.DISCOURSE.SPEECH.DIRECT", "B2",
    "O discurso direto reproduz as palavras exatas do locutor, com dois pontos, travessão e verbos declarativos.",
    ["A Maria disse: — Estou cansada.", "— E tu? — perguntou o João."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "transformation"],
      confusableWith: ["PT.DISCOURSE.SPEECH.INDIRECT.TRANSFORMATION"],
    },
  ),
  ki("PT.DISCOURSE.SPEECH.INDIRECT.TRANSFORMATION", "PT.DISCOURSE.SPEECH.INDIRECT", "B2",
    "No discurso indireto, os enunciados tornam-se orações subordinadas; mudam pessoa, tempo verbal e deíticos.",
    ["A Maria disse que estava cansada.", "O João perguntou-lhe se queria ir."],
    {
      commonErrors: ["Não alterar o tempo verbal na passagem de direto a indireto"],
      criteria: PRODUCTION_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "transformation", "controlled_production"],
      confusableWith: ["PT.DISCOURSE.SPEECH.DIRECT.STRUCTURE"],
    },
  ),

  // --- ORTHOGRAPHY ---
  ki("PT.ORTH.ACCENTS.BASIC.AGUDO", "PT.ORTH.ACCENTS.BASIC", "A1",
    "O acento agudo (´) indica vogal aberta e marca a sílaba tónica: á, é, í, ó, ú.",
    ["café", "água", "música", "médico", "país"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      confusableWith: ["PT.ORTH.ACCENTS.BASIC.CIRCUNFLEXO"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês não usa acentos gráficos.", expectedErrors: ["Omitir acentos por completo"] },
        hi: { difficulty: "high", reason: "O devanágari não usa acentos gráficos sobre caracteres." },
        ar: { difficulty: "high", reason: "O árabe usa diacríticos diferentes (harakat) com função distinta." },
      },
    },
  ),
  ki("PT.ORTH.ACCENTS.BASIC.CIRCUNFLEXO", "PT.ORTH.ACCENTS.BASIC", "A1",
    "O acento circunflexo (^) indica vogal fechada e marca a sílaba tónica: â, ê, ô.",
    ["português", "você", "avô", "pêssego"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production", "transformation"],
      confusableWith: ["PT.ORTH.ACCENTS.BASIC.AGUDO"],
    },
  ),
  ki("PT.ORTH.CEDILLA.USAGE", "PT.ORTH.CEDILLA", "A1",
    "O 'ç' (ce-cedilha) usa-se antes de 'a', 'o', 'u' para representar o som [s]. Nunca aparece antes de 'e' ou 'i'.",
    ["coração", "França", "açúcar", "praça"],
    {
      counterexamples: ["cedo (sem cedilha — o 'c' antes de 'e' já se lê [s])"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "controlled_production"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "O inglês não tem cedilha." },
        hi: { difficulty: "high", reason: "O conceito de cedilha não existe no devanágari." },
        fr: { difficulty: "low", reason: "O francês também usa cedilha com a mesma regra." },
        es: { difficulty: "medium", reason: "O espanhol não usa cedilha (usa z ou c+e/i)." },
      },
    },
  ),

  // --- LEXICON / RHETORIC ---
  ki("PT.LEX.FALSE_FRIENDS.EN", "PT.LEX.FALSE_FRIENDS", "A2",
    "Falsos amigos entre inglês e português: palavras semelhantes com significados diferentes.",
    ["actual (PT: real; EN: current → PT: atual)", "pretend (EN: fingir; PT: pretender = to intend)", "push (EN: empurrar; PT: puxar = to pull)"],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "translation"],
      l1Difficulty: {
        en: { difficulty: "high", reason: "Interferência lexical direta.", expectedErrors: ["Traduzir literalmente sem verificar significado PT"] },
        es: { difficulty: "medium", reason: "Também existem falsos amigos es-pt mas são menos." },
        fr: { difficulty: "medium", reason: "Existem falsos amigos fr-pt (ex: pousser/puxar)." },
      },
    },
  ),
  ki("PT.RHETORIC.METAPHOR.DEFINITION", "PT.RHETORIC.METAPHOR", "B2",
    "A metáfora é uma associação implícita de semelhança entre dois elementos, sem 'como' ou 'tal como'.",
    ["A multidão é um enxame negro. (Saramago)", "O tempo é dinheiro."],
    {
      counterexamples: ["A multidão é como um enxame. (isto é comparação, não metáfora)"],
      commonErrors: ["Confundir metáfora com comparação (a comparação usa 'como' ou 'tal como')"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "free_production"],
      confusableWith: ["PT.RHETORIC.COMPARISON.DEFINITION"],
      relatedTo: ["PT.RHETORIC.COMPARISON.DEFINITION", "PT.RHETORIC.METAPHOR.EFFECT"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "O hindi tem metáfora (rupak alankaar) como conceito, facilitando a transferência." },
        en: { difficulty: "low", reason: "O inglês usa metáfora da mesma forma." },
        ar: { difficulty: "low", reason: "A retórica árabe (balagha) tem forte tradição de metáfora (isti'aara)." },
      },
    },
  ),
  ki("PT.RHETORIC.METAPHOR.EFFECT", "PT.RHETORIC.METAPHOR", "B2",
    "A metáfora cria um efeito expressivo ao transferir qualidades de um domínio para outro, tornando o discurso mais vivo e imaginativo.",
    ["Os seus olhos eram estrelas. (transfere brilho/beleza das estrelas para os olhos)", "A vida é uma viagem. (transfere o percurso/etapas da viagem para a vida)"],
    {
      counterexamples: ["Os seus olhos eram bonitos. (afirmação literal, sem transferência de domínio)"],
      commonErrors: ["Interpretar a metáfora literalmente", "Não conseguir identificar o efeito comunicativo pretendido"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["comprehension", "controlled_production", "free_production", "communication"],
      relatedTo: ["PT.RHETORIC.METAPHOR.DEFINITION"],
      l1Difficulty: {
        hi: { difficulty: "medium", reason: "As metáforas culturais diferem entre PT e hindi, complicando a interpretação." },
        en: { difficulty: "low", reason: "As metáforas conceptuais são frequentemente partilhadas entre PT e inglês." },
      },
    },
  ),
  ki("PT.RHETORIC.METAPHOR.VS_METONYMY", "PT.RHETORIC.METAPHOR", "B2",
    "A metáfora baseia-se na semelhança; a metonímia baseia-se na contiguidade (parte-todo, causa-efeito, continente-conteúdo).",
    ["Ele é uma raposa. (metáfora: semelhança com astúcia)", "Bebi dois copos. (metonímia: continente pelo conteúdo)"],
    {
      counterexamples: ["Ele é como uma raposa. (isto é comparação, nem metáfora nem metonímia)"],
      commonErrors: ["Classificar metonímia como metáfora", "Não distinguir a relação de semelhança (metáfora) da relação de contiguidade (metonímia)"],
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "transformation"],
      confusableWith: ["PT.RHETORIC.COMPARISON.DEFINITION"],
      l1Difficulty: {
        en: { difficulty: "medium", reason: "A distinção metáfora/metonímia existe em inglês mas nem sempre é ensinada formalmente." },
        hi: { difficulty: "medium", reason: "O hindi tem ambos os conceitos na poética clássica." },
      },
    },
  ),
  ki("PT.RHETORIC.COMPARISON.DEFINITION", "PT.RHETORIC.COMPARISON", "B1",
    "A comparação estabelece semelhança explícita com 'como', 'tal como', 'parecer-se com'.",
    ["Deixou o sorriso como quem deixa um guarda-chuva. (M. J. Carvalho)", "O céu parecia uma pintura."],
    {
      criteria: DEFAULT_CRITERIA,
      exerciseTypes: ["recognition", "comprehension", "controlled_production", "free_production"],
      confusableWith: ["PT.RHETORIC.METAPHOR.DEFINITION"],
      relatedTo: ["PT.RHETORIC.METAPHOR.DEFINITION"],
    },
  ),
];

// ===========================================================================
// VALIDATION
// ===========================================================================

export function validateTaxonomy(): string[] {
  const errors: string[] = [];
  const skillCodes = new Set(SKILLS.map((s) => s.code));

  for (const s of SKILLS) {
    for (const prereq of s.prerequisites) {
      if (!skillCodes.has(prereq)) {
        errors.push(`Skill ${s.code} has unknown prerequisite: ${prereq}`);
      }
      if (prereq === s.code) {
        errors.push(`Skill ${s.code} references itself as prerequisite`);
      }
    }
  }

  for (const k of KNOWLEDGE_ITEMS) {
    if (!skillCodes.has(k.skillCode)) {
      errors.push(`KnowledgeItem ${k.code} references unknown skill: ${k.skillCode}`);
    }
  }

  const kiCodes = new Set<string>();
  for (const k of KNOWLEDGE_ITEMS) {
    if (kiCodes.has(k.code)) {
      errors.push(`Duplicate KnowledgeItem code: ${k.code}`);
    }
    kiCodes.add(k.code);
  }

  for (const k of KNOWLEDGE_ITEMS) {
    for (const rel of k.relatedTo ?? []) {
      if (!kiCodes.has(rel)) {
        errors.push(`KI ${k.code} has relatedTo unknown KI: ${rel}`);
      }
      if (rel === k.code) {
        errors.push(`KI ${k.code} has self-reference in relatedTo`);
      }
    }
    for (const conf of k.confusableWith ?? []) {
      if (!kiCodes.has(conf)) {
        errors.push(`KI ${k.code} has confusableWith unknown KI: ${conf}`);
      }
      if (conf === k.code) {
        errors.push(`KI ${k.code} has self-reference in confusableWith`);
      }
    }
  }

  const duplicateSkills = SKILLS.filter((s, i) => SKILLS.findIndex((x) => x.code === s.code) !== i);
  for (const d of duplicateSkills) {
    errors.push(`Duplicate Skill code: ${d.code}`);
  }

  // DAG cycle detection (DFS)
  const adjList = new Map<string, string[]>();
  for (const s of SKILLS) {
    if (!adjList.has(s.code)) adjList.set(s.code, []);
    for (const prereq of s.prerequisites) {
      if (!adjList.has(prereq)) adjList.set(prereq, []);
      adjList.get(s.code)!.push(prereq);
    }
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

  for (const code of skillCodes) {
    if (hasCycle(code)) {
      errors.push(`Cycle detected involving skill: ${code}`);
      break;
    }
  }

  return errors;
}
