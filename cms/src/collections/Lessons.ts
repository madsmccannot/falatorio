import type { CollectionConfig } from "payload";
import { CEFR_OPTIONS, NODE_TYPES } from "../constants";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    defaultColumns: ["unit", "nodeType", "sortOrder", "sessionsRequired", "cefrLevel"],
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
      name: "unit",
      type: "relationship",
      relationTo: "units",
      required: true,
    },
    {
      name: "sortOrder",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "nodeType",
      type: "select",
      required: true,
      defaultValue: "lesson",
      options: NODE_TYPES,
      admin: { description: "Pedagogical function of this node" },
    },
    {
      name: "cefrLevel",
      type: "select",
      required: true,
      defaultValue: "A1",
      options: CEFR_OPTIONS,
    },
    {
      name: "sessionsRequired",
      type: "number",
      required: true,
      defaultValue: 3,
      min: 0,
      max: 10,
      admin: { description: "Number of sessions to complete this node (0 for chests)" },
    },
    {
      name: "skills",
      type: "relationship",
      relationTo: "skills",
      hasMany: true,
      admin: { description: "Skills targeted by this lesson" },
    },
    {
      name: "grammarFocus",
      type: "json",
      required: true,
      defaultValue: [],
      admin: { description: 'Grammar topics: ["ser vs estar", "definite articles"]' },
    },
    {
      name: "vocabTarget",
      type: "json",
      required: true,
      defaultValue: [],
      admin: { description: 'Target vocabulary: ["obrigado", "bom dia", "como esta"]' },
    },
    {
      name: "rewardConfig",
      type: "json",
      admin: {
        description: 'For chest nodes: {"type": "ouro", "amount": 50}',
        condition: (data) => data?.["nodeType"] === "chest",
      },
    },
  ],
};
