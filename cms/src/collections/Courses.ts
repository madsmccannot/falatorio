import type { CollectionConfig } from "payload";
import { L1_OPTIONS, CEFR_OPTIONS } from "../constants";

export const Courses: CollectionConfig = {
  slug: "courses",
  admin: {
    useAsTitle: "internalTitle",
    defaultColumns: ["internalTitle", "l1Source", "cefrMin", "cefrMax", "active"],
    group: "Content",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.["role"] === "admin",
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  fields: [
    {
      name: "internalTitle",
      type: "text",
      required: true,
      admin: { description: "Internal name for admin reference (e.g., 'EN -> PT A1-A2')" },
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
