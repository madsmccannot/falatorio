import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";
import {
  EXERCISE_TYPES,
  type ExerciseType,
  type CEFRLevel,
  type L1Code,
} from "@falatorio/core";
import type { ExerciseGenerationRequest } from "@falatorio/core";
import { getProfile, getCulturalRefs } from "@falatorio/core/l1-profiles";

const GENERATION_MODEL = "claude-sonnet-4-20250514";

const AO_1990_RULES = `REGRAS LINGUÍSTICAS OBRIGATÓRIAS — Acordo Ortográfico de 1990 (AO 1990):
- Consoantes mudas eliminadas: "ato" (não "acto"), "ator" (não "actor"), "direto" (não "directo"), "correto" (não "correcto"), "ótimo" (não "óptimo"), "adotar" (não "adoptar"), "batismo" (não "baptismo"), "receção" (não "recepção"), "ação" (não "acção"), "seleção" (não "selecção"), "proteção" (não "protecção"), "projeto" (não "projecto"), "objeto" (não "objecto"), "exato" (não "exacto"), "corretamente" (não "correctamente")
- EXCEÇÃO: "facto" mantém-se em PT-EU (c pronunciado)
- Acentos e diacríticos obrigatórios: ã, õ, é, ê, á, à, ó, ô, í, ú, ç
- Concordância de género rigorosa: "a avó" (fem), "o avô" (masc), "a casa é bonita", "o carro é bonito"
- PT-EU exclusivamente: "estar a + infinitivo" (nunca gerúndio), "autocarro" (não "ônibus"), "telemóvel" (não "celular"), "pequeno-almoço" (não "café da manhã"), conjugações com tu/você`;

const PRE_AO_WORDS: [string, string][] = [
  ["acto", "ato"], ["actor", "ator"], ["actriz", "atriz"],
  ["acção", "ação"], ["reacção", "reação"], ["selecção", "seleção"],
  ["colecção", "coleção"], ["protecção", "proteção"], ["direcção", "direção"],
  ["correcto", "correto"], ["correctamente", "corretamente"],
  ["directo", "direto"], ["directamente", "diretamente"],
  ["óptimo", "ótimo"], ["adoptar", "adotar"], ["adopção", "adoção"],
  ["baptismo", "batismo"], ["baptizar", "batizar"],
  ["recepção", "receção"], ["projecto", "projeto"],
  ["objecto", "objeto"], ["abstracto", "abstrato"],
  ["exacto", "exato"], ["exactamente", "exatamente"],
  ["electricidade", "eletricidade"], ["electrónico", "eletrónico"],
  ["espectáculo", "espetáculo"],
];

const REQUIRED_PROMPT_KEYS: Record<ExerciseType, string[]> = {
  translate_l1_to_pt: ["sentence"],
  translate_pt_to_l1: ["sentence"],
  fill_blank: ["sentence", "options", "correctIndex"],
  pick_correct: ["question", "options", "correctIndex"],
  match_pairs: ["pairs"],
  reorder_words: ["words", "correctOrder"],
  listen_and_type: ["text"],
  speak_and_score: ["targetText"],
};

function sanitizePromptInput(s: string): string {
  return s
    .replace(/[<>{}]/g, "")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .slice(0, 200)
    .trim();
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required for exercise generation");
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface GeneratedExercise {
  type: ExerciseType;
  prompt: Record<string, unknown>;
  acceptedAnswers: string[];
  difficulty: number;
  l1Tip: Record<string, string>;
  glossary?: Record<string, string[]>;
  genderPairs?: Record<string, { g: "m" | "f"; alt: string }>;
}

export interface GeneratedLesson {
  exercises: GeneratedExercise[];
  grammarFocus: string[];
  vocabTopics: string[];
}

export interface KnowledgeItemContext {
  code: string;
  rule: string;
  examples: string[];
  commonErrors: string[];
  l1Note?: string | { difficulty: string; reason: string; expectedErrors?: string[] };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function getTypeFormatInstruction(type: ExerciseType, l1: L1Code, l1Name: string): string {
  const formats: Record<ExerciseType, string> = {
    translate_l1_to_pt: `prompt format: { "sentence": "<sentence in ${l1Name} to translate>" }
acceptedAnswers: array of valid Portuguese translations
CORRECT example:
{"type":"translate_l1_to_pt","prompt":{"sentence":"I have a big house."},"acceptedAnswers":["Eu tenho uma casa grande.","Tenho uma casa grande."],"difficulty":2,"l1Tip":{"${l1}":"In Portuguese, adjectives usually come after the noun."},"glossary":{"tenho":["have"],"casa":["house"],"grande":["big"]},"genderPairs":{}}
CRITICAL: "sentence" contains ONLY the ${l1Name} sentence. No instruction text like "Translate:" or "Traduz:".`,

    translate_pt_to_l1: `prompt format: { "sentence": "<Portuguese sentence to translate>" }
acceptedAnswers: array of valid ${l1Name} translations
CORRECT example:
{"type":"translate_pt_to_l1","prompt":{"sentence":"Eu como uma maçã."},"acceptedAnswers":["I eat an apple.","I'm eating an apple."],"difficulty":2,"l1Tip":{"${l1}":"'Como' is first person singular of 'comer'."},"glossary":{"como":["eat"],"maçã":["apple"]},"genderPairs":{}}
CRITICAL: "sentence" contains ONLY the Portuguese sentence. No instruction text.`,

    fill_blank: `prompt format: { "sentence": "<sentence with exactly one ___ blank>", "options": ["<correct>","<wrong1>","<wrong2>","<wrong3>"], "correctIndex": <0-3> }
acceptedAnswers: ["<correct word>"]
CORRECT example:
{"type":"fill_blank","prompt":{"sentence":"Eu ___ ao mercado ontem.","options":["fui","foi","ir","ido"],"correctIndex":0},"acceptedAnswers":["fui"],"difficulty":3,"l1Tip":{"${l1}":"'Fui' is the first person preterite of 'ir'."},"glossary":{"mercado":["market"],"ontem":["yesterday"]},"genderPairs":{}}
CRITICAL: "sentence" has exactly one ___. "options" has exactly 4 strings. "correctIndex" is 0-3.`,

    pick_correct: `prompt format: { "question": "<question in Portuguese>", "options": ["<A>","<B>","<C>","<D>"], "correctIndex": <0-3> }
acceptedAnswers: ["<correct option text>"]
CORRECT example:
{"type":"pick_correct","prompt":{"question":"Qual é o significado de 'saudade'?","options":["Um sentimento de falta profunda","Felicidade","Raiva","Surpresa"],"correctIndex":0},"acceptedAnswers":["Um sentimento de falta profunda"],"difficulty":2,"l1Tip":{"${l1}":"'Saudade' has no direct translation in most languages."},"glossary":{},"genderPairs":{}}
CRITICAL: "question" is in Portuguese. "options" has exactly 4 strings.`,

    match_pairs: `prompt format: { "pairs": [{"left":"<Portuguese>","right":"<${l1Name}>"},{"left":"...","right":"..."},...] }
acceptedAnswers: ["<left1>:<right1>","<left2>:<right2>",...]
CORRECT example:
{"type":"match_pairs","prompt":{"pairs":[{"left":"obrigado","right":"thank you"},{"left":"bom dia","right":"good morning"},{"left":"por favor","right":"please"},{"left":"desculpe","right":"excuse me"}]},"acceptedAnswers":["obrigado:thank you","bom dia:good morning","por favor:please","desculpe:excuse me"],"difficulty":1,"l1Tip":{"${l1}":"Portuguese greetings vary by time of day."},"glossary":{},"genderPairs":{}}
CRITICAL: Exactly 4-6 pairs. Left is ALWAYS Portuguese, right is ALWAYS ${l1Name}. Each pair's left and right are plain strings, not objects.`,

    reorder_words: `prompt format: { "words": ["<shuffled>","<words>",...], "correctOrder": "<Correct sentence with capitalization and punctuation.>" }
acceptedAnswers: ["<Correct sentence.>"]
CORRECT example:
{"type":"reorder_words","prompt":{"words":["gosto","de","eu","Portugal"],"correctOrder":"Eu gosto de Portugal."},"acceptedAnswers":["Eu gosto de Portugal."],"difficulty":2,"l1Tip":{"${l1}":"Portuguese follows Subject-Verb-Object order."},"glossary":{"gosto":["like"]},"genderPairs":{}}
CRITICAL: "words" must be SHUFFLED (different order than correctOrder). All lowercase except proper nouns. "correctOrder" has correct capitalization and final punctuation.`,

    listen_and_type: `prompt format: { "text": "<Portuguese sentence the user will hear and type>" }
acceptedAnswers: ["<exact>","<without punctuation>","<lowercase>"]
CORRECT example:
{"type":"listen_and_type","prompt":{"text":"Bom dia, como estás?"},"acceptedAnswers":["Bom dia, como estás?","Bom dia como estás","bom dia, como estás?"],"difficulty":2,"l1Tip":{"${l1}":"'Estás' uses the informal 'tu' form."},"glossary":{"dia":["day"],"estás":["are (you)"]},"genderPairs":{}}
CRITICAL: "text" is ONLY the Portuguese sentence. Include multiple acceptedAnswers variants (with/without punctuation, case variants).`,

    speak_and_score: `prompt format: { "targetText": "<Portuguese sentence to pronounce>" }
acceptedAnswers: ["<exact sentence>"]
CORRECT example:
{"type":"speak_and_score","prompt":{"targetText":"Eu gosto muito de Portugal."},"acceptedAnswers":["Eu gosto muito de Portugal."],"difficulty":2,"l1Tip":{"${l1}":"Focus on the nasal sound in 'muito'."},"glossary":{"gosto":["like"],"muito":["a lot"]},"genderPairs":{}}
CRITICAL: "targetText" is the sentence to speak. Choose sentences with phonetically interesting PT-EU sounds relevant to the knowledge item.`,
  };
  return formats[type];
}

export async function generateLesson(params: {
  l1: L1Code;
  cefrLevel: CEFRLevel;
  grammarFocus?: string[];
  vocabTopics?: string[];
  weaknesses?: string[];
  exerciseCount?: number;
  knowledgeItems?: KnowledgeItemContext[];
}): Promise<GeneratedLesson> {
  const {
    l1,
    cefrLevel,
    grammarFocus: rawGrammar = [],
    vocabTopics: rawVocab = [],
    weaknesses: rawWeaknesses = [],
    exerciseCount = 15,
    knowledgeItems: kiItems = [],
  } = params;

  const grammarFocus = rawGrammar.map(sanitizePromptInput).filter(Boolean);
  const vocabTopics = rawVocab.map(sanitizePromptInput).filter(Boolean);
  const weaknesses = rawWeaknesses.map(sanitizePromptInput).filter(Boolean);

  const profile = getProfile(l1);
  const culturalRefs = getCulturalRefs(l1);
  const transfer = profile.transfer;

  const cefrCulturalRefs = culturalRefs
    .filter((ref) => cefrLevelIndex(ref.cefrMin) <= cefrLevelIndex(cefrLevel))
    .slice(0, 5);

  const prompt = buildLessonPrompt({
    l1,
    l1Name: profile.name,
    cefrLevel,
    grammarFocus,
    vocabTopics,
    weaknesses,
    exerciseCount,
    falseFriends: transfer.falseFriends.slice(0, 10),
    grammarGaps: transfer.grammarGaps.slice(0, 8),
    phoneticDifficulties: transfer.phoneticDifficulties.slice(0, 6),
    cognates: transfer.cognates.slice(0, 10),
    culturalRefs: cefrCulturalRefs,
    knowledgeItems: kiItems,
  });

  const response = await getClient().messages.create({
    model: GENERATION_MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in LLM response");

  const exercises = parseExerciseArray(textBlock.text);

  const resolvedGrammar =
    grammarFocus.length > 0
      ? grammarFocus
      : transfer.grammarGaps.slice(0, 3).map((g) => g.concept);
  const resolvedVocab =
    vocabTopics.length > 0
      ? vocabTopics
      : ["general"];

  return {
    exercises: exercises.slice(0, exerciseCount),
    grammarFocus: resolvedGrammar,
    vocabTopics: resolvedVocab,
  };
}

export async function generateSingleExercise(params: {
  l1: L1Code;
  cefrLevel: CEFRLevel;
  type: ExerciseType;
  topic: string;
  weakness?: string;
}): Promise<GeneratedExercise> {
  const { l1, cefrLevel, type, weakness: rawWeakness } = params;
  const topic = sanitizePromptInput(params.topic);
  const weakness = rawWeakness ? sanitizePromptInput(rawWeakness) : undefined;
  const profile = getProfile(l1);
  const transfer = profile.transfer;

  const relevantFalseFriends = transfer.falseFriends
    .filter((ff) =>
      ff.word.toLowerCase().includes(topic.toLowerCase()) ||
      ff.ptMeaning.toLowerCase().includes(topic.toLowerCase()),
    )
    .slice(0, 5);

  const typeInstruction = getTypeFormatInstruction(type, l1, profile.name);

  const prompt = `Generate exactly 1 European Portuguese (PT-EU) exercise.

${AO_1990_RULES}

Student's native language: ${profile.name} (${l1})
CEFR level: ${cefrLevel}
Exercise type: ${type}
Topic: ${topic}
${weakness ? `Known weakness: ${weakness}` : ""}

${relevantFalseFriends.length > 0 ? `False friends (${profile.name} -> PT):
${relevantFalseFriends.map((ff) => `- "${ff.word}": in ${profile.name} = "${ff.l1Meaning}", in PT = "${ff.ptMeaning}"`).join("\n")}` : ""}

=== EXACT FORMAT REQUIRED ===
${typeInstruction}

Output ONLY the JSON object. No markdown, no code fences, no explanation text.`;

  const response = await getClient().messages.create({
    model: GENERATION_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in LLM response");

  const exercise = parseExerciseJSON(textBlock.text);
  const validation = validateGeneratedExercise(exercise, l1);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join("; ")}`);
  }
  return exercise;
}

export async function generateFromKnowledgeItem(params: {
  request: ExerciseGenerationRequest;
  rule: string;
  examples: string[];
  commonErrors?: string[];
  l1Notes?: string;
}): Promise<GeneratedExercise> {
  const { request, rule, examples, commonErrors, l1Notes } = params;

  const profile = getProfile(request.l1);
  const typeInstruction = getTypeFormatInstruction(request.exerciseType, request.l1, profile.name);

  const prompt = `Generate 1 European Portuguese (PT-EU) exercise.

${AO_1990_RULES}

=== KNOWLEDGE ITEM ===
Skill: ${request.skillCode}
Knowledge item: ${request.knowledgeItemCode}
Rule: ${rule}
${examples.length > 0 ? `Examples: ${examples.join(" | ")}` : ""}
${commonErrors?.length ? `Common errors to exploit: ${commonErrors.join("; ")}` : ""}
${l1Notes ? `Note for ${profile.name} speakers: ${l1Notes}` : ""}

=== PARAMETERS ===
L1: ${profile.name} (${request.l1})
CEFR: ${request.cefrLevel}
Exercise type: ${request.exerciseType}
Cognitive level: ${request.cognitiveLevel}
Difficulty: ${request.difficulty} (1-10)
${request.constraints?.avoidVocabulary?.length ? `Avoid vocabulary: ${request.constraints.avoidVocabulary.join(", ")}` : ""}
${request.constraints?.requireContext ? `Required context: ${request.constraints.requireContext}` : ""}

=== COGNITIVE LEVEL GUIDE ===
- recognition: identify correct form among options (pick_correct, match_pairs)
- comprehension: understand meaning from listening (listen_and_type)
- controlled_production: produce the correct form in a constrained context (fill_blank, reorder_words)
- translation: translate between L1 and PT-EU (translate_l1_to_pt, translate_pt_to_l1)
- free_production: produce speech aloud (speak_and_score)

=== EXACT FORMAT REQUIRED FOR ${request.exerciseType} ===
${typeInstruction}

=== QUALITY RULES ===
- The exercise MUST test the knowledge item's rule
- The l1Tip MUST be written in ${profile.name} (not Portuguese, not English unless L1 is English)
- acceptedAnswers must be an array of plain strings (never objects or nested arrays)
- All Portuguese text must follow AO 1990 strictly
- Do not include instruction text ("Traduz:", "Translate:", "Ouve:") in content fields

Output ONLY the JSON object. No markdown, no code fences, no explanation.`;

  const response = await getClient().messages.create({
    model: GENERATION_MODEL,
    max_tokens: 1536,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in LLM response");

  const exercise = parseExerciseJSON(textBlock.text);
  const validation = validateGeneratedExercise(exercise, request.l1);
  if (!validation.valid) {
    throw new Error(`Validation failed for ${request.knowledgeItemCode} (${request.exerciseType}): ${validation.errors.join("; ")}`);
  }
  if (validation.warnings.length > 0) {
    console.warn(`  [WARN] ${request.knowledgeItemCode}: ${validation.warnings.join("; ")}`);
  }
  return exercise;
}

export function validateGeneratedExercise(exercise: GeneratedExercise, l1: L1Code): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!EXERCISE_TYPES.includes(exercise.type)) {
    errors.push(`Invalid type: ${exercise.type}`);
    return { valid: false, errors, warnings };
  }

  const requiredKeys = REQUIRED_PROMPT_KEYS[exercise.type] ?? [];
  const prompt = exercise.prompt;
  for (const key of requiredKeys) {
    if (!(key in prompt)) {
      errors.push(`Missing prompt.${key}`);
    }
  }

  for (const key of ["sentence", "question", "text", "targetText", "correctOrder"]) {
    if (key in prompt && typeof prompt[key] !== "string") {
      errors.push(`prompt.${key} must be string, got ${typeof prompt[key]}`);
    }
  }

  if ("options" in prompt) {
    if (!Array.isArray(prompt["options"])) {
      errors.push("prompt.options must be array");
    } else {
      const opts = prompt["options"] as unknown[];
      if (opts.length < 2 || opts.length > 6) {
        warnings.push(`prompt.options has ${opts.length} items (expected 2-6)`);
      }
      for (let i = 0; i < opts.length; i++) {
        if (typeof opts[i] !== "string") {
          errors.push(`prompt.options[${i}] must be string, got ${typeof opts[i]}`);
        }
      }
    }
  }

  if ("correctIndex" in prompt) {
    const idx = prompt["correctIndex"] as number;
    const opts = prompt["options"] as unknown[] | undefined;
    if (typeof idx !== "number" || !Number.isInteger(idx) || idx < 0) {
      errors.push(`prompt.correctIndex must be non-negative integer, got ${idx}`);
    } else if (opts && idx >= opts.length) {
      errors.push(`prompt.correctIndex (${idx}) >= options.length (${opts.length})`);
    }
  }

  if ("pairs" in prompt) {
    if (!Array.isArray(prompt["pairs"])) {
      errors.push("prompt.pairs must be array");
    } else {
      const pairs = prompt["pairs"] as unknown[];
      if (pairs.length < 2) errors.push("prompt.pairs needs at least 2 pairs");
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i] as Record<string, unknown> | null;
        if (!pair || typeof pair !== "object" || typeof pair["left"] !== "string" || typeof pair["right"] !== "string") {
          errors.push(`prompt.pairs[${i}] must have string "left" and "right"`);
        }
      }
    }
  }

  if ("words" in prompt) {
    if (!Array.isArray(prompt["words"])) {
      errors.push("prompt.words must be array");
    } else {
      const words = prompt["words"] as unknown[];
      for (let i = 0; i < words.length; i++) {
        if (typeof words[i] !== "string") {
          errors.push(`prompt.words[${i}] must be string`);
        }
      }
    }
  }

  if (!Array.isArray(exercise.acceptedAnswers) || exercise.acceptedAnswers.length === 0) {
    errors.push("acceptedAnswers must be non-empty array");
  } else {
    for (let i = 0; i < exercise.acceptedAnswers.length; i++) {
      if (typeof exercise.acceptedAnswers[i] !== "string") {
        errors.push(`acceptedAnswers[${i}] must be string, got ${typeof exercise.acceptedAnswers[i]}`);
      }
    }
  }

  const allText = collectAllText(exercise);
  for (const [preAO, postAO] of PRE_AO_WORDS) {
    const regex = new RegExp(`\\b${preAO}\\b`, "gi");
    if (regex.test(allText)) {
      warnings.push(`Pre-AO 1990: "${preAO}" -> "${postAO}"`);
    }
  }

  const contentText = ((prompt["sentence"] ?? prompt["text"] ?? prompt["targetText"]) as string) ?? "";
  if (typeof contentText === "string" && contentText.length > 0) {
    if (/^(traduz|translate|ouve|listen|escreve|write|diga|say)/i.test(contentText.trim())) {
      errors.push(`Content field starts with instruction text: "${contentText.slice(0, 60)}"`);
    }
  }

  if (typeof exercise.difficulty !== "number" || exercise.difficulty < 1 || exercise.difficulty > 10) {
    warnings.push(`Unusual difficulty: ${exercise.difficulty}`);
  }

  if (!exercise.l1Tip || typeof exercise.l1Tip !== "object") {
    warnings.push("Missing l1Tip");
  } else if (!exercise.l1Tip[l1]) {
    warnings.push(`l1Tip missing key for "${l1}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

function collectAllText(exercise: GeneratedExercise): string {
  const parts: string[] = [];
  for (const val of Object.values(exercise.prompt)) {
    if (typeof val === "string") parts.push(val);
    else if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string") parts.push(item);
        else if (item && typeof item === "object") {
          for (const v of Object.values(item as Record<string, unknown>)) {
            if (typeof v === "string") parts.push(v);
          }
        }
      }
    }
  }
  for (const ans of exercise.acceptedAnswers) {
    if (typeof ans === "string") parts.push(ans);
  }
  return parts.join(" ");
}

function buildLessonPrompt(params: {
  l1: L1Code;
  l1Name: string;
  cefrLevel: CEFRLevel;
  grammarFocus: string[];
  vocabTopics: string[];
  weaknesses: string[];
  exerciseCount: number;
  falseFriends: Array<{ word: string; l1Meaning: string; ptMeaning: string }>;
  grammarGaps: Array<{ concept: string; explanation: string | Record<string, string>; l1Comparison: string | Record<string, string> }>;
  phoneticDifficulties: Array<{ sound: string | Record<string, string>; ipa: string; description: string | Record<string, string> }>;
  cognates: readonly string[];
  culturalRefs: Array<{ contentPt: string; contentL1: string; explanation: string }>;
  knowledgeItems?: KnowledgeItemContext[];
}): string {
  const {
    l1, l1Name, cefrLevel, grammarFocus, vocabTopics, weaknesses,
    exerciseCount, falseFriends, grammarGaps, phoneticDifficulties,
    cognates, culturalRefs, knowledgeItems: kiItems = [],
  } = params;

  return `Generate ${exerciseCount} European Portuguese (PT-EU) exercises for a ${cefrLevel} learner whose native language is ${l1Name} (${l1}).

${AO_1990_RULES}

=== L1 TRANSFER PROFILE ===

FALSE FRIENDS (${l1Name} -> PT):
${falseFriends.map((ff) => `- "${ff.word}": in ${l1Name} = "${ff.l1Meaning}", in PT = "${ff.ptMeaning}"`).join("\n")}

GRAMMAR GAPS:
${grammarGaps.map((g) => `- ${g.concept}: ${typeof g.explanation === "string" ? g.explanation : g.explanation["en"] ?? Object.values(g.explanation)[0]} (vs ${l1Name}: ${typeof g.l1Comparison === "string" ? g.l1Comparison : g.l1Comparison["en"] ?? Object.values(g.l1Comparison)[0]})`).join("\n")}

PHONETIC DIFFICULTIES:
${phoneticDifficulties.map((p) => `- ${typeof p.sound === "string" ? p.sound : p.sound["en"] ?? Object.values(p.sound)[0]} ${p.ipa}: ${typeof p.description === "string" ? p.description : p.description["en"] ?? Object.values(p.description)[0]}`).join("\n")}

SAFE COGNATES: ${cognates.join(", ")}

CULTURAL CONTEXT:
${culturalRefs.map((c) => `- ${c.contentPt}: ${c.contentL1}`).join("\n")}

${kiItems.length > 0 ? `=== KNOWLEDGE ITEMS (target these specifically) ===

${kiItems.map((ki) => {
  const l1Note = ki.l1Note
    ? typeof ki.l1Note === "string" ? ki.l1Note : `${ki.l1Note.difficulty}: ${ki.l1Note.reason}`
    : "";
  return `[${ki.code}] ${ki.rule}${ki.examples.length > 0 ? `\n  Examples: ${ki.examples.join(" | ")}` : ""}${ki.commonErrors.length > 0 ? `\n  Common errors: ${ki.commonErrors.join("; ")}` : ""}${l1Note ? `\n  ${l1Name} note: ${l1Note}` : ""}`;
}).join("\n\n")}

Each exercise MUST target at least one knowledge item above.

` : ""}=== EXERCISE PARAMETERS ===

${grammarFocus.length > 0 ? `Grammar focus: ${grammarFocus.join(", ")}` : "Grammar: based on L1 gaps above"}
${vocabTopics.length > 0 ? `Vocabulary topics: ${vocabTopics.join(", ")}` : "Vocabulary: general for ${cefrLevel}"}
${weaknesses.length > 0 ? `Known weaknesses: ${weaknesses.join(", ")}` : ""}

=== EXERCISE TYPES AND EXACT FORMATS ===

Use a mix of these types: ${EXERCISE_TYPES.join(", ")}

Prompt format per type (follow EXACTLY):
- translate_l1_to_pt: { "sentence": "<${l1Name} sentence>" } — acceptedAnswers = PT translations
- translate_pt_to_l1: { "sentence": "<PT sentence>" } — acceptedAnswers = ${l1Name} translations
- fill_blank: { "sentence": "Eu ___ ao mercado.", "options": ["fui","foi","ir","ido"], "correctIndex": 0 }
- pick_correct: { "question": "<question in PT>", "options": ["A","B","C","D"], "correctIndex": 0 }
- match_pairs: { "pairs": [{"left":"<PT>","right":"<${l1Name}>"},{"left":"...","right":"..."},...] } — 4-6 pairs
- reorder_words: { "words": ["shuffled","words"], "correctOrder": "Correct sentence." }
- listen_and_type: { "text": "<PT sentence>" }
- speak_and_score: { "targetText": "<PT sentence>" }

CRITICAL: Content fields ("sentence", "text", "targetText", "question") must contain ONLY the content. Never include instruction text like "Translate:", "Traduz:", "Listen:".

=== OUTPUT FORMAT ===

Output ONLY a JSON array. No markdown, no code fences, no explanation.
Each element: { type, prompt, acceptedAnswers (array of PLAIN STRINGS only), difficulty (1-5), l1Tip ({"${l1}": "tip in ${l1Name}"}), glossary ({"ptWord": ["${l1Name} translation"]}), genderPairs ({"adjective": {"g":"m","alt":"feminine form"}}) }

=== QUALITY RULES ===
- AO 1990 strictly in all Portuguese text
- l1Tip must be in ${l1Name}, not in Portuguese
- Include at least 2 exercises targeting false friends
- Include at least 2 exercises targeting grammar gaps
- acceptedAnswers must always be plain strings, never objects
- Vary exercise types across the list`;
}

export function parseExerciseArray(text: string): GeneratedExercise[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in LLM response");

  let parsed: GeneratedExercise[];
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = JSON.parse(repairJSON(jsonMatch[0]));
  }
  if (!Array.isArray(parsed)) throw new Error("Response is not an array");

  return parsed
    .filter(
      (ex) =>
        typeof ex.type === "string" &&
        Array.isArray(ex.acceptedAnswers) &&
        ex.acceptedAnswers.length > 0 &&
        ex.prompt != null,
    )
    .map((ex) => normalizeExercise(ex));
}

function normalizeExercise(ex: GeneratedExercise): GeneratedExercise {
  ex.acceptedAnswers = normalizeAcceptedAnswers(ex.acceptedAnswers);

  if (typeof ex.prompt === "string") {
    ex.prompt = { question: ex.prompt } as any;
  }

  const p = ex.prompt as Record<string, unknown>;
  if (ex.glossary && typeof ex.glossary === "object") {
    p["glossary"] = ex.glossary;
  }
  if (ex.genderPairs && typeof ex.genderPairs === "object") {
    p["genderPairs"] = ex.genderPairs;
  }

  return ex;
}

function parseExerciseJSON(text: string): GeneratedExercise {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object in response");

  let parsed: GeneratedExercise;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = JSON.parse(repairJSON(jsonMatch[0]));
  }

  if (!parsed.type || !parsed.acceptedAnswers) {
    throw new Error("Invalid exercise structure: missing type or acceptedAnswers");
  }

  return normalizeExercise(parsed);
}

function normalizeAcceptedAnswers(val: unknown): string[] {
  if (typeof val === "string") return [val];
  if (!Array.isArray(val)) return [String(val)];
  return val.flat(Infinity).map(String);
}

function repairJSON(raw: string): string {
  let s = raw;
  s = s.replace(/,\s*([}\]])/g, "$1");
  s = s.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
  s = s.replace(/:\s*'([^']*)'/g, ': "$1"');
  s = s.replace(/\t/g, "\\t");
  s = s.replace(/[\x00-\x1f]/g, (ch) => ch === "\n" ? "\\n" : ch === "\r" ? "\\r" : "");
  s = s.replace(/"\s*\n\s*"/g, '" "');
  return s;
}

export function cefrLevelIndex(level: CEFRLevel): number {
  const order: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return order.indexOf(level);
}
