import type { CollectionConfig } from "payload";

const SKILL_DOMAINS = [
  { label: "Phonetics", value: "phonetics" },
  { label: "Morphology", value: "morphology" },
  { label: "Tenses & Moods", value: "tenses_moods" },
  { label: "Determiners", value: "determiners" },
  { label: "Pronouns", value: "pronouns" },
  { label: "Prepositions", value: "prepositions" },
  { label: "Syntax", value: "syntax" },
  { label: "Lexicon", value: "lexicon" },
  { label: "Pragmatics", value: "pragmatics" },
  { label: "Orthography", value: "orthography" },
];

const CEFR_OPTIONS = [
  { label: "A1", value: "A1" },
  { label: "A2", value: "A2" },
  { label: "B1", value: "B1" },
  { label: "B2", value: "B2" },
  { label: "C1", value: "C1" },
  { label: "C2", value: "C2" },
];

export const Skills: CollectionConfig = {
  slug: "skills",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "domain", "cefrLevel", "sortOrder"],
    group: "Knowledge Graph",
  },
  access: {
    read: () => true,
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
  ],
};
