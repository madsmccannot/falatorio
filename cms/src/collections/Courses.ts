import type { CollectionConfig } from "payload";

const L1_OPTIONS = [
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
];

const CEFR_OPTIONS = [
  { label: "A1", value: "A1" },
  { label: "A2", value: "A2" },
  { label: "B1", value: "B1" },
  { label: "B2", value: "B2" },
  { label: "C1", value: "C1" },
  { label: "C2", value: "C2" },
];

export const Courses: CollectionConfig = {
  slug: "courses",
  admin: {
    useAsTitle: "internalTitle",
    defaultColumns: ["internalTitle", "l1Source", "cefrMin", "cefrMax", "active"],
    group: "Content",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "internalTitle",
      type: "text",
      required: true,
      admin: { description: "Internal name for admin reference (e.g., 'EN → PT A1-A2')" },
    },
    {
      name: "l1Source",
      type: "select",
      required: true,
      options: L1_OPTIONS,
      admin: { description: "Source language for this course" },
    },
    {
      name: "title",
      type: "json",
      required: true,
      admin: { description: 'Localized title: {"en": "Beginner Portuguese", "pt": "Portugues Iniciante"}' },
    },
    {
      name: "description",
      type: "json",
      admin: { description: "Localized description" },
    },
    {
      name: "cefrMin",
      type: "select",
      required: true,
      defaultValue: "A1",
      options: CEFR_OPTIONS,
    },
    {
      name: "cefrMax",
      type: "select",
      required: true,
      defaultValue: "B2",
      options: CEFR_OPTIONS,
    },
    {
      name: "sortOrder",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { description: "Lower = appears first" },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
