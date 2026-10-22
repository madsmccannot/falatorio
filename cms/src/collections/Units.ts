import type { CollectionConfig } from "payload";

export const Units: CollectionConfig = {
  slug: "units",
  admin: {
    useAsTitle: "theme",
    defaultColumns: ["theme", "course", "section", "sortOrder"],
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
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
      admin: { description: "Parent course" },
    },
    {
      name: "section",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      max: 4,
      admin: { description: "Section number (1=Basico, 2=Principiante, 3=Intermedio, 4=Avancado)" },
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
