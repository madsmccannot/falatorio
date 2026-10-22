import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { lessonRouter } from "./lesson.router.js";
import { createMockContext, createMockUser, createMockRedis } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ lesson: lessonRouter }));

describe("lesson.router", () => {
  describe("submitAnswer", () => {
    it("rejects expired session", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.submitAnswer({
          sessionId: "00000000-0000-0000-0000-000000000099",
          exerciseId: "00000000-0000-0000-0000-000000000002",
          answer: "Bom dia",
        }),
      ).rejects.toThrow("Session expired");
    });

    it("rejects when session belongs to different user", async () => {
      const session = {
        userId: "other-user-id",
        lessonId: "lesson-1",
        exerciseIds: ["ex1"],
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels: ["recognition"],
        sessionsRequired: 3,
        sectionSortOrder: 0,
        isUnitFinal: false,
      };
      const redisStore = new Map([
        ["session:00000000-0000-0000-0000-000000000099", JSON.stringify(session)],
      ]);
      const ctx = createMockContext({ redis: createMockRedis(redisStore) });
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.submitAnswer({
          sessionId: "00000000-0000-0000-0000-000000000099",
          exerciseId: "ex1",
          answer: "test",
        }),
      ).rejects.toThrow();
    });

    it("rejects wrong exercise index", async () => {
      const user = createMockUser();
      const session = {
        userId: user.userId,
        lessonId: "lesson-1",
        exerciseIds: ["00000000-0000-0000-0000-000000000010", "00000000-0000-0000-0000-000000000011"],
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels: ["recognition", "recall"],
        sessionsRequired: 3,
        sectionSortOrder: 0,
        isUnitFinal: false,
      };
      const redisStore = new Map([
        ["session:00000000-0000-0000-0000-000000000099", JSON.stringify(session)],
      ]);
      const ctx = createMockContext({ user, redis: createMockRedis(redisStore) });
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.submitAnswer({
          sessionId: "00000000-0000-0000-0000-000000000099",
          exerciseId: "00000000-0000-0000-0000-000000000011",
          answer: "test",
        }),
      ).rejects.toThrow("Unexpected exercise");
    });
  });

  describe("completeLesson", () => {
    it("rejects expired session", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.completeLesson({
          sessionId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow("Session expired");
    });

    it("rejects session with zero answers", async () => {
      const user = createMockUser();
      const session = {
        userId: user.userId,
        lessonId: "lesson-1",
        exerciseIds: ["ex1"],
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels: ["recognition"],
        sessionsRequired: 3,
        sectionSortOrder: 0,
        isUnitFinal: false,
      };
      const redisStore = new Map([
        ["session:00000000-0000-0000-0000-000000000099", JSON.stringify(session)],
      ]);
      const ctx = createMockContext({ user, redis: createMockRedis(redisStore) });
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.completeLesson({
          sessionId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow("No answers submitted");
    });
  });

  describe("hasCompletedLesson", () => {
    it("returns hasCompleted false for fresh user", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.lesson.hasCompletedLesson();
      expect(result).toEqual({ hasCompleted: false });
    });
  });

  describe("getMistakesCount", () => {
    it("returns zero for fresh user", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.lesson.getMistakesCount();
      expect(result.totalMistakes).toBe(0);
      expect(result.dailyUsed).toBe(0);
    });
  });

  describe("openChest", () => {
    it("rejects non-chest node", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.lesson.openChest({
          lessonId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow("NOT_A_CHEST");
    });
  });
});
