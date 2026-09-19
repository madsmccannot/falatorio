import type { CollectionConfig } from "payload";

export const Units: CollectionConfig = {
  slug: "units",
  admin: {
    useAsTitle: "theme",
    defaultColumns: ["theme", "course", "sortOrder"],
    group: "Content",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
      admin: { description: "Parent course" },
    },
    {
      name: "sortOrder",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "title",
      type: "json",
      required: true,
      admin: { description: 'Localized title: {"en": "Greetings", "pt": "Cumprimentos"}' },
    },
    {
      name: "theme",
      type: "text",
      required: true,
      admin: { description: "Theme slug (e.g., greetings, food, directions)" },
    },
    {
      name: "description",
      type: "json",
      admin: { description: "Localized description" },
    },
  ],
};
