import type { CollectionConfig } from "payload";
import { L1_OPTIONS, CEFR_OPTIONS } from "../constants";

export const L1CulturalContent: CollectionConfig = {
  slug: "l1-cultural-content",
  admin: {
    useAsTitle: "contentPt",
    defaultColumns: ["contentPt", "l1Code", "type", "cefrMin"],
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
      name: "l1Code",
      type: "select",
      required: true,
      options: L1_OPTIONS,
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
      options: CEFR_OPTIONS,
    },
    {
      name: "tags",
      type: "json",
      defaultValue: [],
      admin: { description: '["humor", "lisbon", "food"]' },
    },
  ],
};
