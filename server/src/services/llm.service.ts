import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface ConversationMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface GrammarError {
  type: string;
  userSaid: string;
  correct: string;
  explanation: string;
}

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
      errors.push({
        type: typeMatch[1]!.trim(),
        userSaid: userMatch[1]!.trim(),
        correct: correctMatch[1]!.trim(),
        explanation: explainMatch[1]!.trim(),
      });
    }
  }

  return errors;
}
