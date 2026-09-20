import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";
import {
  EXERCISE_TYPES,
  type ExerciseType,
  type CEFRLevel,
  type L1Code,
} from "@falatorio/core";
import { getProfile, getCulturalRefs } from "@falatorio/core/l1-profiles";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export interface GeneratedExercise {
  type: ExerciseType;
  prompt: Record<string, unknown>;
  acceptedAnswers: string[];
  difficulty: number;
  l1Tip: Record<string, string>;
}

export interface GeneratedLesson {
  exercises: GeneratedExercise[];
  grammarFocus: string[];
  vocabTopics: string[];
}

export async function generateLesson(params: {
  l1: L1Code;
  cefrLevel: CEFRLevel;
  grammarFocus?: string[];
  vocabTopics?: string[];
  weaknesses?: string[];
  exerciseCount?: number;
}): Promise<GeneratedLesson> {
  const {
    l1,
    cefrLevel,
    grammarFocus = [],
    vocabTopics = [],
    weaknesses = [],
    exerciseCount = 15,
  } = params;

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
  });

  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
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
  const { l1, cefrLevel, type, topic, weakness } = params;
  const profile = getProfile(l1);
  const transfer = profile.transfer;

  const relevantFalseFriends = transfer.falseFriends
    .filter((ff) =>
      ff.word.toLowerCase().includes(topic.toLowerCase()) ||
      ff.ptMeaning.toLowerCase().includes(topic.toLowerCase()),
    )
    .slice(0, 5);

  const prompt = `Generate exactly 1 European Portuguese (PT-EU, NOT Brazilian) exercise.

Student's native language: ${profile.name} (${l1})
CEFR level: ${cefrLevel}
Exercise type: ${type}
Topic: ${topic}
${weakness ? `Known weakness: ${weakness}` : ""}

${relevantFalseFriends.length > 0 ? `False friends to be aware of (use these to create tricky but educational exercises):
${relevantFalseFriends.map((ff) => `- "${ff.word}" means "${ff.l1Meaning}" in ${profile.name}, but in PT "${ff.ptMeaning}"`).join("\n")}` : ""}

Exercise types and their prompt formats:
- translate_l1_to_pt: { sentence: "sentence in ${profile.name}", hint?: "optional hint" }
- translate_pt_to_l1: { sentence: "sentence in Portuguese", hint?: "optional hint" }
- fill_blank: { sentence: "Eu ___ ao mercado.", options: ["fui", "foi", "ir", "ido"], correctIndex: 0 }
- pick_correct: { question: "What does X mean?", options: ["A", "B", "C", "D"], correctIndex: 0 }
- match_pairs: { pairs: [{ left: "obrigado", right: "thank you" }, ...] }
- reorder_words: { words: ["eu", "gosto", "de", "Portugal"], correctOrder: "Eu gosto de Portugal." }
- listen_and_type: { text: "sentence to type after hearing", slowText: "slower version" }
- speak_and_score: { targetText: "sentence to say", transliteration?: "phonetic help" }

Output ONLY a JSON object (not array). Fields:
- type: "${type}"
- prompt: object matching the format above
- acceptedAnswers: array of valid answers
- difficulty: 1-5
- l1Tip: { "${l1}": "helpful tip in ${profile.name}" }

Use European Portuguese EXCLUSIVELY: tu/vos conjugations, autocarro, telemovel, pequeno-almoco.`;

  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in LLM response");

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object in response");

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedExercise;
  if (!parsed.type || !parsed.acceptedAnswers) {
    throw new Error("Invalid exercise structure");
  }

  return parsed;
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
  grammarGaps: Array<{ concept: string; explanation: string; l1Comparison: string }>;
  phoneticDifficulties: Array<{ sound: string; ipa: string; description: string }>;
  cognates: readonly string[];
  culturalRefs: Array<{ contentPt: string; contentL1: string; explanation: string }>;
}): string {
  const {
    l1, l1Name, cefrLevel, grammarFocus, vocabTopics, weaknesses,
    exerciseCount, falseFriends, grammarGaps, phoneticDifficulties,
    cognates, culturalRefs,
  } = params;

  return `Generate ${exerciseCount} European Portuguese (PT-EU, NOT Brazilian) exercises for a ${cefrLevel} learner whose native language is ${l1Name} (${l1}).

=== L1 TRANSFER PROFILE ===

FALSE FRIENDS (use these to create educational traps):
${falseFriends.map((ff) => `- "${ff.word}": means "${ff.l1Meaning}" in ${l1Name}, but in PT "${ff.ptMeaning}"`).join("\n")}

GRAMMAR GAPS (focus exercises on these):
${grammarGaps.map((g) => `- ${g.concept}: ${g.explanation} (vs ${l1Name}: ${g.l1Comparison})`).join("\n")}

PHONETIC DIFFICULTIES:
${phoneticDifficulties.map((p) => `- ${p.sound} ${p.ipa}: ${p.description}`).join("\n")}

SAFE COGNATES (use for easier exercises):
${cognates.join(", ")}

CULTURAL CONTEXT (weave into exercises naturally):
${culturalRefs.map((c) => `- ${c.contentPt}: ${c.contentL1}`).join("\n")}

=== EXERCISE PARAMETERS ===

${grammarFocus.length > 0 ? `Grammar focus: ${grammarFocus.join(", ")}` : "Grammar: based on L1 gaps above"}
${vocabTopics.length > 0 ? `Vocabulary topics: ${vocabTopics.join(", ")}` : "Vocabulary: general for ${cefrLevel}"}
${weaknesses.length > 0 ? `Known weaknesses to reinforce: ${weaknesses.join(", ")}` : ""}

=== EXERCISE TYPES AND FORMATS ===

Use a mix of these types: ${EXERCISE_TYPES.join(", ")}

Prompt format per type:
- translate_l1_to_pt: { sentence: "...", hint?: "..." }
- translate_pt_to_l1: { sentence: "...", hint?: "..." }
- fill_blank: { sentence: "Eu ___ ao mercado.", options: ["fui", "foi", "ir", "ido"], correctIndex: 0 }
- pick_correct: { question: "...", options: ["A", "B", "C", "D"], correctIndex: 0 }
- match_pairs: { pairs: [{ left: "PT word", right: "${l1Name} word" }, ...] }
- reorder_words: { words: ["shuffled", "words"], correctOrder: "Correct sentence." }
- listen_and_type: { text: "sentence", slowText: "slower version" }
- speak_and_score: { targetText: "sentence to say" }

=== OUTPUT FORMAT ===

Output ONLY a JSON array. No markdown, no explanation, no code fences.
Each element has: type, prompt, acceptedAnswers (array of valid strings), difficulty (1-5), l1Tip (object with "${l1}" key and a helpful tip in ${l1Name}).

=== RULES ===
- European Portuguese EXCLUSIVELY: tu/vos, estar a + infinitive (not gerund), autocarro, telemovel, pequeno-almoco
- Include at least 2 exercises targeting false friends from the L1 profile
- Include at least 2 exercises targeting grammar gaps
- Vary difficulty within the CEFR level
- L1 tips should reference the student's language specifically
- Cultural refs should appear in at least 1 exercise`;
}

function parseExerciseArray(text: string): GeneratedExercise[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in LLM response");

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedExercise[];
  if (!Array.isArray(parsed)) throw new Error("Response is not an array");

  return parsed.filter(
    (ex) =>
      typeof ex.type === "string" &&
      Array.isArray(ex.acceptedAnswers) &&
      ex.acceptedAnswers.length > 0 &&
      ex.prompt != null,
  );
}

function cefrLevelIndex(level: CEFRLevel): number {
  const order: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return order.indexOf(level);
}
