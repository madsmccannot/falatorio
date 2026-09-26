import {
  pgTable,
  varchar,
  jsonb,
  integer,
  real,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const shopItemTypeEnum = pgEnum("shop_item_type", [
  "consumable", "subscription",
]);

export const shopItems = pgTable("shop_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: jsonb("name").notNull().$type<Record<string, string>>(),
  description: jsonb("description").$type<Record<string, string>>(),
  type: shopItemTypeEnum("type").notNull(),
  priceOuro: integer("price_crystals"),
  priceEur: real("price_eur"),
  effect: jsonb("effect").notNull(),
  icon: varchar("icon", { length: 16 }),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
