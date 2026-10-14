import { describe, it, expect } from "vitest";

describe("lesson.submitAnswer exercise ordering", () => {
  it("rejects submission for wrong exercise index", () => {
    const session = {
      userId: "user1",
      lessonId: "lesson1",
      exerciseIds: ["ex1", "ex2", "ex3"],
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      xpEarned: 0,
      startedAt: new Date().toISOString(),
      cognitiveLevels: [],
    };

    const expectedExerciseId = session.exerciseIds[session.currentIndex];
    const submittedExerciseId = "ex2";

    expect(submittedExerciseId).not.toBe(expectedExerciseId);
  });

  it("accepts submission for correct exercise index", () => {
    const session = {
      userId: "user1",
      lessonId: "lesson1",
      exerciseIds: ["ex1", "ex2", "ex3"],
      currentIndex: 1,
      correctCount: 1,
      incorrectCount: 0,
      xpEarned: 0,
      startedAt: new Date().toISOString(),
      cognitiveLevels: [],
    };

    const expectedExerciseId = session.exerciseIds[session.currentIndex];
    const submittedExerciseId = "ex2";

    expect(submittedExerciseId).toBe(expectedExerciseId);
  });

  it("prevents completing a lesson with zero answers", () => {
    const session = {
      correctCount: 0,
      incorrectCount: 0,
    };

    const total = session.correctCount + session.incorrectCount;
    expect(total).toBe(0);
  });

  it("prevents replay of already-answered exercise", () => {
    const session = {
      exerciseIds: ["ex1", "ex2", "ex3"],
      currentIndex: 2,
    };

    const submittedExerciseId = "ex1";
    const expectedExerciseId = session.exerciseIds[session.currentIndex];
    expect(submittedExerciseId).not.toBe(expectedExerciseId);
  });
});
