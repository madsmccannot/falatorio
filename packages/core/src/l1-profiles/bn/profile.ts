import type { L1Profile } from "../types.js";

export const bnProfile: L1Profile = {
  code: "bn",
  name: "Bengali",
  nativeName: "বাংলা",
  writingDirection: "ltr",
  hasLatinScript: false,
  transfer: {
    cognates: [],
    falseFriends: [],
    phoneticDifficulties: [
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "Bengali has nasal vowels — use that instinct but add a diphthong glide." },
      { sound: "r/rr", ipa: "/ʁ/", description: "Uvular R", tip: "Not like Bengali র — this is a back-of-throat sound, like gargling." },
      { sound: "v/b", ipa: "/v/ /b/", description: "Distinct v and b", tip: "Bengali often merges these — PT-EU always distinguishes them." },
      { sound: "lh", ipa: "/ʎ/", description: "Palatal lateral", tip: "No Bengali equivalent — tongue on the palate, like a softer L." },
    ],
    grammarGaps: [
      { concept: "Articles", explanation: "Definite and indefinite", l1Comparison: "Bengali has no articles — learn o/a/um/uma with every noun." },
      { concept: "Gender", explanation: "Masculine and feminine", l1Comparison: "Bengali doesn't have grammatical gender — every PT-EU noun has one." },
      { concept: "Verb conjugation", explanation: "6 forms per tense", l1Comparison: "Bengali conjugates for person too — the concept transfers, the forms don't." },
      { concept: "Word order", explanation: "SVO", l1Comparison: "Bengali is SOV — in PT-EU the object comes after the verb." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
