import type { CollectionConfig } from "payload";
import { CEFR_OPTIONS } from "../constants";

export const Vocabulary: CollectionConfig = {
  slug: "vocabulary",
  admin: {
    useAsTitle: "wordPt",
    defaultColumns: ["wordPt", "cefrLevel", "category"],
    group: "Content",
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  fields: [
    {
      name: "wordPt",
      type: "text",
      required: true,
      admin: { description: "Word or phrase in European Portuguese" },
    },
    {
      name: "translations",
      type: "json",
      required: true,
      admin: { description: '{"en": "hello", "es": "hola", "fr": "bonjour"}' },
    },
    {
      name: "phonetic",
      type: "text",
      admin: { description: "IPA transcription for PT-EU pronunciation" },
    },
    {
      name: "audioUrl",
      type: "text",
      admin: { description: "URL for PT-EU pronunciation audio" },
    },
    {
      name: "cefrLevel",
      type: "select",
      required: true,
      defaultValue: "A1",
      options: CEFR_OPTIONS,
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Noun", value: "noun" },
        { label: "Verb", value: "verb" },
        { label: "Adjective", value: "adjective" },
        { label: "Adverb", value: "adverb" },
        { label: "Preposition", value: "preposition" },
        { label: "Conjunction", value: "conjunction" },
        { label: "Phrase", value: "phrase" },
        { label: "Expression", value: "expression" },
      ],
    },
    {
      name: "gender",
      type: "select",
      options: [
        { label: "Masculine", value: "m" },
        { label: "Feminine", value: "f" },
        { label: "N/A", value: "na" },
      ],
      admin: { condition: (data) => data?.["category"] === "noun" || data?.["category"] === "adjective" },
    },
    {
      name: "exampleSentence",
      type: "json",
      admin: { description: '{"pt": "Bom dia, como esta?", "en": "Good morning, how are you?"}' },
    },
    {
      name: "ptBrDifference",
      type: "text",
      admin: { description: "Note if PT-BR uses a different word/spelling" },
    },
    {
      name: "tags",
      type: "json",
      defaultValue: [],
      admin: { description: '["greetings", "formal"]' },
    },
  ],
};
