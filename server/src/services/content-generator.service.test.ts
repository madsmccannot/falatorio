import { describe, it, expect, vi } from "vitest";

vi.mock("../env.js", () => ({
  env: {
    ANTHROPIC_API_KEY: "test-key",
  },
}));

const { parseExerciseArray, cefrLevelIndex } = await import("./content-generator.service.js");

describe("parseExerciseArray", () => {
  it("parses a valid JSON array from text", () => {
    const text = `Here are the exercises:
[
  {
    "type": "fill_blank",
    "prompt": { "sentence": "Eu ___ ao mercado.", "options": ["fui", "foi"], "correctIndex": 0 },
    "acceptedAnswers": ["fui"],
    "difficulty": 2,
    "l1Tip": { "es": "Conjugacion irregular de ir" }
  },
  {
    "type": "translate_l1_to_pt",
    "prompt": { "sentence": "I like coffee" },
    "acceptedAnswers": ["Eu gosto de cafe"],
    "difficulty": 1,
    "l1Tip": { "en": "gostar takes de" }
  }
]
Some trailing text.`;

    const result = parseExerciseArray(text);
    expect(result).toHaveLength(2);
    expect(result[0]!.type).toBe("fill_blank");
    expect(result[1]!.type).toBe("translate_l1_to_pt");
  });

  it("filters out exercises missing required fields", () => {
    const text = `[
  {
    "type": "fill_blank",
    "prompt": { "sentence": "test" },
    "acceptedAnswers": ["a"],
    "difficulty": 1,
    "l1Tip": {}
  },
  {
    "type": "fill_blank",
    "prompt": null,
    "acceptedAnswers": ["a"],
    "difficulty": 1,
    "l1Tip": {}
  },
  {
    "type": "fill_blank",
    "prompt": { "s": "ok" },
    "acceptedAnswers": [],
    "difficulty": 1,
    "l1Tip": {}
  },
  {
    "prompt": { "s": "ok" },
    "acceptedAnswers": ["a"],
    "difficulty": 1,
    "l1Tip": {}
  }
]`;

    const result = parseExerciseArray(text);
    expect(result).toHaveLength(1);
    expect(result[0]!.prompt).toEqual({ sentence: "test" });
  });

  it("throws on text with no JSON array", () => {
    expect(() => parseExerciseArray("No JSON here")).toThrow("No JSON array found");
  });

  it("handles markdown code fences around JSON", () => {
    const text = "```json\n" + `[{"type":"pick_correct","prompt":{"question":"?","options":["a"],"correctIndex":0},"acceptedAnswers":["a"],"difficulty":1,"l1Tip":{}}]` + "\n```";
    const result = parseExerciseArray(text);
    expect(result).toHaveLength(1);
  });
});

describe("cefrLevelIndex", () => {
  it("returns correct indices", () => {
    expect(cefrLevelIndex("A1")).toBe(0);
    expect(cefrLevelIndex("A2")).toBe(1);
    expect(cefrLevelIndex("B1")).toBe(2);
    expect(cefrLevelIndex("B2")).toBe(3);
    expect(cefrLevelIndex("C1")).toBe(4);
    expect(cefrLevelIndex("C2")).toBe(5);
  });

  it("A1 < B1 < C2", () => {
    expect(cefrLevelIndex("A1")).toBeLessThan(cefrLevelIndex("B1"));
    expect(cefrLevelIndex("B1")).toBeLessThan(cefrLevelIndex("C2"));
  });
});
