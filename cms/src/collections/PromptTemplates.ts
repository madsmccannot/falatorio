import type { CollectionConfig } from "payload";
import { CEFR_OPTIONS } from "../constants";

export const PromptTemplates: CollectionConfig = {
  slug: "prompt-templates",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "exerciseType", "cefrLevel", "active"],
    group: "AI Generation",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.["role"] === "admin",
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Template identifier (e.g. 'translate_a1_daily')" },
    },
    {
      name: "exerciseType",
      type: "select",
      required: true,
      options: [
        { label: "Translate L1 -> PT", value: "translate_l1_to_pt" },
        { label: "Translate PT -> L1", value: "translate_pt_to_l1" },
        { label: "Listen and Type", value: "listen_and_type" },
        { label: "Speak and Score", value: "speak_and_score" },
        { label: "Fill in the Blank", value: "fill_blank" },
        { label: "Match Pairs", value: "match_pairs" },
        { label: "Pick Correct", value: "pick_correct" },
        { label: "Reorder Words", value: "reorder_words" },
      ],
    },
    {
      name: "cefrLevel",
      type: "select",
      options: CEFR_OPTIONS,
      admin: { description: "Target CEFR level (leave empty for all levels)" },
    },
    {
      name: "systemPrompt",
      type: "textarea",
      required: true,
      admin: {
        description: "System prompt for the AI. Use {{variables}} for dynamic substitution.",
        rows: 10,
      },
    },
    {
      name: "userPromptTemplate",
      type: "textarea",
      required: true,
      admin: {
        description: "User prompt template. Variables: {{l1}}, {{cefrLevel}}, {{grammarFocus}}, {{vocabTopics}}, {{knowledgeItems}}, {{culturalRefs}}, {{exerciseCount}}",
        rows: 15,
      },
    },
    {
      name: "outputSchema",
      type: "json",
      admin: { description: "Expected JSON output schema for validation" },
    },
    {
      name: "temperature",
      type: "number",
      defaultValue: 0.7,
      min: 0,
      max: 2,
      admin: { step: 0.1, description: "AI temperature (0 = deterministic, 2 = creative)" },
    },
    {
      name: "maxTokens",
      type: "number",
      defaultValue: 4096,
      admin: { description: "Max output tokens" },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "usageCount",
      type: "number",
      defaultValue: 0,
      admin: { readOnly: true, position: "sidebar", description: "Times used in generation" },
    },
  ],
};
