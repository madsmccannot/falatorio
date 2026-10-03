import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const conversationSessions = pgTable("conversation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scenarioId: varchar("scenario_id", { length: 64 }).notNull(),
  messages: jsonb("messages").notNull().$type<Array<{ role: string; content: string; timestamp: string }>>().default([]),
  errorsExtracted: jsonb("errors_extracted").$type<Array<{ type: string; userSaid: string; correct: string; explanation: string }>>(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
