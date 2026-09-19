import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "earn", "spend", "iap", "refund",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  itemId: varchar("item_id", { length: 128 }),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("transactions_user_id_idx").on(table.userId),
  userCreatedIdx: index("transactions_user_created_idx").on(table.userId, table.createdAt),
}));
