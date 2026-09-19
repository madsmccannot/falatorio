import type { CollectionConfig } from "payload";
import { onPublish } from "../hooks/on-publish";
import { onReject } from "../hooks/on-reject";

const EXERCISE_TYPES = [
  { label: "Translate L1 → PT", value: "translate_l1_to_pt" },
  { label: "Translate PT → L1", value: "translate_pt_to_l1" },
  { label: "Listen and Type", value: "listen_and_type" },
  { label: "Speak and Score", value: "speak_and_score" },
  { label: "Fill in the Blank", value: "fill_blank" },
  { label: "Match Pairs", value: "match_pairs" },
  { label: "Pick Correct", value: "pick_correct" },
  { label: "Reorder Words", value: "reorder_words" },
];

export const Exercises: CollectionConfig = {
  slug: "exercises",
  admin: {
    useAsTitle: "type",
    defaultColumns: ["type", "lesson", "status", "difficulty"],
    group: "Content",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [onPublish],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "lesson",
      type: "relationship",
      relationTo: "lessons",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: EXERCISE_TYPES,
    },
    {
      name: "prompt",
      type: "json",
      required: true,
      admin: {
        description:
          'Exercise prompt. Structure depends on type. E.g., {"text": "How do you say hello?", "context": "formal"}',
      },
    },
    {
      name: "acceptedAnswers",
      type: "json",
      required: true,
      admin: { description: 'Array of accepted answers: ["Bom dia", "bom dia"]' },
    },
    {
      name: "audioUrl",
      type: "text",
      admin: { description: "URL for the prompt audio (PT-EU)" },
    },
    {
      name: "audioNativeUrl",
      type: "text",
      admin: { description: "URL for native speaker audio clip" },
    },
    {
      name: "difficulty",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      max: 10,
    },
    {
      name: "l1Tip",
      type: "json",
      admin: {
        description: 'L1-specific hint: {"en": "In PT-EU, we say bom dia until noon", "es": "En PT-EU se dice..."}',
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Review", value: "review" },
        { label: "Live", value: "live" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "version",
      type: "number",
      defaultValue: 1,
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
