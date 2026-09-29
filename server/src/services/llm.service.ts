import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface ConversationMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface GrammarError {
  type: string;
  userSaid: string;
  correct: string;
  explanation: string;
  knowledgeItemCode?: string;
}

const ERROR_TYPE_TO_KI: Record<string, string> = {
  "gender_agreement": "PT.MORPH.GENDER.RULES",
  "number_agreement": "PT.MORPH.NUMBER.RULES",
  "verb_conjugation": "PT.TENSES.PRESENT.REGULAR",
  "ser_estar": "PT.TENSES.SER_ESTAR.CONTRAST",
  "article_usage": "PT.DET.ARTICLES.DEFINITE.USAGE",
  "preposition": "PT.PREP.BASIC.CORE_SET",
  "pronoun_placement": "PT.PRON.PERSONAL.CLITIC_PLACEMENT.RULES",
  "subjunctive": "PT.TENSES.SUBJUNCTIVE_PRESENT.FORMATION",
  "word_order": "PT.SYNTAX.WORD_ORDER.SVO",
  "negation": "PT.ADV.NEGATION.NAO_NUNCA",
  "accent_missing": "PT.ORTH.ACCENTS.BASIC.RULES",
  "false_friend": "PT.LEX.FALSE_FRIENDS.COMMON",
  "por_para": "PT.PREP.POR_PARA.DISTINCTION",
  "reflexive": "PT.PRON.REFLEXIVE.USAGE",
  "comparative": "PT.ADJ.DEGREE.COMPARATIVE_SUPERLATIVE",
  "conditional": "PT.CONJ.CONDITIONAL.SE",
  "conjunction": "PT.CONJ.CAUSAL.PORQUE_COMO",
};

interface TutorReply {
  content: string;
  errors: GrammarError[];
}

export async function chatWithTutor(
  scenarioId: string,
  messages: ConversationMessage[],
  l1: string,
): Promise<TutorReply> {
  const systemPrompt = buildTutorSystemPrompt(scenarioId, l1);

  const anthropicMessages = messages.map((m) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const rawContent = textBlock?.text ?? "";

  const errors = extractErrors(rawContent);
  const content = rawContent.replace(/\[ERRORS?\][\s\S]*?\[\/ERRORS?\]/g, "").trim();

  return { content, errors };
}

export async function explainGrammarError(
  errorText: string,
  l1: string,
  context?: string,
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
    max_tokens: 512,
    system: `You are a Portuguese (PT-EU) grammar tutor. The student's native language is ${l1}. Explain grammar errors concisely. Use the student's L1 for explanations when it helps understanding. Focus on European Portuguese, never Brazilian Portuguese.`,
    messages: [
      {
        role: "user",
        content: context
          ? `Context: "${context}"\n\nExplain this error: "${errorText}"`
          : `Explain this Portuguese grammar error: "${errorText}"`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

export async function explainExerciseError(
  exerciseType: string,
  userAnswer: string,
  correctAnswer: string,
  rule: string,
  l1: string,
  knowledgeItemCode: string,
  errorCount: number,
): Promise<string> {
  const depth = errorCount >= 3 ? "detailed" : "brief";
  const response = await client.messages.create({
    model: "claude-sonnet-5-20250514",
    max_tokens: depth === "detailed" ? 600 : 300,
    system: `You are a Portuguese (PT-EU) tutor. The student's L1 is ${l1}. Explain exercise errors in a way native ${l1} speakers understand. Use European Portuguese ONLY. Be ${depth}. If the student has made this error ${errorCount} times, explain from a different angle or use an L1 comparison.`,
    messages: [
      {
        role: "user",
        content: `Exercise type: ${exerciseType}
Knowledge item: ${knowledgeItemCode}
Rule: ${rule}
Student answered: "${userAnswer}"
Correct answer: "${correctAnswer}"
Times failed: ${errorCount}

Explain why the student's answer is wrong and how to remember the correct form.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

function buildTutorSystemPrompt(scenarioId: string, l1: string): string {
  return `You are a Portuguese (PT-EU) conversation tutor running scenario "${scenarioId}".
The student's native language is ${l1}. Stay in character for the scenario.

Rules:
- Use European Portuguese ONLY (never Brazilian)
- Match the student's CEFR level based on their responses
- Gently correct errors inline, then continue the conversation
- If the student makes grammar/vocabulary errors, append them in an [ERRORS] block:
  [ERRORS]
  type: grammar|vocabulary|pronunciation
  userSaid: what they wrote
  correct: the correct form
  explanation: brief explanation in ${l1}
  [/ERRORS]
- Keep responses conversational and encouraging
- Use culturally relevant Portuguese references when natural`;
}

function extractErrors(text: string): GrammarError[] {
  const errors: GrammarError[] = [];
  const errorBlocks = text.match(/\[ERRORS?\]([\s\S]*?)\[\/ERRORS?\]/g);
  if (!errorBlocks) return errors;

  for (const block of errorBlocks) {
    const inner = block.replace(/\[\/?ERRORS?\]/g, "").trim();
    const typeMatch = inner.match(/type:\s*(.+)/);
    const userMatch = inner.match(/userSaid:\s*(.+)/);
    const correctMatch = inner.match(/correct:\s*(.+)/);
    const explainMatch = inner.match(/explanation:\s*(.+)/);

    if (typeMatch && userMatch && correctMatch && explainMatch) {
      const errorType = typeMatch[1]!.trim();
      errors.push({
        type: errorType,
        userSaid: userMatch[1]!.trim(),
        correct: correctMatch[1]!.trim(),
        explanation: explainMatch[1]!.trim(),
        knowledgeItemCode: ERROR_TYPE_TO_KI[errorType],
      });
    }
  }

  return errors;
}
