import { describe, it, expect } from "vitest";
import { L1_CODES, L1_PHASE_1 } from "../constants.js";
import { getProfile, getCulturalRefs, getAllProfiles } from "./index.js";
import type { L1Code } from "../constants.js";

describe("l1-profiles", () => {
  it("getProfile returns a profile for every L1 code", () => {
    for (const code of L1_CODES) {
      const profile = getProfile(code);
      expect(profile).toBeDefined();
      expect(profile.code).toBe(code);
      expect(profile.name).toBeTruthy();
      expect(profile.nativeName).toBeTruthy();
    }
  });

  it("getCulturalRefs returns an array for every L1 code", () => {
    for (const code of L1_CODES) {
      const refs = getCulturalRefs(code);
      expect(Array.isArray(refs)).toBe(true);
    }
  });

  it("getAllProfiles returns all profiles", () => {
    const all = getAllProfiles();
    expect(all.length).toBe(L1_CODES.length);
  });

  describe("profile structure", () => {
    for (const code of L1_CODES) {
      it(`${code} has valid transfer profile`, () => {
        const profile = getProfile(code);
        const t = profile.transfer;

        expect(Array.isArray(t.cognates)).toBe(true);
        expect(Array.isArray(t.falseFriends)).toBe(true);
        expect(Array.isArray(t.phoneticDifficulties)).toBe(true);
        expect(Array.isArray(t.grammarGaps)).toBe(true);
        expect(typeof t.skipBasics).toBe("boolean");
        expect(["A1", "A2", "B1", "B2", "C1", "C2"]).toContain(t.startingCEFR);
      });

      it(`${code} has valid writingDirection`, () => {
        const profile = getProfile(code);
        expect(["ltr", "rtl"]).toContain(profile.writingDirection);
      });
    }
  });

  describe("false friend structure", () => {
    for (const code of L1_CODES) {
      it(`${code} false friends have required fields`, () => {
        const profile = getProfile(code);
        for (const ff of profile.transfer.falseFriends) {
          expect(ff.word).toBeTruthy();
          expect(ff.l1Meaning).toBeTruthy();
          expect(ff.ptMeaning).toBeTruthy();
        }
      });
    }
  });

  describe("phonetic difficulty structure", () => {
    for (const code of L1_CODES) {
      it(`${code} phonetic difficulties have required fields`, () => {
        const profile = getProfile(code);
        for (const pd of profile.transfer.phoneticDifficulties) {
          expect(pd.sound).toBeTruthy();
          expect(pd.ipa).toBeTruthy();
          expect(pd.description).toBeTruthy();
          expect(pd.tip).toBeTruthy();
        }
      });
    }
  });

  describe("grammar gap structure", () => {
    for (const code of L1_CODES) {
      it(`${code} grammar gaps have required fields`, () => {
        const profile = getProfile(code);
        for (const gg of profile.transfer.grammarGaps) {
          expect(gg.concept).toBeTruthy();
          expect(gg.explanation).toBeTruthy();
          expect(gg.l1Comparison).toBeTruthy();
        }
      });
    }
  });

  describe("cultural ref structure", () => {
    for (const code of L1_CODES) {
      it(`${code} cultural refs have required fields`, () => {
        const refs = getCulturalRefs(code);
        for (const ref of refs) {
          expect(ref.id).toBeTruthy();
          expect(["joke", "expression", "meme", "reference"]).toContain(ref.type);
          expect(ref.contentPt).toBeTruthy();
          expect(ref.contentL1).toBeTruthy();
          expect(ref.explanation).toBeTruthy();
          expect(["A1", "A2", "B1", "B2", "C1", "C2"]).toContain(ref.cefrMin);
          expect(Array.isArray(ref.tags)).toBe(true);
        }
      });
    }
  });

  describe("phase 1 profile depth", () => {
    const MIN_FALSE_FRIENDS = 8;
    const MIN_PHONETIC = 5;
    const MIN_GRAMMAR = 5;
    const MIN_COGNATES = 10;

    for (const code of L1_PHASE_1) {
      it(`${code} meets minimum false friends (${MIN_FALSE_FRIENDS})`, () => {
        const profile = getProfile(code);
        expect(profile.transfer.falseFriends.length).toBeGreaterThanOrEqual(MIN_FALSE_FRIENDS);
      });

      it(`${code} meets minimum phonetic difficulties (${MIN_PHONETIC})`, () => {
        const profile = getProfile(code);
        expect(profile.transfer.phoneticDifficulties.length).toBeGreaterThanOrEqual(MIN_PHONETIC);
      });

      it(`${code} meets minimum grammar gaps (${MIN_GRAMMAR})`, () => {
        const profile = getProfile(code);
        expect(profile.transfer.grammarGaps.length).toBeGreaterThanOrEqual(MIN_GRAMMAR);
      });

      it(`${code} meets minimum cognates (${MIN_COGNATES})`, () => {
        const profile = getProfile(code);
        expect(profile.transfer.cognates.length).toBeGreaterThanOrEqual(MIN_COGNATES);
      });
    }
  });

  describe("RTL languages", () => {
    const rtlCodes: L1Code[] = ["ar", "ur"];
    for (const code of rtlCodes) {
      it(`${code} has RTL writing direction`, () => {
        const profile = getProfile(code);
        expect(profile.writingDirection).toBe("rtl");
      });
    }
  });

  describe("non-Latin scripts", () => {
    const nonLatin: L1Code[] = ["ar", "ur", "hi", "bn", "zh", "ko", "ja", "ru", "uk"];
    for (const code of nonLatin) {
      it(`${code} has hasLatinScript = false`, () => {
        const profile = getProfile(code);
        expect(profile.hasLatinScript).toBe(false);
      });
    }
  });
});
