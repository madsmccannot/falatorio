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
  skills,
  knowledgeItems,
  skillPrerequisites,
  exerciseKnowledge,
  skillEvidence,
  skillMastery,
  knowledgeRelations,
  lessonSkills,
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
  skillEvidence: many(skillEvidence),
  skillMastery: many(skillMastery),
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
  skillLinks: many(lessonSkills),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
  audioClips: many(audioClips),
  progress: many(userProgress),
  knowledgeLinks: many(exerciseKnowledge),
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

export const skillsRelations = relations(skills, ({ many }) => ({
  knowledgeItems: many(knowledgeItems),
  mastery: many(skillMastery),
  prerequisiteOf: many(skillPrerequisites, { relationName: "skill" }),
  prerequisites: many(skillPrerequisites, { relationName: "prerequisite" }),
  lessonLinks: many(lessonSkills),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one, many }) => ({
  skill: one(skills, {
    fields: [knowledgeItems.skillId],
    references: [skills.id],
  }),
  exerciseLinks: many(exerciseKnowledge),
  evidence: many(skillEvidence),
  relationsFrom: many(knowledgeRelations, { relationName: "source" }),
  relationsTo: many(knowledgeRelations, { relationName: "target" }),
}));

export const skillPrerequisitesRelations = relations(skillPrerequisites, ({ one }) => ({
  skill: one(skills, {
    fields: [skillPrerequisites.skillId],
    references: [skills.id],
    relationName: "skill",
  }),
  prerequisite: one(skills, {
    fields: [skillPrerequisites.prerequisiteId],
    references: [skills.id],
    relationName: "prerequisite",
  }),
}));

export const exerciseKnowledgeRelations = relations(exerciseKnowledge, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseKnowledge.exerciseId],
    references: [exercises.id],
  }),
  knowledgeItem: one(knowledgeItems, {
    fields: [exerciseKnowledge.knowledgeItemId],
    references: [knowledgeItems.id],
  }),
}));

export const skillEvidenceRelations = relations(skillEvidence, ({ one }) => ({
  user: one(users, {
    fields: [skillEvidence.userId],
    references: [users.id],
  }),
  knowledgeItem: one(knowledgeItems, {
    fields: [skillEvidence.knowledgeItemId],
    references: [knowledgeItems.id],
  }),
  exercise: one(exercises, {
    fields: [skillEvidence.exerciseId],
    references: [exercises.id],
  }),
}));

export const skillMasteryRelations = relations(skillMastery, ({ one }) => ({
  user: one(users, {
    fields: [skillMastery.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [skillMastery.skillId],
    references: [skills.id],
  }),
}));

export const knowledgeRelationsRelations = relations(knowledgeRelations, ({ one }) => ({
  source: one(knowledgeItems, {
    fields: [knowledgeRelations.sourceId],
    references: [knowledgeItems.id],
    relationName: "source",
  }),
  target: one(knowledgeItems, {
    fields: [knowledgeRelations.targetId],
    references: [knowledgeItems.id],
    relationName: "target",
  }),
}));

export const lessonSkillsRelations = relations(lessonSkills, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonSkills.lessonId],
    references: [lessons.id],
  }),
  skill: one(skills, {
    fields: [lessonSkills.skillId],
    references: [skills.id],
  }),
}));
