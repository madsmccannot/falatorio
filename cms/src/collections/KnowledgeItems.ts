import type { CollectionConfig } from "payload";

const CEFR_OPTIONS = [
  { label: "A1", value: "A1" },
  { label: "A2", value: "A2" },
  { label: "B1", value: "B1" },
  { label: "B2", value: "B2" },
  { label: "C1", value: "C1" },
  { label: "C2", value: "C2" },
];

const COGNITIVE_LEVELS = [
  { label: "Recognition", value: "recognition" },
  { label: "Comprehension", value: "comprehension" },
  { label: "Controlled Production", value: "controlled_production" },
  { label: "Transformation", value: "transformation" },
  { label: "Translation", value: "translation" },
  { label: "Free Production", value: "free_production" },
  { label: "Communication", value: "communication" },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Review", value: "review" },
  { label: "Approved", value: "approved" },
  { label: "Live", value: "live" },
];

export const KnowledgeItems: CollectionConfig = {
  slug: "knowledge-items",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "skill", "cefrLevel", "status", "version"],
    group: "Knowledge Graph",
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "skill",
      type: "relationship",
      relationTo: "skills",
      required: true,
      admin: { description: "Parent skill this KI belongs to" },
    },
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Canonical code (e.g. PT.SYNTAX.SUB.CAUSAL.PORQUE)" },
    },
    {
      name: "cefrLevel",
      type: "select",
      required: true,
      options: CEFR_OPTIONS,
    },
    {
      name: "rule",
      type: "textarea",
      required: true,
      admin: { description: "The grammatical/linguistic rule in PT-PT" },
    },
    {
      name: "examples",
      type: "json",
      required: true,
      admin: { description: 'Array of example strings: ["Eu falo...", "Tu falas..."]' },
    },
    {
      name: "counterexamples",
      type: "json",
      admin: { description: "Array of counterexample strings" },
    },
    {
      name: "commonErrors",
      type: "json",
      admin: { description: "Array of common error descriptions" },
    },
    {
      name: "shortExplanation",
      type: "json",
      admin: { description: 'Localized explanation: {"en": "...", "pt": "..."}' },
    },
    {
      name: "l1Notes",
      type: "json",
      admin: {
        description: 'Per-L1 notes or difficulty data: {"en": "...", "hi": {"difficulty": "high", "reason": "..."}}',
      },
    },
    {
      name: "exerciseTypes",
      type: "select",
      hasMany: true,
      options: COGNITIVE_LEVELS,
      admin: { description: "Cognitive levels appropriate for this KI" },
    },
    {
      name: "masteryCriteria",
      type: "group",
      admin: { description: "Criteria for mastering this KI" },
      fields: [
        {
          name: "minAccuracy",
          type: "number",
          min: 0,
          max: 1,
          defaultValue: 0.8,
          admin: { step: 0.05 },
        },
        {
          name: "minVariety",
          type: "number",
          min: 0,
          max: 1,
          defaultValue: 0.5,
          admin: { step: 0.05 },
        },
        {
          name: "minReps",
          type: "number",
          min: 1,
          defaultValue: 5,
        },
      ],
    },
    {
      name: "relatedKnowledge",
      type: "relationship",
      relationTo: "knowledge-items",
      hasMany: true,
      admin: {
        description: "Related KIs (reinforces, same concept family)",
      },
    },
    {
      name: "confusableWith",
      type: "relationship",
      relationTo: "knowledge-items",
      hasMany: true,
      admin: {
        description: "KIs commonly confused with this one",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: STATUS_OPTIONS,
      admin: { position: "sidebar" },
    },
    {
      name: "version",
      type: "number",
      defaultValue: 1,
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
