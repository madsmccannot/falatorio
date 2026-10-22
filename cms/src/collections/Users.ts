import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Admin",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.["role"] === "admin",
    update: ({ req }) => req.user?.["role"] === "admin",
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Reviewer", value: "reviewer" },
      ],
      access: {
        update: ({ req }) => req.user?.["role"] === "admin",
      },
    },
    {
      name: "name",
      type: "text",
      admin: { description: "Display name" },
    },
  ],
};
