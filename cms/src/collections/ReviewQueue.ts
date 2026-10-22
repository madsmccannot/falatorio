import type { CollectionConfig } from "payload";
import { onReject } from "../hooks/on-reject";

export const ReviewQueue: CollectionConfig = {
  slug: "review-queue",
  admin: {
    useAsTitle: "reason",
    defaultColumns: ["exercise", "reason", "reviewStatus", "assignedTo", "createdAt"],
    group: "QA",
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  hooks: {
    afterChange: [onReject],
  },
  fields: [
    {
      name: "exercise",
      type: "relationship",
      relationTo: "exercises",
      required: true,
    },
    {
      name: "reason",
      type: "select",
      required: true,
      options: [
        { label: "Low quality score", value: "low_score" },
        { label: "User reported", value: "user_reported" },
        { label: "AI generated -- needs review", value: "ai_generated" },
        { label: "Content update", value: "content_update" },
        { label: "Linguistic error", value: "linguistic_error" },
      ],
    },
    {
      name: "reviewStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Needs edit", value: "needs_edit" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      admin: { description: "Reviewer assigned to this item" },
    },
    {
      name: "reviewerNotes",
      type: "textarea",
      admin: { description: "Notes from the content reviewer" },
    },
    {
      name: "avgScore",
      type: "number",
      admin: { description: "Average user score that triggered the flag", readOnly: true },
    },
    {
      name: "responseCount",
      type: "number",
      admin: { description: "Number of user responses when flagged", readOnly: true },
    },
  ],
};
