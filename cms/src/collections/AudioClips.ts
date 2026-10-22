import type { CollectionConfig } from "payload";

export const AudioClips: CollectionConfig = {
  slug: "audio-clips",
  admin: {
    useAsTitle: "speaker",
    defaultColumns: ["speaker", "region", "exercise"],
    group: "Media",
  },
  upload: {
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
    staticDir: "../media/audio",
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req }) => req.user?.["role"] === "admin",
  },
  fields: [
    {
      name: "exercise",
      type: "relationship",
      relationTo: "exercises",
    },
    {
      name: "vocabulary",
      type: "relationship",
      relationTo: "vocabulary",
      admin: { description: "Associated vocabulary entry (if not an exercise clip)" },
    },
    {
      name: "region",
      type: "select",
      required: true,
      options: [
        { label: "Lisboa", value: "lisboa" },
        { label: "Porto", value: "porto" },
        { label: "Algarve", value: "algarve" },
        { label: "Acores", value: "acores" },
        { label: "Madeira", value: "madeira" },
        { label: "Coimbra", value: "coimbra" },
      ],
    },
    {
      name: "speaker",
      type: "text",
      required: true,
      admin: { description: "Speaker identifier or name" },
    },
    {
      name: "durationMs",
      type: "number",
      admin: { description: "Clip duration in milliseconds" },
    },
    {
      name: "source",
      type: "select",
      defaultValue: "tts",
      options: [
        { label: "Azure TTS", value: "tts" },
        { label: "Native Recording", value: "native" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
