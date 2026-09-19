import type { CollectionConfig } from "payload";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    defaultColumns: ["unit", "sortOrder", "grammarFocus"],
    group: "Content",
  },
  access: {
    read: () => true,
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
      name: "unlockThreshold",
      type: "number",
      required: true,
      defaultValue: 0.8,
      min: 0,
      max: 1,
      admin: { description: "Score needed on previous lesson to unlock (0-1)" },
    },
  ],
};
