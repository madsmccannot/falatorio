import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { Courses } from "./collections/Courses";
import { Units } from "./collections/Units";
import { Lessons } from "./collections/Lessons";
import { Exercises } from "./collections/Exercises";
import { Vocabulary } from "./collections/Vocabulary";
import { AudioClips } from "./collections/AudioClips";
import { L1CulturalContent } from "./collections/L1CulturalContent";
import { ReviewQueue } from "./collections/ReviewQueue";
import { Users } from "./collections/Users";

export default buildConfig({
  serverURL: process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3002",
  secret: process.env["PAYLOAD_SECRET"] ?? "",
  admin: {
    user: "users",
    meta: {
      titleSuffix: "— Falatório CMS",
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env["DATABASE_URL"] ?? "",
    },
    migrationDir: "./src/migrations",
  }),
  collections: [
    Users,
    Courses,
    Units,
    Lessons,
    Exercises,
    Vocabulary,
    AudioClips,
    L1CulturalContent,
    ReviewQueue,
  ],
  plugins: [
    s3Storage({
      collections: {
        "audio-clips": {
          prefix: "audio",
        },
      },
      bucket: process.env["R2_BUCKET"] ?? "falatorio-media",
      config: {
        endpoint: process.env["R2_ENDPOINT"] ?? "",
        region: "auto",
        credentials: {
          accessKeyId: process.env["R2_ACCESS_KEY_ID"] ?? "",
          secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] ?? "",
        },
        forcePathStyle: true,
      },
    }),
  ],
  cors: [
    process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3002",
    process.env["APP_URL"] ?? "http://localhost:3001",
  ],
  csrf: [
    process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3002",
  ],
  typescript: {
    outputFile: "./src/payload-types.ts",
  },
});
