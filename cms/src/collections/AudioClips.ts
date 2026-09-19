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
  },
  fields: [
    {
      name: "exercise",
      type: "relationship",
      relationTo: "exercises",
      required: true,
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
  ],
};
