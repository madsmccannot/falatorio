import type { CollectionConfig } from "payload";
import { SKILL_DOMAINS, CEFR_OPTIONS } from "../constants";

export const Skills: CollectionConfig = {
  slug: "skills",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "domain", "cefrLevel", "sortOrder"],
    group: "Knowledge Graph",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.["role"] === "admin",
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Canonical code (e.g. PT.SYNTAX.SUB.CAUSAL)" },
    },
    {
      name: "domain",
      type: "select",
      required: true,
      options: SKILL_DOMAINS,
    },
    {
      name: "cefrLevel",
      type: "select",
      required: true,
      options: CEFR_OPTIONS,
    },
    {
      name: "name",
      type: "json",
      required: true,
      admin: { description: 'Localized name: {"pt": "...", "en": "..."}' },
    },
    {
      name: "description",
      type: "json",
      admin: { description: "Localized description" },
    },
    {
      name: "sortOrder",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "prerequisites",
      type: "relationship",
      relationTo: "skills",
      hasMany: true,
      admin: {
        description: "Skills that must be mastered before this one",
      },
    },
    {
      name: "knowledgeItemCount",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Number of KnowledgeItems (computed)",
      },
    },
    {
      name: "exerciseCount",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Number of exercises linked via KnowledgeItems (computed)",
      },
    },
    {
      name: "lessonCount",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Number of lessons linked to this skill (computed)",
      },
    },
  ],
};
