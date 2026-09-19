import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { exercises } from "./exercises";

export const audioRegionEnum = pgEnum("audio_region", [
  "lisboa", "porto", "algarve", "acores", "madeira",
]);

export const audioClips = pgTable("audio_clips", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  region: audioRegionEnum("region").notNull(),
  speaker: varchar("speaker", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  durationMs: varchar("duration_ms", { length: 16 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
