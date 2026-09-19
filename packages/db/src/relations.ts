import { relations } from "drizzle-orm";
import {
  users,
  courses,
  units,
  lessons,
  exercises,
  userProgress,
  streaks,
  achievements,
  leagueEntries,
  conversationSessions,
  audioClips,
  wallets,
  transactions,
  iapReceipts,
  adEvents,
} from "./schema/index";

export const usersRelations = relations(users, ({ one, many }) => ({
  streak: one(streaks, {
    fields: [users.id],
    references: [streaks.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  progress: many(userProgress),
  achievements: many(achievements),
  leagueEntries: many(leagueEntries),
  conversationSessions: many(conversationSessions),
  transactions: many(transactions),
  iapReceipts: many(iapReceipts),
  adEvents: many(adEvents),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
  audioClips: many(audioClips),
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [userProgress.exerciseId],
    references: [exercises.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const leagueEntriesRelations = relations(leagueEntries, ({ one }) => ({
  user: one(users, {
    fields: [leagueEntries.userId],
    references: [users.id],
  }),
}));

export const conversationSessionsRelations = relations(conversationSessions, ({ one }) => ({
  user: one(users, {
    fields: [conversationSessions.userId],
    references: [users.id],
  }),
}));

export const audioClipsRelations = relations(audioClips, ({ one }) => ({
  exercise: one(exercises, {
    fields: [audioClips.exerciseId],
    references: [exercises.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const iapReceiptsRelations = relations(iapReceipts, ({ one }) => ({
  user: one(users, {
    fields: [iapReceipts.userId],
    references: [users.id],
  }),
}));

export const adEventsRelations = relations(adEvents, ({ one }) => ({
  user: one(users, {
    fields: [adEvents.userId],
    references: [users.id],
  }),
}));
