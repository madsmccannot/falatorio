import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import { eq } from "drizzle-orm";
import { lessons, exercises } from "@fala-pt/db/schema";
import { EXERCISE_TYPES, type ExerciseType } from "@fala-pt/core";

export interface GenerateExercisesData {
  lessonId: string;
  count: number;
  cefrLevel: string;
  grammarFocus: string[];
  vocabTarget: string[];
  l1Source: string;
}

export async function processGenerateExercises(
  job: Job<GenerateExercisesData>,
  db: ReturnType<typeof createDb>,
): Promise<void> {
  const { lessonId, count, cefrLevel, grammarFocus, vocabTarget, l1Source } = job.data;

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    throw new Error(`Lesson ${lessonId} not found`);
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic();

  const prompt = buildExercisePrompt(cefrLevel, grammarFocus, vocabTarget, l1Source, count);

  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in LLM response");

  const generated = parseExerciseResponse(textBlock.text);

  for (const ex of generated) {
    await db.insert(exercises).values({
      lessonId,
      type: ex.type as ExerciseType,
      status: "review",
      prompt: ex.prompt,
      acceptedAnswers: ex.acceptedAnswers,
      difficulty: ex.difficulty,
      l1Tip: ex.l1Tips,
    });
  }

  await job.updateProgress(100);
}

function buildExercisePrompt(
  cefrLevel: string,
  grammarFocus: string[],
  vocabTarget: string[],
  l1Source: string,
  count: number,
): string {
  return `Generate ${count} European Portuguese (PT-EU, NOT Brazilian) exercises for a ${cefrLevel} language learner whose native language is ${l1Source}.

Grammar focus: ${grammarFocus.join(", ") || "general"}
Vocabulary topics: ${vocabTarget.join(", ") || "general"}

For each exercise, output JSON with:
- type: one of ${EXERCISE_TYPES.join(", ")}
- prompt: the exercise content as a JSON object with appropriate fields for the type
- acceptedAnswers: array of valid answer strings (include common alternatives)
- difficulty: 1-5 integer
- l1Tips: object mapping L1 codes to helpful tips (at minimum include "${l1Source}")

Output ONLY a JSON array. No markdown, no explanation.
Use European Portuguese exclusively: tu/vós conjugations, placement of pronouns (mesóclise/enclíse), vocabulary (autocarro not ônibus, telemóvel not celular).`;
}

interface ParsedExercise {
  type: string;
  prompt: Record<string, unknown>;
  acceptedAnswers: string[];
  difficulty: number;
  l1Tips: Record<string, string>;
}

function parseExerciseResponse(text: string): ParsedExercise[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in LLM response");

  const parsed = JSON.parse(jsonMatch[0]) as ParsedExercise[];
  if (!Array.isArray(parsed)) throw new Error("Response is not an array");

  return parsed.filter(
    (ex) =>
      typeof ex.type === "string" &&
      Array.isArray(ex.acceptedAnswers) &&
      ex.acceptedAnswers.length > 0,
  );
}
