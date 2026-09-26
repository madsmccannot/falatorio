import {
  pgTable,
  uuid,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const adTypeEnum = pgEnum("ad_type", [
  "banner", "interstitial", "reward",
]);

export const adRewardTypeEnum = pgEnum("ad_reward_type", [
  "heart", "ouro",
]);

export const adEvents = pgTable("ad_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  adType: adTypeEnum("ad_type").notNull(),
  rewardType: adRewardTypeEnum("reward_type"),
  rewardAmount: integer("reward_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("ad_events_user_id_idx").on(table.userId),
  userCreatedIdx: index("ad_events_user_created_idx").on(table.userId, table.createdAt),
}));
