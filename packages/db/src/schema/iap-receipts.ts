import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const iapPlatformEnum = pgEnum("iap_platform", ["apple", "google"]);

export const iapReceipts = pgTable("iap_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: iapPlatformEnum("platform").notNull(),
  receiptData: text("receipt_data").notNull(),
  productId: varchar("product_id", { length: 128 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  validated: boolean("validated").notNull().default(false),
  validatedAt: timestamp("validated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("iap_receipts_user_id_idx").on(table.userId),
}));
