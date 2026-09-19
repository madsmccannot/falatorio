import type { CollectionConfig } from "payload";

export const L1CulturalContent: CollectionConfig = {
  slug: "l1-cultural-content",
  admin: {
    useAsTitle: "contentPt",
    defaultColumns: ["contentPt", "l1Code", "type", "cefrMin"],
    group: "Content",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "l1Code",
      type: "select",
      required: true,
      options: [
        { label: "English", value: "en" },
        { label: "Spanish", value: "es" },
        { label: "French", value: "fr" },
        { label: "German", value: "de" },
        { label: "Italian", value: "it" },
        { label: "Dutch", value: "nl" },
        { label: "Polish", value: "pl" },
        { label: "Romanian", value: "ro" },
        { label: "Ukrainian", value: "uk" },
        { label: "Russian", value: "ru" },
        { label: "Arabic", value: "ar" },
        { label: "Hindi", value: "hi" },
        { label: "Bengali", value: "bn" },
        { label: "Urdu", value: "ur" },
        { label: "Chinese", value: "zh" },
      ],
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Joke", value: "joke" },
        { label: "Expression", value: "expression" },
        { label: "Meme", value: "meme" },
        { label: "Cultural Reference", value: "reference" },
      ],
    },
    {
      name: "contentPt",
      type: "textarea",
      required: true,
      admin: { description: "Content in European Portuguese" },
    },
    {
      name: "contentL1",
      type: "textarea",
      required: true,
      admin: { description: "Content in the learner's L1" },
    },
    {
      name: "explanation",
      type: "textarea",
      required: true,
      admin: { description: "Cultural context explaining why this matters" },
    },
    {
      name: "cefrMin",
      type: "select",
      required: true,
      defaultValue: "A1",
      options: [
        { label: "A1", value: "A1" },
        { label: "A2", value: "A2" },
        { label: "B1", value: "B1" },
        { label: "B2", value: "B2" },
        { label: "C1", value: "C1" },
        { label: "C2", value: "C2" },
      ],
    },
    {
      name: "tags",
      type: "json",
      defaultValue: [],
      admin: { description: '["humor", "lisbon", "food"]' },
    },
  ],
};
